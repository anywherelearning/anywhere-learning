/**
 * Creates (or verifies) the Stripe Coupon used to credit Starter Pack buyers
 * who upgrade to the membership.
 *
 * Run once per Stripe environment (test, then live):
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/create-starter-pack-credit-coupon.ts
 *
 * Idempotent: if the coupon already exists with the right shape, prints OK
 * and exits. If it exists with the WRONG shape, prints a warning and exits
 * (manual cleanup needed in Stripe dashboard, since coupons are immutable).
 */

import Stripe from 'stripe';
import {
  STARTER_PACK_CREDIT_COUPON_ID,
  STARTER_PACK_CREDIT_CENTS,
} from '../lib/starter-pack-credit';

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY is not set. Aborting.');
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: '2025-09-30.clover' });

  let existing: Stripe.Coupon | null = null;
  try {
    existing = await stripe.coupons.retrieve(STARTER_PACK_CREDIT_COUPON_ID);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') {
      existing = null;
    } else {
      throw err;
    }
  }

  if (existing) {
    const ok =
      existing.amount_off === STARTER_PACK_CREDIT_CENTS &&
      existing.currency === 'usd' &&
      existing.duration === 'once' &&
      existing.valid;
    if (ok) {
      console.log(`✓ Coupon "${existing.id}" already exists with correct shape.`);
      console.log(`  amount_off: ${existing.amount_off} (${existing.currency})`);
      console.log(`  duration: ${existing.duration}`);
      console.log(`  valid: ${existing.valid}`);
      return;
    }
    console.warn(
      `⚠ Coupon "${existing.id}" exists but its shape is wrong:`,
      {
        amount_off: existing.amount_off,
        currency: existing.currency,
        duration: existing.duration,
        valid: existing.valid,
      },
    );
    console.warn(
      `  Coupons are immutable in Stripe. Delete it in the dashboard and re-run this script.`,
    );
    process.exit(1);
  }

  const created = await stripe.coupons.create({
    id: STARTER_PACK_CREDIT_COUPON_ID,
    name: 'Starter Pack credit',
    amount_off: STARTER_PACK_CREDIT_CENTS,
    currency: 'usd',
    duration: 'once',
    metadata: {
      purpose: 'Credit for Starter Pack buyers upgrading to membership',
    },
  });

  console.log(`✓ Created coupon "${created.id}":`);
  console.log(`  amount_off: ${created.amount_off} (${created.currency})`);
  console.log(`  duration: ${created.duration}`);
  console.log(`  valid: ${created.valid}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
