/**
 * Dashboard recommendation engine.
 *
 * Scores every activity against a parent's current situation:
 * - filters they've selected (categories, subjects, age, setting, prep, hide-done)
 * - which kids they have (auto age-narrowing)
 * - what's been logged recently (avoid repeats, prefer variety)
 * - which subjects are under-covered this month (gap-fill bias)
 * - season/month fit
 *
 * Returns ranked results plus per-pick reasoning so the UI can tell the
 * user WHY each activity surfaced.
 */

import { ENRICHED_ACTIVITIES, type EnrichedActivity, type Setting, type PrepLevel } from './activity-metadata';
import { STANDARD_SUBJECTS } from './taxonomy';

export interface Kid {
  id: string;
  name: string;
  birthYear: number | null;
}

export interface LogSummary {
  /** slug of an Anywhere Learning activity that's been logged. Empty for custom entries. */
  productSlug: string | null;
  /** ISO YYYY-MM-DD of when the entry happened. */
  date: string;
  /** Subject ids associated with this entry. */
  subjects: string[];
}

export interface RecommenderFilters {
  /** Selected category slugs. Empty set = no category filter. */
  categories: Set<string>;
  /** Selected subject ids. Empty set = no subject filter. */
  subjects: Set<string>;
  /** 'any' or a specific setting. */
  setting: Setting | 'any';
  /** 'any' or a specific prep level. */
  prep: PrepLevel | 'any';
  /** 'any' or a specific age bucket [min, max]. */
  ageRange: { min: number; max: number } | null;
  /** Hide activities logged in the last N days. */
  hideRecentDays: number;
}

export const DEFAULT_FILTERS: RecommenderFilters = {
  categories: new Set(),
  subjects: new Set(),
  setting: 'any',
  prep: 'any',
  ageRange: null,
  hideRecentDays: 0,
};

export interface ScoredActivity {
  activity: EnrichedActivity;
  score: number;
  /** Short human-readable reasons for the score, ordered by importance. */
  reasons: string[];
  /** Internal score components, exposed for debugging / UI summaries. */
  components: {
    filterMatch: number;
    ageFit: number;
    subjectGap: number;
    seasonFit: number;
    freshness: number;
    coverageBonus: number;
  };
}

/**
 * Compute the subject coverage for the current month from logged entries.
 * Returns a count per subject id; subjects with 0 are explicitly listed too.
 */
export function computeMonthlyCoverage(logs: LogSummary[], now: Date): Record<string, number> {
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const counts: Record<string, number> = {};
  for (const s of STANDARD_SUBJECTS) counts[s.id] = 0;
  for (const log of logs) {
    if (!log.date.startsWith(ym)) continue;
    for (const subj of log.subjects) {
      counts[subj] = (counts[subj] || 0) + 1;
    }
  }
  return counts;
}

/** The two least-covered standard subjects this month, used for gap-fill recommendations. */
export function findCoverageGaps(coverage: Record<string, number>): string[] {
  const standardCounts = STANDARD_SUBJECTS.map((s) => ({ id: s.id, count: coverage[s.id] ?? 0 }));
  standardCounts.sort((a, b) => a.count - b.count);
  return standardCounts.slice(0, 2).map((s) => s.id);
}

