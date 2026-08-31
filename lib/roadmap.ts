// ─── The Trails data layer: the Future-Ready Skills Map, made walkable ───
//
// Structure comes straight from the Skills Map guide (the member PDF):
// - Two AGE BANDS: 6-11 (Build) and 11+ (Apply). A kid's band decides which
//   milestone checklist they measure against and which activities fit.
// - Twelve TERRITORIES: the Skills Map's skill categories. The family path
//   winds through them; every completed activity plants a step in every
//   territory it builds.
// - MILESTONES per territory per band: the guide's own "what this looks like
//   by age 11 / by age 16+" checklists, checkable per kid.
//
// There is no finish line anywhere by design: territories are revisited
// forever, milestones are flags along the way, and the path just continues.
//
// NOTE deliberately absent: activity LEVELS (Explore/Develop/Extend). Those
// live inside each guide so the parent can meet each kid where they are,
// per activity, in the moment. The software never tracks or suggests them.
//
// Activity-to-territory mapping is from the coverage audit of July 2026
// (Desktop/skills-map-activity-coverage.md). Keep in sync when adding
// activities.

export type BandId = 'build' | 'apply';

export interface Band {
  id: BandId;
  /** Parent-facing label, e.g. "Ages 6–11". */
  ages: string;
  name: string;
}

export const BANDS: readonly Band[] = [
  { id: 'build', ages: 'Ages 6–11', name: 'Build' },
  { id: 'apply', ages: 'Ages 11+', name: 'Apply' },
];

/** The band a kid measures against. Age 11 belongs to Apply (11+).
 *  Unknown age defaults to Build. */
export function bandForAge(age: number | null | undefined): BandId {
  if (age == null) return 'build';
  return age >= 11 ? 'apply' : 'build';
}

export interface TerritoryMilestone {
  /** Stable id, persisted per kid. Never rename or reuse. */
  id: string;
  text: string;
}

export interface Territory {
  slug: string;
  /** Display name (shared across bands; the Map's own category names). */
  name: string;
  /** Accent color, brand palette. */
  color: string;
  /** One-line parent-facing blurb per band, from the Map's framing. */
  blurb: Record<BandId, string>;
  /** The Map's "what this looks like by age 11 / 16+" checklists. */
  milestones: Record<BandId, TerritoryMilestone[]>;
  /** Activity slugs that build this territory (from the coverage audit). */
  activities: string[];
}

