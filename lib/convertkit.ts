import {
  guideDisplayName,
  guideCoverUrl,
  guideDownloadUrl,
} from '@/lib/guide-names';

// ─── Cross-sell mapping: category → recommended bundle slug ───
// When a buyer purchases from a category, suggest a complementary bundle.
const CROSS_SELL_MAP: Record<string, string> = {
  'ai-literacy': 'creativity-mega-bundle',              // AI & Digital → Creativity Mega ($29.99)
  'creativity-maker': 'real-world-mega-bundle',      // Creativity & Maker → Real-World Mega ($29.99)
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

// ─── Custom fields ───
//
// Kit silently drops values for fields that don't exist yet, so a field has to
// be created before it can be written. We cache the known keys the same way as
// tags and create on first use.

let fieldCachePromise: Promise<Set<string>> | null = null;

async function fetchAllCustomFields(apiKey: string): Promise<Set<string>> {
  const keys = new Set<string>();
  let cursor: string | null = null;
  do {
    const url = new URL(`${KIT_API_BASE}/custom_fields`);
    if (cursor) url.searchParams.set('after', cursor);
    const res = await fetch(url, { headers: authHeaders(apiKey) });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Kit custom fields list failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as {
      custom_fields: { key: string }[];
      pagination: { has_next_page: boolean; end_cursor: string | null };
    };
    for (const f of data.custom_fields) keys.add(f.key);
    cursor = data.pagination.has_next_page ? data.pagination.end_cursor : null;
  } while (cursor);
  return keys;
}

function loadFieldCache(apiKey: string): Promise<Set<string>> {
  if (!fieldCachePromise) {
    fieldCachePromise = fetchAllCustomFields(apiKey).catch((err) => {
      fieldCachePromise = null; // allow retry on next request
      throw err;
    });
  }
  return fieldCachePromise;
}

/** Create the custom field if Kit doesn't have it yet. Kit derives the `key`
 *  from the label, so "Last guide" becomes the `last_guide` key. */
async function ensureCustomField(apiKey: string, key: string, label: string) {
  const cache = await loadFieldCache(apiKey);
  if (cache.has(key)) return;

  const res = await fetch(`${KIT_API_BASE}/custom_fields`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ label }),
  });
  // 422 means it already exists (a race, or a label we didn't see in the list).
  if (!res.ok && res.status !== 422) {
    const body = await res.text();
    throw new Error(`Kit custom field create failed "${label}": ${res.status} ${body}`);
  }
  cache.add(key);
}

async function upsertSubscriber(
  apiKey: string,
  email: string,
  fields?: Record<string, string>,
): Promise<number> {
  // Idempotent: returns 201 with a new subscriber, or 200 with an existing one.
  // Passing `fields` on an existing subscriber overwrites just those keys.
  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      email_address: email,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    }),
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

