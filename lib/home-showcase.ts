/**
 * Data for the homepage showcase sections (hero "next stop" card, the trail
 * steps, the filterable activity grid, the membership include-list and FAQ).
 *
 * Lives in lib/ because both the server page (JSON-LD, static sections) and the
 * client islands (filtering, toggles, accordion) read from the same arrays.
 * Keeping one copy means the FAQ JSON-LD can never drift from the rendered FAQ.
 */

import type { NextStopActivity } from '@/components/shared/NextStopCard';

export interface ShowcaseActivity {
  slug: string;
  title: string;
  category: string;
  /** Category accent, used for the card's left edge and the dot in the hero card. */
  color: string;
  /** Darker variant of `color` where it sits on cream as small text. */
  colorText: string;
  time: string;
  photo: string;
  blurb: string;
}

/**
 * Three real activities for each of the nine shop categories, so the homepage
 * filter can show a full row whichever category is picked. Every entry is a
 * real product with real cover art, so every card links somewhere.
 *
 * Order matters in one place: the hero card opens on the first entry.
 */
export const SHOWCASE_ACTIVITIES: ShowcaseActivity[] = [
  {
    slug: 'party-planner-math',
    title: 'Party Planner Math',
    category: 'Real-World Math',
    color: '#8b7355',
    colorText: '#8b7355',
    time: 'Multi-day',
    photo: '/products/party-planner-math.jpg',
    blurb: 'Plan a party from guest list to budget.',
  },
  {
    slug: 'snack-mission',
    title: 'The $20 Snack Mission',
    category: 'Real-World Math',
    color: '#8b7355',
    colorText: '#8b7355',
    time: 'Half-day',
    photo: '/products/snack-mission.jpg',
    blurb: 'A real budget, a real store, and a real mission.',
  },
  {
    slug: 'budget-challenge',
    title: 'Real-Life Budget Challenge',
    category: 'Real-World Math',
    color: '#8b7355',
    colorText: '#8b7355',
    time: 'Half-day',
    photo: '/products/budget-challenge.jpg',
    blurb: 'A real budget for a real day out, trade-offs and all.',
  },
  {
    slug: 'write-like-a-pro',
    title: 'Write It Like a Pro',
    category: 'Communication & Writing',
    color: '#5b8fa8',
    colorText: '#5b8fa8',
    time: '3.5 hrs',
    photo: '/products/write-like-a-pro.jpg',
    blurb: 'A topic they care about, written for a real audience.',
  },
  {
    slug: 'family-debate-night',
    title: 'Family Debate Night',
    category: 'Communication & Writing',
    color: '#5b8fa8',
    colorText: '#5b8fa8',
    time: '1 hr',
    photo: '/products/family-debate-night.jpg',
    blurb: 'Persuade, listen, and disagree without it going sideways.',
  },
  {
    slug: 'community-tour-guide',
    title: 'Community Tour Guide',
    category: 'Communication & Writing',
    color: '#5b8fa8',
    colorText: '#5b8fa8',
    time: 'Multi-day',
    photo: '/products/community-tour-guide.jpg',
    blurb: 'Write and lead a real tour of your own town.',
  },
  {
    slug: 'media-info-check',
    title: 'Media & Info Check',
    category: 'AI & Digital',
    color: '#7b88a8',
    colorText: '#7b88a8',
    time: '45 min',
    photo: '/products/media-info-check.jpg',
    blurb: 'Five reliability signals, then a call: reliable or not.',
  },
  {
    slug: 'ai-basics',
    title: 'AI Basics: Myths, Facts & Smart Rules',
    category: 'AI & Digital',
    color: '#7b88a8',
    colorText: '#7b88a8',
    time: 'Half-day',
    photo: '/products/ai-basics.jpg',
    blurb: 'What AI is, what it isn\'t, and how to use it well.',
  },
  {
    slug: 'algorithm-awareness',
    title: 'Algorithm Awareness',
    category: 'AI & Digital',
    color: '#7b88a8',
    colorText: '#7b88a8',
    time: '1 hr',
    photo: '/products/algorithm-awareness.jpg',
    blurb: 'Why you\'re seeing this, and how to take back the feed.',
  },
  {
    slug: 'board-game-studio',
    title: 'Board Game Studio',
    category: 'Creativity & Making',
    color: '#c47a8f',
    colorText: '#c47a8f',
    time: 'Multi-day',
    photo: '/products/board-game-studio.jpg',
    blurb: 'Design, build and playtest an original board game.',
  },
  {
    slug: 'rube-goldberg-machine',
    title: 'Build a Rube Goldberg Machine',
    category: 'Creativity & Making',
    color: '#c47a8f',
    colorText: '#c47a8f',
    time: '4 hrs',
    photo: '/products/rube-goldberg-machine.jpg',
    blurb: 'An absurdly complicated way to do one simple thing.',
  },
  {
    slug: 'invent-a-sport',
    title: 'Invent a New Sport',
    category: 'Creativity & Making',
    color: '#c47a8f',
    colorText: '#c47a8f',
    time: '6 hrs',
    photo: '/products/invent-a-sport.jpg',
    blurb: 'Original rules, homemade kit, playtested with family.',
  },
  {
    slug: 'micro-business',
    title: 'Micro-Business Challenge',
    category: 'Entrepreneurship',
    color: '#b5803e',
    colorText: '#b5803e',
    time: 'Multi-day',
    photo: '/products/micro-business.jpg',
    blurb: 'Set prices, build a brand, pitch it, do the profit math.',
  },
  {
    slug: 'brand-builder',
    title: 'Brand Builder',
    category: 'Entrepreneurship',
    color: '#b5803e',
    colorText: '#b5803e',
    time: '3 hrs',
    photo: '/products/brand-builder.jpg',
    blurb: 'Name, logo, story and voice, built from scratch.',
  },
  {
    slug: 'customer-discovery',
    title: 'Customer Discovery Challenge',
    category: 'Entrepreneurship',
    color: '#b5803e',
    colorText: '#b5803e',
    time: 'Half-day',
    photo: '/products/customer-discovery.jpg',
    blurb: 'Interview real customers, then fix the idea.',
  },
  {
    slug: 'problem-solver',
    title: 'Problem-Solver Studio',
    category: 'Planning & Problem-Solving',
    color: '#c4674a',
    colorText: '#c4674a',
    time: 'Multi-day',
    photo: '/products/problem-solver.jpg',
    blurb: 'Pick a real problem, prototype it, test it, improve it.',
  },
  {
    slug: 'emergency-ready',
    title: 'Emergency Ready Challenge',
    category: 'Planning & Problem-Solving',
    color: '#c4674a',
    colorText: '#c4674a',
    time: 'Half-day',
    photo: '/products/emergency-ready.jpg',
    blurb: 'Clear thinking under pressure, practised before it counts.',
  },
  {
    slug: 'travel-day',
    title: 'Travel Day Itinerary Challenge',
    category: 'Planning & Problem-Solving',
    color: '#c4674a',
    colorText: '#c4674a',
    time: 'Half-day',
    photo: '/products/travel-day.jpg',
    blurb: 'Plan the day, then handle the curveball.',
  },
  {
    slug: 'outdoor-stem-challenges',
    title: 'Outdoor STEM Challenge Cards',
    category: 'Outdoor Learning',
    color: '#6b8e6b',
    colorText: '#6b8e6b',
    time: 'Half-day',
    photo: '/products/outdoor-stem-challenges.jpg',
    blurb: 'Twenty builds using whatever nature provides.',
  },
  {
    slug: 'square-foot-safari',
    title: 'Square Foot Safari',
    category: 'Outdoor Learning',
    color: '#6b8e6b',
    colorText: '#6b8e6b',
    time: '2 hrs',
    photo: '/products/square-foot-safari.jpg',
    blurb: 'Study every living thing in one square of ground.',
  },
  {
    slug: 'camouflage-challenge',
    title: 'Camouflage Challenge',
    category: 'Outdoor Learning',
    color: '#6b8e6b',
    colorText: '#6b8e6b',
    time: '1 hr',
    photo: '/products/camouflage-challenge.jpg',
    blurb: 'Hide it in plain sight, then time the search.',
  },
  {
    slug: 'currency-market-math',
    title: 'Currency & Market Math',
    category: 'Worldschooling',
    color: '#588157',
    colorText: '#588157',
    time: '2 hrs',
    photo: '/products/currency-market-math.jpg',
    blurb: 'Convert, compare and count change in a real market.',
  },
  {
    slug: 'local-language-mission',
    title: 'Local Language Mission',
    category: 'Worldschooling',
    color: '#588157',
    colorText: '#588157',
    time: 'Multi-day',
    photo: '/products/local-language-mission.jpg',
    blurb: 'Real missions that make a new language stick.',
  },
  {
    slug: 'cultural-celebration-journal',
    title: 'Cultural Celebration Journal',
    category: 'Worldschooling',
    color: '#588157',
    colorText: '#588157',
    time: 'Multi-day',
    photo: '/products/cultural-celebration-journal.jpg',
    blurb: 'Document a celebration the way a traveller would.',
  },
  {
    slug: 'decision-lab',
    title: 'What Would You Do? Decision Lab',
    category: 'Emotional & Social Skills',
    color: '#b6748a',
    colorText: '#b6748a',
    time: '45 min',
    photo: '/products/decision-lab.jpg',
    blurb: 'Real scenarios, weighed options, choices they justify.',
  },
  {
    slug: 'big-feelings-lab',
    title: 'The Big Feelings Lab',
    category: 'Emotional & Social Skills',
    color: '#b6748a',
    colorText: '#b6748a',
    time: '1 hr',
    photo: '/products/big-feelings-lab.jpg',
    blurb: 'Name it, find it in the body, watch it pass.',
  },
  {
    slug: 'conflict-fix',
    title: 'The Conflict Fix',
    category: 'Emotional & Social Skills',
    color: '#b6748a',
    colorText: '#b6748a',
    time: '1 hr',
    photo: '/products/conflict-fix.jpg',
    blurb: 'A real script for fights with siblings and friends.',
  },
];

