/**
 * Upload the free guide PDF to Vercel Blob.
 *
 * Overwrites any existing blob at the same pathname so the URL stays stable
 * (ConvertKit email template keeps working). Also finds and deletes any older
 * orphan PDFs that look like prior versions of the free guide.
 *
 * Usage:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/upload-free-guide.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local
 */
import { put, list, del } from '@vercel/blob';
import { readFileSync, existsSync, statSync } from 'fs';
import { basename } from 'path';

const LOCAL_PDF = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities/Free guide - 7 Days of Real-World Learning.pdf';
const BLOB_PATHNAME = 'Free guide - 7 Days of Real-World Learning.pdf';

function fmtMB(bytes: number) {
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

async function main() {
  console.log('\n=== Free Guide Upload ===\n');

  if (!existsSync(LOCAL_PDF)) {
    console.error(`Local file not found: ${LOCAL_PDF}`);
    process.exit(1);
  }
  const localSize = statSync(LOCAL_PDF).size;
  console.log(`Local file:  ${basename(LOCAL_PDF)}`);
  console.log(`Local size:  ${fmtMB(localSize)}`);

  // 1. List current blobs to find prior versions
  console.log('\nListing current Blob inventory...');
  const all = new Map<string, { url: string; size: number }>();
  let cursor: string | undefined;
  do {
    const r = await list({ cursor, limit: 1000 });
    for (const b of r.blobs) all.set(b.pathname, { url: b.url, size: b.size });
    cursor = r.cursor;
  } while (cursor);
  console.log(`  → ${all.size} blobs total`);

  // 2. Find existing free-guide-like PDFs
  const matches = [...all.entries()].filter(([p]) => {
    const s = p.toLowerCase();
    return s.endsWith('.pdf') && (
      s.includes('free guide') ||
      s.includes('free-guide') ||
      s.includes('7 days of real') ||
      s.includes('7-days-of-real')
    );
  });

  console.log(`\nFound ${matches.length} existing free-guide-like PDF(s) on Blob:`);
  for (const [pathname, info] of matches) {
    console.log(`  ${fmtMB(info.size).padStart(8)}  ${pathname}`);
    console.log(`            ${info.url}`);
  }

  // 3. Upload new version at stable pathname (overwrites in place, same URL)
  console.log(`\nUploading ${basename(LOCAL_PDF)} → ${BLOB_PATHNAME}...`);
  const buf = readFileSync(LOCAL_PDF);
  const uploaded = await put(BLOB_PATHNAME, buf, {
    access: 'public',
    contentType: 'application/pdf',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  ✓ uploaded`);
  console.log(`  URL: ${uploaded.url}`);

  // 4. Delete any OTHER matching blobs (old versions with different pathnames)
  const toDelete = matches.filter(([pathname, info]) => {
    return pathname !== BLOB_PATHNAME && info.url !== uploaded.url;
  });

  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} orphan free-guide PDF(s):`);
    for (const [pathname, info] of toDelete) {
      process.stdout.write(`  DEL  ${pathname} (${fmtMB(info.size)})... `);
      try {
        await del(info.url);
        console.log('✓');
      } catch (err) {
        console.log(`✗ ${err instanceof Error ? err.message : err}`);
      }
    }
  } else {
    console.log('\nNo orphan versions to delete (clean state).');
  }

  console.log('\n=== Done ===');
  console.log(`\nNew/current free-guide URL:\n  ${uploaded.url}\n`);
  console.log('Next step: paste this URL into the ConvertKit welcome email template');
  console.log('(replaces the YOUR_FREE_GUIDE_LINK_HERE placeholder / existing URL).\n');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
