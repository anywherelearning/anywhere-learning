#!/usr/bin/env node
/**
 * Walks every user in our DB, finds their Stripe customer, and backfills any
 * missing firstName/lastName into Clerk from the Stripe customer.name field.
 *
 * Safe to re-run — only updates when Clerk has empty name AND Stripe has one.
 *
 * Usage:  npx dotenv-cli -e .env.local -- node scripts/backfill-clerk-names.mjs
 */

import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { createClerkClient } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const rows = await sql`
  SELECT id, email, stripe_customer_id, clerk_id FROM users
  WHERE stripe_customer_id IS NOT NULL AND clerk_id IS NOT NULL
`;

console.log(`Found ${rows.length} candidates\n`);

for (const u of rows) {
  process.stdout.write(`▶ ${u.email}… `);

  // Stripe customer
  let stripeName = '';
  try {
    const cust = await stripe.customers.retrieve(u.stripe_customer_id);
    if (!('deleted' in cust && cust.deleted)) {
      stripeName = (cust.name || '').trim();
    }
  } catch {
    /* might be deleted in test mode */
  }
  if (!stripeName) {
    // Fall back to most recent Checkout Session for that customer
    try {
      const sessions = await stripe.checkout.sessions.list({
        customer: u.stripe_customer_id,
        limit: 1,
      });
      stripeName = sessions.data[0]?.customer_details?.name?.trim() || '';
    } catch {}
  }
  if (!stripeName) {
    console.log('no Stripe name on file');
    continue;
  }

  const [firstName, ...lastNameParts] = stripeName.split(/\s+/);
  const lastName = lastNameParts.join(' ');

  // Clerk user
  const clerkUser = await clerk.users.getUser(u.clerk_id);
  const needsFirst = !clerkUser.firstName && firstName;
  const needsLast = !clerkUser.lastName && lastName;
  if (!needsFirst && !needsLast) {
    console.log(`already set (${clerkUser.firstName || ''} ${clerkUser.lastName || ''})`.trim());
    continue;
  }
  await clerk.users.updateUser(u.clerk_id, {
    ...(needsFirst ? { firstName } : {}),
    ...(needsLast ? { lastName } : {}),
  });
  console.log(`updated → "${firstName} ${lastName}".trim()`);
}

console.log('\nDone.');