export const TERRITORIES: readonly Territory[] = [
  {
    slug: 'reading-media',
    name: 'Reading & Media',
    color: '#8b7355',
    blurb: {
      build: 'Reading to understand, comparing sources, and starting to spot bias.',
      apply: 'Deep comprehension and media literacy: who wrote this, and why?',
    },
    milestones: {
      build: [
        { id: 'rb1', text: 'Can summarize a chapter or article clearly in their own words' },
        { id: 'rb2', text: 'Can answer why and how questions with evidence from the text' },
        { id: 'rb3', text: 'Reads independently, for information and for enjoyment' },
      ],
      apply: [
        { id: 'ra1', text: 'Can explain and critique an argument using evidence' },
        { id: 'ra2', text: 'Can compare sources and tell reliable from questionable' },
        { id: 'ra3', text: 'Can learn something from reading and teach it back' },
      ],
    },
    activities: [
      'my-review-column', 'media-info-check', 'three-ais-one-question', 'bias-fairness-lab',
      'hallucination-detective', 'deepfake-spotter', 'algorithm-awareness', 'supply-chain-detective',
    ],
  },
  {
    slug: 'writing',
    name: 'Writing',
    color: '#3d5c3b',
    blurb: {
      build: 'Clear thinking on paper: real writing for real purposes.',
      apply: 'Clarity, persuasion, and structure, for audiences that matter.',
    },
    milestones: {
      build: [
        { id: 'wb1', text: 'Writes organized paragraphs with a topic sentence and details' },
        { id: 'wb2', text: 'Can revise to improve clarity, not just fix spelling' },
        { id: 'wb3', text: 'Can write a short report or opinion with reasons and examples' },
      ],
      apply: [
        { id: 'wa1', text: 'Writes clearly with strong structure and transitions' },
        { id: 'wa2', text: 'Can revise for logic and clarity' },
        { id: 'wa3', text: 'Can argue convincingly with evidence and a fair counterpoint' },
      ],
    },
    activities: [
      'write-like-a-pro', 'mini-magazine-creator', 'my-review-column', 'adventure-story-map',
      'two-minute-story', 'trail-guide-creator', 'family-recipe-book', 'travel-reflection-postcards',
      'scavenger-hunt-designer', 'prompt-like-a-coach', 'investor-pitch',
    ],
  },
  {
    slug: 'math',
    name: 'Real-World Math',
    color: '#588157',
    blurb: {
      build: 'Number sense through cooking, shopping, measuring, and money.',
      apply: 'Math for decisions: money, data, and turning problems into numbers.',
    },
    milestones: {
      build: [
        { id: 'mb1', text: 'Solves multi-step problems and explains their thinking' },
        { id: 'mb2', text: 'Uses fractions and decimals confidently in daily life' },
        { id: 'mb3', text: 'Reads charts and graphs and can say what they mean' },
      ],
      apply: [
        { id: 'ma1', text: 'Uses math to make choices, not just solve exercises' },
        { id: 'ma2', text: 'Can interpret data and challenge misleading statistics' },
        { id: 'ma3', text: 'Understands basic finance and can budget independently' },
      ],
    },
    activities: [
      'garage-sale-math', 'snack-mission', 'party-planner-math', 'kitchen-math-challenge',
      'clothing-swap-thrift-math', 'currency-market-math', 'nature-data-tracker', 'sports-stats-lab',
      'savings-goal-tracker', 'family-electricity-audit', 'budget-challenge', 'road-trip-calculator',
      'garden-plot-planner', 'smart-shopper', 'pricing-experiment', 'backyard-campout-planner',
    ],
  },
  {
    slug: 'critical-thinking',
    name: 'Critical Thinking',
    color: '#b5803e',
    blurb: {
      build: 'Claim, evidence, reasoning: the habit of asking "how do you know?"',
      apply: 'Judgment and logic: systems, causation, and changing your mind well.',
    },
    milestones: {
      build: [
        { id: 'cb1', text: 'Can support a claim with evidence and explain the reasoning' },
        { id: 'cb2', text: 'Can change their mind when new evidence appears' },
        { id: 'cb3', text: 'Can spot a weak argument' },
      ],
      apply: [
        { id: 'ca1', text: 'Argues from evidence and admits uncertainty honestly' },
        { id: 'ca2', text: 'Spots common reasoning errors and weak proof' },
        { id: 'ca3', text: 'Changes conclusions when better information appears' },
      ],
    },
    activities: [
      'media-info-check', 'customer-discovery', 'what-if-scenario-lab', 'rube-goldberg-machine',
      'decomposition-detective', 'supply-chain-detective', 'seed-travelers', 'hallucination-detective',
      'family-debate-night', 'bias-fairness-lab', 'business-failure-lab', 'comeback-journal',
      'pricing-experiment', 'camouflage-challenge', 'everyday-redesign', 'three-ais-one-question',
    ],
  },
  {
    slug: 'ai-digital',
    name: 'AI & Digital',
    color: '#7b8fa1',
    blurb: {
      build: 'Search, safety, and first AI use, with a parent close by.',
      apply: 'Prompting, verification, and ethics: AI as a tool, never a crutch.',
    },
    milestones: {
      build: [
        { id: 'db1', text: 'Can organize their digital work' },
        { id: 'db2', text: 'Can tell when a source seems unreliable and check it' },
        { id: 'db3', text: 'Can use AI as a helper and still produce their own thinking' },
      ],
      apply: [
        { id: 'da1', text: 'Uses AI to amplify their thinking without outsourcing it' },
        { id: 'da2', text: 'Verifies important claims with reliable sources' },
        { id: 'da3', text: 'Understands privacy basics and makes safe choices online' },
      ],
    },
    activities: [
      'ai-basics', 'prompt-like-a-coach', 'create-with-ai', 'build-ai-helper', 'privacy-footprint',
      'deepfake-spotter', 'healthy-tech-boundaries', 'algorithm-awareness', 'media-info-check',
      'hallucination-detective', 'three-ais-one-question',
    ],
  },
  {
    slug: 'communication',
    name: 'Communication',
    color: '#C97B5C',
    blurb: {
      build: 'Speaking, listening, presenting: explaining your thinking out loud.',
      apply: 'Presenting, negotiating, collaborating, and handling disagreement.',
    },
    milestones: {
      build: [
        { id: 'ob1', text: 'Can present a topic for a few minutes with a clear structure' },
        { id: 'ob2', text: 'Asks good questions and responds thoughtfully' },
        { id: 'ob3', text: 'Can handle feedback without shutting down' },
      ],
      apply: [
        { id: 'oa1', text: 'Can present for 5 to 10 minutes with clear points' },
        { id: 'oa2', text: 'Can run a meeting or lead a small group project' },
        { id: 'oa3', text: 'Handles disagreement respectfully and productively' },
      ],
    },
    activities: [
      'directions-challenge', 'community-tour-guide', 'two-minute-story', 'neighbourhood-interview',
      'people-stories-interview', 'customer-discovery', 'shark-tank-pitch', 'market-stall-pitch',
      'mini-movie', 'investor-pitch', 'product-design-lab', 'board-game-studio', 'family-debate-night',
    ],
  },
  {
    slug: 'emotional',
    name: 'Emotional Intelligence',
    color: '#B6748A',
    blurb: {
      build: 'Reading feelings, navigating friendships, repairing after conflict.',
      apply: 'Self-awareness under pressure, hard conversations, and boundaries.',
    },
    milestones: {
      build: [
        { id: 'eb1', text: 'Can name what they are feeling and why, most of the time' },
        { id: 'eb2', text: 'Can tell "I am angry" from "I am actually hurt"' },
        { id: 'eb3', text: 'Can repair a friendship after a conflict' },
        { id: 'eb4', text: 'Handles losing or not getting picked without it ruining the day' },
        { id: 'eb5', text: 'Notices when someone else is struggling and responds' },
      ],
      apply: [
        { id: 'ea1', text: 'Can sit with an uncomfortable emotion without reacting or numbing' },
        { id: 'ea2', text: 'Can disagree with a friend and still be friends after' },
        { id: 'ea3', text: 'Notices when social media affects their mood, and steps back' },
        { id: 'ea4', text: 'Asks for help when something feels too big to handle alone' },
      ],
    },
    activities: [
      'big-feelings-lab', 'worry-sorter', 'calm-down-toolkit', 'reading-the-room', 'conflict-fix',
      'repair-conversation', 'kindness-missions', 'disappointment-lab', 'healthy-tech-boundaries',
      'comeback-journal',
    ],
  },
  {
    slug: 'self-management',
    name: 'Self-Management',
    color: '#a9762f',
    blurb: {
      build: 'Routines, focus, and starting things without a fight.',
      apply: 'Planning, deep focus, stress management, and follow-through.',
    },
    milestones: {
      build: [
        { id: 'sb1', text: 'Can start tasks with less resistance' },
        { id: 'sb2', text: 'Can work in focused blocks' },
        { id: 'sb3', text: 'Uses coping tools when frustrated: break, reset, ask for help' },
      ],
      apply: [
        { id: 'sa1', text: 'Can plan a multi-week project and follow through' },
        { id: 'sa2', text: 'Can manage distractions and work independently' },
        { id: 'sa3', text: 'Recovers from setbacks without spiraling' },
      ],
    },
    activities: [
      'time-energy-planner', 'plan-a-mini-adventure', 'travel-day', 'hard-thing-challenge',
      'boredom-toolkit', 'calm-down-toolkit', 'disappointment-lab', 'comeback-journal',
      'business-failure-lab', 'worry-sorter', 'healthy-tech-boundaries',
    ],
  },
  {
    slug: 'creativity',
    name: 'Creativity & Making',
    color: '#c4836a',
    blurb: {
      build: 'Design, build, iterate: multi-step projects and maker confidence.',
      apply: 'Idea to prototype to feedback, plus real business thinking.',
    },
    milestones: {
      build: [
        { id: 'crb1', text: 'Completes multi-step projects and improves them after feedback' },
        { id: 'crb2', text: 'Can explain design choices: "I did this because..."' },
        { id: 'crb3', text: 'Enjoys creating and sharing what they make' },
      ],
      apply: [
        { id: 'cra1', text: 'Can take an idea all the way to a finished product or service' },
        { id: 'cra2', text: 'Gathers feedback and improves without taking it personally' },
        { id: 'cra3', text: 'Understands value creation and basic money realities' },
      ],
    },
    activities: [
      'imaginary-world', 'invent-a-sport', 'theme-park', 'product-design-lab', 'rube-goldberg-machine',
      'board-game-studio', 'land-art-challenges', 'mini-movie', 'household-orchestra', 'survival-base',
      'nature-crafts', 'kinetic-sculpture', 'build-a-museum', 'creature-habitat', 'micro-business',
      'marketing-campaign', 'brand-builder', 'everyday-redesign', 'complaint-to-product', 'shark-tank-pitch',
    ],
  },
  {
    slug: 'citizenship',
    name: 'Citizenship & Character',
    color: '#6b8e6b',
    blurb: {
      build: 'Values in action: kindness, responsibility, community, culture.',
      apply: 'Ethics and contribution: service, digital citizenship, empathy.',
    },
    milestones: {
      build: [
        { id: 'ctb1', text: 'Can take responsibility for mistakes and repair them' },
        { id: 'ctb2', text: 'Shows empathy and resolves conflicts with words' },
        { id: 'ctb3', text: 'Understands basic digital citizenship' },
      ],
      apply: [
        { id: 'cta1', text: 'Takes responsibility and repairs harm when needed' },
        { id: 'cta2', text: 'Can discuss ethical dilemmas thoughtfully' },
        { id: 'cta3', text: 'Contributes to family and community in consistent ways' },
      ],
    },
    activities: [
      'kindness-missions', 'decision-lab', 'community-impact', 'community-service-business',
      'neighbourhood-problem-spotter', 'privacy-footprint', 'world-food-detective',
      'cultural-celebration-journal', 'everyday-life-comparison', 'people-stories-interview',
      'local-language-mission', 'solo-mission',
    ],
  },
  {
    slug: 'life-skills',
    name: 'Life Skills',
    color: '#96694F',
    blurb: {
      build: 'Pack a bag, cook a meal, understand money, manage time.',
      apply: 'Practical independence: could they handle 48 hours on their own?',
    },
    milestones: {
      build: [
        { id: 'lb1', text: 'Can pack a bag and manage their belongings' },
        { id: 'lb2', text: 'Can make simple meals and snacks, and clean up' },
        { id: 'lb3', text: 'Makes basic money decisions and saves toward a goal' },
      ],
      apply: [
        { id: 'la1', text: 'Handles daily life tasks with minimal reminders' },
        { id: 'la2', text: 'Manages a simple budget and makes thoughtful purchases' },
        { id: 'la3', text: 'Can plan a day independently: schedule, transport, supplies' },
      ],
    },
    activities: [
      'kitchen-math-challenge', 'family-recipe-book', 'pack-like-a-pro', 'savings-goal-tracker',
      'micro-business', 'garage-sale-math', 'time-energy-planner', 'travel-day', 'emergency-ready',
      'outdoor-survival-planner', 'solo-mission', 'fix-it-detective', 'swap-day-challenge',
      'budget-challenge', 'smart-shopper', 'transport-navigation-challenge',
    ],
  },
  {
    slug: 'physical',
    name: 'Physical & Outdoor',
    color: '#5C7B6A',
    blurb: {
      build: 'Daily movement, outdoor confidence, finding their physical thing.',
      apply: 'Owning your body: challenge, endurance, outdoor independence.',
    },
    milestones: {
      build: [
        { id: 'pb1', text: 'Moves their body daily without being told' },
        { id: 'pb2', text: 'Will try a new physical activity even when it is unfamiliar' },
        { id: 'pb3', text: 'Comfortable outside, even in imperfect weather' },
        { id: 'pb4', text: 'Has a physical activity they genuinely chose themselves' },
      ],
      apply: [
        { id: 'pa1', text: 'Has a movement routine a parent does not organize' },
        { id: 'pa2', text: 'Voluntarily does something physically hard, regularly' },
        { id: 'pa3', text: 'Can push through discomfort without quitting right away' },
        { id: 'pa4', text: 'Can plan a physical outing: gear, route, and safety' },
      ],
    },
    activities: [
      'outdoor-learning-missions', 'survival-base', 'square-foot-safari', 'invent-a-sport',
      'backyard-campout-planner', 'outdoor-survival-planner', 'plan-a-mini-adventure',
      'nature-journal-walks', 'nature-walk-task-cards', 'outdoor-stem-challenges', 'land-art-challenges',
    ],
  },
];

