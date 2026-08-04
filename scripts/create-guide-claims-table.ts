/**
 * Creates the `guide_claims` table.
 *
 * Additive SQL on purpose, rather than `drizzle-kit push`. This Neon database is
 * shared with the separate homeschool-planner app, and push compares the whole
 * database against schema.ts. The tablesFilter in drizzle.config.ts guards
 * against that, but a plain CREATE TABLE IF NOT EXISTS cannot drop anything at
 * all, which is the safer tool for adding one table.
 *
 * Idempotent: safe to run more than once, and safe to run against a database
 * where the table already exists.
 *
 *   npx tsx scripts/create-guide-claims-table.ts
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

  console.log('Creating guide_claims...');

  await sql`
    CREATE TABLE IF NOT EXISTS guide_claims (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      activity_slug text NOT NULL,
      source text,
      claimed_at timestamp NOT NULL DEFAULT now()
    )
  `;

  // One claim per address. The API's INSERT ... ON CONFLICT depends on this.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_guide_claims_email
      ON guide_claims (email)
  `;

  const [{ count }] = (await sql`
    SELECT count(*)::int AS count FROM guide_claims
  `) as { count: number }[];

  console.log(`Done. guide_claims exists with ${count} row(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
