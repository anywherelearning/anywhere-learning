/** Shopping cart types, constants, and localStorage helpers. */

export interface CartItem {
  slug: string;
  name: string;
  priceCents: number;
  stripePriceId: string;
  category: string;
  isBundle: boolean;
  imageUrl: string | null;
}

export const CART_STORAGE_KEY = 'al_cart';
export const CART_EMAIL_STORAGE_KEY = 'al_cart_email';

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

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable - cart works as session-only
  }
}

export function loadCartEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CART_EMAIL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCartEmail(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_EMAIL_STORAGE_KEY, email);
  } catch {
    // localStorage full or unavailable
  }
}

export function cartTotalCents(items: CartItem[]): number {
  const hasBundle = items.some((i) => i.isBundle);
  return items.reduce((sum, item) => {
    // Skills Map is free when any bundle is in the cart
    if (hasBundle && item.slug === FREE_BONUS_SLUG) return sum;
    return sum + item.priceCents;
  }, 0);
}

/** The Skills Map slug - given free as a bonus with any bundle purchase. */
export const FREE_BONUS_SLUG = 'future-ready-skills-map';

/**
 * Check if a product is already covered by the cart - either:
 * 1. The slug is explicitly in the cart, OR
 * 2. A bundle in the cart contains this individual product, OR
 * 3. Any bundle is in the cart and the slug is the free bonus (Skills Map), OR
 * 4. A larger bundle in the cart fully covers this smaller bundle's contents
 */
export function isCoveredByCart(cartItems: CartItem[], slug: string): string | false {
  // Already directly in cart
  if (cartItems.some((i) => i.slug === slug)) return false; // let isInCart handle this

  // Individual product covered by a bundle in cart
  for (const item of cartItems) {
    if (!item.isBundle) continue;
    const children = BUNDLE_CONTENTS[item.slug];
    if (children?.includes(slug)) return item.name;
  }

  // Smaller bundle fully covered by a larger bundle in cart
  const myChildren = BUNDLE_CONTENTS[slug];
  if (myChildren) {
    for (const item of cartItems) {
      if (!item.isBundle) continue;
      const parentChildren = BUNDLE_CONTENTS[item.slug];
      if (parentChildren && myChildren.every((child) => parentChildren.includes(child))) {
        return item.name;
      }
    }
  }

  // Free bonus with any bundle
  if (slug === FREE_BONUS_SLUG && cartItems.some((i) => i.isBundle)) {
    return 'bundle bonus';
  }

  return false;
}