/**
 * Skills-Map areas for activities added after the original coverage audit.
 * The per-territory `activities` lists above came from that audit and go stale
 * as new activities ship, so tag each NEW activity here (2–3 areas it builds).
 * See CLAUDE.md "Adding a New Product" — every activity must land in ≥1 area,
 * or it disappears from the member Library/Record area filters.
 */
const SUPPLEMENTAL_TERRITORY_TAGS: Record<string, string[]> = {
  'nature-choice-boards': ['physical', 'self-management', 'creativity'],
  'outdoor-stem-challenges-volume-2': ['physical', 'critical-thinking', 'creativity'],
  'outdoor-movement-challenge-cards': ['physical', 'self-management'],
  'problem-solver': ['critical-thinking', 'creativity'],
  'farmers-market-challenge': ['math', 'life-skills'],
  'nature-geography-field-study': ['physical', 'critical-thinking'],
  'street-explorer-map-maker': ['creativity', 'critical-thinking', 'physical'],
  'grow-it-eat-it': ['physical', 'self-management', 'critical-thinking'],
  'kitchen-science-lab': ['critical-thinking', 'creativity'],
  'probability-lab': ['math', 'critical-thinking'],
  'secret-code-lab': ['critical-thinking', 'math'],
  'body-owners-manual': ['physical', 'critical-thinking', 'math'],
  'family-history-detective': ['communication', 'writing', 'citizenship'],
  'teach-it-to-learn-it': ['communication', 'self-management'],
  'trade-it-up': ['communication', 'math', 'life-skills'],
  'play-the-world': ['citizenship', 'physical'],
  'people-scientist': ['emotional', 'critical-thinking'],
  'frustration-tolerance-cards': ['emotional', 'self-management'],
  // bias-fairness-lab is an AI-bias activity but was never tagged AI & Digital.
  'bias-fairness-lab': ['ai-digital'],
};

