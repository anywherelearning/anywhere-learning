import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Maps product slugs to their Vercel Blob file names.
 * Bundles are excluded - they don't have their own PDFs.
 * The lead magnet PDF is also excluded (not a product).
 *
 * Five "Real-world math" blob files (backyard-campout-planner,
 * farmers-market-challenge, garage-sale-math, party-planner-math,
 * road-trip-calculator) exist in Blob storage but don't have
 * corresponding product slugs in the database - they are skipped.
 */

const BLOB_BASE_URL = process.env.BLOB_BASE_URL;
if (!BLOB_BASE_URL) {
  console.error('BLOB_BASE_URL is required. Set it in .env.local (e.g. https://xxx.public.blob.vercel-storage.com/)');
  process.exit(1);
}

// slug → blob file name (URL-encoded where necessary)
const blobMap: Record<string, string> = {
  // ── Seasonal Packs ──
  'spring-outdoor-pack': 'Anywhere Learning Spring.pdf',
  'summer-outdoor-pack': 'Anywhere Learning Summer.pdf',
  'fall-outdoor-pack': 'Anywhere Learning Fall.pdf',
  'winter-outdoor-pack': '_Anywhere Learning Winter.pdf',

  // ── Nature & Outdoor ──
  'nature-journal-walks': 'My nature journal.pdf',
  'nature-walk-task-cards': 'Nature Walk Task Cards.pdf',
  'nature-choice-boards': 'Nature Choice Boards.pdf',
  'outdoor-learning-missions': 'Outdoor learning missions.pdf',
  'outdoor-stem-challenges': 'Outdoor STEM Challenge Cards.pdf',
  'land-art-challenges': 'Land Art Challenge Cards.pdf',
  'nature-crafts': 'Nature crafts for kids.pdf',

  // ── Creativity ──
  'board-game-studio': 'Creativity anywhere Board game studio.pdf',
  'rube-goldberg-machine': 'Creativity anywhere Build a Rube Goldberg Machine.pdf',
  'survival-base': 'Creativity anywhere Build a Survival Base for an Imaginary Expedition.pdf',
  'imaginary-world': 'Creativity anywhere Build an imaginary world.pdf',
  // 'creature-habitat' - PDF not yet uploaded to Blob storage
  'theme-park': 'Creativity anywhere Create a Theme Park or Adventure Course.pdf',
  'mini-movie': 'Creativity anywhere Create a mini movie,  stop-motion or radio drama.pdf',
  'invent-a-sport': 'Creativity anywhere Invent a new sport.pdf',
  'kinetic-sculpture': 'Creativity anywhere Kinetic Sculpture or Art Installation.pdf',
  'build-a-museum': 'Creativity anywhere build a museum or interactive exhibit.pdf',

  // ── Real-World Relevance ──
  'budget-challenge': 'Real-world relevance Budget challenge.pdf',
  'community-impact': 'Real-world relevance Community impact project.pdf',
  'kitchen-math-challenge': 'Real-world relevance Kitchen math & meal planning challenge.pdf',
  'media-info-check': 'Real-world relevance Media & info check.pdf',
  'micro-business': 'Real-world relevance Micro-business challenge.pdf',
  'problem-solver': 'Real-world relevance Problem-solver studio.pdf',
  'smart-shopper': 'Real-world relevance Smart shopper lab.pdf',
  'time-energy-planner': 'Real-world relevance Time & energy planner.pdf',
  'travel-day': 'Real-world relevance Travel Day itinerary challenge.pdf',
  'write-like-a-pro': 'Real-world relevance Write it like a pro.pdf',

  // ── AI + Digital Literacy ──
  'ai-basics': 'AI + Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf',
  'algorithm-awareness': 'AI + Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf',
  'bias-fairness-lab': 'AI + Digital Literacy - BIAS & FAIRNESS LAB.pdf',
  'build-ai-helper': 'AI + Digital Literacy - BUILD YOUR OWN AI HELPER.pdf',
  'create-with-ai': 'AI + Digital Literacy - CREATE WITH AI, ETHICALLY.pdf',
  'deepfake-spotter': 'AI + Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf',
  'hallucination-detective': 'AI + Digital Literacy - HALLUCINATION DETECTIVE.pdf',
  'healthy-tech-boundaries': 'AI + Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf',
  'privacy-footprint': 'AI + Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf',
  'prompt-like-a-coach': 'AI + Digital Literacy - PROMPT LIKE A COACH.pdf',

  // ── Real-World Math (dedicated category) ──
  'backyard-campout-planner': 'Real-world math - Backyard Campout Planner.pdf',
  'clothing-swap-thrift-math': 'Real-world math - Clothing Swap & Thrift Math.pdf',
  'family-electricity-audit': 'Real-world math - Family Electricity Audit.pdf',
  'farmers-market-challenge': 'Real-world math - Farmers Market Challenge.pdf',
  'garage-sale-math': 'Real-world math - Garage sale math.pdf',
  'garden-plot-planner': 'Real-world math - Garden Plot Planner.pdf',
  'party-planner-math': 'Real-world math - Party Planner Math.pdf',
  'road-trip-calculator': 'Real-world math - Road trip calculator.pdf',
  'savings-goal-tracker': 'Real-world math - Savings Goal Tracker.pdf',
  'sports-stats-lab': 'Real-world math - Sports Stats Lab.pdf',

  // ── Communication & Writing (dedicated category) ──
  'adventure-story-map': 'Communication & Writing - Adventure Story Map.pdf',
  'community-tour-guide': 'Communication & Writing - Community Tour Guide.pdf',
  'directions-challenge': 'Communication & Writing - Directions Challenge.pdf',
  'family-debate-night': 'Communication & Writing - Family Debate Night.pdf',
  'family-recipe-book': 'Communication & Writing - Family Recipe Book.pdf',
  'market-stall-pitch': 'Communication & Writing - Market Stall Pitch.pdf',
  'mini-magazine-creator': 'Communication & Writing - Mini Magazine Creator.pdf',
  'my-review-column': 'Communication & Writing - My Review Column.pdf',
  'neighbourhood-interview': 'Communication & Writing - Neighbourhood Interview Project.pdf',
  'trail-guide-creator': 'Communication & Writing - Trail Guide Creator.pdf',

  // ── Entrepreneurship (dedicated category) ──
  'brand-builder': 'Entrepreneurship - Brand builder.pdf',
  'business-failure-lab': 'Entrepreneurship - Business Failure Lab.pdf',

  // ── Standalone Guides ──
  'future-ready-skills-map': 'The future-ready skills map.pdf',
};

async function updateBlobUrls() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Set it in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Updating blob URLs in database...\n');

  let updated = 0;
  let errors = 0;

  for (const [slug, fileName] of Object.entries(blobMap)) {
    const blobUrl = BLOB_BASE_URL + encodeURIComponent(fileName);

    try {
      await db
        .update(products)
        .set({ blobUrl })
        .where(eq(products.slug, slug));

      console.log(`  ✓ ${slug}`);
      console.log(`    → ${blobUrl}`);
      updated++;
    } catch (err) {
      console.error(`  ✗ ${slug}: ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\nDone! Updated ${updated} products.`);
  if (errors > 0) {
    console.log(`⚠ ${errors} errors occurred.`);
  }
}

updateBlobUrls().catch(console.error);
