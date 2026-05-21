#!/usr/bin/env node
/**
 * Audit Vercel Blob store: categorizes every blob into "in use" (mapped to a
 * slug) vs "candidate for deletion" (previews, free guides, orphans, duplicates).
 *
 * Read-only — does NOT delete anything. Run scripts/delete-blobs.mjs after
 * reviewing the output if you want to actually purge.
 */

import { list } from '@vercel/blob';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN required');
  process.exit(1);
}

const ROOT = process.cwd();

// Load our mapping of slug → URL (already generated)
const lib = readFileSync(join(ROOT, 'lib', 'activity-blob-urls.ts'), 'utf-8');
const usedUrls = new Set();
for (const m of lib.matchAll(/"(https:\/\/[^"]+)"/g)) usedUrls.add(m[1]);

const all = [];
let cursor;
do {
  const r = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
  all.push(...r.blobs);
  cursor = r.cursor;
} while (cursor);

console.log(`Total blobs in store: ${all.length}\n`);

const categories = {
  inUse: [],
  previewPdf: [],
  freeGuide: [],
  notPdf: [],
  duplicateOfMapped: [], // multiple uploads with same base name
  unmatched: [], // PDF but no mapping
};

// Build map of basename (no path) → matched
const usedBasenames = new Set();
for (const m of lib.matchAll(/"https:\/\/[^"]+\/([^"\/]+?)(?:-[A-Za-z0-9_-]{20,30})?\.pdf"/g)) {
  usedBasenames.add(decodeURIComponent(m[1]).toLowerCase());
}

for (const b of all) {
  const name = b.pathname;
  const lname = name.toLowerCase();
  if (usedUrls.has(b.url)) {
    categories.inUse.push(b);
    continue;
  }
  if (!lname.endsWith('.pdf')) {
    categories.notPdf.push(b);
    continue;
  }
  if (/^preview/i.test(name)) {
    categories.previewPdf.push(b);
    continue;
  }
  if (/^free guide/i.test(name)) {
    categories.freeGuide.push(b);
    continue;
  }
  // Strip suffix and check if a same-base blob is in the used set
  const baseLower = name.toLowerCase().replace(/-[a-z0-9_-]{20,30}\.pdf$/i, '.pdf').replace(/\.pdf$/, '');
  if ([...usedBasenames].some((u) => u.startsWith(baseLower.slice(0, 20)))) {
    categories.duplicateOfMapped.push(b);
    continue;
  }
  categories.unmatched.push(b);
}

const fmt = (b) => `    ${(b.size / 1024).toFixed(0).padStart(5)}KB  ${new Date(b.uploadedAt).toISOString().slice(0, 10)}  ${b.pathname}`;

console.log(`✅ In use (mapped to a slug): ${categories.inUse.length}`);
console.log(`📦 Preview PDFs: ${categories.previewPdf.length}`);
for (const b of categories.previewPdf.slice(0, 5)) console.log(fmt(b));
if (categories.previewPdf.length > 5) console.log(`    …+${categories.previewPdf.length - 5} more`);

console.log(`\n📄 Free Guide PDFs: ${categories.freeGuide.length}`);
for (const b of categories.freeGuide) console.log(fmt(b));

console.log(`\n🖼️ Non-PDFs (covers, images): ${categories.notPdf.length}`);
for (const b of categories.notPdf.slice(0, 5)) console.log(fmt(b));
if (categories.notPdf.length > 5) console.log(`    …+${categories.notPdf.length - 5} more`);

console.log(`\n🔁 Possible duplicates of mapped PDFs: ${categories.duplicateOfMapped.length}`);
for (const b of categories.duplicateOfMapped.slice(0, 10)) console.log(fmt(b));
if (categories.duplicateOfMapped.length > 10) console.log(`    …+${categories.duplicateOfMapped.length - 10} more`);

console.log(`\n❓ Unmatched PDFs (NOT preview/free-guide, no mapping): ${categories.unmatched.length}`);
for (const b of categories.unmatched) console.log(fmt(b));

const totalSize = all.reduce((s, b) => s + b.size, 0);
const unusedSize = [
  ...categories.previewPdf,
  ...categories.freeGuide,
  ...categories.duplicateOfMapped,
  ...categories.unmatched,
].reduce((s, b) => s + b.size, 0);

console.log(`\nTotal store size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
console.log(`Could delete: ${(unusedSize / 1024 / 1024).toFixed(1)}MB (${Math.round((unusedSize / totalSize) * 100)}%)`);
