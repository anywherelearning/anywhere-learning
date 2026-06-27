/**
 * Real-World Skills Scorecard: single source of truth for /quiz.
 *
 * Scoring: 3 questions per dimension, each answered with one of three
 * options worth 0 / 1 / 2 points (Not yet / With help / On their own).
 * Dimension max = 6, total max = 30.
 *
 * The subscribe API derives its tag whitelists from these exports, so
 * adding a dimension, band, or age range here keeps Kit tagging in sync.
 */

export interface QuizOption {
  label: string;
  points: number;
}

export const QUIZ_OPTIONS: QuizOption[] = [
  { label: 'Not yet', points: 0 },
  { label: 'With help', points: 1 },
  { label: 'On their own', points: 2 },
];

export interface QuizAgeRange {
  /** Tag-safe value, becomes Kit tag `quiz-age-{value}`. */
  value: string;
  label: string;
}

export const QUIZ_AGE_RANGES: QuizAgeRange[] = [
  { value: '5-7', label: '5 to 7' },
  { value: '8-10', label: '8 to 10' },
  { value: '11-13', label: '11 to 13' },
  { value: '14-plus', label: '14 or older' },
];

export interface QuizActivity {
  name: string;
  slug: string;
}

export interface QuizDimension {
  /** Tag-safe slug, becomes Kit tag `quiz-focus-{slug}`. */
  slug: string;
  name: string;
  /** Brand accent hex, matches the closest shop category color. */
  color: string;
  /** What this dimension measures. Results screen + SEO section. */
  blurb: string;
  /** Shown when this is the kid's strongest area. */
  strengthCopy: string;
  /** Shown when this is the focus area. */
  growthCopy: string;
  /** Library activities that build exactly this. Slugs must exist in /shop. */
  activities: QuizActivity[];
}

export const QUIZ_DIMENSIONS: QuizDimension[] = [
  {
    slug: 'money-smarts',
    name: 'Money Smarts',
    color: '#8b7355',
    blurb:
      'Handling real money: spending it, saving it, comparing prices, and understanding where it goes.',
    strengthCopy:
      'Your kid already treats money like a tool, not a mystery. Keep handing them real decisions with real dollars.',
    growthCopy:
      'Money skills grow fastest when the stakes are real. Start small: a real budget, a real store, real change to count. One mission a week beats a hundred drills.',
    activities: [
      { name: 'Farmers Market Challenge', slug: 'farmers-market-challenge' },
      { name: 'Savings Goal Tracker', slug: 'savings-goal-tracker' },
      { name: 'Smart Shopper Lab', slug: 'smart-shopper' },
    ],
  },
  {
    slug: 'communication-confidence',
    name: 'Communication & Confidence',
    color: '#5b8fa8',
    blurb:
      'Speaking up, listening well, and getting ideas across to people of all ages, not just family.',
    strengthCopy:
      'You have a communicator. Give them bigger rooms, real audiences, and harder questions.',
    growthCopy:
      'Confidence is built in tiny reps with real people. Small missions, like ordering their own food or interviewing a neighbour, do more than any amount of practice at home.',
    activities: [
      { name: 'Neighbourhood Interview Project', slug: 'neighbourhood-interview' },
      { name: 'Family Debate Night', slug: 'family-debate-night' },
      { name: 'Community Tour Guide', slug: 'community-tour-guide' },
    ],
  },
  {
    slug: 'independence-everyday-life',
    name: 'Independence & Everyday Life',
    color: '#7a6da8',
    blurb:
      'Owning everyday tasks: packing, preparing food, fixing what breaks, and planning ahead.',
    strengthCopy:
      'Capable hands. Your kid already owns real tasks, so hand over bigger ones and watch what happens.',
    growthCopy:
      'Independence is built by transfer: one real responsibility at a time, handed over for good. Pick one thing you currently do for them and make it theirs this week.',
    activities: [
      { name: 'Pack Like a Pro', slug: 'pack-like-a-pro' },
      { name: 'Fix-It Detective', slug: 'fix-it-detective' },
      { name: 'Emergency Ready Challenge', slug: 'emergency-ready' },
    ],
  },
  {
    slug: 'thinking-tech-judgment',
    name: 'Thinking & Tech Judgment',
    color: '#7b88a8',
    blurb:
      'Asking "is this actually true?", solving problems before asking for help, and using AI and the internet with eyes open.',
    strengthCopy:
      'A sharp, skeptical thinker in the making. Feed them messier problems and trickier sources.',
    growthCopy:
      'This is the skill set the next decade will reward most, and it is easier to build than it sounds. Detective-style activities make critical thinking fun instead of preachy.',
    activities: [
      { name: 'Hallucination Detective', slug: 'hallucination-detective' },
      { name: 'Deepfake & Manipulation Spotter', slug: 'deepfake-spotter' },
      { name: 'Privacy & Digital Footprint Map', slug: 'privacy-footprint' },
    ],
  },
  {
    slug: 'curiosity-wider-world',
    name: 'Curiosity & the Wider World',
    color: '#5a9b9c',
    blurb:
      'Navigating new places, noticing how the world works, and staying curious about people who live differently.',
    strengthCopy:
      'A real explorer. Keep widening the map: new foods, new routes, new questions.',
    growthCopy:
      'Curiosity grows with exposure, and you do not need plane tickets. Missions that make the everyday world strange and interesting again work from any front door.',
    activities: [
      { name: 'Street Explorer Map Maker', slug: 'street-explorer-map-maker' },
      { name: 'World Food Detective', slug: 'world-food-detective' },
      { name: 'Nature & Geography Field Study', slug: 'nature-geography-field-study' },
    ],
  },
];

