#!/usr/bin/env node
/**
 * Reads scripts/normalized-skills.json and maps each raw skill phrase to:
 *   - a canonical skill name (e.g. "Critical Thinking")
 *   - one or more top-level Skill Families (e.g. "Critical Thinking & Reasoning")
 *
 * Writes:
 *   scripts/skills-taxonomy.json — per-slug { canonical: [...], families: [...] }
 *   scripts/skills-unmapped.json — phrases that didn't match any pattern (for review)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const NORMALIZED = JSON.parse(readFileSync(join(ROOT, 'scripts', 'normalized-skills.json'), 'utf-8'));

// ─── Controlled vocabulary ────────────────────────────────────────────
// Each entry: canonical name, regex patterns that match, families it belongs to.
// First match wins. Order patterns from specific → general.
const VOCAB = [
  // Tech & Digital
  { canonical: 'AI Literacy', families: ['Tech & Digital'], patterns: [/\bai\s*literacy\b/i, /\bartificial\s+intelligence\b/i, /\bai\s+(systems?|hype|tools?)\b/i] },
  { canonical: 'Digital Citizenship', families: ['Tech & Digital'], patterns: [/\bdigital\s+citizen/i] },
  { canonical: 'Digital Literacy', families: ['Tech & Digital'], patterns: [/\bdigital\s+literacy/i, /\balgorithm\s+awareness\b/i] },
  { canonical: 'Online Safety & Privacy', families: ['Tech & Digital'], patterns: [/\bprivacy\b/i, /\bonline\s+safet/i, /\bsafety\s+and\s+ethics\b/i, /\bsafe\s+tech\b/i] },
  { canonical: 'Ethics', families: ['Tech & Digital', 'Empathy & People'], patterns: [/\bethic(s|al)\b/i] },
  { canonical: 'Media Literacy', families: ['Tech & Digital'], patterns: [/\bmedia\s+literacy\b/i, /\bbias.{0,15}fairness/i, /\bmanipulation\b/i, /\bdeepfake\b/i] },

  // Critical Thinking & Reasoning
  { canonical: 'Critical Thinking', families: ['Critical Thinking & Reasoning'], patterns: [/\bcritical\s+think/i, /\bquestioning\b/i, /\banalysis\b/i, /\blogic\b/i] },
  { canonical: 'Problem-Solving', families: ['Critical Thinking & Reasoning'], patterns: [/\bproblem.solving\b/i, /\btrouble.shooting/i] },
  { canonical: 'Decision-Making', families: ['Critical Thinking & Reasoning'], patterns: [/\bdecision.making\b/i, /\bdeciding\b/i, /\bchoosing\b/i] },
  { canonical: 'Research', families: ['Critical Thinking & Reasoning'], patterns: [/\bresearch\b/i, /\bdata\s+gathering\b/i, /\bsource\s+evaluation\b/i] },
  { canonical: 'Reflection', families: ['Critical Thinking & Reasoning'], patterns: [/\breflect/i, /\bmindfulness\b/i] },

  // Communication & Writing
  { canonical: 'Writing', families: ['Communication & Writing'], patterns: [/\bwriting\b/i, /\bdescriptive\s+writing\b/i, /\bnarrative\s+writing\b/i, /\bessay\b/i] },
  { canonical: 'Storytelling', families: ['Communication & Writing'], patterns: [/\bstorytelling\b/i, /\bstory\s+structure\b/i, /\bnarrative\b/i] },
  { canonical: 'Persuasion', families: ['Communication & Writing'], patterns: [/\bpersuasion\b/i, /\bpersuasive\b/i] },
  { canonical: 'Public Speaking', families: ['Communication & Writing'], patterns: [/\bpublic\s+speaking\b/i, /\bpresentation\b/i, /\bpitching?\b/i] },
  { canonical: 'Listening', families: ['Communication & Writing', 'Empathy & People'], patterns: [/\blistening\b/i] },
  { canonical: 'Audience Awareness', families: ['Communication & Writing', 'Empathy & People'], patterns: [/\baudience\b/i] },
  { canonical: 'Communication', families: ['Communication & Writing'], patterns: [/\bcommunication\b/i, /\bexpressing\s+ideas\b/i, /\bexplain/i] },

  // Math & Money
  { canonical: 'Number Sense', families: ['Math & Money'], patterns: [/\bnumber\s+sense\b/i, /\baddition\b/i, /\bsubtraction\b/i, /\bmultiplication\b/i, /\bdivision\b/i, /\bmental\s+math\b/i] },
  { canonical: 'Math', families: ['Math & Money'], patterns: [/\bmath(s|ematic)?\b/i, /\bnumeracy\b/i, /\bquantit/i, /\bmeasurement\b/i, /\bestimation\b/i, /\bgeometry\b/i, /\bfractions?\b/i] },
  { canonical: 'Percentages', families: ['Math & Money'], patterns: [/\bpercentages?\b/i, /\bpercent\b/i] },
  { canonical: 'Financial Literacy', families: ['Math & Money', 'Entrepreneurship & Money'], patterns: [/\bfinancial\s+literacy\b/i, /\bfinancial\s+thinking\b/i, /\bmoney\s+management\b/i] },
  { canonical: 'Budgeting', families: ['Math & Money', 'Entrepreneurship & Money'], patterns: [/\bbudget/i] },
  { canonical: 'Data & Graphs', families: ['Math & Money', 'Critical Thinking & Reasoning'], patterns: [/\bdata\s+(tracking|graphing|literacy)\b/i, /\bgraphs?\b/i, /\bcharts?\b/i] },

  // Planning & Self-Management
  { canonical: 'Planning', families: ['Planning & Self-Management'], patterns: [/\bplanning\b/i, /\bproject\s+planning\b/i] },
  { canonical: 'Self-Direction', families: ['Planning & Self-Management'], patterns: [/\bself.direction\b/i, /\bself.management\b/i, /\bautonomy\b/i, /\bindependence\b/i] },
  { canonical: 'Time Management', families: ['Planning & Self-Management'], patterns: [/\btime\s+management\b/i, /\bscheduling\b/i, /\btime\s+planning\b/i] },
  { canonical: 'Goal Setting', families: ['Planning & Self-Management'], patterns: [/\bgoal\s+sett/i, /\btargets?\b/i] },
  { canonical: 'Organisation', families: ['Planning & Self-Management'], patterns: [/\borganis/i, /\borganiz/i] },
  { canonical: 'Life Skills', families: ['Planning & Self-Management'], patterns: [/\blife\s+skills?\b/i, /\beveryday\s+skills?\b/i] },
  { canonical: 'Resilience', families: ['Planning & Self-Management', 'Empathy & People'], patterns: [/\bresilience\b/i, /\bperseverance\b/i, /\bgrit\b/i] },
  { canonical: 'Executive Functioning', families: ['Planning & Self-Management'], patterns: [/\bexecutive\s+function/i] },
  { canonical: 'Adaptability', families: ['Planning & Self-Management'], patterns: [/\badaptab/i, /\bflexibility\b/i] },
  { canonical: 'Emotional Regulation', families: ['Empathy & People', 'Planning & Self-Management'], patterns: [/\bemotional\s+(regulation|self.control)\b/i, /\bself.regulation\b/i, /\bself.control\b/i] },
  { canonical: 'Systems Thinking', families: ['Critical Thinking & Reasoning'], patterns: [/\bsystems?\s+thinking\b/i] },

  // Creativity & Making
  { canonical: 'Creative Thinking', families: ['Creativity & Making'], patterns: [/\bcreative\s+think/i, /\bcreativity\b/i, /\binvent/i, /\bimagination\b/i] },
  { canonical: 'Design Thinking', families: ['Creativity & Making'], patterns: [/\bdesign\s+thinking\b/i, /\bprototyp/i, /\biteration\b/i] },
  { canonical: 'Engineering', families: ['Creativity & Making'], patterns: [/\bengineering\b/i, /\bphysics\b/i, /\bconstruction\b/i, /\bbuilding\b/i] },
  { canonical: 'Art', families: ['Creativity & Making'], patterns: [/\bartistic\b/i, /\bart\s+(skills?|expression|history)\b/i, /\bdrawing\b/i, /\bvisual\s+(art|design)/i] },

  // Nature & Science
  { canonical: 'Observation', families: ['Nature & Science', 'Critical Thinking & Reasoning'], patterns: [/\bobservation\b/i, /\bnoticing\b/i, /\bcareful\s+looking\b/i] },
  { canonical: 'Science', families: ['Nature & Science'], patterns: [/\bscience\b/i, /\bbiology\b/i, /\bchemistry\b/i, /\bphysics\b/i, /\becology\b/i] },
  { canonical: 'Nature Connection', families: ['Nature & Science'], patterns: [/\bnature\b/i, /\boutdoor\b/i, /\benvironment(al)?\b/i] },
  { canonical: 'Spatial Thinking', families: ['Nature & Science', 'Critical Thinking & Reasoning'], patterns: [/\bspatial\s+(think|reason)/i, /\bmap.making\b/i, /\bnavigation\b/i] },

  // Empathy & People
  { canonical: 'Empathy', families: ['Empathy & People'], patterns: [/\bempathy\b/i, /\bperspective.taking\b/i, /\bunderstanding\s+others?\b/i] },
  { canonical: 'Cultural Awareness', families: ['Empathy & People', 'World & Geography'], patterns: [/\bcultural\s+awareness\b/i, /\bcultures?\b/i, /\bdiversity\b/i] },
  { canonical: 'Confidence', families: ['Empathy & People', 'Planning & Self-Management'], patterns: [/\bconfidence\b/i, /\bself.esteem\b/i] },
  { canonical: 'Collaboration', families: ['Empathy & People'], patterns: [/\bcollaboration\b/i, /\bteamwork\b/i, /\bworking\s+together\b/i] },

  // Entrepreneurship & Money
  { canonical: 'Entrepreneurship', families: ['Entrepreneurship & Money'], patterns: [/\bentrepreneur/i, /\bbusiness\s+(think|build)/i, /\bventur/i] },
  { canonical: 'Marketing', families: ['Entrepreneurship & Money', 'Communication & Writing'], patterns: [/\bmarketing\b/i, /\bbranding\b/i, /\badvertising\b/i] },
  { canonical: 'Pricing & Sales', families: ['Entrepreneurship & Money', 'Math & Money'], patterns: [/\bpricing\b/i, /\bsales?\b/i, /\bmargins?\b/i] },

  // World & Geography
  { canonical: 'Geography', families: ['World & Geography', 'Nature & Science'], patterns: [/\bgeography\b/i, /\blandmarks\b/i, /\btopography\b/i] },
  { canonical: 'Travel & Worldschooling', families: ['World & Geography'], patterns: [/\btravel\b/i, /\bworldschool/i, /\btransport/i] },
];

function matchPhrase(phrase) {
  for (const v of VOCAB) {
    for (const p of v.patterns) {
      if (p.test(phrase)) return v;
    }
  }
  return null;
}

const result = {};
const unmapped = {};

for (const [slug, { skills }] of Object.entries(NORMALIZED)) {
  const canonical = new Set();
  const families = new Set();
  for (const phrase of skills) {
    const v = matchPhrase(phrase);
    if (v) {
      canonical.add(v.canonical);
      v.families.forEach((f) => families.add(f));
    } else {
      if (!unmapped[slug]) unmapped[slug] = [];
      unmapped[slug].push(phrase);
    }
  }
  result[slug] = {
    canonical: [...canonical].sort(),
    families: [...families].sort(),
  };
}

// Aggregate stats
const familyCounts = {};
const canonicalCounts = {};
for (const { canonical, families } of Object.values(result)) {
  canonical.forEach((c) => (canonicalCounts[c] = (canonicalCounts[c] || 0) + 1));
  families.forEach((f) => (familyCounts[f] = (familyCounts[f] || 0) + 1));
}

writeFileSync(
  join(ROOT, 'scripts', 'skills-taxonomy.json'),
  JSON.stringify(
    {
      familyCounts: Object.fromEntries(
        Object.entries(familyCounts).sort((a, b) => b[1] - a[1]),
      ),
      canonicalCounts: Object.fromEntries(
        Object.entries(canonicalCounts).sort((a, b) => b[1] - a[1]),
      ),
      perSlug: result,
    },
    null,
    2,
  ),
);
writeFileSync(
  join(ROOT, 'scripts', 'skills-unmapped.json'),
  JSON.stringify(unmapped, null, 2),
);

console.log('=== Family coverage ===');
Object.entries(familyCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([f, n]) => console.log(`  ${n.toString().padStart(3)} ${f}`));
console.log('\n=== Canonical skill coverage ===');
Object.entries(canonicalCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([c, n]) => console.log(`  ${n.toString().padStart(3)} ${c}`));

const unmappedCount = Object.values(unmapped).reduce((s, a) => s + a.length, 0);
console.log(`\nUnmapped phrases: ${unmappedCount}`);
console.log(`Slugs with at least one family: ${Object.values(result).filter((r) => r.families.length > 0).length}/${Object.keys(result).length}`);