/** Check if any items in the cart overlap with a bundle's contents. */
export function getBundleOverlaps(cartItems: CartItem[], bundleSlug: string): string[] {
  const contained = BUNDLE_CONTENTS[bundleSlug];
  if (!contained) return [];
  return cartItems
    .filter((item) => contained.includes(item.slug))
    .map((item) => item.name);
}

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
    stripePriceId: 'price_1TFcTNAMzOBftCntknn9ugHW',
    category: 'bundle',
    imageUrl: '/products/four-seasons-bundle.jpg',
    activityCount: 80,
  },
  'creativity-mega-bundle': {
    slug: 'creativity-mega-bundle',
    name: 'Creativity Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TFcTNAMzOBftCntDc8CoKsa',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-creativity.jpg',
    activityCount: null,
  },
  'real-world-mega-bundle': {
    slug: 'real-world-mega-bundle',
    name: 'Real-World Skills Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TFcTNAMzOBftCntZTSpWFfb',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-real-world.jpg',
    activityCount: null,
  },
  'ai-digital-bundle': {
    slug: 'ai-digital-bundle',
    name: 'AI & Digital Literacy Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TFcTOAMzOBftCntHzTASW76',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-ai-digital.jpg',
    activityCount: null,
  },
  'real-world-math-bundle': {
    slug: 'real-world-math-bundle',
    name: 'Real-World Math Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TFcTOAMzOBftCntWV4GZeM4',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-real-world-math.jpg',
    activityCount: 10,
  },
  'nature-art-bundle': {
    slug: 'nature-art-bundle',
    name: 'Nature Art Bundle',
    priceCents: 1799,
    compareAtPriceCents: 2397,
    stripePriceId: 'price_1TFcTPAMzOBftCntIs6rjc1V',
    category: 'bundle',
    imageUrl: '/products/nature-art-bundle.jpg',
    activityCount: null,
  },
  'outdoor-toolkit-bundle': {
    slug: 'outdoor-toolkit-bundle',
    name: 'Outdoor Toolkit Bundle',
    priceCents: 2399,
    compareAtPriceCents: 3196,
    stripePriceId: 'price_1TFcTPAMzOBftCntA7iWyJ5t',
    category: 'bundle',
    imageUrl: '/products/outdoor-toolkit-bundle.jpg',
    activityCount: null,
  },
  'outdoor-mega-bundle': {
    slug: 'outdoor-mega-bundle',
    name: 'Outdoor & Nature Mega Bundle',
    priceCents: 4199,
    compareAtPriceCents: 5593,
    stripePriceId: 'price_1TIVzrAMzOBftCntORiPbt2P',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-outdoor.jpg',
    activityCount: null,
  },
  'communication-writing-bundle': {
    slug: 'communication-writing-bundle',
    name: 'Communication & Writing Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TIVzsAMzOBftCntudyoAMdZ',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-communication-writing.jpg',
    activityCount: 10,
  },
  'entrepreneurship-bundle': {
    slug: 'entrepreneurship-bundle',
    name: 'Entrepreneurship Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TIVzsAMzOBftCntL9ZJ2pZ4',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-entrepreneurship.jpg',
    activityCount: 10,
  },
  'planning-problem-solving-bundle': {
    slug: 'planning-problem-solving-bundle',
    name: 'Planning & Problem-Solving Mega Bundle',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    stripePriceId: 'price_1TIVzqAMzOBftCntHOBpwe5o',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-planning-problem-solving.jpg',
    activityCount: 10,
  },
};

/** Upsell suggestion returned by getBundleUpsell. */
export interface BundleUpsell {
  bundle: BundleInfo;
  matchingSlugs: string[];
  individualTotal: number;
  /** Positive = user saves money switching to bundle. Negative = bundle costs more. */
  savingsCents: number;
  /** How many more cents the bundle costs vs what's already in cart (0 if bundle is cheaper). */
  additionalCostCents: number;
  /** Total number of individual guides in this bundle. */
  totalChildCount: number;
}

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

/** Get the highest qualifying BYOB tier based on non-bundle item count, or null. */
export function getByobTier(items: CartItem[]): ByobTier | null {
  const individualCount = items.filter((i) => !i.isBundle && i.slug !== FREE_BONUS_SLUG).length;
  let activeTier: ByobTier | null = null;
  for (const tier of BYOB_TIERS) {
    if (individualCount >= tier.minItems) activeTier = tier;
  }
  return activeTier;
}

/** Get the next BYOB tier the user is approaching, or null if at max. */
export function getNextByobTier(items: CartItem[]): { tier: ByobTier; itemsNeeded: number } | null {
  const individualCount = items.filter((i) => !i.isBundle && i.slug !== FREE_BONUS_SLUG).length;
  for (const tier of BYOB_TIERS) {
    if (individualCount < tier.minItems) {
      return { tier, itemsNeeded: tier.minItems - individualCount };
    }
  }
  return null;
}

/** Calculate cart total with BYOB discount applied to individual items only. */
export function cartTotalWithByob(items: CartItem[]): {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  tier: ByobTier | null;
} {
  const subtotalCents = cartTotalCents(items);
  const tier = getByobTier(items);
  if (!tier) return { subtotalCents, discountCents: 0, totalCents: subtotalCents, tier: null };

  // Round per-item (same as server/Stripe) to avoid 1-2 cent drift
  // Exclude the free bonus (Skills Map) when a bundle is present - it's already $0
  const hasBundle = items.some((i) => i.isBundle);
  const individualItems = items.filter((i) => !i.isBundle && !(hasBundle && i.slug === FREE_BONUS_SLUG));
  const multiplier = 1 - tier.discountPercent / 100;
  const discountedTotal = individualItems.reduce(
    (sum, i) => sum + Math.round(i.priceCents * multiplier),
    0,
  );
  const individualTotal = individualItems.reduce((sum, i) => sum + i.priceCents, 0);
  const discountCents = individualTotal - discountedTotal;

  return {
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    tier,
  };
}

