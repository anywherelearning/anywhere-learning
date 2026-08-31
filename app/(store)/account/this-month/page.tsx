import type { Metadata } from 'next';
import { getPlanActivities } from '@/lib/plan-activities';
import { getPostBySlug } from '@/lib/blog';
import ThisMonthView, { type MonthActivity, type MonthSection, type SectionExtras } from '@/components/account/ThisMonthView';

export const metadata: Metadata = {
  title: 'This Month',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// ─── Edit this block once a month. Everything below builds itself from it. ───
// `category` values must match a real activity category (lib/categories).
const THIS_MONTH = {
  month: 'September',
  intro: 'A fresh focus, a seasonal set, and one family challenge. New every month.',
  skill: {
    // Six Self-Management picks (no overlap with any other month's set).
    slugs: [
      'time-energy-planner',     // map energy, build a real daily plan, test it
      'plan-a-mini-adventure',   // plan a two-hour family outing and lead it
      'boredom-toolkit',         // handle empty time without a screen
      'teach-it-to-learn-it',    // plan a real lesson and deliver it
      'travel-day',              // plan a full day trip: budget, itinerary, backup
      'nature-choice-boards',    // self-directed picks, kid chooses and owns it
    ],
    // Calm teal-green reads "steady and organized", distinct from the warm
    // harvest rust in the seasonal set below.
    accent: '#3E8577',
    accentDeep: '#28584F',
    eyebrow: 'Skill of the month',
    title: 'The month of owning your day',
    blurb:
      'September hands everyone a fresh calendar, whatever school looks like at your place. This month is about handing over the controls: kids planning real days, managing their own time and energy, and finding out that a day you run yourself feels completely different from one you get dragged through.',
    extras: {
      // 1 · Read this — an internal blog post. Its hero image is pulled in
      // automatically from lib/blog.ts (keep the slug in sync).
      read: { slug: 'time-management-for-kids', title: 'How to Teach Kids Time Management (By Age, With Real Examples)' },
      // 2 · Read together — a younger and an older pick. Cover images live in
      // /public/books/; `link` points at the official author/publisher page.
      books: [
        { ages: 'Ages 8–12', title: 'Get Organized Without Losing It', author: 'Janet S. Fox', cover: '/books/get-organized-without-losing-it.jpg', link: 'https://bookshop.org/book/9781631981739' },
        { ages: 'Ages 11–14', title: 'What Do You Really Want?', author: 'Beverly K. Bachel', cover: '/books/what-do-you-really-want.jpg', link: 'https://bookshop.org/book/9781631980305' },
      ],
      // 3 · Extra — the flexible card. Swap it every month. Items with a `url`
      // render as links; items without render as bullets. VERIFY links first.
      extra: {
        title: 'Hand over the controls',
        items: [
          { label: 'Put a big month calendar where everyone can reach it, and let kids add their own things to it.' },
          { label: 'Let each kid plan one full family day this month, start to finish: timing, food, budget.' },
          { label: 'When they forget something, let the forgetting do the teaching. Rescue less than feels comfortable.' },
        ],
      },
      mindset: "Kids don't learn to manage their time by having it managed for them. Every plan you hand over is a rep, even the ones that flop. The goal is a kid who runs their day instead of waiting to be told what's next.",
    },
  },
  seasonal: {
    // Harvest + fall set, all from the reserve pool so nothing overlaps
    // another month or the Own Your Day skill set above. Farmers market leads.
    // Kept to the five that genuinely fit harvest season — no padding to six.
    slugs: [
      'farmers-market-challenge', // shop the harvest with a real budget
      'backyard-campout-planner', // one last campout before the cold sets in
      'nature-data-tracker',      // track the season turning: leaves, temps, daylight
      'nature-walk-task-cards',   // crunchy-leaf walks with a mission
      'square-foot-safari',       // watch one small patch change as fall arrives
    ],
    // Harvest rust (pumpkins / turning leaves), distinct from the business terracotta.
    accent: '#B5622F',
    accentDeep: '#6E3413',
    eyebrow: 'Seasonal pick',
    title: 'Harvest and fall kickoff',
    blurb:
      "The season turns this month, and it's the best kind of classroom. This set follows the harvest from market stall to dinner table and gets you outside while the leaves do their thing, starting with a farmers market run on a real budget.",
    extras: {
      // Universal (not homeschool-specific) — useful for any family this time of year.
      read: { slug: 'seasonal-scavenger-hunts', title: 'Free Seasonal Nature Scavenger Hunts (Spring, Summer, Fall, Winter)' },
      books: [
        { ages: 'Ages 6–10', title: 'We Gather Together', author: 'Wendy Pfeffer', cover: '/books/we-gather-together.jpg', link: 'https://bookshop.org/book/9780147512826' },
        { ages: 'Ages 10–14', title: 'My Side of the Mountain', author: 'Jean Craighead George', cover: '/books/my-side-of-the-mountain.jpg', link: 'https://bookshop.org/book/9780141312422' },
      ],
      // Real-world harvest outings and one make-it-together project.
      extra: {
        title: 'Taste the season',
        items: [
          { label: 'Find a u-pick farm or orchard nearby and let the kids handle the picking and the paying.' },
          { label: 'Preserve one thing together: applesauce, dried apple rings, or a small batch of freezer jam. Label it with the date.' },
          { label: 'Start a fall bucket list on the fridge and let everyone add to it all month.' },
        ],
      },
      mindset: "Kids notice the season changing when you give them a reason to look. A month of tracking what the trees are doing and where dinner comes from beats a worksheet about leaves every time.",
    },
  },
  challenge: {
    title: 'Hand over the morning',
    text:
      "For the month, mornings belong to the kids. Waking up, breakfast, getting dressed, packing what they need, ready on time. Your job is the hard part: don't remind them. Expect a rough first week, keep a streak chart on the fridge, and watch what happens by week three. The point isn't a perfect morning. It's a kid who finds out they can run one without you.",
  },
};

// Pull each Read-this blog post's hero image in from lib/blog.ts at build time.
function withHero(extras?: SectionExtras): SectionExtras | undefined {
  if (!extras?.read) return extras;
  const heroImage = getPostBySlug(extras.read.slug)?.heroImage;
  return { ...extras, read: { ...extras.read, heroImage } };
}

function buildSection(
  meta: {
    category?: string;
    /** Explicit, ordered activity slugs — use to hand-pick a cross-area set. */
    slugs?: string[];
    /** With `category`: pull this one activity to the front. */
    featureSlug?: string;
    /** Override the section accent (else derived from the first activity). */
    accent?: string;
    accentDeep?: string;
    eyebrow: string;
    title: string;
    blurb: string;
    extras?: SectionExtras;
  },
  limit = 6,
): MonthSection {
  const all = getPlanActivities();
  let acts;
  if (meta.slugs && meta.slugs.length) {
    // Curated, cross-category list — keep the author's order, drop any typos.
    const bySlug = new Map(all.map((a) => [a.slug, a]));
    acts = meta.slugs.map((s) => bySlug.get(s)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  } else {
    acts = all.filter((a) => a.category === meta.category);
    // Pull a themed pick to the front so it never gets sliced off the end.
    if (meta.featureSlug) {
      const i = acts.findIndex((a) => a.slug === meta.featureSlug);
      if (i > 0) acts.unshift(acts.splice(i, 1)[0]);
    }
  }
  const activities: MonthActivity[] = acts.slice(0, limit).map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    categoryLabel: a.categoryLabel,
    effort: a.effort,
    imageUrl: a.imageUrl ?? null,
    trackColor: a.trackColor,
    trackDeep: a.trackDeep,
    description: a.description ?? a.excerpt,
    href: `/api/download/activity/${a.slug}?view=1`,
  }));
  const accent = meta.accent ?? acts[0]?.trackColor ?? '#588157';
  const accentDeep = meta.accentDeep ?? acts[0]?.trackDeep ?? '#3d5c3b';
  return { eyebrow: meta.eyebrow, title: meta.title, blurb: meta.blurb, accent, accentDeep, activities, extras: withHero(meta.extras) };
}

export default function ThisMonthPage() {
  return (
    <ThisMonthView
      month={THIS_MONTH.month}
      intro={THIS_MONTH.intro}
      challengeId={`${THIS_MONTH.month}:${THIS_MONTH.challenge.title}`}
      skill={buildSection(THIS_MONTH.skill)}
      seasonal={buildSection(THIS_MONTH.seasonal)}
      challenge={THIS_MONTH.challenge}
    />
  );
}
