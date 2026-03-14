import { describe, it, expect } from 'vitest';
import { BYOB_TIERS } from './cart';

/**
 * Tests for the checkout and webhook logic.
 *
 * The route handlers depend on Stripe SDK + DB, so we test the pure
 * computation logic that lives inline: BYOB tier calculation on server,
 * line item construction, and webhook price ID extraction.
 */

// ── Server-side BYOB tier (mirrors checkout/route.ts:87-95) ──────────

function serverByobDiscount(
  products: { isBundle: boolean }[],
): number {
  const individualCount = products.filter((p) => !p.isBundle).length;
  const BYOB_TIERS = [
    { minItems: 5, discountPercent: 10 },
    { minItems: 7, discountPercent: 15 },
    { minItems: 10, discountPercent: 20 },
  ];
  let discount = 0;
  for (const tier of BYOB_TIERS) {
    if (individualCount >= tier.minItems) discount = tier.discountPercent;
  }
  return discount;
}

describe('server-side BYOB tier calculation', () => {
  it('returns 0 for fewer than 5 individual items', () => {
    const products = Array.from({ length: 4 }, () => ({ isBundle: false }));
    expect(serverByobDiscount(products)).toBe(0);
  });

  it('returns 10 for 5 individual items', () => {
    const products = Array.from({ length: 5 }, () => ({ isBundle: false }));
    expect(serverByobDiscount(products)).toBe(10);
  });

  it('returns 15 for 7 individual items', () => {
    const products = Array.from({ length: 7 }, () => ({ isBundle: false }));
    expect(serverByobDiscount(products)).toBe(15);
  });

  it('returns 20 for 10+ individual items', () => {
    const products = Array.from({ length: 10 }, () => ({ isBundle: false }));
    expect(serverByobDiscount(products)).toBe(20);
  });

  it('ignores bundles in count', () => {
    const products = [
      ...Array.from({ length: 4 }, () => ({ isBundle: false })),
      { isBundle: true },
    ];
    expect(serverByobDiscount(products)).toBe(0);
  });

  it('matches client-side tiers exactly', () => {
    const serverTiers = [
      { minItems: 5, discountPercent: 10 },
      { minItems: 7, discountPercent: 15 },
      { minItems: 10, discountPercent: 20 },
    ];
    expect(serverTiers).toEqual(BYOB_TIERS);
  });
});

// ── BYOB discount calculation (mirrors checkout/route.ts:116) ────────

function calcDiscountedAmount(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}

describe('BYOB discounted amount calculation', () => {
  it('applies 10% discount correctly', () => {
    expect(calcDiscountedAmount(499, 10)).toBe(449); // 499 * 0.9 = 449.1 → 449
  });

  it('applies 15% discount correctly', () => {
    expect(calcDiscountedAmount(499, 15)).toBe(424); // 499 * 0.85 = 424.15 → 424
  });

  it('applies 20% discount correctly', () => {
    expect(calcDiscountedAmount(499, 20)).toBe(399); // 499 * 0.8 = 399.2 → 399
  });

  it('rounds to nearest cent', () => {
    expect(calcDiscountedAmount(333, 10)).toBe(300); // 333 * 0.9 = 299.7 → 300
  });

  it('handles $0 price', () => {
    expect(calcDiscountedAmount(0, 10)).toBe(0);
  });

  it('returns full price at 0% discount', () => {
    expect(calcDiscountedAmount(499, 0)).toBe(499);
  });
});

// ── Line item construction logic ─────────────────────────────────────

interface MockProduct {
  isBundle: boolean;
  stripePriceId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
}

