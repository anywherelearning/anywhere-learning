import { BUNDLE_CONTENTS, BUNDLE_DATA, BYOB_TIERS } from '@/lib/cart';

/** Category → mega bundle mapping (same as shop page) */
const CATEGORY_BUNDLE_MAP: Record<string, string> = {
  'ai-literacy': 'ai-digital-bundle',
  'creativity-anywhere': 'creativity-mega-bundle',
  'outdoor-learning': 'outdoor-mega-bundle',
  'real-world-math': 'real-world-math-bundle',
  'communication-writing': 'communication-writing-bundle',
  'entrepreneurship': 'entrepreneurship-bundle',
  'planning-problem-solving': 'planning-problem-solving-bundle',
};

export interface AbandonedProduct {
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  isBundle: boolean;
  imageUrl: string | null;
}

export interface AbandonedCartUpsell {
  type: 'bundle-bonus' | 'category-bundle' | 'byob';
  /** bundle-bonus: the bundle name in cart */
  bundleName?: string;
  /** category-bundle: the recommended bundle */
  bundleSlug?: string;
  bundlePriceCents?: number;
  individualTotalCents?: number;
  savingsCents?: number;
  bundleActivityCount?: number;
  /** byob: items needed for next discount tier */
  itemsNeeded?: number;
  discountPercent?: number;
}

/**
 * Determine the best upsell to show in a cart abandonment email.
 *
 * Priority:
 * 1. Bundle in cart → mention free Skills Map bonus
 * 2. 2+ individual items from same category with a bundle available → upsell the bundle
 * 3. Otherwise → BYOB mix-and-match discount nudge
 */
export function getAbandonmentUpsell(products: AbandonedProduct[]): AbandonedCartUpsell | null {
  // 1. Bundle already in cart → highlight the free Skills Map
  const bundle = products.find((p) => p.isBundle);
  if (bundle) {
    return {
      type: 'bundle-bonus',
      bundleName: bundle.name,
    };
  }

  // 2. Count items per category and check for bundle upsell
  const categoryCounts: Record<string, AbandonedProduct[]> = {};
  for (const p of products) {
    if (!categoryCounts[p.category]) categoryCounts[p.category] = [];
    categoryCounts[p.category].push(p);
  }

  // Find the category with the most items that has a bundle available
  let bestCategory = '';
  let bestCount = 0;
  for (const [category, items] of Object.entries(categoryCounts)) {
    if (items.length >= 2 && CATEGORY_BUNDLE_MAP[category] && items.length > bestCount) {
      bestCategory = category;
      bestCount = items.length;
    }
  }

  if (bestCategory && CATEGORY_BUNDLE_MAP[bestCategory]) {
    const bundleSlug = CATEGORY_BUNDLE_MAP[bestCategory];
    const bundleInfo = BUNDLE_DATA[bundleSlug];
    if (bundleInfo) {
      const individualTotal = categoryCounts[bestCategory].reduce((sum, p) => sum + p.priceCents, 0);
      const childCount = BUNDLE_CONTENTS[bundleSlug]?.length || 0;
      return {
        type: 'category-bundle',
        bundleName: bundleInfo.name,
        bundleSlug,
        bundlePriceCents: bundleInfo.priceCents,
        individualTotalCents: individualTotal,
        savingsCents: bundleInfo.compareAtPriceCents - bundleInfo.priceCents,
        bundleActivityCount: childCount,
      };
    }
  }

  // 3. BYOB mix-and-match discount
  const individualCount = products.filter((p) => !p.isBundle).length;
  for (const tier of BYOB_TIERS) {
    if (individualCount < tier.minItems) {
      return {
        type: 'byob',
        itemsNeeded: tier.minItems - individualCount,
        discountPercent: tier.discountPercent,
      };
    }
  }

  // Already at max BYOB tier or no upsell available
  return null;
}
