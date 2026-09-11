/**
 * Creates the `activity_events` table (member view/download log + download cap).
 *
 * Additive SQL on purpose, rather than `drizzle-kit push`: this Neon database
 * is shared with the homeschool-planner app, and CREATE TABLE IF NOT EXISTS
 * cannot drop anything. Idempotent, safe to run more than once.
 *
 *   npx tsx scripts/create-activity-events-table.ts
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

  console.log('Creating activity_events...');

  await sql`
    CREATE TABLE IF NOT EXISTS activity_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      slug text NOT NULL,
      kind text NOT NULL,
      tier text NOT NULL,
      ip_address text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_events_user_kind_created
      ON activity_events (user_id, kind, created_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_events_slug_kind
      ON activity_events (slug, kind)
  `;

  const [{ count }] = (await sql`
    SELECT count(*)::int AS count FROM activity_events
  `) as { count: number }[];

  console.log(`Done. activity_events exists with ${count} row(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