/**
 * Which area an activity should LEAD with in the UI (the first chip / accent).
 * territoriesForSlug otherwise orders by territory declaration order, which can
 * surface a less-representative area first (e.g. AI activities leading with
 * "Reading & Media"). This only reorders display — filters use the full set.
 */
const PRIMARY_AREA_OVERRIDE: Record<string, string> = {
  // AI & Digital activities should lead with AI & Digital, not Reading & Media.
  'media-info-check': 'ai-digital',
  'algorithm-awareness': 'ai-digital',
  'deepfake-spotter': 'ai-digital',
  'hallucination-detective': 'ai-digital',
  'three-ais-one-question': 'ai-digital',
  'bias-fairness-lab': 'ai-digital',
  'prompt-like-a-coach': 'ai-digital',
  // Entrepreneurship activities → a more business-forward lead than the
  // declaration-order default (there's no "Entrepreneurship" area).
  'micro-business': 'life-skills',
  'customer-discovery': 'communication',
  'investor-pitch': 'communication',
  'product-design-lab': 'creativity',
  'supply-chain-detective': 'critical-thinking',
  'trade-it-up': 'communication',
};

// Fold the supplemental tags into the territory lists once, at load, so
// territoriesForSlug / territorySteps see a single, complete source.
for (const [slug, terrs] of Object.entries(SUPPLEMENTAL_TERRITORY_TAGS)) {
  for (const terrSlug of terrs) {
    const t = TERRITORIES.find((x) => x.slug === terrSlug);
    if (t && !t.activities.includes(slug)) t.activities.push(slug);
  }
}

