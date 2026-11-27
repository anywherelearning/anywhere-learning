/**
 * The Sunday "one for this week" member email: which guide it suggests.
 *
 * Why it exists (Nov 2026 churn dig): every family who left used the member
 * zone on one day only; every family who stayed came back on a second day.
 * One weekly email with one guide, picked for their kids, is the nudge back.
 *
 * Order of preference, skipping anything already done or suggested in the
 * last eight weekly emails:
 *   1. 'trail'  : a stop the parent put on their map this week.
 *   2. 'opened' : a guide they opened recently but haven't marked done.
 *   3. 'month'  : this month's theme (This Month skill, then seasonal set).
 *   4. 'quick'  : a quick guide that fits their kids.
 *
 * Pure (no DB) so it can be unit-tested. lib/weekly-pick-run.ts gathers inputs.
 */

import { EFFORT_BY_SLUG } from '@/lib/activity-effort';
import { describeGuide, fitsKids, isActivity, type MidpointGuide } from '@/lib/trial-midpoint';
import type { Child } from '@/lib/member-profile';

export type WeeklySource = 'trail' | 'opened' | 'month' | 'quick';

export interface WeeklyInputs {
  /** Guide opens in the reader over the last few weeks, slug to open count. */
  views: Record<string, number>;
  /** "We did it!" marks, any order. */
  completions: { slug: string; at: string }[];
  /** Slugs on their map's "this week" stop(s). */
  weekSlugs: string[];
  kids: Child[];
  /** Slugs from earlier weekly emails, newest first. */
  recent: string[];
  /** This month's theme guides in order (skill set, then seasonal set). */
  monthSlugs: string[];
  now?: Date;
}

export interface WeeklyPick {
  guide: MidpointGuide;
  source: WeeklySource;
  /** Activities they marked done in the last 7 days, most recent first. */
  doneLastWeek: MidpointGuide[];
}

/** How many past weekly emails to look back on before a guide can come again. */
const NO_REPEAT_WEEKS = 8;
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function pickWeekly(inputs: WeeklyInputs): WeeklyPick | null {
  const now = inputs.now ?? new Date();
  const done = new Set(inputs.completions.map((c) => c.slug));
  const avoid = new Set([...done, ...inputs.recent.slice(0, NO_REPEAT_WEEKS)]);
  const ok = (s: string) => isActivity(s) && !avoid.has(s);

  const doneLastWeek = [...inputs.completions]
    .filter((c) => now.getTime() - new Date(c.at).getTime() <= WEEK)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((c) => c.slug)
    .filter((s, i, all) => all.indexOf(s) === i && isActivity(s))
    .map(describeGuide)
    .filter((g): g is MidpointGuide => !!g);

  const pick = (slug: string | undefined, source: WeeklySource): WeeklyPick | null => {
    const guide = slug ? describeGuide(slug) : null;
    return guide ? { guide, source, doneLastWeek } : null;
  };

  const trail = inputs.weekSlugs.find(ok);
  if (trail) return pick(trail, 'trail');

  const opened = Object.entries(inputs.views)
    .filter(([s]) => ok(s))
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  if (opened) return pick(opened, 'opened');

  const month = inputs.monthSlugs.find((s) => ok(s) && fitsKids(s, inputs.kids));
  if (month) return pick(month, 'month');

  const fits = Object.keys(EFFORT_BY_SLUG).filter((s) => ok(s) && fitsKids(s, inputs.kids));
  const quick = fits.find((s) => EFFORT_BY_SLUG[s] === 'Quick') ?? fits[0];
  return pick(quick, 'quick');
}
