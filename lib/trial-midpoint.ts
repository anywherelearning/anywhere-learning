/**
 * Day-7 trial check-in: which version of the email a trial member gets, and
 * which guide it points at.
 *
 * Three versions, decided by what they've actually done in the member zone:
 *   - 'doing'       : marked at least one activity "We did it!". Celebrate it,
 *                     point at a good next one.
 *   - 'browsing'    : opened guides but hasn't done one yet. Name the guide
 *                     they're circling and make it easy to actually do.
 *   - 'not-started' : hasn't opened anything. Their map already picked a first
 *                     stop, so hand them that one.
 *
 * Pure (no DB) so it can be unit-tested. The cron route gathers the inputs.
 */

import { EFFORT_BY_SLUG, EFFORT_RANGE } from '@/lib/activity-effort';
import { getFallbackProductBySlug } from '@/lib/fallback-products';
import { territoriesForSlug } from '@/lib/roadmap';
import { childAge, type Child } from '@/lib/member-profile';

export type MidpointVariant = 'doing' | 'browsing' | 'not-started';

export interface MidpointInputs {
  /** Guide opens in the reader, slug → open count. */
  views: Record<string, number>;
  /** Slugs marked "We did it!" (any kid), oldest first. */
  completed: string[];
  /** Slugs currently on their map's "this week" stop(s). */
  weekSlugs: string[];
  kids: Child[];
}

export interface MidpointGuide {
  slug: string;
  name: string;
  /** First sentence of the guide's description. */
  blurb: string;
  /** e.g. '30 min to 1 hour'. */
  timeRange: string | null;
  ageRange: string | null;
}

export interface MidpointPick {
  variant: MidpointVariant;
  /** The guide the email is about (done, browsed, or first stop). */
  guide: MidpointGuide;
  /** 'doing' only: what to try next. */
  next?: MidpointGuide;
}

/** First stop when a member has no map pick yet: quick and low-prep (ages 6+). */
const DEFAULT_FIRST_STOP = 'nature-journal-walks';

/** An individual activity guide (not a bundle or pack) that we can link to. */
function isActivity(slug: string): boolean {
  return !!EFFORT_BY_SLUG[slug] && !!getFallbackProductBySlug(slug)?.active;
}

function minAgeOf(slug: string): number | null {
  const m = getFallbackProductBySlug(slug)?.ageRange?.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** True when the guide's minimum age fits the youngest kid we know about. */
function fitsKids(slug: string, kids: Child[]): boolean {
  const ages = kids.map(childAge).filter((a): a is number => a !== null);
  const min = minAgeOf(slug);
  if (!ages.length || min === null) return true;
  return min <= Math.min(...ages);
}

function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

export function describeGuide(slug: string): MidpointGuide | null {
  const p = getFallbackProductBySlug(slug);
  if (!p) return null;
  const effort = EFFORT_BY_SLUG[slug];
  return {
    slug,
    name: p.name,
    blurb: firstSentence(p.description),
    timeRange: effort ? EFFORT_RANGE[effort] : null,
    ageRange: p.ageRange,
  };
}

/**
 * A good next guide after `doneSlug`: shares a Skills Map area, fits the kids,
 * not already done. Prefers whatever is on their map this week.
 */
function pickNext(doneSlug: string, inputs: MidpointInputs): string | null {
  const done = new Set(inputs.completed);
  const onMap = inputs.weekSlugs.find((s) => !done.has(s) && isActivity(s));
  if (onMap) return onMap;

  const areas = new Set(territoriesForSlug(doneSlug));
  const candidates = Object.keys(EFFORT_BY_SLUG)
    .filter((s) => !done.has(s) && s !== doneSlug && isActivity(s) && fitsKids(s, inputs.kids))
    .filter((s) => territoriesForSlug(s).some((t) => areas.has(t)));
  // Quick ones first: the goal is a second win this week, not a big project.
  const quick = candidates.find((s) => EFFORT_BY_SLUG[s] === 'Quick');
  return quick ?? candidates[0] ?? null;
}

export function pickMidpoint(inputs: MidpointInputs): MidpointPick | null {
  const completed = inputs.completed.filter(isActivity);

  if (completed.length) {
    const doneSlug = completed[completed.length - 1];
    const guide = describeGuide(doneSlug);
    if (!guide) return null;
    const nextSlug = pickNext(doneSlug, inputs);
    const next = nextSlug ? describeGuide(nextSlug) ?? undefined : undefined;
    return { variant: 'doing', guide, next };
  }

  const viewed = Object.entries(inputs.views)
    .filter(([s]) => isActivity(s))
    .sort((a, b) => b[1] - a[1]);
  if (viewed.length) {
    // If their map pick is one they've opened, that's the one to push. Otherwise
    // the guide they keep coming back to.
    const mapPick = inputs.weekSlugs.find((s) => inputs.views[s] && isActivity(s));
    const guide = describeGuide(mapPick ?? viewed[0][0]);
    return guide ? { variant: 'browsing', guide } : null;
  }

  const firstStop =
    inputs.weekSlugs.find(isActivity) ??
    (fitsKids(DEFAULT_FIRST_STOP, inputs.kids)
      ? DEFAULT_FIRST_STOP
      : Object.keys(EFFORT_BY_SLUG).find(
          (s) => EFFORT_BY_SLUG[s] === 'Quick' && isActivity(s) && fitsKids(s, inputs.kids),
        ) ?? DEFAULT_FIRST_STOP);
  const guide = describeGuide(firstStop);
  return guide ? { variant: 'not-started', guide } : null;
}

/** Kid names for the email copy: "Kirin (6)", "Elijah and Indie", or "". */
export function kidsPhrase(kids: Child[]): string {
  // First names only: some parents type the full name ("Eva Vieira").
  const names = kids.map((k) => k.name?.trim().split(/\s+/)[0]).filter(Boolean) as string[];
  if (!names.length) return '';
  if (names.length === 1) {
    const age = childAge(kids[0]);
    return age !== null ? `${names[0]} (${age})` : names[0];
  }
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
