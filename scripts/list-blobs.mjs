#!/usr/bin/env node
import { list } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN required');
  process.exit(1);
}

let cursor;
let count = 0;
const all = [];
do {
  const r = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
  for (const b of r.blobs) {
    all.push(b);
    count++;
  }
  cursor = r.cursor;
} while (cursor);

console.log(`Total blobs: ${count}\n`);
console.log('First 100:');
for (const b of all.slice(0, 100)) {
  console.log(`  ${b.pathname.padEnd(70)}  size=${(b.size / 1024).toFixed(0)}KB`);
}
