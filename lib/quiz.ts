// ─── Life-Skill Quiz: single source of truth ───
//
// Used by both the interactive quiz component (rendering) and the
// /api/quiz route (validation + tag building), so the questions, results,
// and tag vocabulary never drift apart.
//
// Funnel design (mirrors the SELF_FUNNEL_GUIDES pattern in convertkit.ts):
// quiz-takers get a `quiz-taker` + `quiz-result:{id}` tag set, NOT the generic
// `lead` tag, so they enter their own Kit sequence (result email -> nurture ->
// trial invite) instead of the default 7-Activities funnel.

export type QuizResultId =
  | 'screen-stuck'
  | 'rescued'
  | 'bored-brainiac'
  | 'almost-ready';

export type AgeBand = '4-6' | '7-9' | '10-12' | '13-plus';

export const QUIZ_RESULT_IDS: QuizResultId[] = [
  'screen-stuck',
  'rescued',
  'bored-brainiac',
  'almost-ready',
];

export const AGE_BANDS: AgeBand[] = ['4-6', '7-9', '10-12', '13-plus'];

// ─── Questions ───
// Q1 captures the kid's age (segmentation gold, becomes a kit-age tag).
// Q2-Q7 each offer one option per result bucket, so scoring is a clean tally.

export interface AgeOption {
  label: string;
  value: AgeBand;
}

export interface BucketOption {
  label: string;
  bucket: QuizResultId;
}

export type QuizQuestion =
  | { kind: 'age'; prompt: string; options: AgeOption[] }
  | { kind: 'bucket'; prompt: string; options: BucketOption[] };

