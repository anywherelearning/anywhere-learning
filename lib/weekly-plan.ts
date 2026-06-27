/**
 * The "Find this week's activities" engine.
 *
 * Pure functions: given the catalog, an in-the-moment request (who / how much
 * time / what focus), and the set of already-touched slugs, return one hero
 * pick plus a couple of lighter extras, all fresh (never done or in progress).
 *
 * Ranking, in order of pull:
 *   1. exclude anything touched (done or started) and anything without an
 *      effort tag (bundles, packs, skills maps are not individual activities)
 *   2. keep only age-appropriate activities for the selected kid(s)
 *   3. prefer the chosen focus categories, then the chosen time bucket
 *   4. if a strict filter empties the pool, broaden (drop time, then focus)
 *      and flag it so the UI can say so
 *   5. extras lean Quick and avoid repeating the hero's category
 */

import type { Effort } from './activity-effort';

export interface PlanActivity {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  ageMin: number;
  ageMax: number;
  effort: Effort;
  trackColor: string;
  trackDeep: string;
}

export interface PickRequest {
  /** Ages of the selected kid(s); empty = no age filter. */
  ages: number[];
  /** Chosen time budget, or 'any'. */
  time: Effort | 'any';
  /** Category slugs to prefer; empty = no focus (surprise us). */
  focus: string[];
}

export interface PlanResult {
  hero: PlanActivity | null;
  extras: PlanActivity[];
  /** True if we had to relax time or focus to find something. */
  broadened: boolean;
  /** True if nothing fresh matched even after broadening. */
  exhausted: boolean;
}

/** Parse an "Ages 6–14" style string into [min, max]. Falls back wide. */
export function parseAgeRange(raw: string | null | undefined): [number, number] {
  if (!raw) return [0, 99];
  const nums = raw.match(/\d+/g);
  if (!nums || nums.length === 0) return [0, 99];
  if (nums.length === 1) return [Number(nums[0]), 99];
  return [Number(nums[0]), Number(nums[1])];
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function ageOk(a: PlanActivity, ages: number[]): boolean {
  if (ages.length === 0) return true;
  return ages.some((age) => age >= a.ageMin && age <= a.ageMax);
}

export function buildPlan(
  all: PlanActivity[],
  req: PickRequest,
  exclude: Set<string>,
): PlanResult {
  const fresh = all.filter((a) => !exclude.has(a.slug));
  const candidates = fresh.filter((a) => ageOk(a, req.ages));

  if (candidates.length === 0) {
    return { hero: null, extras: [], broadened: fresh.length > 0, exhausted: true };
  }

  let broadened = false;

  // Time is the HARD constraint: a parent who picks "Quick" has 30 minutes, so
  // never hand them a multi-day project. Apply time first.
  let pool = candidates;
  if (req.time !== 'any') {
    const timed = pool.filter((a) => a.effort === req.time);
    if (timed.length > 0) pool = timed;
    else broadened = true; // nothing of this length for these ages; relax time
  }

  // Focus is a SOFT preference: prefer it, but relax it before breaking the time
  // budget. So "Quick + creativity" with no quick creativity yields a quick
  // activity from another track (and flags that we widened the focus).
  let heroPool = pool;
  if (req.focus.length > 0) {
    const focused = pool.filter((a) => req.focus.includes(a.category));
    if (focused.length > 0) heroPool = focused;
    else broadened = true;
  }

  const hero = pickRandom(heroPool);
  if (!hero) {
    return { hero: null, extras: [], broadened, exhausted: true };
  }

  // Extras: fresh, not the hero, different category, lean Quick, focus-aligned.
  const extrasBase = candidates.filter(
    (a) => a.slug !== hero.slug && a.category !== hero.category,
  );
  // Extras are the "got a spare moment" palette cleansers, so they lean Quick
  // regardless of the chosen focus. Fall back to any effort only if there
  // aren't enough Quick ones left.
  const quick = extrasBase.filter((a) => a.effort === 'Quick');
  const extrasPool = quick.length >= 2 ? quick : extrasBase;

  const extras: PlanActivity[] = [];
  const used = new Set<string>([hero.category]);
  const shuffled = [...extrasPool].sort(() => Math.random() - 0.5);
  for (const a of shuffled) {
    if (extras.length >= 2) break;
    if (used.has(a.category)) continue;
    extras.push(a);
    used.add(a.category);
  }

  return { hero, extras, broadened, exhausted: false };
}
