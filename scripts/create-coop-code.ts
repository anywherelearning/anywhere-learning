/**
 * Create a co-op's promotion code (and, the first time, the shared coupon).
 * See lib/coop-offer.ts for the offer.
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/create-coop-code.ts COLLECTIVE "The Homeschool Collective"
 *
 * Idempotent: an existing coupon or code is reused and reported.
 * Families then join through https://anywherelearning.co/coop/<code in lowercase>.
 */

import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import { COOP_OFFER, sanitizeCoopCode } from '@/lib/coop-offer';

const code = sanitizeCoopCode(process.argv[2]);
const coopName = (process.argv[3] || '').trim();
if (!process.env.STRIPE_SECRET_KEY || !code || !coopName) {
  console.error('Usage: node --env-file=.env.local node_modules/.bin/tsx scripts/create-coop-code.ts CODE "Co-op name"');
  process.exit(1);
}

async function ensureCoupon() {
  try {
    const coupon = await stripe.coupons.retrieve(COOP_OFFER.couponId);
    console.log(`Coupon "${coupon.id}" already exists ($${(coupon.amount_off ?? 0) / 100} off, ${coupon.duration})`);
    return;
  } catch (err: unknown) {
    if ((err as { code?: string }).code !== 'resource_missing') throw err;
  }
  // Only the founder product: the $20 is sized against $99, and it keeps the
  // code off the monthly plan.
  const founderPrice = await stripe.prices.retrieve(
    requirePriceId(STRIPE_PRICES.MEMBERSHIP_FOUNDER, 'Membership Founder'),
  );
  const productId = typeof founderPrice.product === 'string' ? founderPrice.product : founderPrice.product.id;
  const coupon = await stripe.coupons.create({
    id: COOP_OFFER.couponId,
    amount_off: COOP_OFFER.amountOffUsd * 100,
    currency: founderPrice.currency,
    duration: 'forever',
    name: 'Co-op rate: $79/year for life',
    applies_to: { products: [productId] },
    metadata: { campaign: 'coop_2026' },
  });
  console.log(`Created coupon "${coupon.id}" ($${COOP_OFFER.amountOffUsd} off forever, product ${productId})`);
}

async function main() {
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY!.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
  await ensureCoupon();

  const existing = await stripe.promotionCodes.list({ code: code!, limit: 1 });
  if (existing.data[0]) {
    const p = existing.data[0];
    console.log(`Code ${p.code} already exists (${p.times_redeemed}/${p.max_redemptions ?? '∞'} used, active: ${p.active})`);
    return;
  }
  const promo = await stripe.promotionCodes.create({
    coupon: COOP_OFFER.couponId,
    code: code!,
    max_redemptions: COOP_OFFER.maxFamiliesPerCode,
    expires_at: Math.floor(COOP_OFFER.codesExpireAt.getTime() / 1000),
    metadata: { coop: coopName },
  });
  console.log(`Created code ${promo.code} for ${coopName} (max ${COOP_OFFER.maxFamiliesPerCode}, expires ${COOP_OFFER.codesExpireAt.toISOString()})`);
  console.log(`Flyer link: https://anywherelearning.co/coop/${code!.toLowerCase()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
