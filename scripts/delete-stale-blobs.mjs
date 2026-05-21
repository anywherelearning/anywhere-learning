#!/usr/bin/env node
/**
 * Deletes the 10 stale blob files identified by audit-blob-store.mjs:
 *   - 7 "possible duplicates" (older lowercase versions superseded by newer ALL-CAPS uploads)
 *   - 3 "unmatched" (older versions of activities now uploaded under the new naming convention)
 *
 * Each file is matched by exact pathname so the script is safe — it cannot
 * accidentally delete the mapped activities (those have different basenames).
 *
 * Dry-run by default. Pass --confirm to actually delete.
 */

import { list, del } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN required');
  process.exit(1);
}

const STALE_PATHNAMES = [
  // 7 possible duplicates (lowercase, superseded by newer ALL-CAPS uploads)
  'AI & Digital literacy -  Media & info check.pdf',
  'Communication & Writing - Community impact project.pdf',
  'Communication & Writing - Write it like a pro.pdf',
  'Entrepreneurship - Micro-business challenge.pdf',
  'Planning & Problem-Solving - Problem-solver studio.pdf',
  'Planning & Problem-solving - Time & energy planner.pdf',
  'Planning & Problem-solving - Travel Day itinerary challenge.pdf',
  // 3 unmatched (older versions)
  'Real-world math - Budget challenge.pdf',
  'Real-world math - Kitchen math & meal planning challenge.pdf',
  'Real-world math - Smart shopper lab.pdf',
];

const confirm = process.argv.includes('--confirm');

// Fetch all blobs so we can match exact URLs (and not delete by guessed path)
const all = [];
let cursor;
do {
  const r = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
  all.push(...r.blobs);
  cursor = r.cursor;
} while (cursor);

const toDelete = [];
const notFound = [];
for (const name of STALE_PATHNAMES) {
  const match = all.find((b) => b.pathname === name);
  if (match) toDelete.push(match);
  else notFound.push(name);
}

console.log(`Found ${toDelete.length}/${STALE_PATHNAMES.length} stale blobs:`);
let totalSize = 0;
for (const b of toDelete) {
  console.log(`  ${(b.size / 1024).toFixed(0).padStart(5)}KB  ${b.pathname}`);
  totalSize += b.size;
}
console.log(`\nTotal: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);

if (notFound.length > 0) {
  console.log(`\n⚠️  Not found (skipping): ${notFound.length}`);
  for (const n of notFound) console.log(`    ${n}`);
}

if (!confirm) {
  console.log('\n— Dry run. Re-run with --confirm to actually delete.');
  process.exit(0);
}

console.log('\nDeleting…');
for (const b of toDelete) {
  await del(b.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  console.log(`  ✓ ${b.pathname}`);
}
console.log(`\nDeleted ${toDelete.length} blobs · freed ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
