/**
 * Upload compressed PDFs to Vercel Blob and update database blob URLs.
 *
 * Usage:
 *   npx tsx scripts/upload-compressed-pdfs.ts          # dry run
 *   npx tsx scripts/upload-compressed-pdfs.ts --run    # upload for real
 *
 * Requires BLOB_READ_WRITE_TOKEN and DATABASE_URL in .env.local
 */

import { put, del } from '@vercel/blob';
import { db } from '../lib/db/index.js';
import { products } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync, statSync, existsSync } from 'fs';
import { basename } from 'path';

const ACTIVITIES_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities';

// Map product slug → PDF filename
const SLUG_TO_FILE: Record<string, string> = {
  // AI & Digital Literacy
  'ai-basics': 'AI & Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf',
  'algorithm-awareness': 'AI & Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf',
  'bias-fairness-lab': 'AI & Digital Literacy - BIAS & FAIRNESS LAB.pdf',
  'build-ai-helper': 'AI & Digital Literacy - BUILD YOUR OWN AI HELPER.pdf',
  'create-with-ai': 'AI & Digital Literacy - CREATE WITH AI, ETHICALLY.pdf',
  'deepfake-spotter': 'AI & Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf',
  'hallucination-detective': 'AI & Digital Literacy - HALLUCINATION DETECTIVE.pdf',
  'healthy-tech-boundaries': 'AI & Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf',
  'privacy-footprint': 'AI & Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf',
  'prompt-like-a-coach': 'AI & Digital Literacy - PROMPT LIKE A COACH.pdf',
  'media-info-check': 'AI & Digital literacy -  Media & info check.pdf',

  // Communication & Writing
  'adventure-story-map': 'Communication & Writing - Adventure Story Map.pdf',
  'community-tour-guide': 'Communication & Writing - Community Tour Guide.pdf',
  'community-impact': 'Communication & Writing - Community impact project.pdf',
  'directions-challenge': 'Communication & Writing - Directions Challenge.pdf',
  'family-debate-night': 'Communication & Writing - Family Debate Night.pdf',
  'family-recipe-book': 'Communication & Writing - Family Recipe Book.pdf',
  'market-stall-pitch': 'Communication & Writing - Market Stall Pitch.pdf',
  'mini-magazine-creator': 'Communication & Writing - Mini Magazine Creator.pdf',
  'my-review-column': 'Communication & Writing - My Review Column.pdf',
  'neighbourhood-interview': 'Communication & Writing - Neighbourhood Interview Project.pdf',
  'trail-guide-creator': 'Communication & Writing - Trail Guide Creator.pdf',
  'write-like-a-pro': 'Communication & Writing - Write it like a pro.pdf',

  // Creativity Anywhere
  'board-game-studio': 'Creativity Anywhere - Board game studio.pdf',
  'rube-goldberg-machine': 'Creativity Anywhere - Build a Rube Goldberg Machine.pdf',
  'survival-base': 'Creativity Anywhere - Build a Survival Base for an Imaginary Expedition.pdf',
  'build-a-museum': 'Creativity Anywhere - Build a museum or interactive exhibit.pdf',
  'imaginary-world': 'Creativity Anywhere - Build an imaginary world.pdf',
  'creature-habitat': 'Creativity Anywhere - Create a Creature + Build Its Habitat.pdf',
  'theme-park': 'Creativity Anywhere - Create a Theme Park or Adventure Course.pdf',
  'mini-movie': 'Creativity Anywhere - Create a mini movie,  stop-motion or radio drama.pdf',
  'invent-a-sport': 'Creativity Anywhere - Invent a new sport.pdf',
  'kinetic-sculpture': 'Creativity Anywhere - Kinetic Sculpture or Art Installation.pdf',

  // Entrepreneurship
  'brand-builder': 'Entrepreneurship - Brand builder.pdf',
  'business-failure-lab': 'Entrepreneurship - Business Failure Lab.pdf',
  'micro-business': 'Entrepreneurship - Micro-business challenge.pdf',

  // Outdoor Learning
  'fall-outdoor-pack': 'Outdoor Learning - Anywhere Learning Fall.pdf',
  'spring-outdoor-pack': 'Outdoor Learning - Anywhere Learning Spring.pdf',
  'summer-outdoor-pack': 'Outdoor Learning - Anywhere Learning Summer.pdf',
  'winter-outdoor-pack': 'Outdoor Learning - Anywhere Learning Winter.pdf',
  'land-art-challenges': 'Outdoor Learning - Land Art Challenge Cards.pdf',
  'nature-journal-walks': 'Outdoor Learning - My nature journal.pdf',
  'nature-choice-boards': 'Outdoor Learning - Nature Choice Boards.pdf',
  'nature-walk-task-cards': 'Outdoor Learning - Nature Walk Task Cards.pdf',
  'nature-crafts': 'Outdoor Learning - Nature crafts for kids.pdf',
  'outdoor-stem-challenges': 'Outdoor Learning - Outdoor STEM Challenge Cards.pdf',
  'outdoor-learning-missions': 'Outdoor Learning - Outdoor learning missions.pdf',

  // Planning & Problem-Solving
  'problem-solver': 'Planning & Problem-Solving - Problem-solver studio.pdf',
  'time-energy-planner': 'Planning & Problem-solving - Time & energy planner.pdf',
  'travel-day': 'Planning & Problem-solving - Travel Day itinerary challenge.pdf',

  // Real-world Math
  'backyard-campout-planner': 'Real-world math - Backyard Campout Planner.pdf',
  'budget-challenge': 'Real-world math - Budget challenge.pdf',
  'clothing-swap-thrift-math': 'Real-world math - Clothing Swap & Thrift Math.pdf',
  'family-electricity-audit': 'Real-world math - Family Electricity Audit.pdf',
  'farmers-market-challenge': 'Real-world math - Farmers Market Challenge.pdf',
  'garage-sale-math': 'Real-world math - Garage sale math.pdf',
  'garden-plot-planner': 'Real-world math - Garden Plot Planner.pdf',
  'kitchen-math-challenge': 'Real-world math - Kitchen math & meal planning challenge.pdf',
  'party-planner-math': 'Real-world math - Party Planner Math.pdf',
  'road-trip-calculator': 'Real-world math - Road trip calculator.pdf',
  'savings-goal-tracker': 'Real-world math - Savings Goal Tracker.pdf',
  'smart-shopper': 'Real-world math - Smart shopper lab.pdf',
  'sports-stats-lab': 'Real-world math - Sports Stats Lab.pdf',

  // Start Here
  'future-ready-skills-map': 'The future-ready skills map.pdf',
};

