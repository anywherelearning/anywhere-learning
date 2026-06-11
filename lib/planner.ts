/**
 * Goal-based weekly planner with auto-rescheduler.
 *
 * Parents declare WEEKLY GOALS, not time blocks. The planner places one
 * activity per goal-unit across the week respecting:
 *
 *   1. Hard constraints
 *      - Unavailable windows of kind 'all-off' or 'co-op' (no schoolwork)
 *      - Days outside the target week
 *      - Existing calendar events that already cover that kid + subject
 *
 *   2. Soft preferences
 *      - During 'mom-out' windows, prefer INDEPENDENT-mode activities
 *      - Don't pile 3+ mom-led blocks on the same kid in one day
 *      - Spread same-kid same-subject across multiple days when possible
 *      - Prefer activities that haven't been done in the last 30 days
 *      - Prefer fresh content over reruns
 *      - Match the kid's age to activity age range
 *
 * The output is an array of CalendarEvent-shaped placements ready to be
 * persisted. The planner never deletes existing events. Callers can prune
 * stale generated events (where `skipped=false` and `completed=false`)
 * before re-running.
 */

import {
  ENRICHED_ACTIVITIES,
  type EnrichedActivity,
  type Independence,
} from './activity-metadata';
import type { Kid, LogSummary } from './recommender';

export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Mon ... 6=Sun

/** Per-kid per-subject targets for one week. */
export type WeeklyGoals = Record<string, Record<string, number>>; // childId → subjectId → count

export interface UnavailableWindow {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  label: string | null;
  kind: 'mom-out' | 'all-off' | 'co-op';
}

export interface ExistingEvent {
  id: string;
  date: string;
  productSlug: string | null;
  category: string | null;
  childIds: string[];
  mode: 'independent' | 'together' | 'either';
  completed: boolean;
  skipped: boolean;
}

/** The parent's own curriculum / materials (not an AL activity). */
export interface CustomResource {
  id: string;
  title: string;
  subjects: string[];
  /** Which kids use it. Empty = all kids. */
  childIds: string[];
  mode: 'independent' | 'together' | 'either';
  durationMinutes: number | null;
  cadence: 'flexible' | 'fixed';
  /** For 'flexible': times per week. */
  timesPerWeek: number | null;
  /** For 'fixed': weekday indices 0=Mon ... 6=Sun. */
  fixedDays: number[];
}

export interface Placement {
  /** ISO YYYY-MM-DD. */
  date: string;
  title: string;
  /** 'activity' = AL activity, 'custom' = parent's own material. */
  type: 'activity' | 'custom';
  category: string | null;
  /** AL activity slug, or null for custom resources. */
  productSlug: string | null;
  /** Set when this placement is the parent's own curriculum. */
  customResourceId: string | null;
  subjects: string[];
  childIds: string[];
  childNames: string[];
  mode: 'independent' | 'together' | 'either';
  durationMinutes: number;
  /** Which weekly_goal row this placement satisfies. */
  weeklyGoalKey: string; // `${childId}::${subjectId}`
  /** Short reason string shown in the UI. */
  reason: string;
}

export interface PlanResult {
  placements: Placement[];
  /** Unfulfilled goals: childId → subjectId → remaining count. */
  unfulfilled: Record<string, Record<string, number>>;
  /** Soft warnings the UI may want to surface. */
  notes: string[];
}

export interface PlanInputs {
  weekStart: string; // YYYY-MM-DD (Monday)
  nowDate: string;  // YYYY-MM-DD
  kids: Kid[];
  goals: WeeklyGoals;
  unavailable: UnavailableWindow[];
  existingEvents: ExistingEvent[];
  logs: LogSummary[];
  /** The parent's own curriculum. Placed first, before AL activities fill goals. */
  customResources?: CustomResource[];
}

// ─── Date helpers (pure, no Date math beyond UTC ISO arithmetic) ─────────────

/** Returns YYYY-MM-DD for `offsetDays` after `weekStart`. */
function dayOfWeek(weekStart: string, offsetDays: number): string {
  const t = Date.parse(`${weekStart}T00:00:00Z`) + offsetDays * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  );
}

