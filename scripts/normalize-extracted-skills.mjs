#!/usr/bin/env node
/**
 * Takes scripts/extracted-skills.json (raw OCR output per PDF filename) and
 * produces scripts/normalized-skills.json (per product slug with cleaned,
 * canonical skill names).
 *
 * Steps:
 *  1. Load raw extracted skills + every product slug from lib/fallback-products.
 *  2. Fuzzy-match each PDF filename to a slug.
 *  3. For each skill string: strip everything after first ":" or em-dash,
 *     fix OCR misreads, drop junk lines, title-case.
 *  4. Dedupe, write per-slug normalized list.
 *  5. Also writes a report of unmatched PDFs and slugs with no PDF.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RAW = JSON.parse(readFileSync(join(ROOT, 'scripts', 'extracted-skills.json'), 'utf-8'));
const FALLBACK = readFileSync(join(ROOT, 'lib', 'fallback-products.ts'), 'utf-8');

// Pull every slug out of fallback-products.ts
const slugs = [...FALLBACK.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)].map((m) => m[1]);
const uniqueSlugs = [...new Set(slugs)];

// Build slug → "loose key" for fuzzy matching
function looseKey(s) {
  return s
    .toLowerCase()
    .replace(/[&,'.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const slugKey = new Map(uniqueSlugs.map((s) => [s, looseKey(s)]));

// Try to match a PDF filename stem to a slug
function matchSlug(filename) {
  const key = looseKey(filename);
  // 1) exact slug substring match (strongest signal)
  for (const [slug, slugLoose] of slugKey) {
    if (key.includes(slugLoose)) return slug;
  }
  // 2) reverse: every word of the slug appears in the filename
  for (const [slug, slugLoose] of slugKey) {
    const words = slugLoose.split(' ').filter((w) => w.length > 2);
    if (words.length >= 2 && words.every((w) => key.includes(w))) return slug;
  }
  return null;
}

/** OCR fixups for common misreads we already spotted. */
function fixOcr(s) {
  return s
    // "Al" → "AI" when the surrounding word is clearly AI literacy / AI ethics etc.
    .replace(/\bAl\b/g, 'AI')
    .replace(/\bAI literacy\b/gi, 'AI Literacy')
    // "moking" → "making"
    .replace(/moking/gi, 'making')
    // "Al & Digital" — already covered above
    .trim();
}

/** Pull the canonical skill name out of a longer string. */
function canonicalize(raw) {
  let s = fixOcr(raw.trim());

  // Split on the first colon, em-dash, en-dash, or " — " separator
  const splitMatch = s.match(/^([^:—–\-]{3,60}?)\s*[:—–]\s/);
  if (splitMatch) s = splitMatch[1];
  // If no colon but the line is long, just take the first ~6 words
  if (s.length > 50) {
    const words = s.split(/\s+/).slice(0, 6);
    s = words.join(' ');
  }

  s = s.replace(/[.,;:!?]+$/, '').trim();

  // Smart-title-case: keep small words lower, AI / PE / STEM upper
  s = s
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (['ai', 'pe', 'stem'].includes(lower)) return lower.toUpperCase();
      if (['and', 'or', 'of', 'for', 'the', 'a', 'in', 'on', 'with', 'to', 'vs'].includes(lower) && i > 0) return lower;
      return w[0]?.toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');

  return s;
}

/** Decide if a cleaned skill name should be discarded as junk. */
function isJunk(s) {
  if (!s || s.length < 4 || s.length > 60) return true;
  // OCR fragments
  if (/^[a-z\s]{1,4}$/i.test(s)) return true;
  // Lines starting with "Step", "Choose", "Pick", "Let's", "Heads", etc.
  if (/^(step|choose|pick|let'?s|heads up|prompts?|note|tip|extra|materials|child|your|what|how|why|kid)/i.test(s)) return true;
  // Bullet leftovers
  if (/^[•¢●*·»\-]/.test(s)) return true;
  // Pure punctuation/numbers
  if (!/[A-Za-z]{3,}/.test(s)) return true;
  return false;
}

const normalized = {};
const unmatched = [];

for (const [filename, raw] of Object.entries(RAW)) {
  if (!Array.isArray(raw) || raw.length === 0) {
    unmatched.push({ filename, reason: 'no skills extracted' });
    continue;
  }
  const slug = matchSlug(filename);
  if (!slug) {
    unmatched.push({ filename, reason: 'no slug match' });
    continue;
  }

  const seen = new Set();
  const clean = [];
  for (const item of raw) {
    const c = canonicalize(item);
    if (isJunk(c)) continue;
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(c);
  }
  if (clean.length === 0) {
    unmatched.push({ filename, reason: 'all entries were junk after cleanup' });
    continue;
  }
  // Some PDFs might match the same slug if filenames are similar — prefer the
  // longer result.
  if (!normalized[slug] || clean.length > normalized[slug].skills.length) {
    normalized[slug] = { filename, skills: clean };
  }
}

// Slugs with no PDF / no match
const matchedSlugs = new Set(Object.keys(normalized));
const slugsNoPdf = uniqueSlugs.filter((s) => !matchedSlugs.has(s));

writeFileSync(
  join(ROOT, 'scripts', 'normalized-skills.json'),
  JSON.stringify(normalized, null, 2),
);
writeFileSync(
  join(ROOT, 'scripts', 'skills-extraction-report.json'),
  JSON.stringify(
    {
      slugsWithExtractedSkills: matchedSlugs.size,
      totalProductSlugs: uniqueSlugs.length,
      unmatchedPdfs: unmatched,
      slugsWithoutPdf: slugsNoPdf,
    },
    null,
    2,
  ),
);

console.log(`Slugs with extracted skills: ${matchedSlugs.size}/${uniqueSlugs.length}`);
console.log(`Unmatched PDFs: ${unmatched.length}`);
console.log(`Slugs without a PDF: ${slugsNoPdf.length}`);
console.log('\nWrote:');
console.log('  scripts/normalized-skills.json');
console.log('  scripts/skills-extraction-report.json');
