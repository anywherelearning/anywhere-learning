import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { list, put } from '@vercel/blob';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Upload only MISSING PDFs to Vercel Blob.
 *
 * Usage:
 *   npx tsx scripts/upload-missing-blobs.ts          # dry-run (list only)
 *   npx tsx scripts/upload-missing-blobs.ts --upload  # actually upload
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local
 */

const ACTIVITIES_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Activities';
const PREVIEWS_DIR = '/Users/ameliedrouin/Desktop/Anywhere Learning/Previews';

// Map: local file path → desired blob name
// The blob name is what shows up in Vercel Blob storage.
// For already-uploaded files, the blob name must match exactly.

interface FileMapping {
  localPath: string;
  blobName: string;
}

function getFileMappings(): FileMapping[] {
  const mappings: FileMapping[] = [];

  // ── Activity PDFs ──

  // Seasonal
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Anywhere Learning Spring.pdf`, blobName: 'Anywhere Learning Spring.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Anywhere Learning Summer.pdf`, blobName: 'Anywhere Learning Summer.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Anywhere Learning Fall.pdf`, blobName: 'Anywhere Learning Fall.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Anywhere Learning Winter.pdf`, blobName: '_Anywhere Learning Winter.pdf' });

  // Nature & Outdoor
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - My nature journal.pdf`, blobName: 'My nature journal.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Nature Walk Task Cards.pdf`, blobName: 'Nature Walk Task Cards.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Nature Choice Boards.pdf`, blobName: 'Nature Choice Boards.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Outdoor learning missions.pdf`, blobName: 'Outdoor learning missions.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Outdoor STEM Challenge Cards.pdf`, blobName: 'Outdoor STEM Challenge Cards.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Land Art Challenge Cards.pdf`, blobName: 'Land Art Challenge Cards.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Outdoor Learning - Nature crafts for kids.pdf`, blobName: 'Nature crafts for kids.pdf' });

  // Creativity & Maker
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Board Game Studio.pdf`, blobName: 'Creativity & Maker Board Game Studio.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Build a Rube Goldberg Machine.pdf`, blobName: 'Creativity & Maker Build a Rube Goldberg Machine.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Build a Survival Base for an Imaginary Expedition.pdf`, blobName: 'Creativity & Maker Build a Survival Base for an Imaginary Expedition.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Build an Imaginary World.pdf`, blobName: 'Creativity & Maker Build an Imaginary World.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Create a Creature and Build Its Habitat.pdf`, blobName: 'Creativity & Maker Create a Creature and Build Its Habitat.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Create a Theme Park or Adventure Course.pdf`, blobName: 'Creativity & Maker Create a Theme Park or Adventure Course.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Create a Mini Movie, Stop-Motion or Radio Drama.pdf`, blobName: 'Creativity & Maker Create a Mini Movie, Stop-Motion or Radio Drama.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Invent a New Sport.pdf`, blobName: 'Creativity & Maker Invent a New Sport.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker Kinetic Sculpture or Art Installation.pdf`, blobName: 'Creativity & Maker Kinetic Sculpture or Art Installation.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Creativity & Maker build a museum or interactive exhibit.pdf`, blobName: 'Creativity & Maker build a museum or interactive exhibit.pdf' });

  // Real-World Relevance (original 10 — already uploaded with "Real-world relevance" prefix)
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Budget challenge.pdf`, blobName: 'Real-world relevance Budget challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Community impact project.pdf`, blobName: 'Real-world relevance Community impact project.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Kitchen math & meal planning challenge.pdf`, blobName: 'Real-world relevance Kitchen math & meal planning challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital literacy -  Media & info check.pdf`, blobName: 'Real-world relevance Media & info check.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Entrepreneurship - Micro-business challenge.pdf`, blobName: 'Real-world relevance Micro-business challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Planning & Problem-Solving - Problem-solver studio.pdf`, blobName: 'Real-world relevance Problem-solver studio.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Smart shopper lab.pdf`, blobName: 'Real-world relevance Smart shopper lab.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Planning & Problem-solving - Time & energy planner.pdf`, blobName: 'Real-world relevance Time & energy planner.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Planning & Problem-solving - Travel Day itinerary challenge.pdf`, blobName: 'Real-world relevance Travel Day itinerary challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Write it like a pro.pdf`, blobName: 'Real-world relevance Write it like a pro.pdf' });

  // AI + Digital Literacy
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf`, blobName: 'AI + Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf`, blobName: 'AI + Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - BIAS & FAIRNESS LAB.pdf`, blobName: 'AI + Digital Literacy - BIAS & FAIRNESS LAB.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - BUILD YOUR OWN AI HELPER.pdf`, blobName: 'AI + Digital Literacy - BUILD YOUR OWN AI HELPER.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - CREATE WITH AI, ETHICALLY.pdf`, blobName: 'AI + Digital Literacy - CREATE WITH AI, ETHICALLY.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf`, blobName: 'AI + Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - HALLUCINATION DETECTIVE.pdf`, blobName: 'AI + Digital Literacy - HALLUCINATION DETECTIVE.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf`, blobName: 'AI + Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf`, blobName: 'AI + Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/AI & Digital Literacy - PROMPT LIKE A COACH.pdf`, blobName: 'AI + Digital Literacy - PROMPT LIKE A COACH.pdf' });

  // Standalone
  mappings.push({ localPath: `${ACTIVITIES_DIR}/The future-ready skills map.pdf`, blobName: 'The future-ready skills map.pdf' });

  // ── NEW: Real-World Math (10 packs) ──
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Backyard Campout Planner.pdf`, blobName: 'Real-world math - Backyard Campout Planner.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Clothing Swap & Thrift Math.pdf`, blobName: 'Real-world math - Clothing Swap & Thrift Math.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Family Electricity Audit.pdf`, blobName: 'Real-world math - Family Electricity Audit.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Farmers Market Challenge.pdf`, blobName: 'Real-world math - Farmers Market Challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Garage sale math.pdf`, blobName: 'Real-world math - Garage sale math.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Garden Plot Planner.pdf`, blobName: 'Real-world math - Garden Plot Planner.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Party Planner Math.pdf`, blobName: 'Real-world math - Party Planner Math.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Road trip calculator.pdf`, blobName: 'Real-world math - Road trip calculator.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Savings Goal Tracker.pdf`, blobName: 'Real-world math - Savings Goal Tracker.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Real-world math - Sports Stats Lab.pdf`, blobName: 'Real-world math - Sports Stats Lab.pdf' });

  // ── NEW: Communication & Writing (10 packs) ──
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Adventure Story Map.pdf`, blobName: 'Communication & Writing - Adventure Story Map.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Community Tour Guide.pdf`, blobName: 'Communication & Writing - Community Tour Guide.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Directions Challenge.pdf`, blobName: 'Communication & Writing - Directions Challenge.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Family Debate Night.pdf`, blobName: 'Communication & Writing - Family Debate Night.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Family Recipe Book.pdf`, blobName: 'Communication & Writing - Family Recipe Book.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Market Stall Pitch.pdf`, blobName: 'Communication & Writing - Market Stall Pitch.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Mini Magazine Creator.pdf`, blobName: 'Communication & Writing - Mini Magazine Creator.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - My Review Column.pdf`, blobName: 'Communication & Writing - My Review Column.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Neighbourhood Interview Project.pdf`, blobName: 'Communication & Writing - Neighbourhood Interview Project.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Communication & Writing - Trail Guide Creator.pdf`, blobName: 'Communication & Writing - Trail Guide Creator.pdf' });

  // ── NEW: Entrepreneurship (2 new packs — micro-business already uploaded as Real-world relevance) ──
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Entrepreneurship - Brand builder.pdf`, blobName: 'Entrepreneurship - Brand builder.pdf' });
  mappings.push({ localPath: `${ACTIVITIES_DIR}/Entrepreneurship - Business Failure Lab.pdf`, blobName: 'Entrepreneurship - Business Failure Lab.pdf' });

  // ── Preview PDFs ──

  // Seasonal previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Anywhere Learning Spring.pdf`, blobName: 'Preview Anywhere Learning Spring.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Anywhere Learning Summer.pdf`, blobName: 'Preview Anywhere Learning Summer.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Anywhere Learning Fall.pdf`, blobName: 'Preview Anywhere Learning Fall.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Anywhere Learning Winter.pdf`, blobName: 'Preview Anywhere Learning Winter.pdf' });

  // Outdoor previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview My nature journal.pdf`, blobName: 'Preview My nature journal.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Nature Walk Task Cards.pdf`, blobName: 'Preview Nature Walk Task Cards.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Nature Choice Boards.pdf`, blobName: 'Preview Nature Choice Boards.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Outdoor learning missions.pdf`, blobName: 'Preview Outdoor learning missions.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Outdoor STEM Challenge Cards.pdf`, blobName: 'Preview Outdoor STEM Challenge Cards.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Land Art Challenge Cards.pdf`, blobName: 'Preview Land Art Challenge Cards.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Nature crafts for kids.pdf`, blobName: 'Preview Nature crafts for kids.pdf' });

  // Creativity previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Board game studio.pdf`, blobName: 'Preview Creativity anywhere Board game studio.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Build a Rube Goldberg Machine.pdf`, blobName: 'Preview Creativity anywhere Build a Rube Goldberg Machine.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Build a Survival Base for an Imaginary Expedition.pdf`, blobName: 'Preview Creativity anywhere Build a Survival Base for an Imaginary Expedition.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Build an imaginary world.pdf`, blobName: 'Preview Creativity anywhere Build an imaginary world.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Create a Creature + Build Its Habitat.pdf`, blobName: 'Preview Creativity anywhere Create a Creature + Build Its Habitat.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Create a Theme Park or Adventure Course.pdf`, blobName: 'Preview Creativity anywhere Create a Theme Park or Adventure Course.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Create a mini movie,  stop-motion or radio drama.pdf`, blobName: 'Preview Creativity anywhere Create a mini movie,  stop-motion or radio drama.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Invent a new sport.pdf`, blobName: 'Preview Creativity anywhere Invent a new sport.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere Kinetic Sculpture or Art Installation.pdf`, blobName: 'Preview Creativity anywhere Kinetic Sculpture or Art Installation.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Creativity anywhere build a museum or interactive exhibit.pdf`, blobName: 'Preview Creativity anywhere build a museum or interactive exhibit.pdf' });

  // Real-world relevance previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Budget challenge.pdf`, blobName: 'Preview Real-world relevance Budget challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Community impact project.pdf`, blobName: 'Preview Real-world relevance Community impact project.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Kitchen math & meal planning challenge.pdf`, blobName: 'Preview Real-world relevance Kitchen math & meal planning challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Media & info check.pdf`, blobName: 'Preview Real-world relevance Media & info check.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Micro-business challenge.pdf`, blobName: 'Preview Real-world relevance Micro-business challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Problem-solver studio.pdf`, blobName: 'Preview Real-world relevance Problem-solver studio.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Smart shopper lab.pdf`, blobName: 'Preview Real-world relevance Smart shopper lab.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Time & energy planner.pdf`, blobName: 'Preview Real-world relevance Time & energy planner.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Travel Day itinerary challenge.pdf`, blobName: 'Preview Real-world relevance Travel Day itinerary challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world relevance Write it like a pro.pdf`, blobName: 'Preview Real-world relevance Write it like a pro.pdf' });

  // AI previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf`, blobName: 'Preview AI + Digital Literacy - AI BASICS MYTHS, FACTS & SMART RULES.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf`, blobName: 'Preview AI + Digital Literacy - ALGORITHM AWARENESS WHY AM I SEEING THIS.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - BIAS & FAIRNESS LAB.pdf`, blobName: 'Preview AI + Digital Literacy - BIAS & FAIRNESS LAB.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - BUILD YOUR OWN AI HELPER.pdf`, blobName: 'Preview AI + Digital Literacy - BUILD YOUR OWN AI HELPER.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - CREATE WITH AI, ETHICALLY.pdf`, blobName: 'Preview AI + Digital Literacy - CREATE WITH AI, ETHICALLY.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf`, blobName: 'Preview AI + Digital Literacy - DEEPFAKE & MANIPULATION SPOTTER.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - HALLUCINATION DETECTIVE.pdf`, blobName: 'Preview AI + Digital Literacy - HALLUCINATION DETECTIVE.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf`, blobName: 'Preview AI + Digital Literacy - HEALTHY TECH & AI BOUNDARIES PLAN.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf`, blobName: 'Preview AI + Digital Literacy - PRIVACY & DIGITAL FOOTPRINT MAP.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview AI + Digital Literacy - PROMPT LIKE A COACH.pdf`, blobName: 'Preview AI + Digital Literacy - PROMPT LIKE A COACH.pdf' });

  // Standalone previews
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview The future-ready skills map.pdf`, blobName: 'Preview The future-ready skills map.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview My small business project.pdf`, blobName: 'Preview My small business project.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Time Capsule.pdf`, blobName: 'Preview Time Capsule.pdf' });

  // ── NEW: Real-World Math previews ──
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Backyard Campout Planner.pdf`, blobName: 'Preview Real-world math - Backyard Campout Planner.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Clothing Swap & Thrift Math.pdf`, blobName: 'Preview Real-world math - Clothing Swap & Thrift Math.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Family Electricity Audit.pdf`, blobName: 'Preview Real-world math - Family Electricity Audit.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Farmers Market Challenge.pdf`, blobName: 'Preview Real-world math - Farmers Market Challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Garage sale math.pdf`, blobName: 'Preview Real-world math - Garage sale math.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Garden Plot Planner.pdf`, blobName: 'Preview Real-world math - Garden Plot Planner.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Party Planner Math.pdf`, blobName: 'Preview Real-world math - Party Planner Math.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Road trip calculator.pdf`, blobName: 'Preview Real-world math - Road trip calculator.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Savings Goal Tracker.pdf`, blobName: 'Preview Real-world math - Savings Goal Tracker.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Real-world math - Sports Stats Lab.pdf`, blobName: 'Preview Real-world math - Sports Stats Lab.pdf' });

  // ── NEW: Communication & Writing previews ──
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Adventure Story Map.pdf`, blobName: 'Preview Communication & Writing - Adventure Story Map.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Community Tour Guide.pdf`, blobName: 'Preview Communication & Writing - Community Tour Guide.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Directions Challenge.pdf`, blobName: 'Preview Communication & Writing - Directions Challenge.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Family Debate Night.pdf`, blobName: 'Preview Communication & Writing - Family Debate Night.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Family Recipe Book.pdf`, blobName: 'Preview Communication & Writing - Family Recipe Book.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Market Stall Pitch.pdf`, blobName: 'Preview Communication & Writing - Market Stall Pitch.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Mini Magazine Creator.pdf`, blobName: 'Preview Communication & Writing - Mini Magazine Creator.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - My Review Column.pdf`, blobName: 'Preview Communication & Writing - My Review Column.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Neighbourhood Interview Project.pdf`, blobName: 'Preview Communication & Writing - Neighbourhood Interview Project.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Communication & Writing - Trail Guide Creator.pdf`, blobName: 'Preview Communication & Writing - Trail Guide Creator.pdf' });

  // ── NEW: Entrepreneurship previews ──
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Entrepreneurship - Brand builder.pdf`, blobName: 'Preview Entrepreneurship - Brand builder.pdf' });
  mappings.push({ localPath: `${PREVIEWS_DIR}/Preview Entrepreneurship - Business Failure Lab.pdf`, blobName: 'Preview Entrepreneurship - Business Failure Lab.pdf' });

  return mappings;
}

async function getAllBlobNames(): Promise<Set<string>> {
  const names = new Set<string>();
  let cursor: string | undefined;

  console.log('Fetching existing blobs from Vercel...');

  do {
    const result = await list({ cursor, limit: 1000 });
    for (const blob of result.blobs) {
      // blob.pathname is the name we uploaded with
      names.add(blob.pathname);
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  console.log(`Found ${names.size} existing blobs.\n`);
  return names;
}

async function main() {
  const dryRun = !process.argv.includes('--upload');

  if (dryRun) {
    console.log('🔍 DRY RUN — showing what would be uploaded. Add --upload to actually upload.\n');
  } else {
    console.log('📤 UPLOAD MODE — uploading missing files to Vercel Blob.\n');
  }

  const existingBlobs = await getAllBlobNames();
  const mappings = getFileMappings();

  const missing: FileMapping[] = [];
  const alreadyUploaded: string[] = [];
  const localMissing: string[] = [];

  for (const m of mappings) {
    if (existingBlobs.has(m.blobName)) {
      alreadyUploaded.push(m.blobName);
    } else if (!existsSync(m.localPath)) {
      localMissing.push(m.localPath);
    } else {
      missing.push(m);
    }
  }

  console.log(`✅ Already in Blob: ${alreadyUploaded.length}`);
  console.log(`📤 Missing (need upload): ${missing.length}`);
  if (localMissing.length > 0) {
    console.log(`⚠️  Local file not found: ${localMissing.length}`);
    for (const p of localMissing) {
      console.log(`   - ${p}`);
    }
  }

  if (missing.length === 0) {
    console.log('\n🎉 Everything is already uploaded!');
    return;
  }

  console.log('\nFiles to upload:');
  for (const m of missing) {
    console.log(`  → ${m.blobName}`);
  }

  if (dryRun) {
    console.log('\nRun with --upload to upload these files.');
    return;
  }

  console.log('\nUploading...\n');

  let uploaded = 0;
  let errors = 0;

  for (const m of missing) {
    try {
      const fileBuffer = readFileSync(m.localPath);
      const blob = await put(m.blobName, fileBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });
      console.log(`  ✓ ${m.blobName}`);
      console.log(`    ${blob.url}`);
      uploaded++;
    } catch (err) {
      console.error(`  ✗ ${m.blobName}: ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\nDone! Uploaded ${uploaded} files.`);
  if (errors > 0) {
    console.log(`⚠ ${errors} errors occurred.`);
  }
}

main().catch(console.error);
