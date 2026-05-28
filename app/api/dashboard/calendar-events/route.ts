import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq, gte, lte, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { calendarEvents, logEntries, unavailableWindows } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { LOG_ENTRY_TYPE_IDS, defaultSubjectsForCategory } from '@/lib/taxonomy';
import {
  isoMonday,
  reshuffleAfterSkip,
  type ExistingEvent,
  type UnavailableWindow,
} from '@/lib/planner';

export const runtime = 'nodejs';

const VALID_RECURRENCES = new Set(['none', 'weekly', 'biweekly', 'monthly']);
const VALID_MODES = new Set(['independent', 'together', 'either']);

interface PostBody {
  date?: string;
  title?: string;
  type?: string;
  category?: string | null;
  productSlug?: string | null;
  notes?: string | null;
  recurrence?: string;
  recurrenceUntil?: string | null;
  childIds?: string[];
  childNames?: string[];
  mode?: string;
  durationMinutes?: number | null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

interface EventRow {
  id: string;
  userId: string;
  date: string;
  title: string;
  type: string;
  category: string | null;
  productSlug: string | null;
  notes: string | null;
  completed: boolean;
  logEntryId: string | null;
  recurrence: string;
  recurrenceUntil: string | null;
  childIds: string[];
  childNames: string[];
  mode: string;
  durationMinutes: number | null;
  generatedByPlannerAt: Date | null;
  weeklyGoalId: string | null;
  skipped: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpandedEvent extends EventRow {
  /** True for the original row, false for synthetic recurrence instances. */
  isOccurrence: boolean;
  /** The originating event id (same as `id` for the original row). */
  seriesId: string;
}

/**
 * Expand a recurring event into individual occurrences within [from, to].
 * The seed event itself counts as one occurrence (its own date).
 * Completed events do not recur (one-and-done).
 */
function expandRecurrence(event: EventRow, from: string, to: string): ExpandedEvent[] {
  if (event.recurrence === 'none' || event.completed) {
    return [{ ...event, isOccurrence: false, seriesId: event.id }];
  }

  const step = event.recurrence === 'weekly' ? 7 : event.recurrence === 'biweekly' ? 14 : 0;
  const monthly = event.recurrence === 'monthly';

  const limit = event.recurrenceUntil
    ? event.recurrenceUntil < to
      ? event.recurrenceUntil
      : to
    : to;

  const out: ExpandedEvent[] = [];
  let cursor = event.date;
  let i = 0;
  while (cursor <= limit && i < 200) {
    if (cursor >= from) {
      out.push({
        ...event,
        date: cursor,
        isOccurrence: i > 0,
        seriesId: event.id,
        // Synthesize a stable id per occurrence so React keys are unique
        id: i === 0 ? event.id : `${event.id}:${cursor}`,
      });
    }
    if (monthly) cursor = addMonths(cursor, 1);
    else cursor = addDays(cursor, step);
    i++;
  }
  return out;
}

export async function GET(req: NextRequest) {
  const userId = await getDashboardUserId();
  const params = req.nextUrl.searchParams;

  const from = params.get('from');
  const to = params.get('to');
  const fromIso = isIsoDate(from) ? from : '1970-01-01';
  const toIso = isIsoDate(to) ? to : '2099-12-31';

  // Need to grab any event whose original date might be before `from` if it recurs into the range,
  // OR whose date is within the window. We grab "all events on or before to" then expand+filter.
  const filters = [eq(calendarEvents.userId, userId), lte(calendarEvents.date, toIso)];
  // If non-recurring, also enforce date >= from
  // (Recurring events whose start is before `from` may still emit instances within range.)
  filters.push(
    or(
      eq(calendarEvents.recurrence, 'weekly'),
      eq(calendarEvents.recurrence, 'biweekly'),
      eq(calendarEvents.recurrence, 'monthly'),
      gte(calendarEvents.date, fromIso),
    )!,
  );

  const rows = await db
    .select()
    .from(calendarEvents)
    .where(and(...filters))
    .orderBy(asc(calendarEvents.date), asc(calendarEvents.createdAt));

  // Expand recurring events within the window
  const events: ExpandedEvent[] = [];
  for (const row of rows) {
    const eventRow: EventRow = {
      ...row,
      // Drizzle returns date as string for the date column
      date: row.date,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as EventRow;
    events.push(...expandRecurrence(eventRow, fromIso, toIso));
  }
  events.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ events });
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
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }
  if (!body.type || !LOG_ENTRY_TYPE_IDS.has(body.type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }
  const recurrence = body.recurrence && VALID_RECURRENCES.has(body.recurrence)
    ? body.recurrence
    : 'none';
  const recurrenceUntil = body.recurrenceUntil && isIsoDate(body.recurrenceUntil)
    ? body.recurrenceUntil
    : null;

  const childIds = Array.isArray(body.childIds)
    ? body.childIds.filter((s): s is string => typeof s === 'string').slice(0, 8)
    : [];
  const childNames = Array.isArray(body.childNames)
    ? body.childNames.filter((s): s is string => typeof s === 'string').slice(0, 8)
    : [];
  const mode = body.mode && VALID_MODES.has(body.mode) ? body.mode : 'either';
  const durationMinutes =
    typeof body.durationMinutes === 'number' && body.durationMinutes > 0 && body.durationMinutes < 600
      ? Math.round(body.durationMinutes)
      : null;

  const [created] = await db
    .insert(calendarEvents)
    .values({
      userId,
      date: body.date,
      title: body.title.trim().slice(0, 200),
      type: body.type,
      category: body.category ?? null,
      productSlug: body.productSlug ?? null,
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
      recurrence,
      recurrenceUntil,
      childIds,
      childNames,
      mode,
      durationMinutes,
    })
    .returning();

  return NextResponse.json({ event: created }, { status: 201 });
}

interface CompletePayload {
  action: 'complete';
  eventId: string;
  /** ISO date when this specific occurrence happened (defaults to event.date). */
  occurrenceDate?: string;
  subjects?: string[];
  notes?: string;
}

interface SkipPayload {
  action: 'skip-and-reshuffle';
  eventId: string;
  /** When true, also create a new event on the best available day this week. */
  reshuffle?: boolean;
}

type PutPayload = CompletePayload | SkipPayload;

/**
 * Special endpoint: actions on a calendar event.
 *
 *  - 'complete': mark as done and spawn a log entry. For recurring events
 *    only the single occurrence is marked done; the series continues.
 *
 *  - 'skip-and-reshuffle': flag the event as skipped. If `reshuffle` is true
 *    (default), find the next-best day THIS WEEK to re-place the same activity
 *    and create a new event there. Returns both rows.
 */
export async function PUT(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PutPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.action === 'skip-and-reshuffle') {
    return handleSkipAndReshuffle(userId, body);
  }
  if (body.action === 'complete') {
    return handleComplete(userId, body);
  }
  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}

