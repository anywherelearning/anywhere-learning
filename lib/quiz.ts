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
  | 'non-finisher'
  | 'over-scheduled'
  | 'ready-for-more';

export type AgeBand = '6-8' | '9-11' | '12-14';

export const QUIZ_RESULT_IDS: QuizResultId[] = [
  'screen-stuck',
  'rescued',
  'non-finisher',
  'over-scheduled',
  'ready-for-more',
];

export const AGE_BANDS: AgeBand[] = ['6-8', '9-11', '12-14'];

// ─── Questions ───
// Q1 captures the kid's age (segmentation gold, becomes a kit-age tag).
// Q2-Q8 each offer one option per result bucket, so scoring is a clean tally.
// Option order is shuffled per question so the same bucket is never in the same
// slot (harder to game, less obvious to the parent).

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
      { label: '6 to 8', value: '6-8' },
      { label: '9 to 11', value: '9-11' },
      { label: '12 to 14', value: '12-14' },
    ],
  },
  {
    kind: 'bucket',
    prompt: "It's an unplanned free afternoon. Your kid most likely...",
    options: [
      { label: 'Reaches for a screen before anything else', bucket: 'screen-stuck' },
      { label: 'Asks you what they should do', bucket: 'rescued' },
      { label: 'Starts something big, then drifts off it', bucket: 'non-finisher' },
      { label: 'Seems a little lost without a plan', bucket: 'over-scheduled' },
      { label: 'Invents their own thing and disappears into it', bucket: 'ready-for-more' },
    ],
  },
  {
    kind: 'bucket',
    prompt: "When something gets hard or doesn't go their way, they usually...",
    options: [
      { label: 'Wait for you to step in and fix it', bucket: 'rescued' },
      { label: 'Try a few angles before asking for help', bucket: 'ready-for-more' },
      { label: 'Give up quickly and want to escape to a screen', bucket: 'screen-stuck' },
      { label: 'Drift off to something new and leave it half-done', bucket: 'non-finisher' },
      { label: "Get flustered, they're not used to working through it alone", bucket: 'over-scheduled' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'Which sounds most like a typical week at your house?',
    options: [
      { label: 'Packed. Lessons, teams, somewhere to be most days', bucket: 'over-scheduled' },
      { label: 'Half-finished projects lying around everywhere', bucket: 'non-finisher' },
      { label: 'Pretty self-directed, I just keep them stocked with ideas', bucket: 'ready-for-more' },
      { label: "We do a lot together, I'm often the one keeping them busy", bucket: 'rescued' },
      { label: 'Honestly, a lot of it is screen time', bucket: 'screen-stuck' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'When they start a project or a new idea, what usually happens?',
    options: [
      { label: 'They take it further than I expected', bucket: 'ready-for-more' },
      { label: 'They need me right beside them or it stalls', bucket: 'rescued' },
      { label: 'Big enthusiastic start, then it fizzles before the end', bucket: 'non-finisher' },
      { label: 'It competes with the screen, and the screen wins', bucket: 'screen-stuck' },
      { label: "They rarely start one, there isn't much open time for it", bucket: 'over-scheduled' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'Chores and responsibilities around the house go...',
    options: [
      { label: 'Started, then abandoned halfway, like a half-made bed', bucket: 'non-finisher' },
      { label: "Only if there's a screen reward waiting after", bucket: 'screen-stuck' },
      { label: 'Fine, but only if I walk them through each step', bucket: 'rescued' },
      { label: "Not as much as I'd like, life's just too busy", bucket: 'over-scheduled' },
      { label: 'They handle a few real ones on their own', bucket: 'ready-for-more' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'Which sentence sounds most like your home lately?',
    options: [
      { label: '“Life’s crazy busy, we’re always on the move.”', bucket: 'over-scheduled' },
      { label: '“I’m a little tired of doing everything myself.”', bucket: 'rescued' },
      { label: '“It’s a constant battle over screen time.”', bucket: 'screen-stuck' },
      { label: '“They’re doing amazing, I just want to keep up with them.”', bucket: 'ready-for-more' },
      { label: '“The house is full of half-finished projects and games.”', bucket: 'non-finisher' },
    ],
  },
  {
    kind: 'bucket',
    prompt: 'The skill you most want them to build right now is...',
    options: [
      { label: 'Taking on bigger, real-world challenges', bucket: 'ready-for-more' },
      { label: 'Making their own fun without a plan', bucket: 'over-scheduled' },
      { label: 'Following through and finishing what they start', bucket: 'non-finisher' },
      { label: 'Doing hard things without being rescued', bucket: 'rescued' },
      { label: 'Knowing when to put the screen down', bucket: 'screen-stuck' },
    ],
  },
];

// ─── Results ───

/** A hand-picked activity shown on the result as "where I'd start". */
export interface ResultActivity {
  /** Product slug, links to /shop/{slug}. */
  slug: string;
  /** Display name (kept in sync with the catalog). */
  name: string;
  /** Category slug (for future use / card accent). */
  category: string;
  /** One-line reason it fits this kid. */
  note: string;
}

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
  /**
   * A concrete, do-it-this-weekend micro-action tied to the gap. No product,
   * no prep: a real-life prompt that gives the parent an instant free win
   * before any ask. This is the heart of the "Real-World Skills Plan."
   */
  saturday: string;
  /** Three activities to start with: the "here's your fix" that leads to the trial. */
  activities: ResultActivity[];
}

export const RESULTS: Record<QuizResultId, QuizResult> = {
  'screen-stuck': {
    id: 'screen-stuck',
    title: 'The Screen-Stuck Kid',
    tagline: 'Bright kid, magnetic screen.',
    gapTag: 'screens',
    gapLabel: 'Knowing when to put the screen down, and having something better to reach for',
    accent: '#C97B5C',
    description:
      "You know the moment: a free afternoon, and within about ninety seconds the tablet is out. Not because they're lazy, but because screens are built to be the easiest thing in any room, so boredom takes the path of least resistance. The good news is the pull isn't as strong as it looks. Put something real and hands-on in front of them, a bit of mess, something to build, and the screen loses most of its magic fast. The fix was never a bigger fight over devices. It's giving boredom a better place to land.",
    saturday:
      "This Saturday, hand them $20 and the list for one meal, and let them run the whole trip: find each thing, weigh the produce, pay at the till. A real mission beats the screen almost every time.",
    activities: [
      { slug: 'kitchen-science-lab', name: 'Kitchen Science Lab', category: 'creativity-maker', note: 'Hands-on, a little messy, hard to look away from' },
      { slug: 'rube-goldberg-machine', name: 'Build a Rube Goldberg Machine', category: 'creativity-maker', note: 'The addictive, hands-on kind of fun' },
      { slug: 'square-foot-safari', name: 'Square Foot Safari', category: 'outdoor-learning', note: 'Gets them outside and looking' },
    ],
  },
  rescued: {
    id: 'rescued',
    title: 'The Rescued Kid',
    tagline: 'Capable kid, a little over-helped.',
    gapTag: 'independence',
    gapLabel: 'Doing hard things without being rescued',
    accent: '#588157',
    description:
      "It usually shows up small: they hit the first snag and you hear “can you just do it?” before they've really tried. This one comes from love. It's faster to do it ourselves, so we do, and kids quietly learn that waiting works better than trying. But your kid is more capable than the current setup lets them show. Hand them something real, sit on your hands through the wobbly part, and let them feel the win of figuring it out on their own. That feeling is what builds the next one.",
    saturday:
      "This Saturday, pick one thing they'd normally ask you to do (make their own lunch, fix the bike tire) and say “you've got this, I'm right here if you're stuck.” Then sit on your hands through the wobbly part. The win is theirs to feel.",
    activities: [
      { slug: 'solo-mission', name: 'The Solo Mission', category: 'emotional-social-skills', note: 'A real thing, start to finish, on their own' },
      { slug: 'smart-shopper', name: 'Smart Shopper Lab', category: 'real-world-math', note: 'They make the call, not you' },
      { slug: 'emergency-ready', name: 'Emergency Ready Challenge', category: 'planning-problem-solving', note: 'A grown-up job they own, no rescue needed' },
    ],
  },
  'non-finisher': {
    id: 'non-finisher',
    title: 'The Non-Finisher',
    tagline: 'Big starts, unfinished middles.',
    gapTag: 'follow-through',
    gapLabel: 'Planning something, sticking with it, and seeing it through',
    accent: '#B6913F',
    description:
      "Picture the shelf: the Lego set that's three-quarters built, the notebook with a brilliant first page and then nothing. The ideas are never the problem, and neither is the excitement. What's still forming is the muscle in the middle, planning it out and pushing through the boring part to actually land it. That muscle has a name, executive function, and it's built, not born. Real projects with a clear start and a real finish are how it grows, one completed thing at a time.",
    saturday:
      "This Saturday, pick one small thing and finish it together in a single afternoon, start to done. Bake it, build it, film it, whatever it is. Don't stop until it's actually finished. The whole lesson lives in crossing the line.",
    activities: [
      { slug: 'board-game-studio', name: 'Board Game Studio', category: 'creativity-maker', note: 'Design, build, and actually play the finished game' },
      { slug: 'mini-movie', name: 'Create a Mini Movie', category: 'creativity-maker', note: 'Write, film, edit, premiere: a real ending' },
      { slug: 'time-energy-planner', name: 'Time & Energy Planner', category: 'planning-problem-solving', note: 'The follow-through muscle, made visible' },
    ],
  },
  'over-scheduled': {
    id: 'over-scheduled',
    title: 'The Over-Scheduled Kid',
    tagline: 'Full calendar, quiet imagination.',
    gapTag: 'free-play',
    gapLabel: 'Open, unstructured time to invent, build, and follow their own ideas',
    accent: '#6B8E6B',
    description:
      "Here's the tell: give them an unscheduled hour and they ask “so what are we doing now?” Their week is full in all the good ways, lessons, teams, practices, but the other kind of time has quietly disappeared, the make-your-own-fun, no-instructions kind. That's exactly where imagination, self-direction, and a tolerance for boredom come from. They don't need one more thing on the calendar. They need activities that hand them the wheel and let them drive.",
    saturday:
      "This Saturday, block one hour with nothing planned and no screens. Set out a few odd materials (tape, cardboard, string) and walk away. The “I'm bored” that follows is exactly where their own ideas start.",
    activities: [
      { slug: 'boredom-toolkit', name: 'The Boredom Toolkit', category: 'emotional-social-skills', note: 'Relearning how to make their own fun' },
      { slug: 'invent-a-sport', name: 'Invent a New Sport', category: 'creativity-maker', note: '“You’re the boss” invention, no template' },
      { slug: 'imaginary-world', name: 'Build an Imaginary World', category: 'creativity-maker', note: 'Wide-open, kid-directed play' },
    ],
  },
  'ready-for-more': {
    id: 'ready-for-more',
    title: 'The Ready-for-More Kid',
    tagline: 'Doing great, hungry for bigger.',
    gapTag: 'level-up',
    gapLabel: 'Bigger, real-world challenges to grow into',
    accent: '#3A5A40',
    description:
      "You already know the look: they finish the thing faster than you expected, then glance up like “okay, what else?” Honestly, you're doing a lot right, your kid is curious, fairly independent, and growing. The goal now isn't to fix anything, it's to keep raising the bar so a capable kid doesn't start to coast. Kids like this stay lit up when the challenge is real and the stakes feel a little grown-up. This is the fun part: stretching an already-capable kid into an even more capable one.",
    saturday:
      "This Saturday, hand them one real grown-up job to own end to end: plan Sunday dinner on a $30 budget, or price out and run a small yard sale. Give them the wheel, then genuinely stay out of it. Capable kids grow on real stakes.",
    activities: [
      { slug: 'micro-business', name: 'Micro-Business Challenge', category: 'entrepreneurship', note: 'Run something real' },
      { slug: 'community-impact', name: 'Community Impact Project', category: 'planning-problem-solving', note: 'Big, real-world, matters' },
      { slug: 'build-ai-helper', name: 'Build Your Own AI Helper', category: 'ai-literacy', note: 'Cutting-edge, future-ready stretch' },
    ],
  },
};

// Tie-break priority when two buckets score equally. Earlier wins.
// Ordered by which result is most common + most actionable to lead with;
// 'ready-for-more' is last so the flattering result only wins when it's the
// clear standout, never on a tie.
export const RESULT_PRIORITY: QuizResultId[] = [
  'rescued',
  'screen-stuck',
  'non-finisher',
  'over-scheduled',
  'ready-for-more',
];

/**
 * Tally the bucket answers and return the winning result id.
 * On a tie, the earlier entry in RESULT_PRIORITY wins.
 */
export function scoreBuckets(buckets: QuizResultId[]): QuizResultId {
  const counts: Record<QuizResultId, number> = {
    'screen-stuck': 0,
    rescued: 0,
    'non-finisher': 0,
    'over-scheduled': 0,
    'ready-for-more': 0,
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

export interface TopTwo {
  /** The winning result (the archetype + primary gap). */
  primary: QuizResultId;
  /**
   * The runner-up GAP the answers point to, or null when there isn't a clear
   * second one. 'ready-for-more' is never a secondary gap: it's the "no gap
   * here" bucket, so surfacing it as a weakness would be dishonest.
   */
  secondaryGap: QuizResultId | null;
}

/**
 * The full "top 2 skill gaps" the Real-World Skills Plan is built on. The
 * primary is scored exactly as before (so nothing about the main result
 * changes); the secondary is the next-highest-scoring real gap, personalized
 * to how this kid actually answered.
 */
export function scoreTopTwo(buckets: QuizResultId[]): TopTwo {
  const counts: Record<QuizResultId, number> = {
    'screen-stuck': 0,
    rescued: 0,
    'non-finisher': 0,
    'over-scheduled': 0,
    'ready-for-more': 0,
  };
  for (const b of buckets) {
    if (b in counts) counts[b] += 1;
  }

  const primary = scoreBuckets(buckets);

  // Runner-up: highest-scoring bucket that isn't the primary, has at least one
  // vote, and represents an actual gap. RESULT_PRIORITY order breaks ties
  // toward the more common / more actionable gap, same as the primary.
  let secondaryGap: QuizResultId | null = null;
  let bestCount = 0;
  for (const id of RESULT_PRIORITY) {
    if (id === primary || id === 'ready-for-more') continue;
    if (counts[id] > bestCount) {
      bestCount = counts[id];
      secondaryGap = id;
    }
  }

  return { primary, secondaryGap };
}

export function isQuizResultId(value: unknown): value is QuizResultId {
  return typeof value === 'string' && (QUIZ_RESULT_IDS as string[]).includes(value);
}

export function isAgeBand(value: unknown): value is AgeBand {
  return typeof value === 'string' && (AGE_BANDS as string[]).includes(value);
}
