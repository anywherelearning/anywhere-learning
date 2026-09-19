/**
 * Create the 5-Day Challenge winner codes: one free year of the membership.
 *
 * Run once, locally, with your live Stripe key:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/create-winner-codes.ts
 *
 * Creates one coupon (100% off, applied once, so the first annual invoice is
 * $0) and one single-use promotion code per winner. Each winner starts the
 * membership through the normal checkout at /start-trial?plan=annual and
 * enters their code in the "Add promotion code" field. The Stripe webhook
 * then creates their subscription, Clerk tier, and Kit tags like any member.
 *
 * Year two renews at the founder rate unless they cancel, which is what
 * "one free year" means. Tell them so in the email.
 *
 * Idempotent: reuses the coupon and codes if they already exist.
 */

import { stripe } from '@/lib/stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Run with: node --env-file=.env.local node_modules/.bin/tsx scripts/create-winner-codes.ts');
  process.exit(1);
}

const COUPON_ID = 'challenge-2026-free-year';
const WINNERS = [
  { code: 'KAREN-FREEYEAR', name: 'Karen Mark' },
  { code: 'KELSEY-FREEYEAR', name: 'Kelsey Bouchard' },
];
const EXPIRES_IN_DAYS = 30;

async function main() {
  let coupon;
  try {
    coupon = await stripe.coupons.retrieve(COUPON_ID);
    console.log(`✓ Coupon "${COUPON_ID}" already exists (${coupon.percent_off}% off)`);
  } catch (err: unknown) {
    if ((err as { code?: string }).code !== 'resource_missing') throw err;
    coupon = await stripe.coupons.create({
      id: COUPON_ID,
      percent_off: 100,
      duration: 'once',
      name: '5-Day Challenge: free year',
      metadata: { campaign: 'challenge_2026_cohort_1' },
    });
    console.log(`✓ Created coupon "${coupon.id}" (100% off, once)`);
  }

  const expiresAt = Math.floor((Date.now() + EXPIRES_IN_DAYS * 86400 * 1000) / 1000);

  for (const w of WINNERS) {
    const existing = await stripe.promotionCodes.list({ code: w.code, limit: 1 });
    if (existing.data.length > 0) {
      console.log(`✓ Code ${w.code} already exists for ${w.name}`);
      continue;
    }
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: w.code,
      active: true,
      max_redemptions: 1,
      expires_at: expiresAt,
      metadata: { winner: w.name, campaign: 'challenge_2026_cohort_1' },
    });
    console.log(`✓ Created code ${promo.code} for ${w.name} (single use, expires in ${EXPIRES_IN_DAYS} days)`);
  }

  console.log('\nSend each winner to: https://anywherelearning.co/start-trial?plan=annual');
  console.log('They enter their code in the "Add promotion code" field at checkout.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