export interface TrailStep {
  n: string;
  title: string;
  body: string;
  /** Still shown on phones, and the "before" frame in the desktop demo. */
  img: string;
  pos: string;
  alt: string;
  /**
   * Desktop demo only (components/home/v2/TrailDemo.tsx). The frame the click
   * produces: the cursor lands on `cursor`, then this cross-fades in. Both are
   * real member-zone captures. Leave `after` undefined and the beat simply
   * holds on `img`, which is what a missing capture should look like rather
   * than a recreated screen.
   */
  after?: string;
  afterAlt?: string;
  /**
   * Push the camera into part of the frame. `x`/`y` are a background-position,
   * so aim them at a region the baked-in signpost isn't in when a live card is
   * going to sit on top.
   */
  zoom?: { scale: number; x: number; y: number };
  /**
   * Renders the real NextStopCard over the frame and swaps its activity on the
   * click. Used where a still can't show the change: the swap is the whole
   * point of the step, and no capture of it exists.
   */
  swap?: { from: NextStopActivity; to: NextStopActivity };
  /** Where the cursor rests, as a percentage of the panel. */
  cursor: { x: number; y: number };
  /**
   * How long the beat sits on its opening state before the click lands.
   * Defaults to TRAIL_AIM_MS, which is just cursor travel. Raise it where
   * there's something to read first: on the swap beat you have to take in the
   * activity being replaced or the change means nothing.
   */
  aimMs?: number;
}

