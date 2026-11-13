/**
 * Effort buckets for each individual activity.
 *
 * Three buckets only:
 *   - Quick     : 30 minutes to 1 hour, single sitting, minimal setup
 *   - Half-Day  : 3 to 4 hours, one sitting, some materials or setup
 *   - Project   : multiple days, repeated sessions or reps over time
 *
 * This is the single source of truth the weekly-plan engine filters on
 * (time-budget matching) and what the "effort" label on activity cards shows.
 * Keyed by product slug (matches the keys in lib/product-descriptions.ts).
 *
 * Bundles, mega bundles, seasonal packs, and skills maps
 * are intentionally NOT listed here. They are not individual activities and
 * are never surfaced as a weekly hero pick.
 */

export type Effort = 'Quick' | 'Half-Day' | 'Project';

/** Human-readable time range for each bucket, shown next to the label. */
export const EFFORT_RANGE: Record<Effort, string> = {
  Quick: '30 min to 1 hour',
  'Half-Day': '3 to 4 hours',
  Project: 'Multiple days',
};

export const EFFORT_BY_SLUG: Record<string, Effort> = {
  // Outdoor Learning
  'nature-journal-walks': 'Quick',
  'nature-walk-task-cards': 'Quick',
  'nature-choice-boards': 'Quick',
  'outdoor-learning-missions': 'Quick',
  'outdoor-stem-challenges': 'Half-Day',
  'outdoor-stem-challenges-volume-2': 'Half-Day',
  'outdoor-movement-challenge-cards': 'Quick',
  'land-art-challenges': 'Quick',
  'nature-crafts': 'Half-Day',

  // Creativity & Maker
  'board-game-studio': 'Project',
  'rube-goldberg-machine': 'Project',
  'survival-base': 'Project',
  'imaginary-world': 'Project',
  'creature-habitat': 'Project',
  'theme-park': 'Project',
  'mini-movie': 'Project',
  'invent-a-sport': 'Project',
  'kinetic-sculpture': 'Project',
  'build-a-museum': 'Project',

  // Real-World Math
  'budget-challenge': 'Project',
  'kitchen-math-challenge': 'Project',
  'smart-shopper': 'Project',
  'backyard-campout-planner': 'Project',
  'clothing-swap-thrift-math': 'Project',
  'family-electricity-audit': 'Project',
  'farmers-market-challenge': 'Half-Day',
  'garage-sale-math': 'Project',
  'garden-plot-planner': 'Project',
  'party-planner-math': 'Project',
  'road-trip-calculator': 'Project',
  'savings-goal-tracker': 'Project',
  'sports-stats-lab': 'Project',

  // AI & Digital Literacy
  'ai-basics': 'Half-Day',
  'algorithm-awareness': 'Half-Day',
  'bias-fairness-lab': 'Half-Day',
  'build-ai-helper': 'Half-Day',
  'create-with-ai': 'Half-Day',
  'deepfake-spotter': 'Half-Day',
  'hallucination-detective': 'Half-Day',
  'healthy-tech-boundaries': 'Half-Day',
  'privacy-footprint': 'Half-Day',
  'prompt-like-a-coach': 'Half-Day',
  'media-info-check': 'Quick',

  // Critical Thinking & Planning
  'micro-business': 'Project',
  'problem-solver': 'Project',
  'travel-day': 'Project',
  'time-energy-planner': 'Project',
  'community-impact': 'Project',
  'emergency-ready': 'Project',
  'everyday-redesign': 'Half-Day',
  'fix-it-detective': 'Project',
  'neighbourhood-problem-spotter': 'Project',
  'outdoor-survival-planner': 'Project',
  'pack-like-a-pro': 'Project',
  'scavenger-hunt-designer': 'Project',
  'swap-day-challenge': 'Project',
  'what-if-scenario-lab': 'Project',
  'decision-lab': 'Project',

  // Communication & Writing
  'write-like-a-pro': 'Half-Day',
  'adventure-story-map': 'Project',
  'community-tour-guide': 'Project',
  'directions-challenge': 'Quick',
  'family-debate-night': 'Quick',
  'family-recipe-book': 'Project',
  'market-stall-pitch': 'Half-Day',
  'mini-magazine-creator': 'Project',
  'my-review-column': 'Project',
  'neighbourhood-interview': 'Project',
  'trail-guide-creator': 'Project',

  // Entrepreneurship
  'brand-builder': 'Half-Day',
  'business-failure-lab': 'Half-Day',
  'community-service-business': 'Project',
  'customer-discovery': 'Project',
  'investor-pitch': 'Half-Day',
  'marketing-campaign': 'Project',
  'pricing-experiment': 'Project',
  'product-design-lab': 'Project',
  'supply-chain-detective': 'Project',
  'shark-tank-pitch': 'Project',

  // Worldschooling
  'cultural-celebration-journal': 'Project',
  'currency-market-math': 'Half-Day',
  'everyday-life-comparison': 'Project',
  'local-language-mission': 'Project',
  'nature-geography-field-study': 'Project',
  'people-stories-interview': 'Project',
  'street-explorer-map-maker': 'Half-Day',
  'transport-navigation-challenge': 'Project',
  'travel-reflection-postcards': 'Half-Day',
  'world-food-detective': 'Project',

  // Emotional & Social Skills
  'calm-down-toolkit': 'Project',
  'big-feelings-lab': 'Project',
  'boredom-toolkit': 'Project',
  'disappointment-lab': 'Project',
  'frustration-tolerance-cards': 'Quick',
  'comeback-journal': 'Project',
  'hard-thing-challenge': 'Project',
  'repair-conversation': 'Quick',
  'kindness-missions': 'Project',
  'reading-the-room': 'Project',
  'conflict-fix': 'Project',
  'solo-mission': 'Project',
  'worry-sorter': 'Project',

  // Free-guide full versions
  'square-foot-safari': 'Half-Day',
  'snack-mission': 'Half-Day',
  'household-orchestra': 'Half-Day',
  'three-ais-one-question': 'Quick',
  'two-minute-story': 'Quick',
  'complaint-to-product': 'Project',
  'plan-a-mini-adventure': 'Project',

  // Debundled seasonal-pack activities
  'decomposition-detective': 'Project',
  'seed-travelers': 'Half-Day',
  'camouflage-challenge': 'Quick',
  'nature-data-tracker': 'Project',

  // New 10 (Jul 2026)
  'grow-it-eat-it': 'Project',
  'trade-it-up': 'Project',
  'family-history-detective': 'Project',
  'probability-lab': 'Project',
  'kitchen-science-lab': 'Half-Day',
  'secret-code-lab': 'Project',
  'body-owners-manual': 'Project',
  'people-scientist': 'Project',
  'teach-it-to-learn-it': 'Half-Day',
  'play-the-world': 'Project',
};

/** Returns the effort bucket for a slug, or null if it's not an individual activity. */
export function effortFor(slug: string): Effort | null {
  return EFFORT_BY_SLUG[slug] ?? null;
}
