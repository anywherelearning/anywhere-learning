/**
 * Create the Fall offer Stripe coupon: $20 off the yearly founder plan, so the
 * first year is $79. Applied automatically by lib/membership-checkout.ts for
 * checkouts that come from /fall.
 *
 * Run once per Stripe mode (test, then live):
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/create-fall-coupon.ts
 *
 * Idempotent: if the coupon ID already exists, it is reused.
 *
 * Why `repeating` for 12 months and not `once`: the discount is attached when
 * the subscription starts, during the free trial. A 12-month window covers the
 * first yearly invoice at trial end and has expired by the first renewal, so
 * year two bills at the normal founder rate.
 */

import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import { FALL_OFFER } from '@/lib/fall-offer';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Run with: node --env-file=.env.local node_modules/.bin/tsx scripts/create-fall-coupon.ts');
  process.exit(1);
}

async function main() {
  const mode = process.env.STRIPE_SECRET_KEY!.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`Stripe mode: ${mode}`);

  try {
    const coupon = await stripe.coupons.retrieve(FALL_OFFER.couponId);
    console.log(`✓ Coupon "${coupon.id}" already exists ($${(coupon.amount_off ?? 0) / 100} off)`);
    return;
  } catch (err: unknown) {
    if ((err as { code?: string }).code !== 'resource_missing') throw err;
  }

  // Restrict the coupon to the founder product so it can't discount anything else.
  const founderPrice = await stripe.prices.retrieve(
    requirePriceId(STRIPE_PRICES.MEMBERSHIP_FOUNDER, 'Membership Founder'),
  );
  const productId =
    typeof founderPrice.product === 'string' ? founderPrice.product : founderPrice.product.id;

  const coupon = await stripe.coupons.create({
    id: FALL_OFFER.couponId,
    amount_off: FALL_OFFER.amountOffUsd * 100,
    currency: founderPrice.currency,
    duration: 'repeating',
    duration_in_months: 12,
    name: 'Fall offer: first year $79',
    applies_to: { products: [productId] },
    // Checkout sessions live 2h, so a session opened just before the deadline
    // can still be completed.
    redeem_by: Math.floor(FALL_OFFER.endsAt.getTime() / 1000) + 3 * 60 * 60,
    metadata: { campaign: 'fall_offer_2026', ends_at: FALL_OFFER.endsAt.toISOString() },
  });
  console.log(`✓ Created coupon "${coupon.id}" ($${FALL_OFFER.amountOffUsd} off ${founderPrice.currency.toUpperCase()}, product ${productId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