export const QUESTIONS: QuizQuestion[] = [
  {
    kind: 'age',
    prompt: 'First, how old is your kid?',
    options: [
      { label: '4 to 6', value: '4-6' },
      { label: '7 to 9', value: '7-9' },
      { label: '10 to 12', value: '10-12' },
      { label: '13 and up', value: '13-plus' },
    ],
  },
  {
    kind: 'bucket',
    prompt: "It's an unplanned free afternoon. Your kid most likely...",
    options: [
      { label: 'Reaches for a screen first', bucket: 'screen-stuck' },
      { label: 'Asks you what they should do', bucket: 'rescued' },
      { label: 'Says "there’s nothing to do" and gets restless', bucket: 'bored-brainiac' },
      { label: 'Invents their own thing to do', bucket: 'almost-ready' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'When a task gets hard or something goes wrong...',
    options: [
      { label: "They'd rather watch someone do it on a screen", bucket: 'screen-stuck' },
      { label: 'They wait for you to step in and fix it', bucket: 'rescued' },
      { label: "They lose interest, it wasn't challenging enough to fight for", bucket: 'bored-brainiac' },
      { label: 'They try a couple of ways before asking for help', bucket: 'almost-ready' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'Around the house, your kid can...',
    options: [
      { label: 'Do chores, mostly if there’s a screen reward after', bucket: 'screen-stuck' },
      { label: 'Do them, but only if you walk them through each step', bucket: 'rescued' },
      { label: 'Do them easily, but finds them boring', bucket: 'bored-brainiac' },
      { label: 'Handle a few real responsibilities on their own', bucket: 'almost-ready' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'Which sentence sounds most like your home lately?',
    options: [
      { label: '"We’d all honestly rather be on our devices."', bucket: 'screen-stuck' },
      { label: '"I do a lot for them that they could probably do themselves."', bucket: 'rescued' },
      { label: '"They’re sharp, but under-stimulated and restless."', bucket: 'bored-brainiac' },
      { label: '"They’re doing well, I just want to keep them growing."', bucket: 'almost-ready' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'How much of your kid’s free time is screen time?',
    options: [
      { label: 'Most of it, honestly', bucket: 'screen-stuck' },
      { label: 'A fair amount, but independence is the bigger issue', bucket: 'rescued' },
      { label: 'Less than people think, they’re just bored by what’s offered', bucket: 'bored-brainiac' },
      { label: 'We’ve got a decent balance', bucket: 'almost-ready' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'The skill you most want them to build right now is...',
    options: [
      { label: 'Knowing when to put the screen down', bucket: 'screen-stuck' },
      { label: 'Doing hard things without being rescued', bucket: 'rescued' },
      { label: 'Pouring that brainpower into something real', bucket: 'bored-brainiac' },
      { label: 'Taking on bigger real-world challenges', bucket: 'almost-ready' },
    ],
  },
];

// ─── Results ───

export interface QuizResult {
  id: QuizResultId;
  title: string;
  tagline: string;
  /** Becomes the `gap:{gapTag}` Kit tag for segmented follow-up. */
  gapTag: string;
  /** Human-readable version of the gap, shown on the result card. */
  gapLabel: string;
  description: string;
  /** Accent color token (hex) for the result card. */
  accent: string;
}

export const RESULTS: Record<QuizResultId, QuizResult> = {
  'screen-stuck': {
    id: 'screen-stuck',
    title: 'The Screen-Stuck Kid',
    tagline: 'Bright kid, magnetic screen.',
    gapTag: 'screens',
    gapLabel: 'Knowing when to put the screen down, and what to do instead',
    accent: '#C97B5C',
    description:
      "Your kid isn't lazy. Screens are engineered to be the path of least resistance, and right now they're winning the battle for your kid's free time. The good news is that the pull of a screen fades fast when there's something real and hands-on in front of them. The fix isn't a fight over devices. It's giving boredom somewhere better to go.",
  },
  rescued: {
    id: 'rescued',
    title: 'The Rescued Kid',
    tagline: 'Capable kid, a little over-helped.',
    gapTag: 'independence',
    gapLabel: 'Doing hard things without being rescued',
    accent: '#588157',
    description:
      "This one comes from love. It's faster to do it ourselves, so we do, and our kids quietly learn to wait for rescue instead of trying first. Your kid is more capable than the current setup lets them show. The shift is small: hand them real responsibility, resist the urge to jump in, and let them feel the win of figuring it out on their own.",
  },
  'bored-brainiac': {
    id: 'bored-brainiac',
    title: 'The Bored Brainiac',
    tagline: 'Sharp mind, not enough to chew on.',
    gapTag: 'challenge',
    gapLabel: 'Pouring that brainpower into something real',
    accent: '#B6913F',
    description:
      "Your kid has the horsepower and nowhere to put it. “I'm bored” usually means “nothing here is worthy of my brain.” Easy wins and busywork don't satisfy a kid like this. They need real problems, real stakes, and the kind of hands-on challenge that actually makes them think. Give them that, and the restlessness turns into focus.",
  },
  'almost-ready': {
    id: 'almost-ready',
    title: 'The Almost-Ready Kid',
    tagline: 'Doing great, ready for more.',
    gapTag: 'level-up',
    gapLabel: 'Taking on bigger real-world challenges',
    accent: '#3A5A40',
    description:
      "Honestly? You're doing a lot right. Your kid is curious, fairly independent, and growing. The goal now isn't to fix anything, it's to keep raising the bar so they don't coast. Kids who are doing well still need bigger, real-world challenges to grow into. This is the fun part: stretching a capable kid into an even more capable one.",
  },
};

// Tie-break priority when two buckets score equally. Earlier wins.
// Ordered by which result is most common + most actionable to lead with.
export const RESULT_PRIORITY: QuizResultId[] = [
  'rescued',
  'screen-stuck',
  'bored-brainiac',
  'almost-ready',
];

/**
 * Tally the bucket answers and return the winning result id.
 * On a tie, the earlier entry in RESULT_PRIORITY wins.
 */
export function scoreBuckets(buckets: QuizResultId[]): QuizResultId {
  const counts: Record<QuizResultId, number> = {
    'screen-stuck': 0,
    rescued: 0,
    'bored-brainiac': 0,
    'almost-ready': 0,
  };
  for (const b of buckets) {
    if (b in counts) counts[b] += 1;
  }

  let best = RESULT_PRIORITY[0];
  let bestCount = -1;
  for (const id of RESULT_PRIORITY) {
    if (counts[id] > bestCount) {
      best = id;
      bestCount = counts[id];
    }
  }
  return best;
}

export function isQuizResultId(value: unknown): value is QuizResultId {
  return typeof value === 'string' && (QUIZ_RESULT_IDS as string[]).includes(value);
}

export function isAgeBand(value: unknown): value is AgeBand {
  return typeof value === 'string' && (AGE_BANDS as string[]).includes(value);
}