async function handleComplete(userId: string, body: CompletePayload) {
  // Allow synthetic occurrence ids in the form "seriesId:YYYY-MM-DD"
  const rawId = body.eventId ?? '';
  const [seriesId, occurrenceFromId] = rawId.split(':');
  const occurrenceDate = isIsoDate(body.occurrenceDate)
    ? body.occurrenceDate
    : isIsoDate(occurrenceFromId)
    ? occurrenceFromId
    : null;

  if (!seriesId) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, seriesId), eq(calendarEvents.userId, userId)));

  if (!event) {
    return NextResponse.json({ error: 'event not found' }, { status: 404 });
  }

  const subjects = Array.isArray(body.subjects) && body.subjects.length > 0
    ? body.subjects
    : defaultSubjectsForCategory(event.category);

  const logDate = occurrenceDate ?? event.date;

  const [logRow] = await db
    .insert(logEntries)
    .values({
      userId,
      date: logDate,
      title: event.title,
      type: event.type,
      category: event.category,
      productSlug: event.productSlug,
      subjects,
      childIds: event.childIds ?? [],
      childNames: event.childNames ?? [],
      durationMinutes: event.durationMinutes,
      notes: body.notes ?? event.notes,
    })
    .returning();

  // For non-recurring events, mark the row completed. For recurring events,
  // do NOT mark the series as completed - the user is checking off a single
  // occurrence and the series should continue.
  if (event.recurrence === 'none') {
    const [updated] = await db
      .update(calendarEvents)
      .set({ completed: true, logEntryId: logRow.id, updatedAt: new Date() })
      .where(eq(calendarEvents.id, event.id))
      .returning();
    return NextResponse.json({ event: updated, entry: logRow });
  }

  return NextResponse.json({ event, entry: logRow });
}