/**
 * Find the best bundle upsell for the current cart.
 * Considers both individual guides AND smaller bundles whose children
 * are covered by a larger bundle (e.g. nature-art-bundle + outdoor-toolkit-bundle
 * triggers an outdoor-mega-bundle upsell).
 * Prioritises bundles that save money, then lowest additional cost.
 * When BYOB discount is active, factors it into the comparison so
 * the customer sees honest numbers.
 */
export function getBundleUpsell(cartItems: CartItem[]): BundleUpsell | null {
  const individualItems = cartItems.filter((item) => !item.isBundle);
  const bundleItems = cartItems.filter((item) => item.isBundle);

  // Need at least 2 items (individual or bundle) to suggest an upsell
  if (cartItems.length < 2) return null;

  // Factor BYOB discount into comparison so numbers are honest
  const byobTier = getByobTier(cartItems);
  const byobMultiplier = byobTier ? 1 - byobTier.discountPercent / 100 : 1;

  let bestUpsell: BundleUpsell | null = null;

  for (const [bundleSlug, childSlugs] of Object.entries(BUNDLE_CONTENTS)) {
    // Skip if this bundle is already in the cart
    if (cartItems.some((item) => item.slug === bundleSlug)) continue;

    const bundleInfo = BUNDLE_DATA[bundleSlug];
    if (!bundleInfo) continue;

    // Find matching individual guides
    const matchingIndividuals = individualItems.filter((item) =>
      childSlugs.includes(item.slug)
    );

    // Find matching smaller bundles whose children are fully covered by this bundle
    const matchingBundles = bundleItems.filter((item) => {
      const smallerChildren = BUNDLE_CONTENTS[item.slug] || [];
      return smallerChildren.length > 0 && smallerChildren.every((c) => childSlugs.includes(c));
    });

    // Collect all matching slugs (individual slugs + smaller bundle slugs)
    const matchingSlugs = [
      ...matchingIndividuals.map((i) => i.slug),
      ...matchingBundles.map((i) => i.slug),
    ];

    // Count total covered children (avoid double-counting)
    const coveredChildren = new Set<string>();
    for (const item of matchingIndividuals) coveredChildren.add(item.slug);
    for (const item of matchingBundles) {
      const children = BUNDLE_CONTENTS[item.slug] || [];
      for (const c of children) coveredChildren.add(c);
    }

    // Skip if the cart already fully covers this bundle's children - no point upgrading
    if (coveredChildren.size === childSlugs.length) continue;

    // Need at least 2 matching items OR children from bundles covering 2+ of the target's children
    if (matchingSlugs.length < 2 && coveredChildren.size < 2) continue;
    // Need at least something matching
    if (matchingSlugs.length === 0) continue;

    // Calculate what the customer is currently paying for overlapping items
    const rawIndividualTotal = matchingIndividuals.reduce(
      (sum, item) => sum + item.priceCents, 0
    );
    const bundleTotal = matchingBundles.reduce(
      (sum, item) => sum + item.priceCents, 0
    );

    // BYOB only applies to individual items, not bundles
    const individualTotal = Math.round(rawIndividualTotal * byobMultiplier) + bundleTotal;

    const savingsCents = individualTotal - bundleInfo.priceCents;
    const additionalCostCents = Math.max(0, bundleInfo.priceCents - individualTotal);

    const candidate: BundleUpsell = {
      bundle: bundleInfo,
      matchingSlugs,
      individualTotal,
      savingsCents,
      additionalCostCents,
      totalChildCount: childSlugs.length,
    };

    if (!bestUpsell) {
      bestUpsell = candidate;
      continue;
    }

    // Prefer bundles that save money; among upgrade offers prefer lowest additional cost
    const bestSaves = bestUpsell.savingsCents > 0;
    const candidateSaves = savingsCents > 0;
    if (candidateSaves && !bestSaves) {
      bestUpsell = candidate;
    } else if (candidateSaves && bestSaves && savingsCents > bestUpsell.savingsCents) {
      bestUpsell = candidate;
    } else if (!candidateSaves && !bestSaves && additionalCostCents < bestUpsell.additionalCostCents) {
      bestUpsell = candidate;
    }
  }

  return bestUpsell;
}
