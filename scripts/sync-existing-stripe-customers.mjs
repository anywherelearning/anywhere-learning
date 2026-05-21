#!/usr/bin/env node
/**
 * One-off repair: walks all users in the DB that have a stripeCustomerId,
 * fetches their active Stripe subscriptions, and upserts them into the
 * `subscriptions` table. Useful when the webhook order-of-events caused a
 * subscription row to be missed.
 *
 * Idempotent — safe to run multiple times.
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- node scripts/sync-existing-stripe-customers.mjs
 */

import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY required');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const usersList = await sql`
    SELECT id, email, stripe_customer_id, clerk_id
    FROM users
  `;
  console.log(`Found ${usersList.length} users in DB`);

  for (const user of usersList) {
    process.stdout.write(`▶ ${user.email}... `);

    // Look up all Stripe customers that match this email (could be multiple
    // if the buyer purchased multiple times across browser sessions).
    const customers = await stripe.customers.list({ email: user.email, limit: 100 });
    if (customers.data.length === 0) {
      console.log('no Stripe customer');
      continue;
    }

    // Collect all subscriptions across all matching customers.
    const allSubs = [];
    for (const cust of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: cust.id, status: 'all', limit: 10 });
      for (const s of subs.data) allSubs.push({ sub: s, customerId: cust.id });
    }
    if (allSubs.length === 0) {
      console.log(`${customers.data.length} customer(s), 0 subscriptions`);
      continue;
    }

    // Prefer the most recently created active subscription as the "primary"
    // customer id to store on the user row.
    const activeFirst = allSubs.sort((a, b) => {
      const aActive = a.sub.status === 'active' ? 1 : 0;
      const bActive = b.sub.status === 'active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return b.sub.created - a.sub.created;
    });
    const primaryCustomerId = activeFirst[0].customerId;

    if (user.stripe_customer_id !== primaryCustomerId) {
      await sql`UPDATE users SET stripe_customer_id = ${primaryCustomerId} WHERE id = ${user.id}`;
      console.log(`linked customer ${primaryCustomerId} | `);
    }

    for (const { sub, customerId } of allSubs) {
      const periodEnd = new Date(
        (sub.current_period_end || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60) * 1000,
      );
      const priceId = sub.items.data[0]?.price.id || '';

      const existing = await sql`
        SELECT id FROM subscriptions WHERE stripe_subscription_id = ${sub.id} LIMIT 1
      `;
      if (existing.length > 0) {
        await sql`
          UPDATE subscriptions
          SET status = ${sub.status},
              current_period_end = ${periodEnd},
              cancel_at_period_end = ${sub.cancel_at_period_end ?? false},
              updated_at = now()
          WHERE id = ${existing[0].id}
        `;
        process.stdout.write(`updated ${sub.id} (${sub.status}) `);
      } else {
        await sql`
          INSERT INTO subscriptions
            (user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
             status, current_period_end, cancel_at_period_end)
          VALUES
            (${user.id}, ${customerId}, ${sub.id}, ${priceId},
             ${sub.status}, ${periodEnd}, ${sub.cancel_at_period_end ?? false})
        `;
        process.stdout.write(`inserted ${sub.id} (${sub.status}) `);
      }
    }
    console.log();
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