/** Territories an activity builds (an activity can build several). The leading
 *  entry is the one to show as "primary" — respecting PRIMARY_AREA_OVERRIDE. */
export function territoriesForSlug(slug: string): string[] {
  const list = TERRITORIES.filter((t) => t.activities.includes(slug)).map((t) => t.slug);
  const lead = PRIMARY_AREA_OVERRIDE[slug];
  if (lead && list.includes(lead)) return [lead, ...list.filter((s) => s !== lead)];
  return list;
}

/** Skills-Map areas an activity builds, with display name + accent color (ordered). */
export function areaMetaForSlug(slug: string): { slug: string; name: string; color: string }[] {
  return territoriesForSlug(slug)
    .map((ts) => TERRITORIES.find((t) => t.slug === ts))
    .filter((t): t is Territory => !!t)
    .map((t) => ({ slug: t.slug, name: t.name, color: t.color }));
}

/** Per-territory step counts from a set of completed activity slugs. */
export function territorySteps(completedSlugs: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TERRITORIES) out[t.slug] = 0;
  for (const slug of completedSlugs) {
    for (const t of TERRITORIES) {
      if (t.activities.includes(slug)) out[t.slug] += 1;
    }
  }
  return out;
}

/** Milestone id → territory slug, across both bands. */
export const MILESTONE_TERRITORY: Record<string, string> = Object.fromEntries(
  TERRITORIES.flatMap((t) =>
    (['build', 'apply'] as BandId[]).flatMap((b) => t.milestones[b].map((m) => [m.id, t.slug])),
  ),
);
