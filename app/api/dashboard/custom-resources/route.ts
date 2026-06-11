import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customResources } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

const VALID_MODE = new Set(['independent', 'together', 'either']);
const VALID_CADENCE = new Set(['flexible', 'fixed']);

interface PostBody {
  title?: string;
  subjects?: string[];
  childIds?: string[];
  mode?: string;
  durationMinutes?: number | null;
  cadence?: string;
  timesPerWeek?: number | null;
  fixedDays?: number[];
}

function cleanStringArray(v: unknown, max = 12): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, max) : [];
}

function cleanDayArray(v: unknown): number[] {
  return Array.isArray(v)
    ? Array.from(new Set(v.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)))
    : [];
}

export async function GET() {
  const userId = await getDashboardUserId();
  const rows = await db
    .select()
    .from(customResources)
    .where(and(eq(customResources.userId, userId), eq(customResources.active, true)))
    .orderBy(asc(customResources.createdAt));
  return NextResponse.json({ resources: rows });
}

export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  const cadence = body.cadence && VALID_CADENCE.has(body.cadence) ? body.cadence : 'flexible';
  const mode = body.mode && VALID_MODE.has(body.mode) ? body.mode : 'either';
  const timesPerWeek =
    typeof body.timesPerWeek === 'number' && body.timesPerWeek > 0 && body.timesPerWeek <= 14
      ? Math.round(body.timesPerWeek)
      : 3;
  const durationMinutes =
    typeof body.durationMinutes === 'number' && body.durationMinutes > 0 && body.durationMinutes < 600
      ? Math.round(body.durationMinutes)
      : null;

  const [created] = await db
    .insert(customResources)
    .values({
      userId,
      title: body.title.trim().slice(0, 80),
      subjects: cleanStringArray(body.subjects),
      childIds: cleanStringArray(body.childIds, 8),
      mode,
      durationMinutes,
      cadence,
      timesPerWeek: cadence === 'flexible' ? timesPerWeek : null,
      fixedDays: cadence === 'fixed' ? cleanDayArray(body.fixedDays) : [],
    })
    .returning();

  return NextResponse.json({ resource: created }, { status: 201 });
}
