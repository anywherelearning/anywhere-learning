/**
 * Create the Home Educators' Appreciation Week Stripe coupon + promotion code.
 *
 * Run once: `npx tsx scripts/create-sale-coupon.ts`
 *
 * Idempotent: if the coupon ID already exists, it will be reused.
 */

import { stripe } from '@/lib/stripe';
import { SALE_CONFIG } from '@/lib/sale';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Run with: node --env-file=.env.local node_modules/.bin/tsx scripts/create-sale-coupon.ts');
  process.exit(1);
}

async function main() {
  const couponId = SALE_CONFIG.couponId;

  // 1. Create or fetch the coupon (the discount itself)
  let coupon;
  try {
    coupon = await stripe.coupons.retrieve(couponId);
    console.log(`✓ Coupon "${couponId}" already exists (${coupon.percent_off}% off)`);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'resource_missing') {
      coupon = await stripe.coupons.create({
        id: couponId,
        percent_off: SALE_CONFIG.percentOff,
        duration: 'once',
        name: SALE_CONFIG.name,
        redeem_by: Math.floor(SALE_CONFIG.endsAt.getTime() / 1000),
        metadata: {
          campaign: 'home_educators_appreciation_2026',
          starts_at: SALE_CONFIG.startsAt.toISOString(),
          ends_at: SALE_CONFIG.endsAt.toISOString(),
        },
      });
      console.log(`✓ Created coupon "${coupon.id}" (${coupon.percent_off}% off)`);
    } else {
      throw err;
    }
  }

  // 2. Create or reuse the customer-facing promotion code
  // (Customers can also type THANKYOU25 manually if they hear about it
  //  word-of-mouth and the auto-apply window has expired.)
  const existing = await stripe.promotionCodes.list({
    code: SALE_CONFIG.promoCode,
    limit: 1,
  });

  if (existing.data.length > 0) {
    console.log(`✓ Promotion code "${SALE_CONFIG.promoCode}" already exists (${existing.data[0].id})`);
  } else {
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: SALE_CONFIG.promoCode,
      active: true,
      expires_at: Math.floor(SALE_CONFIG.endsAt.getTime() / 1000),
      metadata: {
        campaign: 'home_educators_appreciation_2026',
      },
    });
    console.log(`✓ Created promotion code "${SALE_CONFIG.promoCode}" (${promo.id})`);
  }

  console.log('\nSale window:');
  console.log(`  Starts: ${SALE_CONFIG.startsAt.toISOString()}`);
  console.log(`  Ends:   ${SALE_CONFIG.endsAt.toISOString()}`);
  console.log(`\nDiscount: ${SALE_CONFIG.percentOff}% off all products and bundles`);
  console.log('Auto-apply: enabled in app/api/checkout/route.ts (no manual code entry needed)');
}

main().catch((err) => {
  console.error('Failed to create sale coupon:', err);
  process.exit(1);
});
