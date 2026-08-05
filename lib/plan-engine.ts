/**
 * The Skills Map planner engine.
 *
 * Walks each kid through the 12 Skills Map territories (lib/roadmap.ts) in a
 * LEAST-COVERED-FIRST rotation: it always serves the territory the kid has done
 * the fewest activities in, then picks the next age-appropriate, not-yet-done
 * activity mapped to that territory (mappings come from the coverage audit).
 *
 * The rotation is emergent, not stored: finishing a Math activity bumps Math's
 * coverage, so the next-least territory (Communication, Creativity, ...) comes
 * up automatically. Ties break on the territory list order.
 *
 * Overrides / steering:
 *  - compass NUDGE (lib/kid-roadmap `nudgeFor`) forces a territory to the front.
 *  - the parent can SKIP the whole area (bumps that territory's score so a
 *    different one is served) or ask for a DIFFERENT ONE in the same area
 *    (marks the current pick "passed"), or hand-pick anything from the Library.
 */

import { TERRITORIES } from './roadmap';
import { OPT_IN_ONLY_CATEGORIES, type PlanActivity } from './weekly-plan';
import type { Effort } from './activity-effort';
import { notifyLocalChanged } from './account-sync';

export interface NextPick {
  slug: string;
  territorySlug: string;
  territoryName: string;
}

/** Which Skills Map territory a given activity slug belongs to (first match). */
export function territoryOf(slug: string): { slug: string; name: string } | null {
  for (const t of TERRITORIES) {
    if (t.activities.includes(slug)) return { slug: t.slug, name: t.name };
  }
  return null;
}

/** The engine's next step for one kid. Returns null only when nothing is left. */
export function nextForKid(opts: {
  age: number | null;
  /** Lifetime completions — used to rank territories by coverage (stable). */
  doneSlugs: Set<string>;
  /** Recently done (last ~year) — an activity is only excluded while in here,
   *  so finished activities resurface as suggestions after a year. Defaults to
   *  doneSlugs when omitted. */
  recentDone?: Set<string>;
  /** slug → last-done timestamp (ms). Used to recycle oldest-first once an
   *  area has no fresh activities left. */
  doneAt?: Map<string, number>;
  passed: Set<string>;
  skips: Record<string, number>;
  nudge?: string | null;
  activities: PlanActivity[];
  /** Family prefs: only rotate through these territories (default all). */
  enabledTerritories?: Set<string>;
  /** Family prefs: only pick these effort lengths (default all). */
  enabledEfforts?: Set<Effort>;
}): NextPick | null {
  const bySlug = new Map(opts.activities.map((a) => [a.slug, a] as const));
  const { age } = opts;
  const excludeDone = opts.recentDone ?? opts.doneSlugs;
  const doneAt = opts.doneAt;
  const ageOK = (a: PlanActivity) => age == null || (age >= a.ageMin && age <= a.ageMax);
  const effortOK = (a: PlanActivity) => !opts.enabledEfforts || opts.enabledEfforts.has(a.effort);
  // Eligible = right age/effort and not skipped. Recency is applied separately.
  const eligible = (slug: string) => {
    if (opts.passed.has(slug)) return false;
    const a = bySlug.get(slug);
    if (!a) return false;
    // Opt-in-only categories (worldschooling) never enter the automatic trail
    // rotation — the parent hand-adds those from the Library when a trip is on.
    if (OPT_IN_ONLY_CATEGORIES.has(a.category)) return false;
    return ageOK(a) && effortOK(a);
  };
  const oldestFirst = (slugs: string[]) =>
    [...slugs].sort((a, b) => (doneAt?.get(a) ?? 0) - (doneAt?.get(b) ?? 0));

  const ranked = TERRITORIES
    .filter((t) => !opts.enabledTerritories || opts.enabledTerritories.has(t.slug))
    .map((t, order) => {
      const eligibleSlugs = t.activities.filter(eligible);
      const fresh = eligibleSlugs.filter((s) => !excludeDone.has(s));
      // If the whole area has been done (nothing fresh left), recycle it —
      // oldest completion first — so there's always a next stop.
      const avail = fresh.length ? fresh : oldestFirst(eligibleSlugs);
      const coverage = t.activities.filter((s) => opts.doneSlugs.has(s)).length;
      const skips = opts.skips[t.slug] ?? 0;
      return { t, order, avail, score: coverage + skips };
    }).filter((x) => x.avail.length > 0);

  if (ranked.length === 0) return null;

  const pick = (x: (typeof ranked)[number]): NextPick => ({
    slug: x.avail[0],
    territorySlug: x.t.slug,
    territoryName: x.t.name,
  });

  // compass nudge wins, if that territory still has anything available
  if (opts.nudge) {
    const n = ranked.find((x) => x.t.slug === opts.nudge);
    if (n) return pick(n);
  }
  ranked.sort((a, b) => a.score - b.score || a.order - b.order);
  return pick(ranked[0]);
}

// ─── per-kid engine state (skips + passed), localStorage-synced ───

const STORAGE_KEY = 'al_plan_engine_v1';
interface KidEngine {
  skips: Record<string, number>;
  passed: string[];
}
type EngineStore = Record<string, KidEngine>;

function read(): EngineStore {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // Must be a plain object: skipTerritory/passActivity do s[kidId] = …,
    // which throws on a primitive or array blob.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as EngineStore)
      : {};
  } catch {
    return {};
  }
}
function write(s: EngineStore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    notifyLocalChanged();
  } catch {
    /* ignore quota */
  }
}

export function engineFor(kidId: string): { skips: Record<string, number>; passed: Set<string> } {
  const k = read()[kidId];
  return { skips: k?.skips ?? {}, passed: new Set(k?.passed ?? []) };
}

/** Parent skipped the whole area: push that territory down the rotation once. */
export function skipTerritory(kidId: string, territorySlug: string) {
  const s = read();
  const k = s[kidId] ?? { skips: {}, passed: [] };
  k.skips = { ...k.skips, [territorySlug]: (k.skips[territorySlug] ?? 0) + 1 };
  s[kidId] = k;
  write(s);
}

/** Parent wants a different activity in the same area: mark this one passed. */
export function passActivity(kidId: string, slug: string) {
  const s = read();
  const k = s[kidId] ?? { skips: {}, passed: [] };
  if (!k.passed.includes(slug)) k.passed = [...k.passed, slug];
  s[kidId] = k;
  write(s);
}

/** On completing an activity, clear "passed" so earlier swap-aways can resurface. */
export function clearPassed(kidId: string) {
  const s = read();
  if (!s[kidId]) return;
  s[kidId] = { ...s[kidId], passed: [] };
  write(s);
}
