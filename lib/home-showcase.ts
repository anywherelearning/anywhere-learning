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

export interface InsideTab {
  n: string;
  title: string;
  /** One or two lines. The clip does the explaining; this names what it shows. */
  body: string;
  /** Still: shown on phones, and on desktop when the tab has no clip. */
  img: string;
  alt: string;
  /** How the still sits in the 3:2 panel. Portrait captures crop from the top. */
  fit: 'contain' | 'cover';
  /**
   * Desktop clip, silent and looping, hosted on Vercel Blob. Each is the
   * screen-recorder export with its decorative border cropped off and the
   * result cut to a centred 3:2, no audio track. The exports are only ~1000px
   * wide and low bitrate, so each is lightly denoised, doubled with Lanczos
   * and sharpened before the encode: a browser would scale it up anyway on a
   * retina screen, and doing it once here with a sharpen reads crisper than
   * the browser's bilinear. Recipe in the session that made them: hqdn3d,
   * scale 2x lanczos, unsharp 5:5:0.6. Blob URLs cache for a year: a replacement
   * gets a new version suffix, never an overwrite. Leave undefined and the
   * tab holds on `img`, which is what a missing clip should look like rather
   * than a recreated screen.
   */
  video?: string;
  poster?: string;
  /** How long the panel sits on this tab before advancing. Match the clip. */
  holdMs: number;
}

/**
 * "A map, a month, a record": the three places a member actually lives, one
 * tab each, with the product playing large beside them. Replaced the
 * three-beat cursor demo plus the standalone This Month and Record sections,
 * which said the same three things across three screens of scrolling. An
 * all-three-rows version was tried and put back: the section ran three
 * screens tall again.
 */
export const INSIDE_TABS: InsideTab[] = [
  {
    n: '1',
    title: 'Your adventure map',
    body: 'Each kid is an explorer on your trail. We pick the next stop, matched to their age and the time you have. Do it together, tap We reached it, and they climb and earn gear for the backpack.',
    img: '/product-shots/app-nextstop.webp',
    alt: "The family trail, with Liam and Elena partway along it and the next stop ready",
    fit: 'contain',
    video: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-map-v5.mp4',
    poster: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-map-v5-poster.jpg',
    // The clip runs 8.7s: open an explorer, peek in the backpack, reach
    // the next stop, collect the new finds. One full pass, then move on.
    holdMs: 9200,
  },
  {
    n: '2',
    title: 'This Month',
    body: 'A skill of the month, a seasonal pick, and one small family challenge, with reads, books by age, and apps gathered around them. New subject every month.',
    img: '/product-shots/app-month-full.webp',
    alt: 'A month inside the membership: skill of the month, what to read together, and tools to try',
    fit: 'contain',
    // Versioned filename: the Blob URL is cached for a year, so a replacement
    // clip gets a new name rather than an overwrite that visitors never see.
    video: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-month-v6.mp4',
    poster: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-month-v6-poster.jpg',
    // The clip runs 8.0s: down the month page to the family challenge.
    holdMs: 8500,
  },
  {
    n: '3',
    title: 'Your record',
    body: 'Every activity you mark reached lands in a printable record, one per child: days, hours, coverage across twelve skill areas, and a dated log. You never write it up.',
    img: '/product-shots/app-record.webp',
    alt: "A child's learning record, showing coverage by skill area and a dated log of activities",
    fit: 'cover',
    video: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-record-v5.mp4',
    poster: 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/home-inside/inside-record-v5-poster.jpg',
    // The clip runs 9.6s: one child's record, coverage bars, then the log.
    holdMs: 10100,
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

/**
 * The two questions that decide the sale: am I even the audience, and why pay
 * for something Pinterest gives away. Both were only answerable at the very
 * bottom of the page, below the price, which is after the person with the
 * objection has already gone.
 *
 * Looked up out of HOME_FAQS rather than written twice, so the answer above the
 * price and the answer in the FAQ can never disagree. Editing the FAQ entry
 * edits both.
 */
const OBJECTION_QUESTIONS = [
  'Is this only for homeschoolers?',
  'How is this different from free printables?',
];

export const HOME_OBJECTIONS: ShowcaseFaq[] = OBJECTION_QUESTIONS.map((q) => {
  const faq = HOME_FAQS.find((f) => f.q === q);
  // A typo'd question here would silently drop the block, so fail loudly at
  // build time instead.
  if (!faq) throw new Error(`HOME_OBJECTIONS: no FAQ matches "${q}"`);
  return faq;
});