/**
 * Demo timing, shared by TrailSteps (which advances the beat) and TrailDemo
 * (which fires the click inside it), so the two can't drift apart.
 *
 * A beat is aim + hold: the cursor travels, the click lands, the result sits
 * there. Hold is fixed so every payoff gets the same read; aim varies per step,
 * because a cursor crossing to a button needs less time than a title you have
 * to read before it changes.
 */
export const TRAIL_AIM_MS = 900;
/**
 * 2.6s was enough to see the result but not to finish reading it: the card's
 * description ran past the end of the beat. Every step gets a second longer.
 */
export const TRAIL_HOLD_MS = 3600;

export const TRAIL_STEPS: TrailStep[] = [
  {
    n: '1',
    title: 'Set up your explorers',
    body: "Names, ages, the skills you care about. Two minutes, once. Each child becomes an explorer on your family's trail.",
    img: '/product-shots/app-nextstop.webp',
    pos: 'center',
    alt: "The family trail, with Liam and Elena partway along it",
    after: '/product-shots/app-explorer.webp',
    afterAlt: 'An explorer opened, showing what you can change for that child',
    // Liam, standing on the trail.
    cursor: { x: 38, y: 77 },
  },
  {
    n: '2',
    title: 'We pick your next stop',
    body: "No scrolling, no second-guessing. Matched to your kids and the time you've got. Not feeling it? Different one, or skip the area.",
    img: '/product-shots/app-nextstop.webp',
    pos: 'center',
    alt: 'The next activity on the trail, ready to swap for a different one',
    // No capture shows an activity swapping, so this beat renders the real
    // NextStopCard live and changes it on the click. The camera pushes into the
    // hillside rather than the signpost: the screenshot has its own card baked
    // into the bottom right, and two cards on screen would be nonsense.
    zoom: { scale: 1.85, x: 12, y: 68 },
    swap: {
      from: {
        title: 'Party Planner Math',
        meta: 'Real-World Math · Multi-day',
        blurb: 'Plan a party from guest list to budget.',
      },
      to: {
        title: 'Outdoor STEM Challenge Cards',
        meta: 'Physical & Outdoor · Half-day',
        blurb: '20 outdoor STEM challenges that use the natural world as a laboratory.',
      },
    },
    // "Different one", inside the live card.
    cursor: { x: 63, y: 88 },
    // Long enough to actually read "Party Planner Math" before it's replaced.
    // At the default the swap happened before the eye had landed on the title,
    // so the beat looked like a flicker rather than a choice.
    aimMs: 2300,
  },
  {
    n: '3',
    title: 'Do it together, mark it reached',
    body: 'Tap "We reached it." Your explorers move forward and earn gear for the backpack, 72 finds to collect.',
    img: '/product-shots/app-nextstop.webp',
    pos: 'center',
    alt: 'The next stop on the trail, ready to be marked as reached',
    after: '/product-shots/app-newfinds.webp',
    afterAlt: 'Gear earned by both explorers after finishing the activity',
    // The "We reached it" button on the next-stop card.
    cursor: { x: 81, y: 87 },
  },
];

