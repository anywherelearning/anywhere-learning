/**
 * Enriches the raw product catalog with derived metadata used by the
 * dashboard recommender: implied subjects, indoor/outdoor setting,
 * estimated prep level, and seasonal hints.
 *
 * Source data: lib/fallback-products.ts (the 92 activity guides).
 * No new database column needed; everything derived here.
 */

import { fallbackProducts } from './fallback-products';
import type { FallbackProduct } from './fallback-products';
import { defaultSubjectsForCategory } from './taxonomy';

export type Setting = 'outdoor' | 'indoor' | 'either';
export type PrepLevel = 'none' | 'minimal' | 'planned';
export type DurationTier = 'short' | 'medium' | 'long' | 'multi-day';

/**
 * How much parent involvement the activity needs.
 *
 * - 'independent' = kid can start, work, and finish on their own. Hand it over.
 * - 'together'    = needs a parent in the room or guiding the discussion.
 * - 'either'      = works either way depending on age and kid.
 */
export type Independence = 'independent' | 'together' | 'either';

export interface EnrichedActivity {
  product: FallbackProduct;
  /** Subjects implied by category + slug heuristics. */
  subjects: string[];
  setting: Setting;
  prepLevel: PrepLevel;
  durationTier: DurationTier;
  /** Concrete duration estimate in minutes. Used by the auto-rescheduler. */
  durationMinutes: number;
  /** How much parent involvement the activity needs. */
  independence: Independence;
  /** Months where this activity is at its best (1=Jan, 12=Dec). Empty = year-round. */
  bestMonths: number[];
  /** Parsed age range. */
  ageMin: number;
  ageMax: number;
}

// ─── Heuristics ──────────────────────────────────────────────────────────────

/** Outdoor categories. Anything else defaults to 'either'. */
const OUTDOOR_CATEGORIES = new Set(['outdoor-learning']);

/** Categories that are typically indoor-only. */
const INDOOR_CATEGORIES = new Set(['ai-literacy', 'communication-writing']);

/** Slug-based overrides. Each pattern wins over the category default. */
const SLUG_SETTING_OVERRIDES: Array<[RegExp, Setting]> = [
  [/(outdoor|nature|backyard|campout|garden|trail|woods|forest|park)/, 'outdoor'],
  [/(ai-|prompt|algorithm|deepfake|hallucination|privacy|digital)/, 'indoor'],
];

function inferSetting(product: FallbackProduct): Setting {
  for (const [pattern, setting] of SLUG_SETTING_OVERRIDES) {
    if (pattern.test(product.slug)) return setting;
  }
  if (OUTDOOR_CATEGORIES.has(product.category)) return 'outdoor';
  if (INDOOR_CATEGORIES.has(product.category)) return 'indoor';
  return 'either';
}

/** Prep estimate by category. */
const PREP_BY_CATEGORY: Record<string, PrepLevel> = {
  'outdoor-learning': 'none',
  'creativity-maker': 'minimal',
  'real-world-math': 'minimal',
  'planning-problem-solving': 'minimal',
  'ai-literacy': 'none',
  'entrepreneurship': 'planned',
  'communication-writing': 'minimal',
  'worldschooling': 'minimal',
  'start-here': 'none',
};

const PREP_OVERRIDES: Array<[RegExp, PrepLevel]> = [
  [/(business|brand|enterprise|customer)/, 'planned'],
  [/(choice-boards|task-cards|prompt-cards|missions)/, 'none'],
  [/(theme-park|build-a-museum|mini-movie|board-game-studio)/, 'planned'],
];

function inferPrep(product: FallbackProduct): PrepLevel {
  for (const [pattern, level] of PREP_OVERRIDES) {
    if (pattern.test(product.slug)) return level;
  }
  return PREP_BY_CATEGORY[product.category] ?? 'minimal';
}

const DURATION_OVERRIDES: Array<[RegExp, DurationTier]> = [
  [/(choice-boards|task-cards|prompt-cards|debate|kitchen-math)/, 'short'],
  [/(challenge|pack|toolkit|guide|missions)/, 'medium'],
  [/(theme-park|build-a-museum|mini-movie|business|micro-business|brand-builder|backyard-campout|travel-day)/, 'long'],
  [/(survival-base|imaginary-world|creature-habitat|invent-a-sport)/, 'multi-day'],
];

function inferDuration(product: FallbackProduct): DurationTier {
  for (const [pattern, dur] of DURATION_OVERRIDES) {
    if (pattern.test(product.slug)) return dur;
  }
  return 'medium';
}

/** Mid-point minutes per duration tier, used by the auto-rescheduler. */
const DURATION_MINUTES: Record<DurationTier, number> = {
  short: 20,
  medium: 45,
  long: 120,
  'multi-day': 240,
};

// ─── Independence heuristics ─────────────────────────────────────────────────
//
// Activities a kid can finish on their own without a parent in the room.
// Solo-friendly = clear output, self-contained instructions, no discussion required.

/** Slug patterns for activities that work well as "hand it over" independent work. */
const INDEPENDENT_SLUG_PATTERNS: RegExp[] = [
  /(party-planner|garage-sale|sports-stats|garden-plot|road-trip-calculator|savings-goal|farmers-market|backyard-campout-planner)/,
  /(task-cards|choice-boards|prompt-cards|missions)/,
  /(brand-builder|product-design|market-stall|trail-guide|mini-magazine|my-review|adventure-story|family-recipe-book)/,
  /(scavenger-hunt|swap-day|pack-like-a-pro|fix-it-detective|emergency-ready|everyday-redesign)/,
  /(land-art|nature-crafts|nature-journal|nature-walk)/,
  /(invent-a-sport|kinetic-sculpture|imaginary-world|creature-habitat|build-a-museum|theme-park|board-game-studio)/,
];

