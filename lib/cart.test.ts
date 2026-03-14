import { describe, it, expect } from 'vitest';
import {
  CartItem,
  BYOB_TIERS,
  getByobTier,
  getNextByobTier,
  cartTotalCents,
  cartTotalWithByob,
  getBundleUpsell,
  getBundleOverlaps,
  BUNDLE_CONTENTS,
  BUNDLE_DATA,
} from './cart';

// ── Helpers ──────────────────────────────────────────────────────────

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    slug: 'test-pack',
    name: 'Test Pack',
    priceCents: 499,
    stripePriceId: 'price_test',
    category: 'nature',
    isBundle: false,
    imageUrl: null,
    ...overrides,
  };
}

function makeItems(count: number, overrides: Partial<CartItem> = {}): CartItem[] {
  return Array.from({ length: count }, (_, i) =>
    makeItem({ slug: `pack-${i}`, stripePriceId: `price_${i}`, ...overrides }),
  );
}

function makeBundle(overrides: Partial<CartItem> = {}): CartItem {
  return makeItem({
    slug: 'seasonal-bundle',
    name: 'Seasonal Bundle',
    priceCents: 3999,
    stripePriceId: 'price_bundle',
    category: 'bundle',
    isBundle: true,
    ...overrides,
  });
}

// ── BYOB tier thresholds ─────────────────────────────────────────────

describe('BYOB_TIERS', () => {
  it('has 3 tiers with correct thresholds', () => {
    expect(BYOB_TIERS).toEqual([
      { minItems: 5, discountPercent: 10 },
      { minItems: 7, discountPercent: 15 },
      { minItems: 10, discountPercent: 20 },
    ]);
  });
});

describe('getByobTier', () => {
  it('returns null for 0 items', () => {
    expect(getByobTier([])).toBeNull();
  });

  it('returns null for 4 individual items (below first tier)', () => {
    expect(getByobTier(makeItems(4))).toBeNull();
  });

  it('returns 10% tier for exactly 5 items', () => {
    expect(getByobTier(makeItems(5))).toEqual({ minItems: 5, discountPercent: 10 });
  });

  it('returns 10% tier for 6 items', () => {
    expect(getByobTier(makeItems(6))).toEqual({ minItems: 5, discountPercent: 10 });
  });

  it('returns 15% tier for exactly 7 items', () => {
    expect(getByobTier(makeItems(7))).toEqual({ minItems: 7, discountPercent: 15 });
  });

  it('returns 15% tier for 9 items', () => {
    expect(getByobTier(makeItems(9))).toEqual({ minItems: 7, discountPercent: 15 });
  });

  it('returns 20% tier for exactly 10 items', () => {
    expect(getByobTier(makeItems(10))).toEqual({ minItems: 10, discountPercent: 20 });
  });

  it('returns 20% tier for 15 items', () => {
    expect(getByobTier(makeItems(15))).toEqual({ minItems: 10, discountPercent: 20 });
  });

  it('ignores bundles when counting items', () => {
    const items = [...makeItems(4), makeBundle()];
    expect(getByobTier(items)).toBeNull(); // 4 individuals + 1 bundle = still 4
  });

  it('counts only non-bundle items for tier', () => {
    const items = [...makeItems(5), makeBundle()];
    expect(getByobTier(items)).toEqual({ minItems: 5, discountPercent: 10 });
  });
});

describe('getNextByobTier', () => {
  it('returns 10% tier for 0 items (need 5)', () => {
    const result = getNextByobTier([]);
    expect(result).toEqual({ tier: { minItems: 5, discountPercent: 10 }, itemsNeeded: 5 });
  });

  it('returns 10% tier for 3 items (need 2 more)', () => {
    const result = getNextByobTier(makeItems(3));
    expect(result).toEqual({ tier: { minItems: 5, discountPercent: 10 }, itemsNeeded: 2 });
  });

  it('returns 15% tier when at 5 items (need 2 more)', () => {
    const result = getNextByobTier(makeItems(5));
    expect(result).toEqual({ tier: { minItems: 7, discountPercent: 15 }, itemsNeeded: 2 });
  });

  it('returns 20% tier when at 7 items (need 3 more)', () => {
    const result = getNextByobTier(makeItems(7));
    expect(result).toEqual({ tier: { minItems: 10, discountPercent: 20 }, itemsNeeded: 3 });
  });

  it('returns null when at max tier (10+ items)', () => {
    expect(getNextByobTier(makeItems(10))).toBeNull();
    expect(getNextByobTier(makeItems(15))).toBeNull();
  });

  it('ignores bundles when counting', () => {
    const items = [...makeItems(4), makeBundle()];
    const result = getNextByobTier(items);
    expect(result).toEqual({ tier: { minItems: 5, discountPercent: 10 }, itemsNeeded: 1 });
  });
});

