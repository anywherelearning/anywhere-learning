/** Shopping cart types, localStorage helpers, and cart-math functions. */

import {
  BUNDLE_CONTENTS,
  BUNDLE_DATA,
  BYOB_TIERS,
  FREE_BONUS_SLUG,
  type BundleInfo,
  type ByobTier,
} from './bundles';

// Re-export pure bundle data for backward compatibility. New code should
// import directly from @/lib/bundles to avoid pulling the cart helpers
// into client bundles that only need the data.
export {
  BUNDLE_CONTENTS,
  BUNDLE_DATA,
  BYOB_TIERS,
  FREE_BONUS_SLUG,
};
export type { BundleInfo, ByobTier };

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
// Build Your Own Bundle (BYOB) - tier definitions live in lib/bundles.ts;
// the helpers below apply the tiers to an actual cart.
// ═══════════════════════════════════════════════════════════════════

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