const dryRun = !process.argv.includes('--run');

async function main() {
  console.log(`\n=== Upload Compressed PDFs to Vercel Blob ===`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (use --run to upload)' : 'UPLOADING'}\n`);

  // Get all products with existing blob URLs
  const allProducts = await db.select({
    slug: products.slug,
    blobUrl: products.blobUrl,
    name: products.name,
  }).from(products);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;
  let totalBytes = 0;

  for (const product of allProducts) {
    const filename = SLUG_TO_FILE[product.slug];
    if (!filename) {
      // Bundle or product without a direct PDF file - skip silently
      continue;
    }

    const filepath = `${ACTIVITIES_DIR}/${filename}`;
    if (!existsSync(filepath)) {
      console.log(`MISS  ${product.slug} - file not found: ${filename}`);
      errors++;
      continue;
    }

    const stat = statSync(filepath);
    const sizeMB = (stat.size / 1048576).toFixed(1);

    if (dryRun) {
      console.log(`WOULD ${product.slug} (${sizeMB}MB) - ${filename}`);
      totalBytes += stat.size;
      uploaded++;
      continue;
    }

    try {
      process.stdout.write(`UP    ${product.slug} (${sizeMB}MB)... `);

      const fileBuffer = readFileSync(filepath);
      const blobName = basename(filename);

      // Upload to Vercel Blob
      const blob = await put(blobName, fileBuffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      // Update database with new blob URL
      await db.update(products)
        .set({ blobUrl: blob.url })
        .where(eq(products.slug, product.slug));

      // Delete old blob if URL changed
      if (product.blobUrl && product.blobUrl.startsWith('https://') && product.blobUrl !== blob.url) {
        try {
          await del(product.blobUrl);
        } catch {
          // Old blob may already be gone - non-critical
        }
      }

      console.log(`✓ ${blob.url.substring(0, 60)}...`);
      totalBytes += stat.size;
      uploaded++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  const totalMB = (totalBytes / 1048576).toFixed(1);
  console.log(`\n=== Summary ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  console.log(`Total:    ${totalMB}MB`);

  if (dryRun) {
    console.log(`\nRun with --run to upload for real.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
