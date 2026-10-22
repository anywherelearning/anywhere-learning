/**
 * Creates the `map_purchases` table (Skills Map one-time purchases).
 *
 * Additive SQL on purpose, rather than `drizzle-kit push`: this Neon database
 * is shared with the homeschool-planner app, and CREATE TABLE IF NOT EXISTS
 * cannot drop anything. Idempotent, safe to run more than once.
 *
 *   npx tsx scripts/create-map-purchases-table.ts
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
    CREATE TABLE IF NOT EXISTS map_purchases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      stripe_session_id text NOT NULL,
      amount_cents integer NOT NULL,
      bonus boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_map_purchases_session ON map_purchases (stripe_session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_map_purchases_email_created ON map_purchases (email, created_at)`;
  console.log('✓ map_purchases ready');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
