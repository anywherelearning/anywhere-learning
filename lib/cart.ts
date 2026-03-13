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
  'nature-art-bundle': [
    'land-art-challenges', 'nature-crafts', 'nature-journal-walks',
  ],
  'outdoor-toolkit-bundle': [
    'nature-walk-task-cards', 'outdoor-learning-missions', 'outdoor-stem-challenges', 'nature-choice-boards',
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
    // localStorage full or unavailable — cart works as session-only
  }
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents, 0);
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
    priceCents: 3999,
    compareAtPriceCents: 5196,
    stripePriceId: '', // populated by stripe:sync
    category: 'bundle',
    imageUrl: '/products/four-seasons-bundle.jpg',
    activityCount: 80,
  },
  'creativity-mega-bundle': {
    slug: 'creativity-mega-bundle',
    name: 'Creativity Mega Bundle',
    priceCents: 2999,
    compareAtPriceCents: 4990,
    stripePriceId: '',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-creativity.jpg',
    activityCount: null,
  },
  'real-world-mega-bundle': {
    slug: 'real-world-mega-bundle',
    name: 'Real-World Skills Mega Bundle',
    priceCents: 2999,
    compareAtPriceCents: 4990,
    stripePriceId: '',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-real-world.jpg',
    activityCount: null,
  },
  'ai-digital-bundle': {
    slug: 'ai-digital-bundle',
    name: 'AI & Digital Literacy Bundle',
    priceCents: 2999,
    compareAtPriceCents: 4990,
    stripePriceId: '',
    category: 'bundle',
    imageUrl: '/products/mega-bundle-ai-digital.jpg',
    activityCount: null,
  },
  'nature-art-bundle': {
    slug: 'nature-art-bundle',
    name: 'Nature Art Bundle',
    priceCents: 1499,
    compareAtPriceCents: 2097,
    stripePriceId: '',
    category: 'bundle',
    imageUrl: '/products/nature-art-bundle.jpg',
    activityCount: null,
  },
  'outdoor-toolkit-bundle': {
    slug: 'outdoor-toolkit-bundle',
    name: 'Outdoor Toolkit Bundle',
    priceCents: 1999,
    compareAtPriceCents: 2796,
    stripePriceId: '',
    category: 'bundle',
    imageUrl: '/products/outdoor-toolkit-bundle.jpg',
    activityCount: null,
  },
};

/** Upsell suggestion returned by getBundleUpsell. */
export interface BundleUpsell {
  bundle: BundleInfo;
  matchingSlugs: string[];
  individualTotal: number;
  savingsCents: number;
}

/**
 * Find the best bundle upsell for the current cart.
 * Returns the bundle where the user has 2+ matching individual packs
 * and would save the most money by switching to the bundle.
 * Returns null if no upsell applies or if the bundle is already in the cart.
 */
export function getBundleUpsell(cartItems: CartItem[]): BundleUpsell | null {
  const individualItems = cartItems.filter((item) => !item.isBundle);
  if (individualItems.length < 2) return null;

  let bestUpsell: BundleUpsell | null = null;

  for (const [bundleSlug, childSlugs] of Object.entries(BUNDLE_CONTENTS)) {
    // Skip if this bundle is already in the cart
    if (cartItems.some((item) => item.slug === bundleSlug)) continue;

    const bundleInfo = BUNDLE_DATA[bundleSlug];
    if (!bundleInfo) continue;

    const matchingItems = individualItems.filter((item) =>
      childSlugs.includes(item.slug)
    );

    if (matchingItems.length < 2) continue;

    const individualTotal = matchingItems.reduce(
      (sum, item) => sum + item.priceCents,
      0
    );

    // Only suggest if bundle actually saves money vs what they'd pay for individuals
    const savingsCents = individualTotal - bundleInfo.priceCents;
    if (savingsCents <= 0) continue;

    if (!bestUpsell || savingsCents > bestUpsell.savingsCents) {
      bestUpsell = {
        bundle: bundleInfo,
        matchingSlugs: matchingItems.map((item) => item.slug),
        individualTotal,
        savingsCents,
      };
    }
  }

  return bestUpsell;
}
