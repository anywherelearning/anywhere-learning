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
  month: 'August',
  intro: 'A fresh focus, a seasonal set, and one family challenge. New every month.',
  skill: {
    // Six AI & Digital picks (no overlap with any other month's set).
    slugs: [
      'ai-basics',                // what AI is, myths vs facts, smart rules
      'healthy-tech-boundaries',  // a real screen & tech plan for the year
      'privacy-footprint',        // what you share and who can see it
      'prompt-like-a-coach',      // use AI to learn, not to cheat
      'hallucination-detective',  // fact-check what AI tells you
      'three-ais-one-question',   // compare tools, notice they disagree
    ],
    // Cool slate-blue reads "digital", and sets the skill apart from the warm
    // gold back-to-school seasonal below.
    accent: '#5B8FA8',
    accentDeep: '#3C6479',
    eyebrow: 'Skill of the month',
    title: 'The month of smart screens',
    blurb:
      'Before the school year kicks in, get ahead of the screens instead of fighting them. This month is about using tech and AI on purpose: setting real boundaries, understanding how AI actually works, and raising a kid who runs their devices instead of the other way around.',
    extras: {
      // 1 · Read this — an internal blog post. Its hero image is pulled in
      // automatically from lib/blog.ts (keep the slug in sync).
      read: { slug: 'how-much-screen-time-kids', title: 'How Much Screen Time Is Actually OK? An Honest Mom\'s Answer' },
      // 2 · Read together — a younger and an older pick. Cover images live in
      // /public/books/; `link` points at the official author/publisher page.
      books: [
        { ages: 'Ages 8–12', title: 'The Amazing Generation', author: 'Jonathan Haidt & Catherine Price', cover: '/books/the-amazing-generation.jpg', link: 'https://bookshop.org/book/9798217111916' },
        { ages: 'Ages 11–14', title: 'Unplugged', author: 'Gordon Korman', cover: '/books/unplugged-korman.jpg', link: 'https://bookshop.org/book/9780062798893' },
      ],
      // 3 · Extra — the flexible card. Swap it every month. Items with a `url`
      // render as links; items without render as bullets. VERIFY links first.
      extra: {
        title: 'Use it, don\'t fear it',
        note: 'Two free, trusted tools for setting healthier tech habits together.',
        items: [
          { label: 'Common Sense Media: free app, game, and screen-time reviews by age', url: 'https://www.commonsensemedia.org/' },
          { label: 'Be Internet Awesome (Interland): Google\'s free game that teaches online safety', url: 'https://beinternetawesome.withgoogle.com/en_us/interland' },
        ],
      },
      mindset: "Screens aren't the enemy, and neither is AI. The goal isn't zero. It's a kid who can put it down, question what it shows them, and use it to make something instead of just scroll.",
    },
  },
  seasonal: {
    // A hand-picked, cross-area back-to-school set (grit, planning, study skills,
    // tech boundaries, goals, nerves). The Hard Thing Challenge leads.
    // Grit + nerves set for the new year, all from the reserve pool so nothing
    // overlaps another month or the Smart Screens skill set above. Kept to the
    // five that genuinely fit "start the year strong" — no padding to six.
    slugs: [
      'hard-thing-challenge',   // pick one genuinely hard thing and finish it
      'comeback-journal',       // bounce back from a setback
      'disappointment-lab',     // steady yourself when it doesn't go your way
      'calm-down-toolkit',      // handle the first-week nerves
      'conflict-fix',           // navigate the friendship bumps
    ],
    // Back-to-school gold (autumn / pencils), distinct from the business terracotta.
    accent: '#C2913C',
    accentDeep: '#6E531A',
    eyebrow: 'Seasonal pick',
    title: 'Start the year strong',
    blurb:
      'Back-to-school season stirs up nerves, setbacks, and big feelings, whatever school looks like for your family. This set builds the grit and bounce-back to meet the year head-on, starting with picking one genuinely hard thing and finishing it.',
    extras: {
      // Universal (not homeschool-specific) — useful for any family this time of year.
      read: { slug: 'how-to-build-resilience-in-kids', title: 'How to Build Resilience in Kids: 12 Activities That Actually Work' },
      books: [
        { ages: 'Ages 6–10', title: 'Your Fantastic Elastic Brain', author: 'JoAnn Deak', cover: '/books/your-fantastic-elastic-brain.jpg', link: 'https://bookshop.org/book/9780982993804' },
        { ages: 'Ages 11–14', title: 'The 7 Habits of Highly Effective Teens', author: 'Sean Covey', cover: '/books/the-7-habits-of-highly-effective-teens.jpg', link: 'https://bookshop.org/book/9781476764665' },
      ],
      // Genuinely useful, universal back-to-school systems any family can set up.
      extra: {
        title: 'Set up the year',
        items: [
          { label: "Build a 'launch pad' by the door: tomorrow's stuff packed the night before, so mornings stop being a battle." },
          { label: 'Do a 10-minute Sunday preview together: what is coming, who owns what, one thing each kid is looking forward to.' },
          { label: 'End each day with one hard thing and one good thing from everyone, so setbacks get named instead of bottled up.' },
        ],
      },
      mindset: "A strong year isn't one where nothing goes wrong. It's one where your kid learns they can be nervous, or fail, or find it hard, and keep going anyway.",
    },
  },
  challenge: {
    title: 'The hour back',
    text:
      "Pick one hour a day that usually disappears into screens, and take it back as a family for the month. No phones, no shows, no scrolling in that hour. Keep a running list on the fridge of what you did instead. The point isn't less screen time for its own sake. It's noticing how much a single reclaimed hour a day adds up to, and what your family does with it.",
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
