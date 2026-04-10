/**
 * Sync local PDFs (activities + previews) to Vercel Blob and Neon.
 *
 * Smart: only uploads files that are missing or have changed size compared to
 * what's already on Blob. Updates products.blobUrl and products.previewBlobUrl
 * to match.
 *
 * Usage:
 *   npx tsx scripts/sync-blob-pdfs.ts            # dry run (default)
 *   npx tsx scripts/sync-blob-pdfs.ts --run      # perform uploads + DB writes
 *   npx tsx scripts/sync-blob-pdfs.ts --run --only=activities
 *   npx tsx scripts/sync-blob-pdfs.ts --run --only=previews
 *   npx tsx scripts/sync-blob-pdfs.ts --prune    # also report orphan PDFs
 *   npx tsx scripts/sync-blob-pdfs.ts --run --prune  # and delete them
 *
 * Requires BLOB_READ_WRITE_TOKEN and DATABASE_URL in .env.local
 */

import { put, list, del } from '@vercel/blob';
import { db } from '../lib/db/index.js';
import { products } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync, statSync, existsSync } from 'fs';
import { basename } from 'path';
import { fallbackProducts } from '../lib/fallback-products.js';

const ACTIVITIES_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities';
const PREVIEWS_DIR   = '/Users/ameliedrouin/Desktop/Anywhere Learning/Previews';

// ─────────────────────────────────────────────────────────────
// Activity slug → filename mapping.
// Kept in this script (not loaded from DB) so it's git-reviewable.
// ─────────────────────────────────────────────────────────────
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
  'community-service-business': 'Entrepreneurship - Community Service Business.pdf',
  'customer-discovery': 'Entrepreneurship - Customer Discovery Challenge.pdf',
  'investor-pitch': 'Entrepreneurship - Investor Pitch Portfolio.pdf',
  'marketing-campaign': 'Entrepreneurship - Marketing Campaign Creator.pdf',
  'micro-business': 'Entrepreneurship - Micro-business challenge.pdf',
  'pricing-experiment': 'Entrepreneurship - Pricing Experiment.pdf',
  'product-design-lab': 'Entrepreneurship - Product Design Lab.pdf',
  'supply-chain-detective': 'Entrepreneurship - Supply Chain Detective.pdf',
  'shark-tank-pitch': 'Entrepreneurship - The Shark Tank Pitch.pdf',

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
  'emergency-ready': 'Planning & Problem-Solving Emergency Ready Challenge.pdf',
  'everyday-redesign': 'Planning & Problem-Solving Everyday Redesign Challenge.pdf',
  'fix-it-detective': 'Planning & Problem-Solving Fix-it detective.pdf',
  'neighbourhood-problem-spotter': 'Planning & Problem-Solving Neighbourhood Problem Spotter.pdf',
  'outdoor-survival-planner': 'Planning & Problem-Solving Outdoor survival planner.pdf',
  'pack-like-a-pro': 'Planning & Problem-Solving Pack Like a Pro.pdf',
  'scavenger-hunt-designer': 'Planning & Problem-Solving Scavenger Hunt Designer.pdf',
  'swap-day-challenge': 'Planning & Problem-Solving The Swap Day Challenge.pdf',
  'what-if-scenario-lab': 'Planning & Problem-Solving The What If Scenario Lab.pdf',
  'decision-lab': 'Planning & Problem-Solving What Would You Do Decision Lab.pdf',

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