async function removeTagFromSubscriber(
  apiKey: string,
  tagId: number,
  subscriberId: number,
): Promise<void> {
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
    method: 'DELETE',
    headers: authHeaders(apiKey),
  });
  // 404 = tag wasn't on the subscriber, treat as success (idempotent)
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Kit tag remove failed (tag ${tagId}): ${res.status} ${body}`);
  }
}

/**
 * Subscribe an email to Kit, set any custom fields, and apply one or more tags.
 * Tags are passed as string names; unknown tags are created on the fly. The
 * flow is:
 *   1. Ensure any custom fields exist (Kit drops values for unknown keys).
 *   2. Upsert the subscriber with those field values (idempotent).
 *   3. Apply each tag by ID. Kit automations triggered by "tag added" fire
 *      on each application.
 *
 * Fields are written BEFORE tags on purpose: the tag is what triggers the
 * sequence, so the field has to already hold its value when email 1 renders.
 *
 * Throws on any API failure so the caller can surface / log the error.
 */
export async function subscribeAndTag(
  email: string,
  tags: string[] = [],
  fields?: Record<string, string>,
) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!apiKey) return;
  if (tags.length === 0) return;

  if (fields) {
    for (const key of Object.keys(fields)) {
      await ensureCustomField(apiKey, key, CUSTOM_FIELD_LABELS[key] ?? key);
    }
  }

  const subscriberId = await upsertSubscriber(apiKey, email, fields);
  for (const name of tags) {
    const tagId = await getOrCreateTag(apiKey, name);
    await applyTagToSubscriber(apiKey, tagId, subscriberId);
  }
}

/** Kit derives a field's `key` from its label, so these must stay paired. */
const CUSTOM_FIELD_LABELS: Record<string, string> = {
  last_guide: 'Last guide',
  last_guide_cover: 'Last guide cover',
  last_guide_download: 'Last guide download',
};

/**
 * Apply one set of tags AND remove another, in a single subscriber lookup.
 * Used for lifecycle transitions (e.g. on refund: add 'refunded', remove
 * 'member' + 'founder'). Both lists are optional.
 *
 * Idempotent: removing a tag that's not applied is a no-op (Kit returns 404,
 * we treat that as success).
 *
 * Throws on any API failure so the caller can surface / log the error.
 */
export async function applyAndRemoveTags(
  email: string,
  opts: { add?: string[]; remove?: string[] },
) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!apiKey) return;
  const add = opts.add ?? [];
  const remove = opts.remove ?? [];
  if (add.length === 0 && remove.length === 0) return;

  const subscriberId = await upsertSubscriber(apiKey, email);
  for (const name of add) {
    const tagId = await getOrCreateTag(apiKey, name);
    await applyTagToSubscriber(apiKey, tagId, subscriberId);
  }
  for (const name of remove) {
    try {
      const tagId = await getOrCreateTag(apiKey, name);
      await removeTagFromSubscriber(apiKey, tagId, subscriberId);
    } catch (err) {
      console.warn(`[kit] could not remove tag ${name}:`, err);
    }
  }
}

// ─── Backwards-compatible exports ───

/** Guides that have their OWN dedicated Kit funnel (own tag + own email
 * sequence). Subscribers to these must NOT also get the generic `lead` tag,
 * otherwise they'd be dumped into the default 7-Activities sequence on top of
 * their own. Each funnel shares a `lead-nurtured` marker so a person who later
 * grabs the other guide only receives that guide's email 1, not a second full
 * sequence. Guides NOT listed here fall back to the default `lead` funnel. */
const SELF_FUNNEL_GUIDES = new Set<string>(['capable-kid']);

/** Subscribe a free guide lead and apply the tags that drive the Kit funnels.
 *
 * Always applies `from-{source}` for attribution (defaults to 'organic').
 *
 * Tagging then splits by guide:
 *  - A guide with its own funnel (see SELF_FUNNEL_GUIDES) gets ONLY its
 *    `guide:{guide}` tag, which triggers that guide's dedicated sequence.
 *  - Everything else (no guide, or a guide without its own funnel) gets the
 *    generic `lead` tag that triggers the default 7-Activities sequence.
 *
 * This keeps the funnels fully separate: one signup = one guide + one sequence.
 *
 * Also writes the guide's display name to the `last_guide` custom field, so a
 * single welcome sequence can name whichever guide they actually took. Nine
 * guides now share that sequence; without this, email 1 thanks all of them for
 * the 7-day guide.
 */
export async function subscribeToConvertKit(
  email: string,
  source?: string,
  guide?: string,
) {
  const tags = [`from-${source || 'organic'}`];
  if (guide && SELF_FUNNEL_GUIDES.has(guide)) {
    tags.push(`guide:${guide}`);
  } else {
    tags.push('lead');
    if (guide) tags.push(`guide:${guide}`);
  }
  await subscribeAndTag(email, tags, {
    last_guide: guideDisplayName(guide),
    last_guide_cover: guideCoverUrl(guide),
    last_guide_download: guideDownloadUrl(guide),
  });
}

/** Subscribe someone who unlocked a printable idea-list checklist.
 *
 * Deliberately does NOT apply `lead`. That tag runs the 7-day guide sequence,
 * and these people asked for a nature walk checklist, not a 7-day guide.
 * Dropping them into that funnel would answer a question nobody asked and
 * would blur the `lead` count that measures the /free-guide page.
 *
 * They get three tags instead:
 *  - `from-{source}`          attribution, same as everywhere else
 *  - `checklist-subscriber`   the funnel trigger. ONE Kit automation hangs off
 *                             this and serves all the idea lists, which is why
 *                             it exists as well as the per-list tag: an
 *                             automation per list would mean 15 of them.
 *  - `checklist:{slug}`       counting only, so you can see which list works.
 *
 * The `last_guide*` fields are pointed at the checklist itself rather than the
 * default lead magnet, so a welcome email can name the thing they actually took
 * and re-send the right PDF. Without this they'd read "7 Days of Real-World
 * Learning" and hand over a file the person never asked for.
 */
export async function subscribeChecklistLead(
  email: string,
  source: string | undefined,
  list: { slug: string; title: string; downloadUrl: string },
) {
  await subscribeAndTag(
    email,
    [
      `from-${source || 'organic'}`,
      'checklist-subscriber',
      `checklist:${list.slug}`,
    ],
    {
      last_guide: list.title,
      last_guide_cover: `https://anywherelearning.co/ideas/${list.slug}.jpg`,
      last_guide_download: list.downloadUrl,
    },
  );
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
