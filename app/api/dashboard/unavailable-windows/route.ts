import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte, lte, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { unavailableWindows } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_KIND = new Set(['mom-out', 'all-off', 'co-op']);
const VALID_RECURRENCE = new Set(['none', 'weekly', 'biweekly', 'monthly']);

interface PostBody {
  date?: string;
  startTime?: string;
  endTime?: string;
  label?: string | null;
  kind?: string;
  recurrence?: string;
  recurrenceUntil?: string | null;
}

/**
 * GET /api/dashboard/unavailable-windows?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns all windows in the range (inclusive). If `from`/`to` are omitted,
 * returns everything ordered by date asc.
 */
export async function GET(req: NextRequest) {
  const userId = await getDashboardUserId();
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  const conditions = [eq(unavailableWindows.userId, userId)];
  if (from && ISO_DATE.test(from)) {
    conditions.push(gte(unavailableWindows.date, from));
  }
  if (to && ISO_DATE.test(to)) {
    conditions.push(lte(unavailableWindows.date, to));
  }

  const rows = await db
    .select()
    .from(unavailableWindows)
    .where(and(...conditions))
    .orderBy(asc(unavailableWindows.date), asc(unavailableWindows.startTime));

  return NextResponse.json({ windows: rows });
}

/**
 * POST /api/dashboard/unavailable-windows
 *
 * Create an unavailable window. Body: { date, startTime, endTime, label?, kind?, recurrence?, recurrenceUntil? }
 */
export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.date || !ISO_DATE.test(body.date)) {
    return NextResponse.json({ error: 'date required as YYYY-MM-DD' }, { status: 400 });
  }
  if (!body.startTime || !HH_MM.test(body.startTime)) {
    return NextResponse.json({ error: 'startTime required as HH:MM' }, { status: 400 });
  }
  if (!body.endTime || !HH_MM.test(body.endTime)) {
    return NextResponse.json({ error: 'endTime required as HH:MM' }, { status: 400 });
  }
  if (body.startTime >= body.endTime) {
    return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 });
  }
  const kind = body.kind && VALID_KIND.has(body.kind) ? body.kind : 'mom-out';
  const recurrence = body.recurrence && VALID_RECURRENCE.has(body.recurrence) ? body.recurrence : 'none';
  const recurrenceUntil =
    body.recurrenceUntil && ISO_DATE.test(body.recurrenceUntil) ? body.recurrenceUntil : null;

  const [created] = await db
    .insert(unavailableWindows)
    .values({
      userId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      label: body.label && body.label.trim() ? body.label.trim().slice(0, 60) : null,
      kind,
      recurrence,
      recurrenceUntil,
    })
    .returning();

  return NextResponse.json({ window: created }, { status: 201 });
}
