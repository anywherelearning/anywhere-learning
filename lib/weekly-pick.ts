/**
 * The weekly "one for this week" member email: which guide it suggests.
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
import { getProductSkills } from '@/lib/skills';
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

export interface MonthRecap {
  /** e.g. "November". */
  month: string;
  /** Distinct activities marked done that month, most recent first. */
  activities: MidpointGuide[];
  /** The guides' own skills (lib/skills.ts, from the PDFs), most practised
   *  first, at most 12. */
  skills: string[];
}

export interface WeeklyPick {
  guide: MidpointGuide;
  source: WeeklySource;
  /** Activities they marked done in the last 7 days, most recent first. */
  doneLastWeek: MidpointGuide[];
  /** Nothing marked done in the last 14 days, and they've had 2+ weekly
   *  emails: the email adds one gentle "no pressure" line. */
  quiet: boolean;
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

  const quiet =
    inputs.recent.length >= 2 &&
    !inputs.completions.some((c) => now.getTime() - new Date(c.at).getTime() <= 2 * WEEK);

  const pick = (slug: string | undefined, source: WeeklySource): WeeklyPick | null => {
    const guide = slug ? describeGuide(slug) : null;
    return guide ? { guide, source, doneLastWeek, quiet } : null;
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

/**
 * Is this member's weekly email due today? First one 7 days after they became
 * a paying member, then every 7 days after the last one. The cron runs once a
 * day at the same hour, so "6.5 days" lands on the 7th day without drifting.
 */
export function isWeeklyDue({
  memberSince,
  lastSent,
  now,
}: {
  memberSince: Date;
  lastSent?: Date;
  now: Date;
}): boolean {
  const since = lastSent ?? memberSince;
  return now.getTime() - since.getTime() >= 6.5 * 24 * 60 * 60 * 1000;
}

const easternMonth = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit' }).format(d);

/**
 * Last calendar month (Eastern) at a glance: what they marked done and the
 * skills those guides practise. Null when they marked nothing that month, so a
 * quiet month never gets a recap.
 */
export function monthRecap(completions: { slug: string; at: string }[], now: Date): MonthRecap | null {
  const firstOfThisMonth = new Date(`${easternMonth(now)}-01T12:00:00Z`);
  const lastMonth = easternMonth(new Date(firstOfThisMonth.getTime() - 5 * 24 * 60 * 60 * 1000));
  const slugs = [...completions]
    .filter((c) => easternMonth(new Date(c.at)) === lastMonth)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((c) => c.slug)
    .filter((s, i, all) => all.indexOf(s) === i && isActivity(s));
  if (!slugs.length) return null;

  // The guides' own skills, as on the product pages. "STEM" is a label, not a
  // skill, so it stays out. Most practised first, then in order of appearance.
  const counts = new Map<string, number>();
  for (const s of slugs) {
    for (const k of getProductSkills(s)?.canonical ?? []) {
      if (k !== 'STEM') counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const skills = [...counts.entries()]
    .map(([k, n], i) => ({ k, n, i }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, 12)
    .map((x) => x.k);

  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(`${lastMonth}-15T12:00:00Z`));
  return {
    month,
    activities: slugs.map(describeGuide).filter((g): g is MidpointGuide => !!g),
    skills,
  };
}