function isFuture(date: string, nowDate: string): boolean {
  return Date.parse(`${date}T00:00:00Z`) >= Date.parse(`${nowDate}T00:00:00Z`);
}

// ─── Activity selection ──────────────────────────────────────────────────────

interface CandidatePick {
  activity: EnrichedActivity;
  score: number;
  reason: string;
}

/** Score an activity for a specific kid + subject in this planning context. */
function scoreActivity(
  activity: EnrichedActivity,
  kid: Kid,
  subjectId: string,
  logs: LogSummary[],
  existingSlugs: Set<string>,
  preferIndependent: boolean,
  now: Date
): { score: number; reason: string } | null {
  // Subject must match
  if (!activity.subjects.includes(subjectId)) return null;

  // Kid age must fit
  if (kid.birthYear) {
    const age = now.getFullYear() - kid.birthYear;
    if (age < activity.ageMin - 1 || age > activity.ageMax + 1) return null;
  }

  // Already on this week's plan: skip (we want variety)
  if (existingSlugs.has(activity.product.slug)) return null;

  let score = 50;
  let reason = activity.product.name;

  // Independence preference
  if (preferIndependent && activity.independence === 'independent') {
    score += 25;
    reason = `${activity.product.name} (solo-friendly)`;
  } else if (preferIndependent && activity.independence === 'together') {
    score -= 30;
  }

  // Freshness: how recently has this kid done this activity?
  const lastLog = logs
    .filter((l) => l.productSlug === activity.product.slug)
    .map((l) => Date.parse(`${l.date}T00:00:00Z`))
    .sort((a, b) => b - a)[0];

  if (lastLog) {
    const daysSince = Math.floor((now.getTime() - lastLog) / 86_400_000);
    if (daysSince < 14) score -= 25;
    else if (daysSince < 30) score -= 10;
    else if (daysSince > 90) score += 10;
  } else {
    score += 8; // never done
  }

  // Season fit
  const month = now.getMonth() + 1;
  if (activity.bestMonths.length > 0) {
    if (activity.bestMonths.includes(month)) score += 12;
    else score -= 4;
  }

  // Prep penalty: prefer no-prep when stacking many activities
  if (activity.prepLevel === 'none') score += 4;
  else if (activity.prepLevel === 'planned') score -= 6;

  return { score, reason };
}

