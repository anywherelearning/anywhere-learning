/**
 * Analytics tracking helpers.
 * Covers Pinterest Tag and Google Analytics 4 (gtag) events. Safe to call from
 * client code. Every function no-ops if its underlying global isn't loaded
 * yet or if we're server-side.
 */

export const PINTEREST_TAG_ID = '2613130206618';
export const GA4_MEASUREMENT_ID = 'G-WF83M4HF46';
export const BRAND_NAME = 'Anywhere Learning';

type PinterestLineItem = {
  product_id: string;
  product_name: string;
  product_category?: string;
  product_price?: number;
  product_quantity?: number;
  product_brand?: string;
};

type PinterestEventData = {
  event_id?: string;
  value?: number;
  order_id?: string;
  order_quantity?: number;
  currency?: string;
  line_items?: PinterestLineItem[];
  search_query?: string;
  lead_type?: string;
};

type PintrkFunction = {
  (command: 'track', event: string, data?: PinterestEventData): void;
  (command: 'load', tagId: string, data?: { em?: string }): void;
  (command: 'page'): void;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    pintrk?: PintrkFunction;
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}

/** GA4 ecommerce item shape. Matches the standard gtag.js schema. */
export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

/**
 * Generate a per-event UUID. Used to dedupe browser-pixel events against
 * server-side Conversions API events if we ever add server-side tracking later.
 */
function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for very old environments (should never hit this in modern browsers).
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Fire a Pinterest Tag event. Silently no-ops if the tag hasn't loaded
 * (e.g. user blocked it, or we're in SSR).
 *
 * Automatically injects:
 * - `event_id` (UUID, for server-side dedupe)
 * - `product_brand` on each line item (always "Anywhere Learning")
 */
export function pinterestTrack(event: string, data?: PinterestEventData): void {
  if (typeof window === 'undefined') return;
  if (typeof window.pintrk !== 'function') return;
  try {
    const enriched: PinterestEventData = {
      event_id: data?.event_id ?? generateEventId(),
      ...data,
      line_items: data?.line_items?.map((item) => ({
        product_brand: BRAND_NAME,
        ...item,
      })),
    };
    window.pintrk('track', event, enriched);
  } catch {
    // Analytics should never break the app.
  }
}

/** Fire a pagevisit on route change (the base tag only fires once on initial load). */
export function pinterestPageVisit(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.pintrk !== 'function') return;
  try {
    window.pintrk('page');
  } catch {
    // Analytics should never break the app.
  }
}

/**
 * Update Pinterest's enhanced-match email. Safe to call multiple times. Pinterest's
 * core.js accepts an updated load call and will hash/process the new email for
 * improved attribution and audience matching.
 */
export function pinterestSetEnhancedMatch(email: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (typeof window.pintrk !== 'function') return;
  if (!email) return;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return;
  try {
    window.pintrk('load', PINTEREST_TAG_ID, { em: trimmed });
  } catch {
    // Analytics should never break the app.
  }
}

/* -------------------------------------------------------------------------- */
/*                             Google Analytics 4                              */
/* -------------------------------------------------------------------------- */

/**
 * Fire a GA4 event via gtag.js. Silently no-ops if gtag hasn't loaded
 * (e.g. user blocked it, ad blocker, or SSR).
 */
function gtagEvent(event: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', event, params);
  } catch {
    // Analytics should never break the app.
  }
}

/** Fire the GA4 `add_to_cart` ecommerce event. */
export function ga4AddToCart(item: Ga4Item): void {
  gtagEvent('add_to_cart', {
    currency: 'USD',
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [
      {
        item_brand: BRAND_NAME,
        quantity: 1,
        ...item,
      },
    ],
  });
}

/** Fire the GA4 `purchase` ecommerce event on the checkout success page. */
export function ga4Purchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  items: Ga4Item[];
}): void {
  gtagEvent('purchase', {
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency ?? 'USD',
    items: params.items.map((item) => ({
      item_brand: BRAND_NAME,
      quantity: 1,
      ...item,
    })),
  });
}