export interface QuizQuestion {
  /** QuizDimension slug this question scores toward. */
  dimension: string;
  text: string;
}

/** 15 questions, grouped by dimension in display order. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Money Smarts
  {
    dimension: 'money-smarts',
    text: 'Could they pay for something at a checkout and notice if the change is wrong?',
  },
  {
    dimension: 'money-smarts',
    text: 'Are they saving up for something they actually want?',
  },
  {
    dimension: 'money-smarts',
    text: 'Could they compare two sizes or brands and pick the better deal?',
  },
  // Communication & Confidence
  {
    dimension: 'communication-confidence',
    text: 'Would they order their own meal, or ask a store clerk for help?',
  },
  {
    dimension: 'communication-confidence',
    text: 'Could they retell something that happened so a listener can actually follow it?',
  },
  {
    dimension: 'communication-confidence',
    text: 'Could they introduce themselves to a new adult and hold a short conversation?',
  },
  // Independence & Everyday Life
  {
    dimension: 'independence-everyday-life',
    text: 'Could they pack their own bag for a day out, with the things they would actually need?',
  },
  {
    dimension: 'independence-everyday-life',
    text: 'Could they make themselves a simple meal that is not cereal?',
  },
  {
    dimension: 'independence-everyday-life',
    text: 'Is there a household job they own from start to finish, without reminders?',
  },
  // Thinking & Tech Judgment
  {
    dimension: 'thinking-tech-judgment',
    text: 'When they see a surprising claim online, do they question whether it is true?',
  },
  {
    dimension: 'thinking-tech-judgment',
    text: 'When something breaks or will not work, do they try to figure it out before asking?',
  },
  {
    dimension: 'thinking-tech-judgment',
    text: 'Could they explain in their own words what AI is, and where it can be wrong?',
  },
  // Curiosity & the Wider World
  {
    dimension: 'curiosity-wider-world',
    text: 'Could they lead the way on a familiar route while you follow behind?',
  },
  {
    dimension: 'curiosity-wider-world',
    text: 'Do they ask questions about how things work, or why people do things differently?',
  },
  {
    dimension: 'curiosity-wider-world',
    text: 'Could they find your country, and one other you have talked about, on a world map?',
  },
];

export interface QuizBand {
  /** Tag-safe slug, becomes Kit tag `quiz-band-{slug}`. */
  slug: string;
  name: string;
  min: number;
  max: number;
  headline: string;
  body: string;
}

export const QUIZ_BANDS: QuizBand[] = [
  {
    slug: 'spark',
    name: 'The Spark',
    min: 0,
    max: 12,
    headline: 'Just getting started, and that is the fun part.',
    body: 'Your kid has a world of skills waiting, and none of this is about being behind. It is about exposure. Pick one focus area, run one tiny real-world mission this week, and watch how fast small wins stack.',
  },
  {
    slug: 'builder',
    name: 'The Builder',
    min: 13,
    max: 22,
    headline: 'Solid foundations. Time to hand over the keys.',
    body: 'Your kid can do a lot with you nearby. The next jump comes from ownership: real tasks, real money, real audiences, with you standing one step further back than feels comfortable.',
  },
  {
    slug: 'trailblazer',
    name: 'The Trailblazer',
    min: 23,
    max: 30,
    headline: 'Ready for bigger challenges than most school days offer.',
    body: 'Your kid is ahead of the curve, so keep them stretched. Multi-step projects are the next level: running a market stall, planning a family trip, building something real that other people use.',
  },
];

export const QUIZ_MAX_SCORE = QUIZ_QUESTIONS.length * 2;
export const QUIZ_DIMENSION_MAX = 6;

export interface QuizResult {
  total: number;
  band: QuizBand;
  /** Dimension slug → score 0-6, in QUIZ_DIMENSIONS order. */
  dimensionScores: { dimension: QuizDimension; score: number }[];
  focus: QuizDimension;
  strength: QuizDimension | null;
}

/** Compute the full result from per-question answers (0/1/2, indexed like QUIZ_QUESTIONS). */
export function computeQuizResult(answers: number[]): QuizResult {
  const dimensionScores = QUIZ_DIMENSIONS.map((dimension) => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, i) => {
      if (q.dimension === dimension.slug) score += answers[i] ?? 0;
    });
    return { dimension, score };
  });

  const total = dimensionScores.reduce((sum, d) => sum + d.score, 0);
  const band =
    QUIZ_BANDS.find((b) => total >= b.min && total <= b.max) ?? QUIZ_BANDS[0];

  // Focus = lowest score (first wins ties); strength = highest (first wins ties).
  // When every dimension scores the same, show only the focus block.
  let focusEntry = dimensionScores[0];
  let strengthEntry = dimensionScores[0];
  for (const entry of dimensionScores) {
    if (entry.score < focusEntry.score) focusEntry = entry;
    if (entry.score > strengthEntry.score) strengthEntry = entry;
  }
  const strength =
    strengthEntry.dimension.slug === focusEntry.dimension.slug
      ? null
      : strengthEntry.dimension;

  return { total, band, dimensionScores, focus: focusEntry.dimension, strength };
}
