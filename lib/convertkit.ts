// ─── Cross-sell mapping: category → recommended product slug ───
// When a buyer purchases from a category, suggest a complementary one.
// New products slot into existing categories automatically.
const CROSS_SELL_MAP: Record<string, string> = {
  seasonal: 'nature-bundle',         // Seasonal → Nature Bundle ($24.99)
  nature: 'seasonal-bundle',         // Nature → Seasonal Bundle ($49.99)
  creativity: 'real-world-bundle',   // Creativity → Real-World Skills Bundle ($34.99)
  'real-world': 'creativity-bundle', // Real-World → Creativity Bundle ($32.99)
  'life-skills': 'real-world-bundle',// Life Skills → Real-World Skills Bundle ($34.99)
  'ai-literacy': 'real-world-bundle',// AI Literacy → Real-World Skills Bundle ($34.99)
};

/**
 * Determine the best cross-sell tag based on what the buyer purchased.
 * Returns a tag like `cross-sell:nature-bundle` that Kit uses to send
 * the right version of the cross-sell email.
 */
export function getCrossSellTag(
  categories: string[],
  boughtBundles: boolean,
): string | null {
  // If they bought the master bundle, they have everything — no cross-sell
  if (categories.includes('bundle') && boughtBundles) return null;

  // Find the first non-bundle category and map it
  for (const cat of categories) {
    if (cat !== 'bundle' && CROSS_SELL_MAP[cat]) {
      return `cross-sell:${CROSS_SELL_MAP[cat]}`;
    }
  }

  // Fallback: suggest the master bundle for any individual purchase
  return 'cross-sell:master-bundle';
}

// ─── Core ConvertKit API ───

/**
 * Subscribe an email to the ConvertKit form and optionally apply tags.
 * Tags are passed as string names — Kit creates them automatically if they don't exist.
 */
export async function subscribeAndTag(email: string, tags: string[] = []) {
  const formId = process.env.CONVERTKIT_FORM_ID;
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!formId || !apiKey) return;

  try {
    await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        ...(tags.length > 0 && { tags }),
      }),
    });
  } catch (error) {
    console.error('ConvertKit subscribe/tag error:', error);
  }
}

// ─── Backwards-compatible exports ───

/** Subscribe a free guide lead — applies the 'lead' tag to trigger welcome sequence */
export async function subscribeToConvertKit(email: string) {
  await subscribeAndTag(email, ['lead']);
}

/** Tag a buyer with product-specific, purchase-type, and cross-sell tags */
export async function tagBuyerInConvertKit(
  email: string,
  productSlugs: string[],
  options: {
    isFirstPurchase?: boolean;
    hasBundles?: boolean;
    categories?: string[];
  } = {},
) {
  const tags: string[] = ['buyer'];

  // Product-specific tags
  for (const slug of productSlugs) {
    tags.push(`product:${slug}`);
  }

  // First-time buyer tag — triggers post-purchase sequence in Kit
  if (options.isFirstPurchase) {
    tags.push('first-buyer');
  }

  // Bundle buyer tag — useful for segmentation
  if (options.hasBundles) {
    tags.push('bundle-buyer');
  }

  // Cross-sell tag — tells Kit which product to recommend in follow-up email
  if (options.categories) {
    const crossSellTag = getCrossSellTag(options.categories, !!options.hasBundles);
    if (crossSellTag) {
      tags.push(crossSellTag);
    }
  }

  await subscribeAndTag(email, tags);
}
