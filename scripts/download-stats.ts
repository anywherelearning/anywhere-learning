/**
 * Prints what members view and download, from the `activity_events` table.
 *
 *   npm run stats:downloads            # last 30 days
 *   npm run stats:downloads -- 90      # last 90 days
 *
 * Sections: most/least downloaded guides, most viewed guides, and the members
 * with the most downloads (with how many distinct guides and over how many
 * days, so a one-afternoon bulk grab stands out).
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { neon } from '@neondatabase/serverless';
import { getFallbackProducts } from '../lib/fallback-products';

const days = Math.max(1, parseInt(process.argv[2] || '30', 10) || 30);

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Set it in .env.local');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const names = new Map(getFallbackProducts().map((p) => [p.slug, p.name]));
  const label = (slug: string) => names.get(slug) ?? slug;

  console.log(`\nActivity in the last ${days} day(s)\n${'='.repeat(40)}`);

  const totals = (await sql`
    SELECT kind, count(*)::int AS events, count(DISTINCT user_id)::int AS people
    FROM activity_events
    WHERE created_at > now() - make_interval(days => ${days})
    GROUP BY kind
  `) as { kind: string; events: number; people: number }[];
  for (const t of totals) console.log(`${t.kind.padEnd(9)} ${t.events} events by ${t.people} people`);
  if (totals.length === 0) console.log('No events yet.');

  const top = (await sql`
    SELECT slug, count(*)::int AS downloads, count(DISTINCT user_id)::int AS people
    FROM activity_events
    WHERE kind = 'download' AND created_at > now() - make_interval(days => ${days})
    GROUP BY slug ORDER BY downloads DESC, slug LIMIT 20
  `) as { slug: string; downloads: number; people: number }[];
  console.log(`\nMost downloaded\n${'-'.repeat(40)}`);
  for (const r of top) console.log(`${String(r.downloads).padStart(4)}  ${label(r.slug)}  (${r.people} people)`);

  const downloadedSlugs = new Set(
    ((await sql`SELECT DISTINCT slug FROM activity_events WHERE kind = 'download'`) as { slug: string }[]).map((r) => r.slug),
  );
  const never = getFallbackProducts()
    .filter((p) => p.active !== false && !p.isBundle && !downloadedSlugs.has(p.slug))
    .map((p) => p.name);
  console.log(`\nNever downloaded (${never.length})\n${'-'.repeat(40)}`);
  for (const n of never.slice(0, 30)) console.log(`      ${n}`);
  if (never.length > 30) console.log(`      … and ${never.length - 30} more`);

  const views = (await sql`
    SELECT slug, count(*)::int AS views
    FROM activity_events
    WHERE kind = 'view' AND created_at > now() - make_interval(days => ${days})
    GROUP BY slug ORDER BY views DESC, slug LIMIT 10
  `) as { slug: string; views: number }[];
  console.log(`\nMost opened in the reader\n${'-'.repeat(40)}`);
  for (const r of views) console.log(`${String(r.views).padStart(4)}  ${label(r.slug)}`);

  const members = (await sql`
    SELECT u.email, e.tier,
           count(*)::int AS downloads,
           count(DISTINCT e.slug)::int AS guides,
           (date_trunc('day', max(e.created_at)) - date_trunc('day', min(e.created_at)))::int / 86400 + 1 AS active_days
    FROM activity_events e JOIN users u ON u.id = e.user_id
    WHERE e.kind = 'download' AND e.created_at > now() - make_interval(days => ${days})
    GROUP BY u.email, e.tier ORDER BY guides DESC, downloads DESC LIMIT 15
  `) as { email: string; tier: string; downloads: number; guides: number; active_days: number }[];
  console.log(`\nMembers by downloads\n${'-'.repeat(40)}`);
  for (const m of members) {
    console.log(`${String(m.guides).padStart(4)} guides  ${String(m.downloads).padStart(4)} files  over ${m.active_days} day(s)  ${m.email}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
