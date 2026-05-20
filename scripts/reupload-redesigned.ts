import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { put } from '@vercel/blob';
import { readFileSync } from 'fs';

/**
 * Re-upload the 10 redesigned Real-World Relevance activities + 10 previews
 * to Vercel Blob, overwriting the existing blobs with compressed versions.
 *
 * Usage:
 *   npx tsx scripts/reupload-redesigned.ts
 */

const ACTIVITIES_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities';
const PREVIEWS_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Previews';

const files = [
  // Activities
  { localPath: `${ACTIVITIES_DIR}/Real-world math - Real-Life Budget Challenge.pdf`, blobName: 'Real-world relevance Budget challenge.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Planning & Problem-Solving Community Impact Project.pdf`, blobName: 'Real-world relevance Community impact project.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Real-world math - Kitchen Math & Meal Planning Challenge.pdf`, blobName: 'Real-world relevance Kitchen math & meal planning challenge.pdf' },
  { localPath: `${ACTIVITIES_DIR}/AI + Digital Literacy - MEDIA & INFO CHECK.pdf`, blobName: 'Real-world relevance Media & info check.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Entrepreneurship - Micro-Business Challenge.pdf`, blobName: 'Real-world relevance Micro-business challenge.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Planning & Problem-Solving Problem-Solver Studio.pdf`, blobName: 'Real-world relevance Problem-solver studio.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Real-world math - Smart shopper lab.pdf`, blobName: 'Real-world relevance Smart shopper lab.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Planning & Problem-Solving Time & Energy Planner.pdf`, blobName: 'Real-world relevance Time & energy planner.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Planning & Problem-Solving Travel Day Itinerary Challenge.pdf`, blobName: 'Real-world relevance Travel Day itinerary challenge.pdf' },
  { localPath: `${ACTIVITIES_DIR}/Communication & Writing - Write It Like a Pro.pdf`, blobName: 'Real-world relevance Write it like a pro.pdf' },

  // Previews
  { localPath: `${PREVIEWS_DIR}/Preview Real-world math - Real-Life Budget Challenge.pdf`, blobName: 'Preview Real-world relevance Budget challenge.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Planning & Problem-Solving Community Impact Project.pdf`, blobName: 'Preview Real-world relevance Community impact project.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Real-world math - Kitchen Math & Meal Planning Challenge.pdf`, blobName: 'Preview Real-world relevance Kitchen math & meal planning challenge.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - MEDIA & INFO CHECK.pdf`, blobName: 'Preview Real-world relevance Media & info check.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Entrepreneurship - Micro-Business Challenge.pdf`, blobName: 'Preview Real-world relevance Micro-business challenge.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Planning & Problem-Solving Problem-Solver Studio.pdf`, blobName: 'Preview Real-world relevance Problem-solver studio.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Real-world math - Smart shopper lab.pdf`, blobName: 'Preview Real-world relevance Smart shopper lab.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Planning & Problem-Solving Time & Energy Planner.pdf`, blobName: 'Preview Real-world relevance Time & energy planner.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Planning & Problem-Solving Travel Day Itinerary Challenge.pdf`, blobName: 'Preview Real-world relevance Travel Day itinerary challenge.pdf' },
  { localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Write It Like a Pro.pdf`, blobName: 'Preview Real-world relevance Write it like a pro.pdf' },
];

async function main() {
  console.log(`Uploading ${files.length} redesigned PDFs to Vercel Blob (overwrite mode)...\n`);

  let uploaded = 0;
  let errors = 0;

  for (const f of files) {
    try {
      const fileBuffer = readFileSync(f.localPath);
      const sizeMB = (fileBuffer.length / 1048576).toFixed(1);
      const blob = await put(f.blobName, fileBuffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log(`  ✓ ${f.blobName} (${sizeMB}MB)`);
      console.log(`    ${blob.url}`);
      uploaded++;
    } catch (err) {
      console.error(`  ✗ ${f.blobName}: ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\nDone! Uploaded ${uploaded}/${files.length} files.`);
  if (errors > 0) {
    console.log(`⚠ ${errors} errors occurred.`);
  }
}

main().catch(console.error);
