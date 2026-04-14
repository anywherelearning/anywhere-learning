// ─── Cross-sell mapping: category → recommended bundle slug ───
// When a buyer purchases from a category, suggest a complementary bundle.
const CROSS_SELL_MAP: Record<string, string> = {
  'ai-literacy': 'creativity-mega-bundle',              // AI & Digital → Creativity Mega ($29.99)
  'creativity-anywhere': 'real-world-mega-bundle',      // Creativity Anywhere → Real-World Mega ($29.99)
  'outdoor-learning': 'creativity-mega-bundle',         // Outdoor Learning → Creativity Mega ($29.99)
  'real-world-math': 'creativity-mega-bundle',          // Real-World Math → Creativity Mega ($29.99)
  'communication-writing': 'creativity-mega-bundle',    // Communication & Writing → Creativity Mega ($29.99)
  'entrepreneurship': 'real-world-mega-bundle',         // Entrepreneurship → Real-World Mega ($29.99)
  'planning-problem-solving': 'real-world-mega-bundle', // Planning & Problem-Solving → Real-World Mega ($29.99)
  'start-here': 'outdoor-toolkit-bundle',               // Start Here → Outdoor Toolkit ($19.99)
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
  // If they bought the master bundle, they have everything - no cross-sell
  if (categories.includes('bundle') && boughtBundles) return null;

  // Find the first non-bundle category and map it
  for (const cat of categories) {
    if (cat !== 'bundle' && CROSS_SELL_MAP[cat]) {
      return `cross-sell:${CROSS_SELL_MAP[cat]}`;
    }
  }

  // Fallback: suggest the seasonal bundle for any individual purchase
  return 'cross-sell:seasonal-bundle';
}

// ─── Core Kit v4 API ───
//
// Kit (formerly ConvertKit) v4 uses Bearer-style auth and requires tag IDs
// (not names) when applying tags. We keep a module-level cache of tag
// name → ID and lazily create tags on first use.

const KIT_API_BASE = 'https://api.kit.com/v4';

type TagCache = Map<string, number>;
let tagCachePromise: Promise<TagCache> | null = null;

function authHeaders(apiKey: string): HeadersInit {
  return {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function fetchAllTags(apiKey: string): Promise<TagCache> {
  const cache: TagCache = new Map();
  let cursor: string | null = null;
  do {
    const url = new URL(`${KIT_API_BASE}/tags`);
    if (cursor) url.searchParams.set('after', cursor);
    const res = await fetch(url, { headers: authHeaders(apiKey) });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Kit tags list failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as {
      tags: { id: number; name: string }[];
      pagination: { has_next_page: boolean; end_cursor: string | null };
    };
    for (const t of data.tags) cache.set(t.name, t.id);
    cursor = data.pagination.has_next_page ? data.pagination.end_cursor : null;
  } while (cursor);
  return cache;
}

function loadTagCache(apiKey: string): Promise<TagCache> {
  if (!tagCachePromise) {
    tagCachePromise = fetchAllTags(apiKey).catch((err) => {
      tagCachePromise = null; // allow retry on next request
      throw err;
    });
  }
  return tagCachePromise;
}

async function getOrCreateTag(apiKey: string, name: string): Promise<number> {
  const cache = await loadTagCache(apiKey);
  const existing = cache.get(name);
  if (existing) return existing;

  const res = await fetch(`${KIT_API_BASE}/tags`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kit tag create failed for "${name}": ${res.status} ${body}`);
  }
  const data = (await res.json()) as { tag: { id: number; name: string } };
  cache.set(data.tag.name, data.tag.id);
  return data.tag.id;
}

async function upsertSubscriber(apiKey: string, email: string): Promise<number> {
  // Idempotent: returns 201 with a new subscriber, or 200 with an existing one.
  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kit subscriber upsert failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { subscriber: { id: number } };
  return data.subscriber.id;
}

async function applyTagToSubscriber(
  apiKey: string,
  tagId: number,
  subscriberId: number,
): Promise<void> {
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
    method: 'POST',
    headers: authHeaders(apiKey),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kit tag apply failed (tag ${tagId}): ${res.status} ${body}`);
  }
}

/**
 * Subscribe an email to Kit and apply one or more tags. Tags are passed as
 * string names; unknown tags are created on the fly. The flow is:
 *   1. Upsert the subscriber (idempotent).
 *   2. Apply each tag by ID. Kit automations triggered by "tag added" fire
 *      on each application.
 *
 * Throws on any API failure so the caller can surface / log the error.
 */
export async function subscribeAndTag(email: string, tags: string[] = []) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!apiKey) return;
  if (tags.length === 0) return;

  const subscriberId = await upsertSubscriber(apiKey, email);
  for (const name of tags) {
    const tagId = await getOrCreateTag(apiKey, name);
    await applyTagToSubscriber(apiKey, tagId, subscriberId);
  }
}

// ─── Backwards-compatible exports ───

/** Subscribe a free guide lead - applies the 'lead' tag to trigger welcome sequence */
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

  // First-time buyer tag - triggers post-purchase sequence in Kit
  if (options.isFirstPurchase) {
    tags.push('first-buyer');
  }

  // Bundle buyer tag - useful for segmentation
  if (options.hasBundles) {
    tags.push('bundle-buyer');
  }

  // Cross-sell tag - tells Kit which product to recommend in follow-up email
  if (options.categories) {
    const crossSellTag = getCrossSellTag(options.categories, !!options.hasBundles);
    if (crossSellTag) {
      tags.push(crossSellTag);
    }
  }

  await subscribeAndTag(email, tags);
}
