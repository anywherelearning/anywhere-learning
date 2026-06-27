import { put } from '@vercel/blob';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Load .env.local manually
const envText = await readFile('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
  if (m && !process.env[m[1]]) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const SRC = '/Users/ameliedrouin/Desktop/Anywhere Learning/Compressed Emotional & Social Skills';
const files = await readdir(SRC);
const pdfs = files.filter(f => f.endsWith('.pdf')).sort();

console.log(`Uploading ${pdfs.length} PDFs...\n`);

const urls = {};
for (const f of pdfs) {
  const buf = await readFile(path.join(SRC, f));
  const blob = await put(f, buf, {
    access: 'public',
    contentType: 'application/pdf',
    allowOverwrite: true,
    addRandomSuffix: false,
  });
  const isPreview = f.startsWith('Preview ');
  const kind = isPreview ? 'PREVIEW ' : 'ACTIVITY';
  console.log(`[${kind}] ${f}`);
  console.log(`         ${blob.url}\n`);
  urls[f] = blob.url;
}

console.log('---DONE---');
console.log(JSON.stringify(urls, null, 2));