/** Convert kids[] to a combined age range, or null if no kids set up. */
export function kidsToAgeRange(kids: Kid[], now: Date): { min: number; max: number } | null {
  const ages = kids
    .map((k) => (k.birthYear ? now.getFullYear() - k.birthYear : null))
    .filter((a): a is number => a !== null && a >= 0 && a <= 25);
  if (ages.length === 0) return null;
  return {
    min: Math.max(0, Math.min(...ages) - 1),
    max: Math.min(25, Math.max(...ages) + 2),
  };
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function ageFitScore(activity: EnrichedActivity, range: { min: number; max: number } | null): number {
  if (!range) return 0;
  const overlap =
    Math.min(activity.ageMax, range.max) - Math.max(activity.ageMin, range.min);
  if (overlap < 0) return -100; // hard no
  // Tight overlap is better than huge spans
  const activityWidth = activity.ageMax - activity.ageMin;
  if (overlap >= range.max - range.min) {
    return activityWidth <= 6 ? 30 : 18;
  }
  return 12;
}

function filterMatchScore(activity: EnrichedActivity, filters: RecommenderFilters): number {
  let score = 0;
  let hardFail = false;

  if (filters.categories.size > 0) {
    if (filters.categories.has(activity.product.category)) score += 25;
    else hardFail = true;
  }
  if (filters.subjects.size > 0) {
    const matched = activity.subjects.filter((s) => filters.subjects.has(s)).length;
    if (matched === 0) hardFail = true;
    else score += 15 + matched * 5;
  }
  if (filters.setting !== 'any') {
    if (activity.setting === 'either' || activity.setting === filters.setting) score += 8;
    else hardFail = true;
  }
  if (filters.prep !== 'any') {
    if (activity.prepLevel === filters.prep) score += 8;
    else if (activity.prepLevel === 'none' && filters.prep === 'minimal') score += 4;
    else hardFail = true;
  }
  if (filters.ageRange) {
    const fit = ageFitScore(activity, filters.ageRange);
    if (fit < 0) hardFail = true;
    else score += fit;
  }

  return hardFail ? -Infinity : score;
}

function subjectGapScore(activity: EnrichedActivity, gaps: string[]): number {
  const hits = activity.subjects.filter((s) => gaps.includes(s)).length;
  return hits * 12;
}

function seasonFitScore(activity: EnrichedActivity, month: number): number {
  if (activity.bestMonths.length === 0) return 0;
  return activity.bestMonths.includes(month) ? 10 : -3;
}

function freshnessScore(
  activity: EnrichedActivity,
  logs: LogSummary[],
  hideRecentDays: number,
  now: Date
): { score: number; hardFail: boolean } {
  const logged = logs.filter((l) => l.productSlug === activity.product.slug);
  if (logged.length === 0) return { score: 8, hardFail: false };

  // Days since most recent log
  const latest = logged
    .map((l) => Date.parse(l.date + 'T00:00:00Z'))
    .sort((a, b) => b - a)[0];
  const daysSince = Math.max(0, Math.floor((now.getTime() - latest) / 86_400_000));

  if (hideRecentDays > 0 && daysSince < hideRecentDays) {
    return { score: 0, hardFail: true };
  }

  if (daysSince < 7) return { score: -10, hardFail: false };
  if (daysSince < 30) return { score: -3, hardFail: false };
  return { score: 4, hardFail: false };
}

// ─── Reason generation ───────────────────────────────────────────────────────

function generateReasons(
  activity: EnrichedActivity,
  filters: RecommenderFilters,
  gaps: string[],
  daysSinceLog: number | null,
  month: number
): string[] {
  const reasons: string[] = [];

  // Filter matches
  if (filters.categories.has(activity.product.category)) {
    reasons.push(`matches your ${activity.product.category.replace('-', ' ')} filter`);
  }
  const matchedSubjects = activity.subjects.filter((s) => filters.subjects.has(s));
  if (matchedSubjects.length > 0) {
    const subjLabels = matchedSubjects
      .map((id) => STANDARD_SUBJECTS.find((s) => s.id === id)?.label)
      .filter(Boolean);
    reasons.push(`covers ${subjLabels.join(' + ')}`);
  }

  // Gap fill
  const gapMatches = activity.subjects.filter((s) => gaps.includes(s));
  if (filters.subjects.size === 0 && gapMatches.length > 0) {
    const labels = gapMatches
      .map((id) => STANDARD_SUBJECTS.find((s) => s.id === id)?.label)
      .filter(Boolean);
    if (labels.length) {
      reasons.push(`fills a gap (${labels.join(', ')} is under-covered this month)`);
    }
  }

  // Freshness
  if (daysSinceLog === null) {
    reasons.push("you haven't done this one yet");
  } else if (daysSinceLog > 30) {
    reasons.push(`last done ${daysSinceLog} days ago`);
  }

  // Season
  if (activity.bestMonths.includes(month)) {
    reasons.push('in season right now');
  }

  // Prep / duration
  if (activity.prepLevel === 'none') reasons.push('no prep needed');

  return reasons.slice(0, 3);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface RecommenderInputs {
  filters: RecommenderFilters;
  kids: Kid[];
  logs: LogSummary[];
  now: Date;
}

export function rankActivities(inputs: RecommenderInputs): ScoredActivity[] {
  const { filters, kids, logs, now } = inputs;
  const month = now.getMonth() + 1;
  const coverage = computeMonthlyCoverage(logs, now);
  const gaps = findCoverageGaps(coverage);

  // If user hasn't set an explicit age filter, auto-narrow to the kids' age range.
  const effectiveAge = filters.ageRange ?? kidsToAgeRange(kids, now);
  const effectiveFilters: RecommenderFilters = { ...filters, ageRange: effectiveAge };

  const results: ScoredActivity[] = [];

  for (const activity of ENRICHED_ACTIVITIES) {
    const filterScore = filterMatchScore(activity, effectiveFilters);
    if (!Number.isFinite(filterScore)) continue;

    const freshness = freshnessScore(activity, logs, effectiveFilters.hideRecentDays, now);
    if (freshness.hardFail) continue;

    const ageFit = ageFitScore(activity, effectiveFilters.ageRange);
    const gap = subjectGapScore(activity, gaps);
    const season = seasonFitScore(activity, month);

    // Coverage bonus: pure-no-filter baseline points so something always shows
    const coverageBonus = effectiveFilters.categories.size === 0 && effectiveFilters.subjects.size === 0 ? 5 : 0;

    const total = filterScore + ageFit + gap + season + freshness.score + coverageBonus;

    const daysSince = (() => {
      const logged = logs
        .filter((l) => l.productSlug === activity.product.slug)
        .map((l) => Date.parse(l.date + 'T00:00:00Z'));
      if (logged.length === 0) return null;
      return Math.floor((now.getTime() - Math.max(...logged)) / 86_400_000);
    })();

    results.push({
      activity,
      score: total,
      reasons: generateReasons(activity, effectiveFilters, gaps, daysSince, month),
      components: {
        filterMatch: filterScore,
        ageFit,
        subjectGap: gap,
        seasonFit: season,
        freshness: freshness.score,
        coverageBonus,
      },
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/** Convenience: top N items in distinct categories for the "alternates" strip. */
export function topByVariety(scored: ScoredActivity[], n: number): ScoredActivity[] {
  const seen = new Set<string>();
  const out: ScoredActivity[] = [];
  for (const s of scored) {
    if (seen.has(s.activity.product.category)) continue;
    seen.add(s.activity.product.category);
    out.push(s);
    if (out.length === n) break;
  }
  // If we didn't fill n, top up with the next best regardless of category
  for (const s of scored) {
    if (out.length === n) break;
    if (out.includes(s)) continue;
    out.push(s);
  }
  return out;
}

/** Returns the top item in a specific subject for the gap-fill strip. */
export function topForSubject(
  inputs: RecommenderInputs,
  subjectId: string,
  excludeSlugs: Set<string> = new Set()
): ScoredActivity | null {
  const focused: RecommenderInputs = {
    ...inputs,
    filters: { ...inputs.filters, subjects: new Set([subjectId]) },
  };
  const scored = rankActivities(focused);
  return scored.find((s) => !excludeSlugs.has(s.activity.product.slug)) ?? null;
}
