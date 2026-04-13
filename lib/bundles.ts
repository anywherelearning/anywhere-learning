/**
 * Pure bundle data - slug maps, pricing, child lists, and the BYOB tiers.
 *
 * This module has no runtime dependencies (no React, no localStorage,
 * no server imports) so it is safe to pull into client components,
 * server routes, and tests without dragging in the cart helpers.
 *
 * lib/cart.ts re-exports these for backward compatibility.
 */

/** The Skills Map slug - given free as a bonus with any bundle purchase. */
export const FREE_BONUS_SLUG = 'future-ready-skills-map';

/** Bundle slug → individual product slugs it contains. */
export const BUNDLE_CONTENTS: Record<string, string[]> = {
  'seasonal-bundle': [
    'spring-outdoor-pack', 'summer-outdoor-pack', 'fall-outdoor-pack', 'winter-outdoor-pack',
  ],
  'creativity-mega-bundle': [
    'board-game-studio', 'rube-goldberg-machine', 'survival-base',
    'imaginary-world', 'creature-habitat', 'theme-park', 'mini-movie',
    'invent-a-sport', 'kinetic-sculpture', 'build-a-museum',
  ],
  'real-world-mega-bundle': [
    'budget-challenge', 'community-impact', 'kitchen-math-challenge',
    'media-info-check', 'micro-business', 'problem-solver', 'smart-shopper',
    'time-energy-planner', 'travel-day', 'write-like-a-pro',
  ],
  'ai-digital-bundle': [
    'ai-basics', 'algorithm-awareness', 'bias-fairness-lab', 'build-ai-helper',
    'create-with-ai', 'deepfake-spotter', 'hallucination-detective',
    'healthy-tech-boundaries', 'privacy-footprint', 'prompt-like-a-coach',
  ],
  'real-world-math-bundle': [
    'backyard-campout-planner', 'clothing-swap-thrift-math', 'family-electricity-audit',
    'farmers-market-challenge', 'garage-sale-math', 'garden-plot-planner',
    'party-planner-math', 'road-trip-calculator', 'savings-goal-tracker', 'sports-stats-lab',
  ],
  'nature-art-bundle': [
    'land-art-challenges', 'nature-crafts', 'nature-journal-walks',
  ],
  'outdoor-toolkit-bundle': [
    'nature-walk-task-cards', 'outdoor-learning-missions', 'outdoor-stem-challenges', 'nature-choice-boards',
  ],
  'outdoor-mega-bundle': [
    'land-art-challenges', 'nature-crafts', 'nature-journal-walks',
    'nature-walk-task-cards', 'outdoor-learning-missions', 'outdoor-stem-challenges', 'nature-choice-boards',
  ],
  'communication-writing-bundle': [
    'adventure-story-map', 'community-tour-guide', 'directions-challenge',
    'family-debate-night', 'family-recipe-book', 'market-stall-pitch',
    'mini-magazine-creator', 'my-review-column', 'neighbourhood-interview',
    'trail-guide-creator',
  ],
  'entrepreneurship-bundle': [
    'brand-builder', 'business-failure-lab', 'community-service-business',
    'customer-discovery', 'investor-pitch', 'marketing-campaign',
    'pricing-experiment', 'product-design-lab', 'supply-chain-detective',
    'shark-tank-pitch',
  ],
  'planning-problem-solving-bundle': [
    'emergency-ready', 'everyday-redesign', 'fix-it-detective',
    'neighbourhood-problem-spotter', 'outdoor-survival-planner',
    'pack-like-a-pro', 'scavenger-hunt-designer', 'swap-day-challenge',
    'what-if-scenario-lab', 'decision-lab',
  ],
};

/** Bundle metadata for client-side upsell suggestions. */
export interface BundleInfo {
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number;
  stripePriceId: string;
  category: string;
  imageUrl: string | null;
  activityCount: number | null;
}

export const BUNDLE_DATA: Record<string, BundleInfo> = {
  'seasonal-bundle': {
    slug: 'seasonal-bundle',
    name: 'Full Seasonal Bundle (All 4 Seasons)',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLrpvAkIBECpwGmfll39qgU',
    category: 'bundle',
    imageUrl: '/products/four-seasons-bundle.jpg',
    activityCount: 80,
  },
  'creativity-mega-bundle': {
    slug: 'creativity-mega-bundle',
    name: 'Creativity Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLrpXAkIBECpwGmiH5gmGNa',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-creativity.jpg',
    activityCount: null,
  },
  'real-world-mega-bundle': {
    slug: 'real-world-mega-bundle',
    name: 'Real-World Skills Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLrpYAkIBECpwGmOJN33UUA',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-real-world.jpg',
    activityCount: null,
  },
  'ai-digital-bundle': {
    slug: 'ai-digital-bundle',
    name: 'AI & Digital Literacy Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLrpYAkIBECpwGmwTymDpXV',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-ai-digital.jpg',
    activityCount: null,
  },
  'real-world-math-bundle': {
    slug: 'real-world-math-bundle',
    name: 'Real-World Math Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLrpZAkIBECpwGmldyiIrpx',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-real-world-math.jpg',
    activityCount: 10,
  },
  'nature-art-bundle': {
    slug: 'nature-art-bundle',
    name: 'Nature Art Bundle',
    priceCents: 1799,
    compareAtPriceCents: 2397,
    stripePriceId: 'price_1TLrpaAkIBECpwGmguWVbtmQ',
    category: 'bundle',
    imageUrl: '/products/nature-art-bundle.jpg',
    activityCount: null,
  },
  'outdoor-toolkit-bundle': {
    slug: 'outdoor-toolkit-bundle',
    name: 'Outdoor Toolkit Bundle',
    priceCents: 2399,
    compareAtPriceCents: 3196,
    stripePriceId: 'price_1TLrpbAkIBECpwGmUEAAVflw',
    category: 'bundle',
    imageUrl: '/products/outdoor-toolkit-bundle.jpg',
    activityCount: null,
  },
  'outdoor-mega-bundle': {
    slug: 'outdoor-mega-bundle',
    name: 'Outdoor & Nature Mega Bundle',
    priceCents: 4199,
    compareAtPriceCents: 5593,
    stripePriceId: 'price_1TLo8mAkIBECpwGm1ksHAleE',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-outdoor.jpg',
    activityCount: null,
  },
  'communication-writing-bundle': {
    slug: 'communication-writing-bundle',
    name: 'Communication & Writing Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLo8lAkIBECpwGmNGXYXZif',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-communication-writing.jpg',
    activityCount: 10,
  },
  'entrepreneurship-bundle': {
    slug: 'entrepreneurship-bundle',
    name: 'Entrepreneurship Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLo8lAkIBECpwGmV5BcGnyY',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-entrepreneurship.jpg',
    activityCount: 10,
  },
  'planning-problem-solving-bundle': {
    slug: 'planning-problem-solving-bundle',
    name: 'Planning & Problem-Solving Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TLo8lAkIBECpwGmZ54mEf19',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-planning-problem-solving.jpg',
    activityCount: 10,
  },
};

// ═══════════════════════════════════════════════════════════════════
// Build Your Own Bundle (BYOB) - tiered discounts on individual items
// ═══════════════════════════════════════════════════════════════════

export interface ByobTier {
  minItems: number;
  discountPercent: number;
}

export const BYOB_TIERS: ByobTier[] = [
  { minItems: 5,  discountPercent: 10 },
  { minItems: 7,  discountPercent: 15 },
  { minItems: 10, discountPercent: 20 },
];
