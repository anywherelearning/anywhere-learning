import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, gte, lte, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { logEntries } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { LOG_ENTRY_TYPE_IDS } from '@/lib/taxonomy';

export const runtime = 'nodejs';

interface PostBody {
  date?: string;
  title?: string;
  type?: string;
  category?: string | null;
  productSlug?: string | null;
  subjects?: string[];
  childIds?: string[];
  childNames?: string[];
  photos?: string[];
  notes?: string | null;
  durationMinutes?: number | null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
  const userId = await getDashboardUserId();
  const params = req.nextUrl.searchParams;

  const filters = [eq(logEntries.userId, userId)];

  const from = params.get('from');
  if (isIsoDate(from)) filters.push(gte(logEntries.date, from));

  const to = params.get('to');
  if (isIsoDate(to)) filters.push(lte(logEntries.date, to));

  const type = params.get('type');
  if (type && LOG_ENTRY_TYPE_IDS.has(type)) filters.push(eq(logEntries.type, type));

  const category = params.get('category');
  if (category) filters.push(eq(logEntries.category, category));

  const subject = params.get('subject');
  if (subject) {
    filters.push(sql`${logEntries.subjects} @> ${JSON.stringify([subject])}::jsonb`);
  }

  const childId = params.get('child');
  if (childId) {
    filters.push(sql`${logEntries.childIds} @> ${JSON.stringify([childId])}::jsonb`);
  }

  // Full-text search across title + notes (case-insensitive LIKE).
  const q = params.get('q');
  if (q && q.trim().length > 0) {
    const needle = `%${q.trim().slice(0, 80).replace(/[%_]/g, (m) => `\\${m}`)}%`;
    filters.push(
      or(
        ilike(logEntries.title, needle),
        ilike(logEntries.notes, needle)
      )!
    );
  }

  const rows = await db
    .select()
    .from(logEntries)
    .where(and(...filters))
    .orderBy(desc(logEntries.date), desc(logEntries.createdAt));

  return NextResponse.json({ entries: rows });
}

export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isIsoDate(body.date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
  }
  if (!body.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (!body.type || !LOG_ENTRY_TYPE_IDS.has(body.type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }

  const [created] = await db
    .insert(logEntries)
    .values({
      userId,
      date: body.date,
      title: body.title.trim().slice(0, 200),
      type: body.type,
      category: body.category ?? null,
      productSlug: body.productSlug ?? null,
      subjects: Array.isArray(body.subjects) ? body.subjects.slice(0, 20) : [],
      childIds: Array.isArray(body.childIds) ? body.childIds.slice(0, 10) : [],
      childNames: Array.isArray(body.childNames) ? body.childNames.slice(0, 10) : [],
      photos: Array.isArray(body.photos) ? body.photos.slice(0, 8) : [],
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
      durationMinutes: typeof body.durationMinutes === 'number' ? body.durationMinutes : null,
    })
    .returning();

  return NextResponse.json({ entry: created }, { status: 201 });
}
