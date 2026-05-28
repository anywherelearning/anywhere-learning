/**
 * Programs: done-for-you, multi-week skill journeys.
 *
 * The "do it for me" front door to the planner. A parent picks a program,
 * chooses the kid(s) and a start date, and the whole arc drops onto their
 * calendar week by week. No goals, no steppers, no configuration.
 *
 * Each program is built from activities the family already has access to, and
 * maps to a sellable bundle: buying the bundle is how a non-member unlocks the
 * path. The sequence is the product à la carte can't give them.
 *
 * Activity slugs are validated against lib/activity-metadata at build time
 * (see the smoke check in the route). Titles are resolved from the catalog at
 * render so they never drift.
 */

export interface ProgramWeek {
  /** 1-indexed week number. */
  week: number;
  /** What this week is about, in plain language. */
  theme: string;
  /** Activity slugs for the week. Usually one, occasionally two. */
  activitySlugs: string[];
}

export interface Program {
  id: string;
  title: string;
  /** One-line hook. */
  tagline: string;
  /** The concrete outcome a parent is buying into. */
  outcome: string;
  /** Bundle this maps to (for unlock / cross-sell). */
  bundleSlug: string;
  /** AL category, drives theming color. */
  category: string;
  ageRange: string;
  weeks: ProgramWeek[];
}

