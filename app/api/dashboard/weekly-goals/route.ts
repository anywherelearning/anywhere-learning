import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { weeklyGoals } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { isoMonday } from '@/lib/planner';

export const runtime = 'nodejs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface PutBody {
  weekStart?: string;
  goals?: Record<string, Record<string, number>>;
}

/**
 * GET /api/dashboard/weekly-goals?weekStart=YYYY-MM-DD
 *
 * Returns the saved goals for that week (or an empty row if none exist).
 * `weekStart` is normalized to the ISO Monday.
 */
export async function GET(req: NextRequest) {
  const userId = await getDashboardUserId();
  const param = req.nextUrl.searchParams.get('weekStart');
  const weekStart = param && ISO_DATE.test(param)
    ? isoMonday(param)
    : isoMonday(new Date().toISOString().slice(0, 10));

  const rows = await db
    .select()
    .from(weeklyGoals)
    .where(and(eq(weeklyGoals.userId, userId), eq(weeklyGoals.weekStart, weekStart)));

  const row = rows[0] ?? null;
  return NextResponse.json({
    weekStart,
    goals: row?.goals ?? {},
    lastGeneratedAt: row?.lastGeneratedAt ?? null,
  });
}

/**
 * PUT /api/dashboard/weekly-goals
 *
 * Upserts the goals for a given week. Body shape:
 *   { weekStart: 'YYYY-MM-DD', goals: { [childId]: { [subjectId]: number } } }
 */
export async function PUT(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.weekStart || !ISO_DATE.test(body.weekStart)) {
    return NextResponse.json({ error: 'weekStart required as YYYY-MM-DD' }, { status: 400 });
  }
  if (!body.goals || typeof body.goals !== 'object') {
    return NextResponse.json({ error: 'goals must be an object' }, { status: 400 });
  }

  const weekStart = isoMonday(body.weekStart);

  // Validate goals shape: clamp counts to [0, 12], drop empty kids
  const cleaned: Record<string, Record<string, number>> = {};
  for (const [childId, subjects] of Object.entries(body.goals)) {
    if (!subjects || typeof subjects !== 'object') continue;
    const inner: Record<string, number> = {};
    for (const [subjectId, count] of Object.entries(subjects)) {
      if (typeof count !== 'number' || !Number.isFinite(count)) continue;
      const clamped = Math.max(0, Math.min(12, Math.floor(count)));
      if (clamped > 0) inner[subjectId] = clamped;
    }
    if (Object.keys(inner).length > 0) cleaned[childId] = inner;
  }

  // Atomic upsert -- prevents the race when rapid stepper clicks fire
  // concurrent saves that all see "no row" and try to insert.
  const [row] = await db
    .insert(weeklyGoals)
    .values({ userId, weekStart, goals: cleaned })
    .onConflictDoUpdate({
      target: [weeklyGoals.userId, weeklyGoals.weekStart],
      set: { goals: cleaned, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ goals: row.goals, weekStart: row.weekStart });
}