// ── Cart totals ──────────────────────────────────────────────────────

describe('cartTotalCents', () => {
  it('returns 0 for empty cart', () => {
    expect(cartTotalCents([])).toBe(0);
  });

  it('sums all item prices', () => {
    const items = [
      makeItem({ priceCents: 499 }),
      makeItem({ priceCents: 699 }),
      makeItem({ priceCents: 3999 }),
    ];
    expect(cartTotalCents(items)).toBe(5197);
  });
});

describe('cartTotalWithByob', () => {
  it('returns full price with no discount below 5 items', () => {
    const items = makeItems(4, { priceCents: 499 });
    const result = cartTotalWithByob(items);
    expect(result).toEqual({
      subtotalCents: 1996,
      discountCents: 0,
      totalCents: 1996,
      tier: null,
    });
  });

  it('applies 10% discount at 5 items', () => {
    const items = makeItems(5, { priceCents: 500 });
    const result = cartTotalWithByob(items);
    expect(result.subtotalCents).toBe(2500);
    expect(result.discountCents).toBe(250); // 10% of 2500
    expect(result.totalCents).toBe(2250);
    expect(result.tier?.discountPercent).toBe(10);
  });

  it('applies 15% discount at 7 items', () => {
    const items = makeItems(7, { priceCents: 500 });
    const result = cartTotalWithByob(items);
    expect(result.subtotalCents).toBe(3500);
    expect(result.discountCents).toBe(525); // 15% of 3500
    expect(result.totalCents).toBe(2975);
    expect(result.tier?.discountPercent).toBe(15);
  });

  it('applies 20% discount at 10 items', () => {
    const items = makeItems(10, { priceCents: 500 });
    const result = cartTotalWithByob(items);
    expect(result.subtotalCents).toBe(5000);
    expect(result.discountCents).toBe(1000); // 20% of 5000
    expect(result.totalCents).toBe(4000);
    expect(result.tier?.discountPercent).toBe(20);
  });

  it('only discounts individual items, not bundles', () => {
    const individuals = makeItems(5, { priceCents: 500 }); // 2500 total, 10% = 250 off
    const bundle = makeBundle({ priceCents: 3999 });
    const items = [...individuals, bundle];
    const result = cartTotalWithByob(items);
    expect(result.subtotalCents).toBe(6499); // 2500 + 3999
    expect(result.discountCents).toBe(250); // 10% of 2500 (individuals only)
    expect(result.totalCents).toBe(6249);
  });

  it('rounds discount to nearest cent', () => {
    const items = makeItems(5, { priceCents: 499 }); // 2495, 10% = 249.5 → 250
    const result = cartTotalWithByob(items);
    expect(result.discountCents).toBe(250);
    expect(result.totalCents).toBe(2245);
  });
});

// ── Bundle overlaps ──────────────────────────────────────────────────

describe('getBundleOverlaps', () => {
  it('returns empty array when no overlaps', () => {
    const items = [makeItem({ slug: 'unrelated-pack' })];
    expect(getBundleOverlaps(items, 'seasonal-bundle')).toEqual([]);
  });

  it('returns matching item names', () => {
    const items = [
      makeItem({ slug: 'spring-outdoor-pack', name: 'Spring Outdoor Pack' }),
      makeItem({ slug: 'summer-outdoor-pack', name: 'Summer Outdoor Pack' }),
      makeItem({ slug: 'unrelated-pack', name: 'Unrelated' }),
    ];
    const overlaps = getBundleOverlaps(items, 'seasonal-bundle');
    expect(overlaps).toEqual(['Spring Outdoor Pack', 'Summer Outdoor Pack']);
  });

  it('returns empty array for unknown bundle slug', () => {
    const items = [makeItem({ slug: 'spring-outdoor-pack' })];
    expect(getBundleOverlaps(items, 'nonexistent-bundle')).toEqual([]);
  });
});