export const PROGRAMS: Program[] = [
  {
    id: 'young-entrepreneur',
    title: 'Young Entrepreneur',
    tagline: 'Build a tiny business from idea to pitch.',
    outcome:
      'By the end, your kid has found a real problem, designed a product, priced it, branded it, and pitched it out loud.',
    bundleSlug: 'entrepreneurship-bundle',
    category: 'entrepreneurship',
    ageRange: '8-14',
    weeks: [
      { week: 1, theme: 'Find a real problem worth solving', activitySlugs: ['customer-discovery'] },
      { week: 2, theme: 'Design the product', activitySlugs: ['product-design-lab'] },
      { week: 3, theme: 'Figure out the price', activitySlugs: ['pricing-experiment'] },
      { week: 4, theme: 'Build the brand', activitySlugs: ['brand-builder'] },
      { week: 5, theme: 'Get the word out', activitySlugs: ['marketing-campaign'] },
      { week: 6, theme: 'Pitch it like a pro', activitySlugs: ['shark-tank-pitch'] },
    ],
  },
  {
    id: 'money-confident-kid',
    title: 'Money Confident Kid',
    tagline: 'Real-world math that builds money sense.',
    outcome:
      'By the end, your kid can budget an event, price to sell, compare costs, plan a trip, and set a savings goal.',
    bundleSlug: 'real-world-math-bundle',
    category: 'real-world-math',
    ageRange: '7-13',
    weeks: [
      { week: 1, theme: 'Plan a party on a budget', activitySlugs: ['party-planner-math'] },
      { week: 2, theme: 'Price things to sell', activitySlugs: ['garage-sale-math'] },
      { week: 3, theme: 'Shop smart at the market', activitySlugs: ['farmers-market-challenge'] },
      { week: 4, theme: 'Cost out a road trip', activitySlugs: ['road-trip-calculator'] },
      { week: 5, theme: 'Set and track a savings goal', activitySlugs: ['savings-goal-tracker'] },
      { week: 6, theme: 'Plan the whole campout', activitySlugs: ['backyard-campout-planner'] },
    ],
  },
  {
    id: 'math-all-around',
    title: 'Math All Around',
    tagline: 'Spot the math hiding in everyday life.',
    outcome:
      'By the end, your kid measures and plans space, reads data and averages, works out rates, and handles percentages, all from real situations.',
    bundleSlug: 'real-world-math-bundle',
    category: 'real-world-math',
    ageRange: '8-13',
    weeks: [
      { week: 1, theme: 'Measure and plan a garden plot', activitySlugs: ['garden-plot-planner'] },
      { week: 2, theme: 'Crunch the numbers on sports', activitySlugs: ['sports-stats-lab'] },
      { week: 3, theme: 'Audit the family electricity bill', activitySlugs: ['family-electricity-audit'] },
      { week: 4, theme: 'Find the best deal thrifting', activitySlugs: ['clothing-swap-thrift-math'] },
      { week: 5, theme: 'Calculate a road trip', activitySlugs: ['road-trip-calculator'] },
      { week: 6, theme: 'Budget a real event', activitySlugs: ['party-planner-math'] },
    ],
  },
  {
    id: 'young-naturalist',
    title: 'Young Naturalist',
    tagline: 'Slow, observant, outdoor science.',
    outcome:
      'By the end, your kid observes closely, journals what they see, builds outside, and thinks like a field scientist.',
    bundleSlug: 'outdoor-mega-bundle',
    category: 'outdoor-learning',
    ageRange: '6-12',
    weeks: [
      { week: 1, theme: 'Notice everything on a walk', activitySlugs: ['nature-walk-task-cards'] },
      { week: 2, theme: 'Keep a nature journal', activitySlugs: ['nature-journal-walks'] },
      { week: 3, theme: 'Go on an outdoor mission', activitySlugs: ['outdoor-learning-missions'] },
      { week: 4, theme: 'Make art from the land', activitySlugs: ['land-art-challenges'] },
      { week: 5, theme: 'Solve an outdoor STEM challenge', activitySlugs: ['outdoor-stem-challenges'] },
      { week: 6, theme: 'Craft with what you find', activitySlugs: ['nature-crafts'] },
    ],
  },
  {
    id: 'maker-studio',
    title: 'Maker Studio',
    tagline: 'Invent, build, and make things that work.',
    outcome:
      'By the end, your kid has invented, prototyped, problem-solved, and built something they are proud to show off.',
    bundleSlug: 'creativity-mega-bundle',
    category: 'creativity-maker',
    ageRange: '7-14',
    weeks: [
      { week: 1, theme: 'Invent a brand-new sport', activitySlugs: ['invent-a-sport'] },
      { week: 2, theme: 'Design a board game', activitySlugs: ['board-game-studio'] },
      { week: 3, theme: 'Build a Rube Goldberg machine', activitySlugs: ['rube-goldberg-machine'] },
      { week: 4, theme: 'Make a kinetic sculpture', activitySlugs: ['kinetic-sculpture'] },
      { week: 5, theme: 'Curate your own museum', activitySlugs: ['build-a-museum'] },
      { week: 6, theme: 'Design a theme park', activitySlugs: ['theme-park'] },
    ],
  },
  {
    id: 'confident-communicator',
    title: 'Confident Communicator',
    tagline: 'Speak up, write well, and be understood.',
    outcome:
      'By the end, your kid can argue a point, review and recommend, interview a stranger, publish, and present.',
    bundleSlug: 'communication-writing-bundle',
    category: 'communication-writing',
    ageRange: '8-14',
    weeks: [
      { week: 1, theme: 'Argue a point at debate night', activitySlugs: ['family-debate-night'] },
      { week: 2, theme: 'Write a review worth reading', activitySlugs: ['my-review-column'] },
      { week: 3, theme: 'Interview a neighbour', activitySlugs: ['neighbourhood-interview'] },
      { week: 4, theme: 'Publish a mini magazine', activitySlugs: ['mini-magazine-creator'] },
      { week: 5, theme: 'Pitch at the market stall', activitySlugs: ['market-stall-pitch'] },
      { week: 6, theme: 'Lead a community tour', activitySlugs: ['community-tour-guide'] },
    ],
  },
];

export const PROGRAM_BY_ID: Record<string, Program> = Object.fromEntries(
  PROGRAMS.map((p) => [p.id, p]),
);

export function getProgram(id: string): Program | undefined {
  return PROGRAM_BY_ID[id];
}

/** Total distinct activities in a program (for "6 activities, 6 weeks" copy). */
export function programActivityCount(p: Program): number {
  return p.weeks.reduce((sum, w) => sum + w.activitySlugs.length, 0);
}
