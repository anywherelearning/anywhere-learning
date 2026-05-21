#!/usr/bin/env node
/**
 * Walks every PDF in ~/Desktop/Anywhere Learning/Activities/, renders pages 3-5
 * to images, OCRs each, and extracts the "Skills your child develops" bulleted
 * list. Writes results to scripts/extracted-skills.json.
 *
 * Usage:  node scripts/extract-pdf-skills.mjs
 */

import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { tmpdir, homedir } from 'node:os';

const ACTIVITIES_DIR = join(
  homedir(),
  'Desktop',
  'Anywhere Learning',
  'Activities',
);
const OUTPUT = join(process.cwd(), 'scripts', 'extracted-skills.json');

function ocrPages(pdfPath) {
  const work = mkdtempSync(join(tmpdir(), 'pdfskills-'));
  try {
    // Render pages 3-5 (intro section). Cheap at 180dpi for OCR.
    spawnSync('pdftoppm', ['-r', '180', '-f', '3', '-l', '5', pdfPath, join(work, 'p'), '-jpeg'], {
      stdio: 'pipe',
    });
    const pages = readdirSync(work).filter((f) => f.startsWith('p-')).sort();
    let combined = '';
    for (const p of pages) {
      const r = spawnSync('tesseract', [join(work, p), '-'], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      combined += '\n' + (r.stdout || '');
    }
    return combined;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Find a skills section and parse it.
 * Two known formats in the activity PDFs:
 *   A) "Skills your child develops" + bulleted list  (most categories)
 *   B) "What your child is actually learning" + category-prefixed paragraphs
 *      (Creativity & Maker, Entrepreneurship)
 * Returns array of normalized skill strings, or [] if nothing matched.
 */
function parseSkills(text) {
  // Tolerate OCR misreads — "your" sometimes comes back as "vour", "yyour", etc.
  // Just key off "child develops" / "child is actually learning".
  const reBullet = /skills?\s+\S{2,6}\s+child\s+develops?/i;
  const reParagraph = /what\s+\S{2,6}\s+child\s+(is\s+)?actually\s+learning/i;
  const mB = reBullet.exec(text);
  const mP = reParagraph.exec(text);

  // Prefer whichever appears first
  let format = null;
  let m = null;
  if (mB && (!mP || mB.index < mP.index)) {
    format = 'bullet';
    m = mB;
  } else if (mP) {
    format = 'paragraph';
    m = mP;
  } else {
    return [];
  }

  const after = text.slice(m.index + m[0].length);

  if (format === 'bullet') {
    const lines = after.split(/\r?\n/).slice(0, 30);
    const skills = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const m2 = /^[•¢●*\-e●●·»o]\s*(.+)$/.exec(line);
      let item = m2 ? m2[1] : line;
      if (/^(What|Materials|Tips|How|Why|At a glance|This activity|Levels?|Time|Extras?|Notes|Step|Prompts|Kid|Your\s+job|Child)/i.test(item) && skills.length > 0) break;
      if (item.length < 4 || item.length > 120) continue;
      // Reject lines with parens that look like prompts/explanations
      if (/^\(/.test(item)) continue;
      item = item.replace(/[.;,]+$/, '').trim();
      skills.push(item);
      if (skills.length >= 10) break;
    }
    return skills;
  }

  // Paragraph format: extract category name from "Category: rest of paragraph"
  // Take a chunk of text after the header; categories are typically Capitalized
  // and followed by a colon at the start of a line.
  const chunk = after.slice(0, 1600);
  const skills = [];
  // Match "Category name:" at the start of a line (allowing an optional bullet
  // mark, since the "paragraph" format sometimes uses "e Skill: …" bullets too).
  const catRe = /^\s*(?:[•¢●*\-e●●·»o]\s+)?([A-Z][A-Za-z][A-Za-z\s&/-]{2,40}?):\s/gm;
  let match;
  while ((match = catRe.exec(chunk)) !== null) {
    const cat = match[1].trim();
    // Skip non-skill labels that sometimes appear with a colon
    if (/^(child|your|what|how|why|note|tip|heads up|prompts?|step|level|materials|extras?)/i.test(cat)) continue;
    if (cat.length < 4) continue;
    skills.push(cat);
    if (skills.length >= 10) break;
  }
  return skills;
}

function main() {
  if (!existsSync(ACTIVITIES_DIR)) {
    console.error('Activities directory not found:', ACTIVITIES_DIR);
    process.exit(1);
  }
  const files = readdirSync(ACTIVITIES_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();
  console.log(`Found ${files.length} PDFs. OCRing...`);

  const result = {};
  let i = 0;
  for (const f of files) {
    i++;
    const path = join(ACTIVITIES_DIR, f);
    const stem = basename(f, extname(f));
    process.stdout.write(`[${i}/${files.length}] ${stem.slice(0, 60)}... `);
    try {
      const text = ocrPages(path);
      const skills = parseSkills(text);
      result[stem] = skills;
      console.log(skills.length > 0 ? `(${skills.length} skills)` : '(no skills section found)');
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      result[stem] = { error: err.message };
    }
  }

  writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${OUTPUT}`);
}

main();