// ─────────────────────────────────────────────────────────────
// Preview slug → filename map comes from fallbackProducts.previewFile.
// Bundles and products with previewFile=null are excluded.
// ─────────────────────────────────────────────────────────────
const SLUG_TO_PREVIEW: Record<string, string> = {};
for (const p of fallbackProducts) {
  if (p.previewFile) {
    SLUG_TO_PREVIEW[p.slug] = p.previewFile;
  }
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────
const args = new Set(process.argv.slice(2));
const dryRun = !args.has('--run');
const doPrune = args.has('--prune');
const only = Array.from(args).find((a) => a.startsWith('--only='))?.split('=')[1] ?? 'all';
const doActivities = only === 'all' || only === 'activities';
const doPreviews   = only === 'all' || only === 'previews';

type Plan = 'UPLOAD' | 'SKIP' | 'MISS' | 'DB-UPDATE-ONLY';
type Row  = {
  kind: 'activity' | 'preview';
  slug: string;
  filename: string;
  localSize: number;
  plan: Plan;
  reason: string;
};

function fmtMB(bytes: number) {
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

async function listAllBlobs() {
  const index = new Map<string, { url: string; size: number }>();
  let cursor: string | undefined;
  do {
    const result = await list({ cursor, limit: 1000 });
    for (const b of result.blobs) {
      // Use the decoded pathname as key — pathname is the "filename" we put()
      index.set(b.pathname, { url: b.url, size: b.size });
    }
    cursor = result.cursor;
  } while (cursor);
  return index;
}

async function main() {
  console.log(`\n=== Sync Blob PDFs ===`);
  console.log(`Mode:  ${dryRun ? 'DRY RUN (pass --run to apply)' : '🔴 APPLYING CHANGES'}`);
  console.log(`Scope: ${only}\n`);

  // 1. Index what's on Blob today
  console.log('Listing current Blob inventory...');
  const blobIndex = await listAllBlobs();
  console.log(`  → ${blobIndex.size} blobs currently on store\n`);

  // 2. Load DB state
  const dbRows = await db.select({
    id: products.id,
    slug: products.slug,
    blobUrl: products.blobUrl,
    previewBlobUrl: products.previewBlobUrl,
  }).from(products);
  const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]));

  // 3. Build the plan
  const plan: Row[] = [];

  function planOne(
    kind: 'activity' | 'preview',
    slug: string,
    filename: string,
    dir: string,
    currentBlobUrl: string | null,
  ) {
    const filepath = `${dir}/${filename}`;
    if (!existsSync(filepath)) {
      plan.push({
        kind, slug, filename, localSize: 0, plan: 'MISS',
        reason: 'local file not found',
      });
      return;
    }
    const localSize = statSync(filepath).size;

    // Blob pathname is the basename passed to put()
    const pathname = basename(filename);
    const existing = blobIndex.get(pathname);

    if (!existing) {
      plan.push({
        kind, slug, filename, localSize, plan: 'UPLOAD',
        reason: 'not on Blob',
      });
      return;
    }

    if (existing.size !== localSize) {
      plan.push({
        kind, slug, filename, localSize, plan: 'UPLOAD',
        reason: `size mismatch (blob=${fmtMB(existing.size)}, local=${fmtMB(localSize)})`,
      });
      return;
    }

    // Sizes match — Blob copy is current. Just make sure DB points at it.
    if (!currentBlobUrl || currentBlobUrl !== existing.url) {
      plan.push({
        kind, slug, filename, localSize, plan: 'DB-UPDATE-ONLY',
        reason: 'Blob is current, DB URL needs refresh',
      });
    } else {
      plan.push({
        kind, slug, filename, localSize, plan: 'SKIP',
        reason: 'up to date',
      });
    }
  }

  if (doActivities) {
    for (const [slug, filename] of Object.entries(SLUG_TO_FILE)) {
      const row = dbBySlug.get(slug);
      if (!row) {
        plan.push({
          kind: 'activity', slug, filename, localSize: 0, plan: 'MISS',
          reason: 'no DB row',
        });
        continue;
      }
      planOne('activity', slug, filename, ACTIVITIES_DIR, row.blobUrl || null);
    }
  }

  if (doPreviews) {
    for (const [slug, filename] of Object.entries(SLUG_TO_PREVIEW)) {
      const row = dbBySlug.get(slug);
      if (!row) {
        plan.push({
          kind: 'preview', slug, filename, localSize: 0, plan: 'MISS',
          reason: 'no DB row',
        });
        continue;
      }
      planOne('preview', slug, filename, PREVIEWS_DIR, row.previewBlobUrl || null);
    }
  }

  // 4. Report
  const counts = { UPLOAD: 0, SKIP: 0, MISS: 0, 'DB-UPDATE-ONLY': 0 };
  let totalUploadBytes = 0;
  for (const row of plan) {
    counts[row.plan]++;
    if (row.plan === 'UPLOAD') totalUploadBytes += row.localSize;
  }

  const print = (row: Row) => {
    const tag = row.plan.padEnd(15);
    const size = row.localSize ? fmtMB(row.localSize).padStart(8) : '       ─';
    console.log(`  ${tag} ${row.kind.padEnd(9)} ${size}  ${row.slug.padEnd(32)} ${row.reason}`);
  };

  for (const kind of ['activity', 'preview'] as const) {
    const rows = plan.filter((r) => r.kind === kind);
    if (rows.length === 0) continue;
    console.log(`\n── ${kind.toUpperCase()} FILES (${rows.length}) ──`);
    for (const p of ['UPLOAD', 'DB-UPDATE-ONLY', 'MISS', 'SKIP'] as const) {
      const sub = rows.filter((r) => r.plan === p);
      if (sub.length === 0) continue;
      console.log(`\n  [${p}] ${sub.length}`);
      for (const r of sub) print(r);
    }
  }

  console.log(`\n=== Plan summary ===`);
  console.log(`  UPLOAD:         ${counts.UPLOAD}  (${fmtMB(totalUploadBytes)})`);
  console.log(`  DB-UPDATE-ONLY: ${counts['DB-UPDATE-ONLY']}`);
  console.log(`  SKIP:           ${counts.SKIP}`);
  console.log(`  MISS:           ${counts.MISS}`);

  // 5. Orphan detection (if --prune was passed)
  // An orphan is any PDF on Blob that no product row references. Non-PDF files
  // (images, lead magnet, etc) are not considered by this pass — it only
  // targets PDFs produced by this sync pipeline.
  const orphans: Array<{ pathname: string; url: string; size: number }> = [];
  if (doPrune) {
    const referenced = new Set<string>();
    for (const r of dbRows) {
      if (r.blobUrl?.startsWith('https://')) referenced.add(r.blobUrl);
      if (r.previewBlobUrl?.startsWith('https://')) referenced.add(r.previewBlobUrl);
    }
    for (const [pathname, info] of blobIndex.entries()) {
      if (!pathname.toLowerCase().endsWith('.pdf')) continue;
      if (!referenced.has(info.url)) {
        orphans.push({ pathname, url: info.url, size: info.size });
      }
    }
    orphans.sort((a, b) => b.size - a.size);

    const orphanBytes = orphans.reduce((s, o) => s + o.size, 0);
    console.log(`\n── ORPHANS (PDFs on Blob not referenced by any product) ──`);
    console.log(`  count: ${orphans.length}   size: ${fmtMB(orphanBytes)}`);
    for (const o of orphans) {
      console.log(`  ${fmtMB(o.size).padStart(8)}  ${o.pathname}`);
    }
  }

  if (dryRun) {
    console.log(`\nDry run — nothing changed. Re-run with --run to apply.`);
    process.exit(0);
  }

  // 5. Execute
  console.log(`\n=== Executing ===`);
  let done = 0;
  let failed = 0;
  for (const row of plan) {
    if (row.plan === 'SKIP' || row.plan === 'MISS') continue;
    try {
      let finalUrl: string;

      if (row.plan === 'UPLOAD') {
        const dir = row.kind === 'activity' ? ACTIVITIES_DIR : PREVIEWS_DIR;
        const filepath = `${dir}/${row.filename}`;
        const fileBuffer = readFileSync(filepath);
        const pathname = basename(row.filename);
        process.stdout.write(`  UP   ${row.kind} ${row.slug} (${fmtMB(row.localSize)})... `);
        const blob = await put(pathname, fileBuffer, {
          access: 'public',
          contentType: 'application/pdf',
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        finalUrl = blob.url;
      } else {
        // DB-UPDATE-ONLY: Blob already has the right bytes, just repoint DB
        const pathname = basename(row.filename);
        const existing = blobIndex.get(pathname)!;
        finalUrl = existing.url;
        process.stdout.write(`  DB   ${row.kind} ${row.slug}... `);
      }

      const column = row.kind === 'activity'
        ? { blobUrl: finalUrl }
        : { previewBlobUrl: finalUrl };
      await db.update(products).set(column).where(eq(products.slug, row.slug));

      console.log(`✓`);
      done++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  // 6. Prune orphans (if --prune was passed)
  let pruned = 0;
  let pruneFailed = 0;
  if (doPrune && orphans.length > 0) {
    console.log(`\n=== Pruning ${orphans.length} orphan PDFs ===`);
    for (const o of orphans) {
      try {
        process.stdout.write(`  DEL  ${fmtMB(o.size).padStart(8)}  ${o.pathname}... `);
        await del(o.url);
        console.log(`✓`);
        pruned++;
      } catch (err) {
        console.log(`✗ ${err instanceof Error ? err.message : err}`);
        pruneFailed++;
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Applied: ${done}`);
  console.log(`  Failed:  ${failed}`);
  if (doPrune) {
    console.log(`  Pruned:  ${pruned}`);
    console.log(`  Prune failed: ${pruneFailed}`);
  }
  process.exit(failed + pruneFailed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
