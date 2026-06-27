import { put } from '@vercel/blob';
import { readFile } from 'node:fs/promises';

// Load .env.local manually (avoids dotenv dependency)
const envText = await readFile('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
  if (m && !process.env[m[1]]) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const filePath = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities/Free guide - 7 Days of Real-World Learning - compressed.pdf';
const buf = await readFile(filePath);
const blob = await put(
  'Free guide - 7 Days of Real-World Learning - compressed.pdf',
  buf,
  {
    access: 'public',
    contentType: 'application/pdf',
    allowOverwrite: true,
    addRandomSuffix: false,
  }
);
console.log('URL:', blob.url);
