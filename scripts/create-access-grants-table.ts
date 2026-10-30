/**
 * Creates the `access_grants` table (prepaid membership with no Stripe
 * subscription: gifts, ESA orders, co-op and school licenses).
 *
 * Additive SQL on purpose, rather than `drizzle-kit push`: this Neon database
 * is shared with the homeschool-planner app, and CREATE TABLE IF NOT EXISTS
 * cannot drop anything. Idempotent, safe to run more than once.
 *
 *   npm run db:create-access-grants
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { neon } from '@neondatabase/serverless';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Set it in .env.local');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS access_grants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      email text NOT NULL,
      source text NOT NULL,
      gift_from text,
      note text,
      starts_at timestamp NOT NULL DEFAULT now(),
      ends_at timestamp NOT NULL,
      revoked_at timestamp,
      reminder_sent_at timestamp,
      ended_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_access_grants_user_ends ON access_grants (user_id, ends_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_access_grants_ends ON access_grants (ends_at)`;

  // Gift checkout + scheduled delivery (Oct 30 2026). Additive columns.
  await sql`ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS gift_message text`;
  await sql`ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS buyer_email text`;
  await sql`ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS stripe_session_id text`;
  await sql`ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS welcome_sent_at timestamp`;
  // Grants made before scheduling existed were activated on creation.
  await sql`UPDATE access_grants SET welcome_sent_at = created_at WHERE welcome_sent_at IS NULL AND starts_at <= created_at + interval '1 minute'`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_access_grants_stripe_session ON access_grants (stripe_session_id)`;
  console.log('✓ access_grants ready');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