/** Slug patterns for activities that really need a parent leading or in conversation. */
const TOGETHER_SLUG_PATTERNS: RegExp[] = [
  /(family-debate-night|investor-pitch|shark-tank-pitch|community-impact|customer-discovery)/,
  /(media-info-check|bias-fairness-lab|deepfake-spotter|hallucination-detective|healthy-tech|privacy-footprint)/,
  /(neighbourhood-interview|community-tour-guide|people-stories-interview)/,
  /(business-failure-lab|supply-chain-detective|pricing-experiment|marketing-campaign)/,
];

function inferIndependence(product: FallbackProduct): Independence {
  for (const pattern of TOGETHER_SLUG_PATTERNS) {
    if (pattern.test(product.slug)) return 'together';
  }
  for (const pattern of INDEPENDENT_SLUG_PATTERNS) {
    if (pattern.test(product.slug)) return 'independent';
  }
  // Category-level fallbacks
  if (product.category === 'ai-literacy') return 'together';
  if (product.category === 'entrepreneurship') return 'together';
  if (product.category === 'outdoor-learning') return 'independent';
  if (product.category === 'real-world-math') return 'independent';
  if (product.category === 'creativity-maker') return 'either';
  return 'either';
}

/** Months 1-12 where this activity is in season. Empty = anytime. */
function inferBestMonths(product: FallbackProduct): number[] {
  const s = product.slug;
  if (/spring/.test(s)) return [3, 4, 5];
  if (/summer/.test(s)) return [6, 7, 8];
  if (/(fall|autumn)/.test(s)) return [9, 10, 11];
  if (/winter/.test(s)) return [12, 1, 2];
  if (/(campout|sun|beach|garden|lemonade-stand|backyard|outdoor)/.test(s)) {
    return [4, 5, 6, 7, 8, 9, 10]; // warm-weather lean
  }
  return [];
}

/** Subjects per product, deeper than just the category default. */
const SUBJECT_OVERRIDES_BY_SLUG: Record<string, string[]> = {
  // Communication / writing
  'family-debate-night': ['ela', 'life'],
  'write-like-a-pro': ['ela'],
  'persuasive-pitch': ['ela', 'life'],
  // Real-world math
  'kitchen-math-challenge': ['math', 'life'],
  'budget-challenge': ['math', 'life'],
  'smart-shopper': ['math', 'life'],
  'micro-business': ['math', 'life', 'ela'],
  // Nature / outdoor → science + PE
  'nature-journal-walks': ['science', 'art', 'ela', 'pe'],
  'land-art-challenges': ['art', 'pe'],
  'nature-crafts': ['art', 'science'],
  // AI literacy → science + ELA
  'media-info-check': ['ela', 'science'],
  'bias-fairness-lab': ['science', 'life'],
  // Worldschool
  'cultural-celebration-journal': ['history', 'ela', 'art'],
  'community-tour-guide': ['history', 'ela'],
  // Creativity-maker varied
  'board-game-studio': ['math', 'art'],
  'mini-movie': ['ela', 'art'],
  'build-a-museum': ['history', 'art', 'science'],
  'theme-park': ['math', 'art'],
};

function inferSubjects(product: FallbackProduct): string[] {
  if (SUBJECT_OVERRIDES_BY_SLUG[product.slug]) return SUBJECT_OVERRIDES_BY_SLUG[product.slug];
  return defaultSubjectsForCategory(product.category);
}

function parseAgeRange(s: string | null | undefined): { min: number; max: number } {
  if (!s) return { min: 6, max: 14 };
  const m = s.match(/(\d{1,2}).*?(\d{1,2})/);
  if (!m) return { min: 6, max: 14 };
  return { min: Number(m[1]), max: Number(m[2]) };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** All non-bundle, active activities, enriched once at module load. */
export const ENRICHED_ACTIVITIES: EnrichedActivity[] = fallbackProducts
  .filter((p) => !p.isBundle && p.active)
  .map((product) => {
    const { min, max } = parseAgeRange(product.ageRange);
    const durationTier = inferDuration(product);
    return {
      product,
      subjects: inferSubjects(product),
      setting: inferSetting(product),
      prepLevel: inferPrep(product),
      durationTier,
      durationMinutes: DURATION_MINUTES[durationTier],
      independence: inferIndependence(product),
      bestMonths: inferBestMonths(product),
      ageMin: min,
      ageMax: max,
    };
  });

/** Quick lookup by slug. */
export const ENRICHED_BY_SLUG: Record<string, EnrichedActivity> = Object.fromEntries(
  ENRICHED_ACTIVITIES.map((a) => [a.product.slug, a])
);

export const PREP_LABEL: Record<PrepLevel, string> = {
  none: 'No prep',
  minimal: 'Quick prep',
  planned: 'Plan ahead',
};

export const DURATION_LABEL: Record<DurationTier, string> = {
  short: 'Under 30 min',
  medium: '30-90 min',
  long: 'Half-day+',
  'multi-day': 'Multi-day',
};

export const SETTING_LABEL: Record<Setting, string> = {
  outdoor: 'Outdoor',
  indoor: 'Indoor',
  either: 'Anywhere',
};

export const INDEPENDENCE_LABEL: Record<Independence, string> = {
  independent: 'Solo',
  together: 'Together',
  either: 'Flexible',
};

/** Returns the independent-only subset of activities, sorted by quality of fit for solo work. */
export function getIndependentActivities(): EnrichedActivity[] {
  return ENRICHED_ACTIVITIES.filter((a) => a.independence === 'independent');
}
