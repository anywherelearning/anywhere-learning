#!/usr/bin/env node
/**
 * One-off repair: walks all paid Starter Pack checkout sessions in Stripe
 * and sets `users.starter_pack_purchased_at` for the matching email.
 *
 * Useful when webhooks were misconfigured during a test purchase (port
 * mismatch, stripe-listen not running, etc.) and the DB never learned about
 * the purchase.
 *
 * Idempotent — re-running is safe (only sets the column when null).
 */

import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { createClerkClient } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  console.log('Walking Stripe checkout sessions for Starter Pack purchases…\n');

  // List recent sessions (last 100)
  const sessions = await stripe.checkout.sessions.list({ limit: 100 });
  const starterPaid = sessions.data.filter(
    (s) => s.payment_status === 'paid' && (s.metadata?.kind === 'starter_pack' || (s.mode === 'payment' && !s.metadata?.kind)),
  );
  console.log(`Found ${starterPaid.length} paid Starter Pack sessions.\n`);

  const updated = new Set();
  for (const s of starterPaid) {
    const email = s.customer_details?.email?.toLowerCase() || s.customer_email?.toLowerCase();
    if (!email) {
      console.log(`▶ ${s.id} → no email, skipping`);
      continue;
    }
    if (updated.has(email)) continue; // already handled

    // Find user row by email
    const userRows = await sql`SELECT id, starter_pack_purchased_at FROM users WHERE email = ${email} LIMIT 1`;
    if (userRows.length === 0) {
      console.log(`▶ ${email} → no DB row (webhook may need to run); skipping`);
      continue;
    }
    if (userRows[0].starter_pack_purchased_at) {
      console.log(`▶ ${email} → already marked (${userRows[0].starter_pack_purchased_at}); skipping`);
      updated.add(email);
      continue;
    }
    const purchasedAt = new Date(s.created * 1000);
    await sql`UPDATE users SET starter_pack_purchased_at = ${purchasedAt} WHERE id = ${userRows[0].id}`;
    console.log(`▶ ${email} → marked at ${purchasedAt.toISOString()}`);

    // Also update Clerk publicMetadata if user doesn't already have member tier
    try {
      const list = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
      const cu = list.data[0];
      if (cu) {
        const meta = (cu.publicMetadata || {});
        if (meta.tier !== 'member') {
          await clerk.users.updateUserMetadata(cu.id, {
            publicMetadata: { ...meta, tier: 'starter', founder: false },
          });
          console.log(`    + Clerk metadata: tier=starter`);
        }
      }
    } catch (e) {
      console.log(`    ! Clerk metadata failed: ${e.message}`);
    }

    updated.add(email);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