/** Pick the next best activity for a kid+subject from the catalog. */
function pickActivity(
  kid: Kid,
  subjectId: string,
  logs: LogSummary[],
  existingSlugs: Set<string>,
  preferIndependent: boolean,
  now: Date
): CandidatePick | null {
  const scored: CandidatePick[] = [];
  for (const activity of ENRICHED_ACTIVITIES) {
    const result = scoreActivity(
      activity,
      kid,
      subjectId,
      logs,
      existingSlugs,
      preferIndependent,
      now
    );
    if (result) {
      scored.push({ activity, score: result.score, reason: result.reason });
    }
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

// ─── Day capacity model ──────────────────────────────────────────────────────

interface DayContext {
  date: string;
  isAllOff: boolean;
  momOutMinutes: number;
  /** Per-kid: minutes already booked TOGETHER (parent-led) this day. */
  togetherMinutes: Record<string, number>;
  /** Per-kid: total minutes booked this day. */
  totalMinutes: Record<string, number>;
  /** Per-kid: count of together-mode blocks. */
  togetherCount: Record<string, number>;
}

function buildDayContexts(
  weekStart: string,
  unavailable: UnavailableWindow[],
  existing: ExistingEvent[]
): DayContext[] {
  const contexts: DayContext[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = dayOfWeek(weekStart, i);
    const windows = unavailable.filter((w) => w.date === date);
    const isAllOff = windows.some((w) => w.kind === 'all-off');
    let momOutMinutes = 0;
    for (const w of windows) {
      if (w.kind === 'mom-out') {
        momOutMinutes += minutesBetween(w.startTime, w.endTime);
      }
    }
    const ctx: DayContext = {
      date,
      isAllOff,
      momOutMinutes,
      togetherMinutes: {},
      totalMinutes: {},
      togetherCount: {},
    };
    for (const ev of existing) {
      if (ev.date !== date || ev.skipped) continue;
      const minutes = 45; // default budget assumption for existing rows without duration
      for (const childId of ev.childIds.length > 0 ? ev.childIds : ['__family']) {
        ctx.totalMinutes[childId] = (ctx.totalMinutes[childId] ?? 0) + minutes;
        if (ev.mode === 'together') {
          ctx.togetherMinutes[childId] = (ctx.togetherMinutes[childId] ?? 0) + minutes;
          ctx.togetherCount[childId] = (ctx.togetherCount[childId] ?? 0) + 1;
        }
      }
    }
    contexts.push(ctx);
  }
  return contexts;
}

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

/** Score a candidate day for placing this activity for this kid. Higher is better. */
function scoreDay(
  ctx: DayContext,
  childId: string,
  independence: Independence,
  durationMinutes: number,
  nowDate: string
): number | null {
  // Skip days marked entirely off (travel, sick, holiday)
  if (ctx.isAllOff) return null;
  // Skip past days (we never schedule into the past)
  if (!isFuture(ctx.date, nowDate)) return null;

  const total = ctx.totalMinutes[childId] ?? 0;
  const togetherCount = ctx.togetherCount[childId] ?? 0;

  let score = 50;

  // Light days are better than crammed days
  score -= Math.floor(total / 30) * 4;

  // Avoid stacking 3+ mom-led blocks on the same kid
  if (independence === 'together' && togetherCount >= 2) score -= 20;
  if (independence === 'together' && togetherCount >= 3) score -= 60;

  // Mom-out windows on this day attract independent work
  if (ctx.momOutMinutes >= durationMinutes && independence === 'independent') {
    score += 25;
  }
  // ...and repel parent-led work
  if (ctx.momOutMinutes >= durationMinutes && independence === 'together') {
    score -= 15;
  }

  // Weekends carry a soft penalty so the week pre-fills first
  const day = new Date(`${ctx.date}T00:00:00Z`).getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) score -= 10;

  return score;
}

// ─── Main planner ────────────────────────────────────────────────────────────

/**
 * Generate a week plan from goals + constraints. Idempotent: callers should
 * delete prior generated-but-not-completed events first if they want a clean
 * re-run.
 */
export function generateWeekPlan(inputs: PlanInputs): PlanResult {
  const { weekStart, nowDate, kids, goals, unavailable, existingEvents, logs } = inputs;
  const now = new Date(`${nowDate}T00:00:00Z`);
  const kidById = Object.fromEntries(kids.map((k) => [k.id, k]));

  const dayContexts = buildDayContexts(weekStart, unavailable, existingEvents);
  const placements: Placement[] = [];
  const unfulfilled: Record<string, Record<string, number>> = {};
  const notes: string[] = [];

  // Track which slugs we've already placed this week to avoid duplicates.
  const placedSlugs = new Set<string>(
    existingEvents
      .filter((e) => !e.skipped)
      .map((e) => e.productSlug)
      .filter((s): s is string => !!s)
  );

  // Mutate a day's load so later placements avoid over-stacking.
  function applyLoad(
    ctx: DayContext,
    childId: string,
    mode: 'independent' | 'together' | 'either',
    minutes: number
  ) {
    ctx.totalMinutes[childId] = (ctx.totalMinutes[childId] ?? 0) + minutes;
    if (mode === 'together') {
      ctx.togetherMinutes[childId] = (ctx.togetherMinutes[childId] ?? 0) + minutes;
      ctx.togetherCount[childId] = (ctx.togetherCount[childId] ?? 0) + 1;
    } else if (mode === 'independent' && ctx.momOutMinutes > 0) {
      ctx.momOutMinutes = Math.max(0, ctx.momOutMinutes - minutes);
    }
  }

  // ─── Step 1: place the parent's own curriculum (the backbone) ──────────────
  // These are placed at their declared cadence FIRST, then counted toward the
  // weekly subject goals so AL activities only fill what's left.
  const customResources = inputs.customResources ?? [];
  const customCoverage: Record<string, Record<string, number>> = {}; // childId → subjectId → count

  const placeCustom = (res: CustomResource, kid: Kid, ctx: DayContext) => {
    const minutes = res.durationMinutes ?? 30;
    placements.push({
      date: ctx.date,
      title: res.title,
      type: 'custom',
      category: null,
      productSlug: null,
      customResourceId: res.id,
      subjects: res.subjects,
      childIds: [kid.id],
      childNames: [kid.name],
      mode: res.mode,
      durationMinutes: minutes,
      weeklyGoalKey: `${kid.id}::custom`,
      reason: 'Your material',
    });
    applyLoad(ctx, kid.id, res.mode, minutes);
    for (const subj of res.subjects) {
      customCoverage[kid.id] = customCoverage[kid.id] ?? {};
      customCoverage[kid.id][subj] = (customCoverage[kid.id][subj] ?? 0) + 1;
    }
  };

  for (const kid of kids) {
    for (const res of customResources) {
      const appliesToKid = res.childIds.length === 0 || res.childIds.includes(kid.id);
      if (!appliesToKid) continue;

      if (res.cadence === 'fixed') {
        // Place on each specified weekday (0=Mon ... 6=Sun) that's open.
        for (const dayIdx of res.fixedDays) {
          const ctx = dayContexts[dayIdx];
          if (!ctx || ctx.isAllOff || !isFuture(ctx.date, nowDate)) continue;
          placeCustom(res, kid, ctx);
        }
      } else {
        // Flexible: spread `timesPerWeek` across the lightest open days.
        const want = res.timesPerWeek ?? 3;
        const candidates = dayContexts
          .map((c, i) => ({ i, c }))
          .filter(({ c }) => !c.isAllOff && isFuture(c.date, nowDate))
          .sort(
            (a, b) =>
              (a.c.totalMinutes[kid.id] ?? 0) - (b.c.totalMinutes[kid.id] ?? 0) || a.i - b.i
          );
        if (candidates.length === 0) continue;
        for (let n = 0; n < want; n += 1) {
          placeCustom(res, kid, candidates[n % candidates.length].c);
        }
      }
    }
  }

  // ─── Step 2: fill remaining weekly goals with AL activities ────────────────
  // Count how many "together" placements each kid has so far (per day),
  // and remaining mom-out budget per day, by mutating dayContexts as we go.
  for (const childId of Object.keys(goals)) {
    const kid = kidById[childId];
    if (!kid) continue;
    const kidGoals = goals[childId];

    for (const subjectId of Object.keys(kidGoals)) {
      const target = kidGoals[subjectId];
      if (!target || target <= 0) continue;

      // How many events already cover this kid+subject this week?
      const alreadyCovered = existingEvents.filter((e) => {
        if (e.skipped) return false;
        if (!e.childIds.includes(childId)) return false;
        const enriched = ENRICHED_ACTIVITIES.find((a) => a.product.slug === e.productSlug);
        return enriched?.subjects.includes(subjectId);
      }).length;

      // The parent's own curriculum we just placed also counts toward the goal,
      // so AL activities only top up what's left.
      const customCovered = customCoverage[childId]?.[subjectId] ?? 0;

      let remaining = target - alreadyCovered - customCovered;
      if (remaining <= 0) continue;

      // Try to place `remaining` activities for this kid + subject
      while (remaining > 0) {
        // Decide whether to prefer independent based on mom-out budget across the week
        const futureMomOut = dayContexts
          .filter((c) => isFuture(c.date, nowDate))
          .reduce((sum, c) => sum + c.momOutMinutes, 0);
        const preferIndependent = futureMomOut > 0 && remaining % 2 === 1;

        const pick = pickActivity(kid, subjectId, logs, placedSlugs, preferIndependent, now);
        if (!pick) {
          unfulfilled[childId] = unfulfilled[childId] ?? {};
          unfulfilled[childId][subjectId] = (unfulfilled[childId][subjectId] ?? 0) + remaining;
          notes.push(
            `Could not find a fresh ${subjectId} activity for ${kid.name}. (${remaining} left to place)`
          );
          break;
        }

        // Find the best day for this activity
        let bestIdx = -1;
        let bestScore = -Infinity;
        for (let i = 0; i < dayContexts.length; i += 1) {
          const dayScore = scoreDay(
            dayContexts[i],
            childId,
            pick.activity.independence,
            pick.activity.durationMinutes,
            nowDate
          );
          if (dayScore === null) continue;
          if (dayScore > bestScore) {
            bestScore = dayScore;
            bestIdx = i;
          }
        }

        if (bestIdx === -1) {
          unfulfilled[childId] = unfulfilled[childId] ?? {};
          unfulfilled[childId][subjectId] = (unfulfilled[childId][subjectId] ?? 0) + remaining;
          notes.push(
            `No open day this week to place ${pick.activity.product.name} for ${kid.name}.`
          );
          break;
        }

        const ctx = dayContexts[bestIdx];

        // Commit the placement
        placements.push({
          date: ctx.date,
          title: pick.activity.product.name,
          type: 'activity',
          category: pick.activity.product.category,
          productSlug: pick.activity.product.slug,
          customResourceId: null,
          subjects: pick.activity.subjects,
          childIds: [childId],
          childNames: [kid.name],
          mode: pick.activity.independence,
          durationMinutes: pick.activity.durationMinutes,
          weeklyGoalKey: `${childId}::${subjectId}`,
          reason: pick.reason,
        });
        placedSlugs.add(pick.activity.product.slug);

        // Update day context so the next placement avoids stacking too much
        ctx.totalMinutes[childId] =
          (ctx.totalMinutes[childId] ?? 0) + pick.activity.durationMinutes;
        if (pick.activity.independence === 'together') {
          ctx.togetherMinutes[childId] =
            (ctx.togetherMinutes[childId] ?? 0) + pick.activity.durationMinutes;
          ctx.togetherCount[childId] = (ctx.togetherCount[childId] ?? 0) + 1;
        } else if (pick.activity.independence === 'independent' && ctx.momOutMinutes > 0) {
          // Burn mom-out budget so the next placement looks elsewhere
          ctx.momOutMinutes = Math.max(0, ctx.momOutMinutes - pick.activity.durationMinutes);
        }

        remaining -= 1;
      }
    }
  }

  if (placements.length === 0 && Object.keys(goals).length > 0) {
    notes.push(
      'No goals to fill. Add a few subject targets per kid and run the planner again.'
    );
  }

  return { placements, unfulfilled, notes };
}

/**
 * When a parent skips a single event, find the next-best future day THIS WEEK
 * to re-place the same activity for the same kid(s). Returns null if there's
 * no room left in the week.
 */
export function reshuffleAfterSkip(args: {
  skippedEvent: ExistingEvent & { productSlug: string; title: string };
  kids: Kid[];
  weekStart: string;
  nowDate: string;
  unavailable: UnavailableWindow[];
  otherEvents: ExistingEvent[];
}): { date: string; reason: string } | null {
  const { skippedEvent, weekStart, nowDate, unavailable, otherEvents } = args;
  const enriched = ENRICHED_ACTIVITIES.find(
    (a) => a.product.slug === skippedEvent.productSlug
  );
  if (!enriched) return null;

  const dayContexts = buildDayContexts(weekStart, unavailable, otherEvents);
  const targetChildId = skippedEvent.childIds[0] ?? '__family';

  let bestIdx = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < dayContexts.length; i += 1) {
    if (dayContexts[i].date === skippedEvent.date) continue;
    const day = scoreDay(
      dayContexts[i],
      targetChildId,
      enriched.independence,
      enriched.durationMinutes,
      nowDate
    );
    if (day === null) continue;
    if (day > bestScore) {
      bestScore = day;
      bestIdx = i;
    }
  }
  if (bestIdx === -1) return null;
  const newDate = dayContexts[bestIdx].date;
  const daysShifted = daysBetween(skippedEvent.date, newDate);
  return {
    date: newDate,
    reason: daysShifted > 0 ? `Moved +${daysShifted}d` : `Moved ${daysShifted}d`,
  };
}

/** Compute the ISO Monday of the week containing `date`. */
export function isoMonday(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun ... 6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  return new Date(d.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
}
