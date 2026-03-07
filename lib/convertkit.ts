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

/** Tag a buyer with product-specific and purchase-type tags */
export async function tagBuyerInConvertKit(
  email: string,
  productSlugs: string[],
  options: { isFirstPurchase?: boolean; hasBundles?: boolean } = {},
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

  await subscribeAndTag(email, tags);
}