async function handleSkipAndReshuffle(userId: string, body: SkipPayload) {
  const rawId = body.eventId ?? '';
  const seriesId = rawId.split(':')[0];
  if (!seriesId) return NextResponse.json({ error: 'invalid request' }, { status: 400 });

  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, seriesId), eq(calendarEvents.userId, userId)));

  if (!event) return NextResponse.json({ error: 'event not found' }, { status: 404 });

  // Mark it skipped
  await db
    .update(calendarEvents)
    .set({ skipped: true, updatedAt: new Date() })
    .where(eq(calendarEvents.id, event.id));

  if (body.reshuffle === false || !event.productSlug) {
    return NextResponse.json({ event: { ...event, skipped: true }, reshuffled: null });
  }

  // Load week context for the reshuffle attempt
  const weekStart = isoMonday(event.date);
  const weekEnd = (() => {
    const t = Date.parse(`${weekStart}T00:00:00Z`) + 6 * 86_400_000;
    return new Date(t).toISOString().slice(0, 10);
  })();

  const otherEventRows = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.date, weekStart),
        lte(calendarEvents.date, weekEnd),
      ),
    );
  const otherEvents: ExistingEvent[] = otherEventRows
    .filter((r) => r.id !== event.id)
    .map((r) => ({
      id: r.id,
      date: r.date,
      productSlug: r.productSlug,
      category: r.category,
      childIds: Array.isArray(r.childIds) ? (r.childIds as string[]) : [],
      mode:
        r.mode === 'independent' || r.mode === 'together'
          ? r.mode
          : 'either',
      completed: r.completed,
      skipped: r.skipped,
    }));

  const winRows = await db
    .select()
    .from(unavailableWindows)
    .where(
      and(
        eq(unavailableWindows.userId, userId),
        gte(unavailableWindows.date, weekStart),
        lte(unavailableWindows.date, weekEnd),
      ),
    );
  const unavailable: UnavailableWindow[] = winRows.map((w) => ({
    id: w.id,
    date: w.date,
    startTime: w.startTime,
    endTime: w.endTime,
    label: w.label,
    kind: w.kind === 'all-off' || w.kind === 'co-op' ? w.kind : 'mom-out',
  }));

  const childIds = Array.isArray(event.childIds) ? (event.childIds as string[]) : [];

  const move = reshuffleAfterSkip({
    skippedEvent: {
      id: event.id,
      date: event.date,
      productSlug: event.productSlug,
      title: event.title,
      category: event.category,
      childIds,
      mode:
        event.mode === 'independent' || event.mode === 'together'
          ? event.mode
          : 'either',
      completed: event.completed,
      skipped: true,
    },
    kids: [], // not needed beyond targeting; reshuffle uses childIds[0]
    weekStart,
    nowDate: new Date().toISOString().slice(0, 10),
    unavailable,
    otherEvents,
  });

  if (!move) {
    return NextResponse.json({ event: { ...event, skipped: true }, reshuffled: null });
  }

  const [newEvent] = await db
    .insert(calendarEvents)
    .values({
      userId,
      date: move.date,
      title: event.title,
      type: event.type,
      category: event.category,
      productSlug: event.productSlug,
      notes: `${event.notes ?? ''}\n${move.reason} (auto-reshuffled from ${event.date})`.trim(),
      childIds,
      childNames: Array.isArray(event.childNames) ? (event.childNames as string[]) : [],
      mode: event.mode,
      durationMinutes: event.durationMinutes,
      generatedByPlannerAt: new Date(),
      weeklyGoalId: event.weeklyGoalId,
    })
    .returning();

  return NextResponse.json({
    event: { ...event, skipped: true },
    reshuffled: { event: newEvent, reason: move.reason },
  });
}
