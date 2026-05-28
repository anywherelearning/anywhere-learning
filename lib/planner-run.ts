/**
 * Server-side planner actions shared by the REST routes and the AI agent.
 *
 * One source of truth for "run the planner for a week" and "start a program",
 * so the manual Generate button, the program shelf, and the AI assistant all
 * behave identically.
 */

import { and, eq, gte, isNotNull, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  calendarEvents,
  children,
  customResources,
  logEntries,
  unavailableWindows,
  weeklyGoals,
} from '@/lib/db/schema';
import {
  generateWeekPlan,
  isoMonday,
  type CustomResource,
  type ExistingEvent,
  type PlanResult,
  type UnavailableWindow,
} from '@/lib/planner';
import type { Kid, LogSummary } from '@/lib/recommender';
import { getProgram } from '@/lib/programs';
import { ENRICHED_BY_SLUG } from '@/lib/activity-metadata';

function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export interface RunPlannerResult extends PlanResult {
  weekStart: string;
  createdEventIds: string[];
}

/**
 * Load everything for a week, run the goal-based planner, and (unless dryRun)
 * persist the placements as calendar events.
 */
export async function runPlannerForWeek(
  userId: string,
  weekStartRaw: string | undefined,
  opts: { clearPriorGenerated?: boolean; dryRun?: boolean } = {},
): Promise<RunPlannerResult> {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = weekStartRaw ? isoMonday(weekStartRaw) : isoMonday(today);
  const weekEnd = addDaysIso(weekStart, 6);
  const clearPrior = opts.clearPriorGenerated !== false;
  const dryRun = opts.dryRun === true;

  const [goalsRow] = await db
    .select()
    .from(weeklyGoals)
    .where(and(eq(weeklyGoals.userId, userId), eq(weeklyGoals.weekStart, weekStart)));
  const goals = goalsRow?.goals ?? {};

  if (Object.keys(goals).length === 0) {
    return {
      weekStart,
      placements: [],
      unfulfilled: {},
      notes: ['No goals set for this week. Set subject targets per kid first.'],
      createdEventIds: [],
    };
  }

  const kidRows = await db.select().from(children).where(eq(children.userId, userId));
  const kids: Kid[] = kidRows.map((k) => ({ id: k.id, name: k.name, birthYear: k.birthYear }));
  if (kids.length === 0) {
    return {
      weekStart,
      placements: [],
      unfulfilled: {},
      notes: ['Add at least one kid before generating a plan.'],
      createdEventIds: [],
    };
  }

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

  if (clearPrior && !dryRun) {
    await db
      .delete(calendarEvents)
      .where(
        and(
          eq(calendarEvents.userId, userId),
          gte(calendarEvents.date, weekStart),
          lte(calendarEvents.date, weekEnd),
          eq(calendarEvents.completed, false),
          eq(calendarEvents.skipped, false),
          isNotNull(calendarEvents.generatedByPlannerAt),
        ),
      );
  }

  const eventRows = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.date, weekStart),
        lte(calendarEvents.date, weekEnd),
      ),
    );
  const existingEvents: ExistingEvent[] = eventRows.map((e) => ({
    id: e.id,
    date: e.date,
    productSlug: e.productSlug,
    category: e.category,
    childIds: Array.isArray(e.childIds) ? (e.childIds as string[]) : [],
    mode: e.mode === 'independent' || e.mode === 'together' ? e.mode : 'either',
    completed: e.completed,
    skipped: e.skipped,
  }));

  const ninetyDaysAgo = addDaysIso(today, -90);
  const logRows = await db
    .select({
      productSlug: logEntries.productSlug,
      date: logEntries.date,
      subjects: logEntries.subjects,
    })
    .from(logEntries)
    .where(and(eq(logEntries.userId, userId), gte(logEntries.date, ninetyDaysAgo)));
  const logs: LogSummary[] = logRows.map((l) => ({
    productSlug: l.productSlug,
    date: l.date,
    subjects: Array.isArray(l.subjects) ? (l.subjects as string[]) : [],
  }));

  const resourceRows = await db
    .select()
    .from(customResources)
    .where(and(eq(customResources.userId, userId), eq(customResources.active, true)));
  const ownCurriculum: CustomResource[] = resourceRows.map((r) => ({
    id: r.id,
    title: r.title,
    subjects: Array.isArray(r.subjects) ? (r.subjects as string[]) : [],
    childIds: Array.isArray(r.childIds) ? (r.childIds as string[]) : [],
    mode: r.mode === 'independent' || r.mode === 'together' ? r.mode : 'either',
    durationMinutes: r.durationMinutes,
    cadence: r.cadence === 'fixed' ? 'fixed' : 'flexible',
    timesPerWeek: r.timesPerWeek,
    fixedDays: Array.isArray(r.fixedDays) ? (r.fixedDays as number[]) : [],
  }));

  const result = generateWeekPlan({
    weekStart,
    nowDate: today,
    kids,
    goals,
    unavailable,
    existingEvents,
    logs,
    customResources: ownCurriculum,
  });

  if (dryRun) {
    return { weekStart, ...result, createdEventIds: [] };
  }

  const createdEventIds: string[] = [];
  const generatedAt = new Date();
  for (const p of result.placements) {
    const [row] = await db
      .insert(calendarEvents)
      .values({
        userId,
        date: p.date,
        title: p.title,
        type: p.type,
        category: p.category,
        productSlug: p.productSlug,
        customResourceId: p.customResourceId,
        notes: p.reason,
        childIds: p.childIds,
        childNames: p.childNames,
        mode: p.mode,
        durationMinutes: p.durationMinutes,
        generatedByPlannerAt: generatedAt,
      })
      .returning({ id: calendarEvents.id });
    createdEventIds.push(row.id);
  }

  if (goalsRow) {
    await db
      .update(weeklyGoals)
      .set({ lastGeneratedAt: generatedAt, updatedAt: generatedAt })
      .where(eq(weeklyGoals.id, goalsRow.id));
  }

  return { weekStart, ...result, createdEventIds };
}