// ── Bundle upsell ────────────────────────────────────────────────────

describe('getBundleUpsell', () => {
  it('returns null for empty cart', () => {
    expect(getBundleUpsell([])).toBeNull();
  });

  it('returns null for single item', () => {
    expect(getBundleUpsell([makeItem()])).toBeNull();
  });

  it('returns null when BYOB tier is active (5+ individual items)', () => {
    // 5 items from the seasonal bundle — would normally match, but BYOB suppresses
    const items = BUNDLE_CONTENTS['seasonal-bundle'].map((slug) =>
      makeItem({ slug, priceCents: 1299 }),
    );
    // Add a 5th item to ensure BYOB kicks in
    items.push(makeItem({ slug: 'extra-pack', priceCents: 499 }));
    expect(getBundleUpsell(items)).toBeNull();
  });

  it('returns null when bundle already in cart', () => {
    const items = [
      makeBundle({ slug: 'seasonal-bundle' }),
      makeItem({ slug: 'spring-outdoor-pack', priceCents: 1299 }),
      makeItem({ slug: 'summer-outdoor-pack', priceCents: 1299 }),
    ];
    expect(getBundleUpsell(items)).toBeNull();
  });

  it('returns upsell when 2+ items match a bundle', () => {
    const items = [
      makeItem({ slug: 'spring-outdoor-pack', priceCents: 1299 }),
      makeItem({ slug: 'summer-outdoor-pack', priceCents: 1299 }),
    ];
    const upsell = getBundleUpsell(items);
    expect(upsell).not.toBeNull();
    expect(upsell!.bundle.slug).toBe('seasonal-bundle');
    expect(upsell!.matchingSlugs).toContain('spring-outdoor-pack');
    expect(upsell!.matchingSlugs).toContain('summer-outdoor-pack');
    expect(upsell!.totalChildCount).toBe(4); // seasonal bundle has 4 packs
  });

  it('calculates savings correctly when bundle is cheaper', () => {
    // 3 seasonal packs at $12.99 each = $38.97; bundle = $39.99
    const items = [
      makeItem({ slug: 'spring-outdoor-pack', priceCents: 1299 }),
      makeItem({ slug: 'summer-outdoor-pack', priceCents: 1299 }),
      makeItem({ slug: 'fall-outdoor-pack', priceCents: 1299 }),
    ];
    const upsell = getBundleUpsell(items);
    expect(upsell).not.toBeNull();
    expect(upsell!.individualTotal).toBe(3897);
    expect(upsell!.bundle.priceCents).toBe(3999);
    // Bundle costs more than 3 items, so savingsCents is negative
    expect(upsell!.savingsCents).toBe(3897 - 3999);
    expect(upsell!.additionalCostCents).toBe(3999 - 3897);
  });
});

// ── Bundle data integrity ────────────────────────────────────────────

describe('BUNDLE_CONTENTS', () => {
  it('every bundle in BUNDLE_DATA has entries in BUNDLE_CONTENTS', () => {
    for (const slug of Object.keys(BUNDLE_DATA)) {
      expect(BUNDLE_CONTENTS[slug]).toBeDefined();
      expect(BUNDLE_CONTENTS[slug].length).toBeGreaterThan(0);
    }
  });

  it('every bundle in BUNDLE_CONTENTS has entries in BUNDLE_DATA', () => {
    for (const slug of Object.keys(BUNDLE_CONTENTS)) {
      expect(BUNDLE_DATA[slug]).toBeDefined();
    }
  });

  it('seasonal bundle contains 4 packs', () => {
    expect(BUNDLE_CONTENTS['seasonal-bundle']).toHaveLength(4);
  });
});