function buildLineItems(
  products: MockProduct[],
  byobDiscount: number,
  siteUrl: string,
) {
  return products.map((product) => {
    if (!product.isBundle && byobDiscount > 0) {
      const discountedAmount = Math.round(product.priceCents * (1 - byobDiscount / 100));
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} (${byobDiscount}% off)`,
            images: product.imageUrl ? [`${siteUrl}${product.imageUrl}`] : undefined,
            metadata: { stripePriceId: product.stripePriceId },
          },
          unit_amount: discountedAmount,
        },
        quantity: 1,
      };
    }
    return { price: product.stripePriceId, quantity: 1 };
  });
}

describe('checkout line item construction', () => {
  const siteUrl = 'https://anywherelearning.co';

  it('uses standard price for bundles even when BYOB is active', () => {
    const bundle: MockProduct = {
      isBundle: true,
      stripePriceId: 'price_bundle_123',
      name: 'Seasonal Bundle',
      priceCents: 3999,
      imageUrl: '/products/bundle.jpg',
    };
    const items = buildLineItems([bundle], 10, siteUrl);
    expect(items[0]).toEqual({
      price: 'price_bundle_123',
      quantity: 1,
    });
  });

  it('uses price_data for individual items when BYOB is active', () => {
    const individual: MockProduct = {
      isBundle: false,
      stripePriceId: 'price_ind_123',
      name: 'Spring Pack',
      priceCents: 499,
      imageUrl: '/products/spring.jpg',
    };
    const items = buildLineItems([individual], 10, siteUrl);
    expect(items[0]).toEqual({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Spring Pack (10% off)',
          images: ['https://anywherelearning.co/products/spring.jpg'],
          metadata: { stripePriceId: 'price_ind_123' },
        },
        unit_amount: 449,
      },
      quantity: 1,
    });
  });

  it('uses standard price for individual items when no BYOB', () => {
    const individual: MockProduct = {
      isBundle: false,
      stripePriceId: 'price_ind_123',
      name: 'Spring Pack',
      priceCents: 499,
      imageUrl: null,
    };
    const items = buildLineItems([individual], 0, siteUrl);
    expect(items[0]).toEqual({
      price: 'price_ind_123',
      quantity: 1,
    });
  });

  it('embeds stripePriceId in metadata for BYOB items', () => {
    const individual: MockProduct = {
      isBundle: false,
      stripePriceId: 'price_original_abc',
      name: 'Test',
      priceCents: 500,
      imageUrl: null,
    };
    const items = buildLineItems([individual], 15, siteUrl);
    const lineItem = items[0] as { price_data: { product_data: { metadata: Record<string, string> } } };
    expect(lineItem.price_data.product_data.metadata.stripePriceId).toBe('price_original_abc');
  });

  it('handles mixed cart (bundle + BYOB individuals)', () => {
    const products: MockProduct[] = [
      { isBundle: true, stripePriceId: 'price_bundle', name: 'Bundle', priceCents: 3999, imageUrl: null },
      { isBundle: false, stripePriceId: 'price_a', name: 'Pack A', priceCents: 499, imageUrl: null },
      { isBundle: false, stripePriceId: 'price_b', name: 'Pack B', priceCents: 699, imageUrl: null },
    ];
    const items = buildLineItems(products, 10, siteUrl);
    // Bundle uses standard price
    expect(items[0]).toHaveProperty('price', 'price_bundle');
    // Individuals use price_data
    expect(items[1]).toHaveProperty('price_data');
    expect(items[2]).toHaveProperty('price_data');
  });
});

// ── Webhook price ID extraction (mirrors webhooks/stripe/route.ts:312-326) ──

function extractPriceIds(
  lineItems: Array<{
    price: {
      id: string;
      product?: { metadata?: Record<string, string> } | string | null;
    } | null;
  }>,
): string[] {
  const priceIds: string[] = [];
  for (const li of lineItems) {
    const priceObj = li.price;
    if (!priceObj) continue;
    // BYOB metadata lives on the product (product_data.metadata), not the price
    const product = priceObj.product;
    const productMeta = typeof product === 'object' && product !== null
      ? product.metadata
      : null;
    const originalPriceId = productMeta?.stripePriceId;
    if (originalPriceId) {
      priceIds.push(originalPriceId);
    } else if (priceObj.id && !priceObj.id.startsWith('price_')) {
      // Skip ad-hoc prices without metadata (e.g., free Skills Map bonus)
      continue;
    } else {
      priceIds.push(priceObj.id);
    }
  }
  return priceIds;
}

describe('webhook price ID extraction', () => {
  it('extracts standard price IDs', () => {
    const lineItems = [
      { price: { id: 'price_abc123' } },
      { price: { id: 'price_def456' } },
    ];
    expect(extractPriceIds(lineItems)).toEqual(['price_abc123', 'price_def456']);
  });

  it('extracts original price ID from BYOB product metadata', () => {
    const lineItems = [
      {
        price: {
          id: 'price_adhoc_xyz',
          product: { metadata: { stripePriceId: 'price_original_123' } },
        },
      },
    ];
    expect(extractPriceIds(lineItems)).toEqual(['price_original_123']);
  });

  it('skips free items without metadata (Skills Map bonus)', () => {
    const lineItems = [
      { price: { id: 'price_abc123' } }, // standard
      { price: { id: 'adhoc_free_item' } }, // no metadata, no price_ prefix → skip
    ];
    expect(extractPriceIds(lineItems)).toEqual(['price_abc123']);
  });

  it('handles mixed cart: standard + BYOB + free bonus', () => {
    const lineItems = [
      { price: { id: 'price_bundle_abc' } }, // standard bundle
      { price: { id: 'price_byob_1', product: { metadata: { stripePriceId: 'price_original_1' } } } }, // BYOB
      { price: { id: 'price_byob_2', product: { metadata: { stripePriceId: 'price_original_2' } } } }, // BYOB
      { price: { id: 'adhoc_skills_map' } }, // free bonus (no metadata, no prefix)
    ];
    expect(extractPriceIds(lineItems)).toEqual([
      'price_bundle_abc', // standard bundle (first in list)
      'price_original_1', // BYOB metadata resolved
      'price_original_2',
      // adhoc_skills_map skipped
    ]);
  });

  it('handles null price gracefully', () => {
    const lineItems = [
      { price: null },
      { price: { id: 'price_abc' } },
    ];
    expect(extractPriceIds(lineItems)).toEqual(['price_abc']);
  });
});

// ── Input validation (mirrors checkout/route.ts:25-47) ───────────────

describe('checkout input validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('accepts valid email', () => {
    expect(emailRegex.test('parent@example.com')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(emailRegex.test('')).toBe(false);
  });

  it('rejects missing @', () => {
    expect(emailRegex.test('parentexample.com')).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(emailRegex.test('parent@')).toBe(false);
  });

  it('rejects spaces', () => {
    expect(emailRegex.test('par ent@example.com')).toBe(false);
  });
});
