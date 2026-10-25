// Publishes redesigned guides to the member library.
//   node scripts/publish-guides.mjs my-review-column family-recipe-book ...
//
// For each slug: renders the member PDF and the 3-page preview from
// guides/content/<slug>.json, compresses both (Ghostscript /ebook, always
// before a Blob upload), uploads them as the next version of the guide's
// current Blob file, then points lib/activity-blob-urls.ts, the preview name
// in lib/fallback-products.ts and the products.preview_blob_url row at the new
// files, and refreshes public/products/<slug>.jpg from the new cover.
// Commit and push afterwards to go live.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1');
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node scripts/publish-guides.mjs <slug> [slug...]');
  process.exit(1);
}

const BLOB = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/';
const mapPath = 'lib/activity-blob-urls.ts';
const fallbackPath = 'lib/fallback-products.ts';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-guides-'));
const sql = neon(process.env.DATABASE_URL);
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

for (const slug of slugs) {
  let map = fs.readFileSync(mapPath, 'utf8');
  const current = map.match(new RegExp(`"${slug}": "${BLOB.replace(/[.]/g, '\\.')}([^"]+)"`));
  if (!current) throw new Error(`${slug}: not in ${mapPath}`);
  const oldName = decodeURIComponent(current[1]);
  const base = oldName.replace(/( v\d+)?\.pdf$/, '');
  const version = Number(oldName.match(/ v(\d+)\.pdf$/)?.[1] ?? 1) + 1;
  const memberName = `${base} v${version}.pdf`;
  const previewName = `Preview ${base} v${version}.pdf`;

  for (const flag of [[], ['--preview']]) {
    const out = run('node', ['guides/render/render.mjs', `guides/content/${slug}.json`, ...flag]);
    if (/OVERFLOW/.test(out)) console.warn(`${slug}: overflow ${flag.join('')}\n${out}`);
  }
  const files = {
    member: [`notes/guides/${slug}-color.pdf`, memberName],
    preview: [`notes/guides/${slug}-preview-color.pdf`, previewName],
  };
  const urls = {};
  for (const [kind, [src, name]] of Object.entries(files)) {
    const small = path.join(tmp, `${slug}-${kind}.pdf`);
    run('/opt/homebrew/bin/gs', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5', '-dPDFSETTINGS=/ebook',
      '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${small}`, src]);
    const blob = await put(name, fs.readFileSync(small), {
      access: 'public', contentType: 'application/pdf', allowOverwrite: true, addRandomSuffix: false,
    });
    urls[kind] = blob.url;
  }

  map = map.replace(current[0], `"${slug}": "${urls.member}"`);
  fs.writeFileSync(mapPath, map);

  let fallback = fs.readFileSync(fallbackPath, 'utf8');
  const block = fallback.indexOf(`slug: "${slug}"`);
  const pf = fallback.indexOf('previewFile:', block);
  if (block !== -1 && pf !== -1) {
    const end = fallback.indexOf('\n', pf);
    fallback = `${fallback.slice(0, pf)}previewFile: ${JSON.stringify(previewName)},${fallback.slice(end)}`;
    fs.writeFileSync(fallbackPath, fallback);
  }

  const rows = await sql`update products set preview_blob_url = ${urls.preview} where slug = ${slug} returning slug`;

  const cover = path.join(tmp, `${slug}-cover`);
  run('pdftoppm', ['-jpeg', '-r', '200', '-f', '1', '-l', '1', '-singlefile', files.member[0], cover]);
  run('sips', ['--resampleWidth', '800', `${cover}.jpg`, '--out', `public/products/${slug}.jpg`]);

  console.log(`${slug}: v${version} published${rows.length ? '' : ' (no products row)'}`);
}
