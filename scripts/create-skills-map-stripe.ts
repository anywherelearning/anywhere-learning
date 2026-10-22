/**
 * Stripe setup for the Skills Map sale (Oct 2026). Touches only the Map and
 * one new coupon, never the membership prices.
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/create-skills-map-stripe.ts
 *
 * 1. Finds the existing Skills Map product (metadata.slug) and adds a $12.99
 *    one-time price, made the product's default. The old $9.99 price is
 *    archived. Prints the new price ID for lib/skills-map.ts.
 * 2. Creates coupon `map_owner_20`: 20% off, repeating 12 months (so it lands
 *    on the first yearly invoice after the trial, like the fall coupon),
 *    limited to the yearly membership products.
 *
 * Idempotent: reuses a matching active price and an existing coupon.
 */

import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import { SKILLS_MAP, OWNER_OFFER } from '@/lib/skills-map';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required (run with --env-file=.env.local).');
  process.exit(1);
}

async function productIdOf(priceId: string): Promise<string> {
  const p = await stripe.prices.retrieve(priceId);
  return typeof p.product === 'string' ? p.product : p.product.id;
}

async function main() {
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY!.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);

  // ── 1. Map price ──
  const found = await stripe.products.search({ query: `metadata['slug']:'${SKILLS_MAP.slug}'` });
  const product = found.data[0];
  if (!product) throw new Error(`No Stripe product with metadata.slug=${SKILLS_MAP.slug}`);
  console.log(`Product: ${product.id} (${product.name})`);

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  let price = prices.data.find((p) => p.unit_amount === SKILLS_MAP.priceCents && !p.recurring);
  if (price) {
    console.log(`✓ $${SKILLS_MAP.priceUsd} price already exists: ${price.id}`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: SKILLS_MAP.priceCents,
      currency: 'usd',
      metadata: { slug: SKILLS_MAP.slug },
    });
    console.log(`✓ Created $${SKILLS_MAP.priceUsd} price: ${price.id}`);
  }
  await stripe.products.update(product.id, { default_price: price.id });
  for (const old of prices.data) {
    if (old.id !== price.id) {
      await stripe.prices.update(old.id, { active: false });
      console.log(`  archived old price ${old.id} ($${(old.unit_amount ?? 0) / 100})`);
    }
  }

  // ── 2. Owner coupon ──
  try {
    const c = await stripe.coupons.retrieve(OWNER_OFFER.couponId);
    console.log(`✓ Coupon "${c.id}" already exists (${c.percent_off}% off)`);
  } catch (err: unknown) {
    if ((err as { code?: string }).code !== 'resource_missing') throw err;
    const annualProducts = [
      ...new Set([
        await productIdOf(requirePriceId(STRIPE_PRICES.MEMBERSHIP_FOUNDER, 'Membership Founder')),
        await productIdOf(requirePriceId(STRIPE_PRICES.MEMBERSHIP_STANDARD, 'Membership Standard')),
      ]),
    ];
    const c = await stripe.coupons.create({
      id: OWNER_OFFER.couponId,
      percent_off: OWNER_OFFER.percentOff,
      duration: 'repeating',
      duration_in_months: 12,
      name: 'Skills Map owner: 20% off first year',
      applies_to: { products: annualProducts },
      metadata: { campaign: 'skills_map_owner' },
    });
    console.log(`✓ Created coupon "${c.id}" (${c.percent_off}% off, products ${annualProducts.join(', ')})`);
  }

  console.log(`\nSet SKILLS_MAP.stripePriceId in lib/skills-map.ts to: ${price.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
