import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

// drizzle-kit runs outside Next, so it doesn't auto-load .env.local. Load it the
// same way scripts/seed.ts does, otherwise DATABASE_URL is undefined and
// db:push/db:studio can't connect.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // This repo shares its Neon database with the separate homeschool-planner
  // app, which owns tables not defined in schema.ts (calendar_events, children,
  // custom_resources, custom_subjects, log_entries, unavailable_windows,
  // weekly_goals). Without this filter, `db:push` sees them as "missing from the
  // schema" and offers to DROP them. Scope every drizzle-kit operation to only
  // the tables this repo actually manages, so those planner tables are ignored.
  // Keep this list in sync with the pgTable() definitions in schema.ts.
  tablesFilter: [
    'member_state',
    'users',
    'products',
    'orders',
    'downloads',
    'reviews',
    'device_tokens',
    'subscriptions',
    'trial_downloads',
    'stripe_events',
    'sent_emails',
    'referrals',
    'referral_conversions',
  ],
});