/**
 * The 9 shop categories. Kept separate from SKILL_AREAS on purpose: the shop
 * runs on these nine, the member Library/Record/Focus run on the twelve Skills
 * Map areas below. See lib/roadmap.ts.
 */
export const SHOP_CATEGORIES = [
  'Real-World Math',
  'Creativity & Making',
  'AI & Digital',
  'Entrepreneurship',
  'Communication & Writing',
  'Planning & Problem-Solving',
  'Outdoor Learning',
  'Worldschooling',
  'Emotional & Social Skills',
];


/** The 12 Future-Ready Skills Map areas the Record reports coverage across. */
export const SKILL_AREAS = [
  'Emotional Intelligence',
  'Reading & Media',
  'Writing',
  'Real-World Math',
  'Critical Thinking',
  'Communication',
  'Self-Management',
  'Creativity & Making',
  'Citizenship & Character',
  'Life Skills',
  'Physical & Outdoor',
  'AI & Digital',
];

/** What the one membership price covers, shown as a two-column checklist. */
export const MEMBERSHIP_INCLUDES = [
  'All 120+ activity guides, across nine topics',
  'Three skill levels in every guide: Explore, Develop, Extend',
  'Your next stop picked for you, matched to each child',
  'An explorer, a trail and a backpack per child, 72 finds',
  'A new skill, seasonal set and family challenge every month',
  'Reads, videos, podcasts, games and apps around each theme',
  'Printable home education record across twelve skill areas',
  'New activities added every quarter, at no extra cost',
];

export interface ShowcaseFaq {
  q: string;
  a: string;
}

/** Rendered by the accordion AND serialised into FAQPage JSON-LD. One source. */
export const HOME_FAQS: ShowcaseFaq[] = [
  {
    q: 'Is this only for homeschoolers?',
    a: 'No, most of our members actually have kids in school. The activities work in the rhythm you already have, whether that is a Saturday morning or a stretch after dinner.',
  },
  {
    q: 'What ages does this work for?',
    a: 'Ages 6 to 14. Every activity has three levels, Explore, Develop and Extend, so siblings work side by side without anyone feeling overwhelmed or bored.',
  },
  {
    q: "What about a kid who can't sit still?",
    a: 'Nothing here is timed or graded, and you pitch each activity where your kid actually is. If the table is where it all falls apart in your house, none of this happens at a table.',
  },
  {
    q: 'How many kids can I add?',
    a: 'All of them. Each child gets their own explorer, their own trail and their own record, at the same one price.',
  },
  {
    q: 'How much time does each activity take?',
    a: 'Some are quick afternoon things, others fill a rainy Saturday. Parent prep is intentionally minimal: read the guide, grab whatever is in the kitchen drawer.',
  },
  {
    q: 'Do I need to print anything?',
    a: 'No. You open the guide on your phone, tablet or laptop and follow along. The only thing built to print is your record, and only if you want it.',
  },
  {
    q: 'How is this different from free printables?',
    a: 'Pinterest gives you ideas. We give you step-by-step guides, low prep, teacher-designed, three levels each. No fill-in-the-blanks, no glittery craft that ends up in the bin.',
  },
  {
    q: 'What happens when the trial ends?',
    a: 'You are charged your chosen plan on day 15, and we email you before that. Cancel any time in the trial and you are never charged at all.',
  },
  {
    q: 'Can I cancel, and what about refunds?',
    a: 'Cancel in one click from your account, any time. After your first charge there is a 14-day money-back guarantee. Email us within 14 days for a full refund, no questions asked.',
  },
];