export interface StartProgramResult {
  created: number;
  weekStart: string;
  programTitle: string;
  weeks: number;
}

/** Drop a program's weekly activities onto the calendar for the given kids. */
export async function startProgramForUser(
  userId: string,
  programId: string,
  requestedChildIds: string[],
  startDateRaw: string | undefined,
): Promise<StartProgramResult | { error: string }> {
  const program = getProgram(programId);
  if (!program) return { error: 'Unknown program' };

  const today = new Date().toISOString().slice(0, 10);
  const startMonday = startDateRaw ? isoMonday(startDateRaw) : isoMonday(today);

  let childIds: string[] = [];
  let childNames: string[] = [];
  if (requestedChildIds.length > 0) {
    const rows = await db
      .select({ id: children.id, name: children.name })
      .from(children)
      .where(eq(children.userId, userId));
    const wanted = new Set(requestedChildIds);
    const matched = rows.filter((r) => wanted.has(r.id));
    childIds = matched.map((r) => r.id);
    childNames = matched.map((r) => r.name);
  }

  const dayOffsets = [0, 2, 4, 1, 3];
  const generatedAt = new Date();
  const values: (typeof calendarEvents.$inferInsert)[] = [];

  for (const wk of program.weeks) {
    const weekMonday = addDaysIso(startMonday, (wk.week - 1) * 7);
    wk.activitySlugs.forEach((slug, idx) => {
      const enriched = ENRICHED_BY_SLUG[slug];
      if (!enriched) return;
      values.push({
        userId,
        date: addDaysIso(weekMonday, dayOffsets[idx % dayOffsets.length]),
        title: enriched.product.name,
        type: 'activity',
        category: enriched.product.category,
        productSlug: slug,
        notes: `${program.title} · Week ${wk.week}: ${wk.theme}`,
        childIds,
        childNames,
        mode: enriched.independence,
        durationMinutes: enriched.durationMinutes,
        generatedByPlannerAt: generatedAt,
      });
    });
  }

  if (values.length === 0) return { error: 'Program has no schedulable activities' };

  await db.insert(calendarEvents).values(values);
  return {
    created: values.length,
    weekStart: startMonday,
    programTitle: program.title,
    weeks: program.weeks.length,
  };
}
