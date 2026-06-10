import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { logEntries } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { LOG_ENTRY_TYPE_IDS } from '@/lib/taxonomy';

export const runtime = 'nodejs';

interface PatchBody {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getDashboardUserId();
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Partial<typeof logEntries.$inferInsert> = { updatedAt: new Date() };
  if (isIsoDate(body.date)) updates.date = body.date;
  if (typeof body.title === 'string') updates.title = body.title.trim().slice(0, 200);
  if (body.type && LOG_ENTRY_TYPE_IDS.has(body.type)) updates.type = body.type;
  if ('category' in body) updates.category = body.category ?? null;
  if ('productSlug' in body) updates.productSlug = body.productSlug ?? null;
  if (Array.isArray(body.subjects)) updates.subjects = body.subjects.slice(0, 20);
  if (Array.isArray(body.childIds)) updates.childIds = body.childIds.slice(0, 10);
  if (Array.isArray(body.childNames)) updates.childNames = body.childNames.slice(0, 10);
  if (Array.isArray(body.photos)) updates.photos = body.photos.slice(0, 8);
  if ('notes' in body) updates.notes = body.notes ? String(body.notes).slice(0, 2000) : null;
  if ('durationMinutes' in body) {
    updates.durationMinutes =
      typeof body.durationMinutes === 'number' ? body.durationMinutes : null;
  }

  const [updated] = await db
    .update(logEntries)
    .set(updates)
    .where(and(eq(logEntries.id, id), eq(logEntries.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ entry: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getDashboardUserId();

  const result = await db
    .delete(logEntries)
    .where(and(eq(logEntries.id, id), eq(logEntries.userId, userId)))
    .returning({ id: logEntries.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
