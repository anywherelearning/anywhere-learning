#!/usr/bin/env node
/**
 * Walks every user in the DB and stamps Clerk publicMetadata.tier + .founder
 * based on their actual subscription / Starter Pack purchase.
 *
 * Run once after adding tier-aware UI; new purchases get this set
 * automatically by the Stripe webhook.
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- node scripts/backfill-clerk-tier-metadata.mjs
 */

import { neon } from '@neondatabase/serverless';
import { createClerkClient } from '@clerk/backend';

if (!process.env.DATABASE_URL || !process.env.CLERK_SECRET_KEY) {
  console.error('DATABASE_URL and CLERK_SECRET_KEY required');
  process.exit(1);
}

// Stripe price IDs (need to match lib/stripe-prices.ts exactly)
const FOUNDER_PRICE_ID = 'price_1TZMETAMzOBftCnthrU2MJLz';

const sql = neon(process.env.DATABASE_URL);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const users = await sql`
  SELECT u.id, u.email, u.clerk_id, u.starter_pack_purchased_at,
         s.stripe_price_id, s.status
  FROM users u
  LEFT JOIN LATERAL (
    SELECT stripe_price_id, status
    FROM subscriptions
    WHERE user_id = u.id
    ORDER BY created_at ASC
    LIMIT 1
  ) s ON TRUE
  WHERE u.clerk_id IS NOT NULL
`;

console.log(`Found ${users.length} users to check\n`);

for (const u of users) {
  let tier = null;
  let founder = false;

  // Active subscription wins
  if (u.stripe_price_id && (u.status === 'active' || u.status === 'past_due')) {
    tier = 'member';
    founder = u.stripe_price_id === FOUNDER_PRICE_ID;
  } else if (u.starter_pack_purchased_at) {
    tier = 'starter';
    founder = false;
  } else {
    process.stdout.write(`▶ ${u.email}… no tier (guest), skipping\n`);
    continue;
  }

  try {
    await clerk.users.updateUserMetadata(u.clerk_id, {
      publicMetadata: { tier, founder },
    });
    console.log(`▶ ${u.email}… ${tier}${founder ? ' (founder)' : ''}`);
  } catch (err) {
    console.error(`▶ ${u.email}… FAILED: ${err.message}`);
  }
}

console.log('\nDone.');
