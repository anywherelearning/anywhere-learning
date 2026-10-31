import { getListBySlug, getListByBlogSlug } from '@/lib/ideas';
import { getIdeaListPdfUrls } from '@/lib/idea-list-pdfs';
import type { BlogContentBlock } from '@/lib/blog';
import type { ResourceTopic } from '@/lib/resources';
import { SKILLS_MAP } from '@/lib/skills-map';

// ─── The one free thing to offer a reader of a given post ───
//
// Every post and pillar guide gets exactly one lead magnet: the free idea-list
// printable, the Capable Kid guide, or the 7-day guide, whichever is closest to
// what they just read. The exit-intent popup captures the email inline, and
// the in-body CTA points at the same thing, so a nature post never pitches the
// generic guide when there is a nature checklist to give away.
//
// Kept as a plain serialisable object so the server can pick it and hand it to
// the client popup without shipping the whole ideas dataset to the browser.

export type LeadMagnet =
  | {
      kind: 'ideas';
      /** Idea-list slug, also the `checklist` value sent to /api/subscribe. */
      slug: string;
      title: string;
      href: string;
      eyebrow: string;
      blurb: string;
      cta: string;
    }
  | {
      kind: 'capable-kid';
      title: string;
      href: string;
      eyebrow: string;
      blurb: string;
      cta: string;
    }
  | {
      /** The one paid offer: posts where the Map is the exact answer. A link, no email form. */
      kind: 'skills-map';
      title: string;
      href: string;
      eyebrow: string;
      blurb: string;
      cta: string;
    }
  | {
      kind: 'free-guide';
      title: string;
      href: string;
      eyebrow: string;
      blurb: string;
      cta: string;
    };

const CAPABLE_KID: LeadMagnet = {
  kind: 'capable-kid',
  title: 'The Capable Kid Guide',
  href: '/guides/capable-kid',
  eyebrow: 'Free guide, ages 6 to 14',
  blurb:
    'What your kid can actually do at each age, and how to hand each skill over without losing your mind. Written by a former teacher.',
  cta: 'Send me the guide',
};

const FREE_GUIDE: LeadMagnet = {
  kind: 'free-guide',
  title: '7 Days of Real-World Learning',
  href: '/free-guide',
  eyebrow: 'Free guide',
  blurb:
    'A week of real-world activities you can run at home with almost no prep. The academics and the life skills happen in the same task.',
  cta: 'Send me the guide',
};

/**
 * Oct 2026: posts where the reader is asking "what should my kid know or be
 * doing at this age" get the Skills Map as their one offer instead of a free
 * one. Kept to five so the email list keeps growing everywhere else; read
 * Map sales by utm_campaign (the post slug) before adding more.
 */
export const SKILLS_MAP_POSTS = new Set<string>([
  'what-kids-should-know-before-18',
  'homeschool-middle-school',
  'homeschool-first-grade',
  'curriculum-guilt-permission-slip',
  'critical-thinking-for-kids',
]);

function skillsMapMagnet(postSlug: string): LeadMagnet {
  return {
    kind: 'skills-map',
    title: SKILLS_MAP.name,
    href: `/shop/${SKILLS_MAP.slug}?utm_source=blog&utm_medium=offer&utm_campaign=${postSlug}`,
    eyebrow: `Parent guide · $${SKILLS_MAP.priceUsd}`,
    blurb:
      'The 12 skill areas kids need for real life, and what each one looks like from 6 to 14 and beyond, with hands-on ideas for every area. Written by a former teacher.',
    cta: 'See the Skills Map',
  };
}

function ideasMagnet(listSlug: string): LeadMagnet | null {
  const found = getListBySlug(listSlug);
  if (!found) return null;
  // No printable yet means nothing to send, and /api/subscribe rejects the
  // signup. A new list can go live as a page first; its posts keep their old
  // offer until the PDF is registered in lib/idea-list-pdfs.
  if (!getIdeaListPdfUrls(found.list.slug)) return null;
  return {
    kind: 'ideas',
    slug: found.list.slug,
    title: found.list.title,
    href: `/ideas/${found.list.slug}`,
    eyebrow: 'Free printable checklist',
    blurb:
      found.list.cardExcerpt ||
      'Free to read, and the printable version lands in your inbox with one email.',
    cta: 'Send me the checklist',
  };
}

/**
 * Best magnet by blog category when a post has no direct idea list and no
 * hand-picked override. Life-skills posts get the age-by-age guide, the
 * homeschool-journey cluster gets the 7-day starter, everything else gets the
 * closest checklist.
 */
const CATEGORY_DEFAULT: Record<string, string | 'capable-kid' | 'free-guide'> = {
  'nature-learning': 'nature-walk-ideas',
  'stem-for-kids': 'stem-ideas',
  'creativity-maker': 'creative-ideas',
  'travel-worldschool': 'travel-ideas',
  'ai-digital-literacy': 'ai-digital-ideas',
  'future-ready-skills': 'capable-kid',
  'real-world-skills': 'free-guide',
  'homeschool-journey': 'free-guide',
};

/**
 * Hand-picked fits where the category default would be wrong: a money post
 * wants the life-skills checklist (it has a Money & Budgeting section), the
 * road-trip post wants the travel list, a Shark Tank reader is a capable-kid
 * reader, and so on. Direct `blogSlug` matches in the ideas data win over
 * these, so a post with its own printable never needs an entry here.
 */
const POST_OVERRIDES: Record<string, string | 'capable-kid' | 'free-guide'> = {
  'real-world-math-activities': 'kitchen-ideas',
  'plan-a-party-math-kids': 'kitchen-ideas',
  'road-trip-math': 'travel-ideas',
  'teach-kids-about-money': 'life-skills-ideas',
  'allowance-vs-commission': 'life-skills-ideas',
  'financial-literacy-for-kids-by-age': 'life-skills-ideas',
  // shark-tank-for-kids is the kid-business-ideas list's own blogSlug, so it
  // gets that list directly; this override only applies if that link is removed.
  'shark-tank-for-kids': 'capable-kid',
  'community-impact-projects-for-kids': 'kid-business-ideas',
  'project-based-learning-homeschool': 'stem-ideas',
  'kids-making-videos-learning': 'creative-ideas',
  'real-world-writing-for-kids': 'creative-ideas',
  'emotional-regulation-kids': 'resilience-ideas',
  'teaching-kids-to-fail': 'resilience-ideas',
  'what-to-do-when-kids-say-im-bored': 'resilience-ideas',
  'nature-journaling-for-kids': 'nature-walk-ideas',
  'fall-nature-activities-kids': 'seasonal-scavenger-ideas',
  'winter-stem-activities-kids': 'stem-ideas',
  'bird-watching-with-kids': 'nature-walk-ideas',
  'risky-play-for-kids': 'forest-school-ideas',
  'outdoor-survival-skills-for-kids': 'forest-school-ideas',
  'outdoor-stem-by-age': 'stem-ideas',
  'lego-stem-activities': 'engineering-ideas',
  'science-fair-project-ideas': 'backyard-science-ideas',
  'just-let-them-play': 'creative-ideas',
  'how-much-screen-time-kids': 'ai-digital-ideas',
  'screen-free-activities-kids': 'creative-ideas',
  'when-should-kids-get-a-phone': 'ai-digital-ideas',
};

function resolve(choice: string | 'capable-kid' | 'free-guide' | undefined): LeadMagnet {
  if (!choice || choice === 'free-guide') return FREE_GUIDE;
  if (choice === 'capable-kid') return CAPABLE_KID;
  return ideasMagnet(choice) ?? FREE_GUIDE;
}

/** The single offer for a blog post (free, except the Skills Map posts). */
export function getLeadMagnetForPost(post: { slug: string; category: string }): LeadMagnet {
  if (SKILLS_MAP_POSTS.has(post.slug)) return skillsMapMagnet(post.slug);
  const direct = getListByBlogSlug(post.slug);
  const directMagnet = direct ? ideasMagnet(direct.list.slug) : null;
  if (directMagnet) return directMagnet;
  return resolve(POST_OVERRIDES[post.slug] ?? CATEGORY_DEFAULT[post.category]);
}

const TOPIC_DEFAULT: Record<ResourceTopic, string | 'capable-kid' | 'free-guide'> = {
  'nature-stem': 'nature-walk-ideas',
  'real-world-learning': 'free-guide',
  worldschooling: 'travel-ideas',
  'creativity-maker': 'creative-ideas',
  'ai-digital-literacy': 'ai-digital-ideas',
  'homeschool-journey': 'free-guide',
  'future-ready-skills': 'capable-kid',
  'stem-for-kids': 'stem-ideas',
};

/** The single free offer for a pillar guide. */
export function getLeadMagnetForResource(topic: ResourceTopic): LeadMagnet {
  return resolve(TOPIC_DEFAULT[topic]);
}

/** In-body CTA card for a magnet. The 7-day guide keeps each post's own hand-written line. */
function ctaBlockFor(magnet: LeadMagnet): BlogContentBlock | null {
  if (magnet.kind === 'ideas') {
    return {
      type: 'cta',
      text: `Want this as a free printable? Grab the ${magnet.title}, free to read, and the printable version lands in your inbox.`,
      href: magnet.href,
      label: 'Get the free checklist',
    };
  }
  if (magnet.kind === 'capable-kid') {
    return {
      type: 'cta',
      text: 'Want the age-by-age version? The Capable Kid Guide lays out what kids can actually do from 6 to 14, and how to hand each skill over. Free, from a former teacher.',
      href: magnet.href,
      label: 'Get the Capable Kid Guide',
    };
  }
  if (magnet.kind === 'skills-map') {
    return {
      type: 'cta',
      text: `Want the age-by-age version? The Future-Ready Skills Map lays out the 12 skill areas kids need for real life, and what each one looks like from 6 to 14 and beyond. $${SKILLS_MAP.priceUsd}, from a former teacher.`,
      href: magnet.href,
      label: 'See the Skills Map',
    };
  }
  return null;
}

/**
 * Point a post's in-body CTA at its magnet. Generic "/free-guide" CTAs are
 * rewritten when a closer magnet exists; posts with no CTA at all get one
 * after the last paragraph, inside the body where the link counts for SEO.
 */
export function applyLeadMagnetCta(
  content: BlogContentBlock[],
  magnet: LeadMagnet,
): BlogContentBlock[] {
  const replacement = ctaBlockFor(magnet);
  const hasMagnetLink = content.some(
    (b) => b.type === 'cta' && b.href === magnet.href,
  );
  if (hasMagnetLink) return content;

  const ctaIdx = content.findIndex((b) => b.type === 'cta');

  if (ctaIdx !== -1) {
    const existing = content[ctaIdx];
    if (!replacement || existing.type !== 'cta' || existing.href !== '/free-guide') {
      return content;
    }
    const result = [...content];
    result[ctaIdx] = replacement;
    return result;
  }

  const block: BlogContentBlock = replacement ?? {
    type: 'cta',
    text: 'Want more real-world ways to learn through doing? Our free guide gives you a week of activities your kids can try, no curriculum, low prep.',
    href: FREE_GUIDE.href,
    label: 'Get the Free Guide',
  };
  const lastParagraphIdx = content.map((b) => b.type).lastIndexOf('paragraph');
  if (lastParagraphIdx === -1) return [...content, block];
  const result = [...content];
  result.splice(lastParagraphIdx + 1, 0, block);
  return result;
}

// ─── Inline capture: the magnet offered inside the body, not only at exit ───
//
// Sept 2026: 235 organic sessions in 28 days produced one lead, and it came
// from an idea list, where the ask sits inline on the page. The exit popup
// was live on every top organic post and produced none. So the pages Google
// sends the most people to got the same ask inline, with the popup left as is.
//
// Oct 2026: placed after the first full section, the inline ask produced zero
// organic leads in three weeks (456 organic sessions, 12 leads site-wide from
// search, none inline). Search visitors read the summary and the intro, get
// their answer, and leave before section two. So the ask now sits right
// before the first H2, under the summary box, and the list covers the top
// organic landings from GSC. Read GA4 lead_source "inline:*" against
// "popup:*" before moving it again.

// Oct 31 2026: every post gets the early ask, not a hand-picked list. 84 of
// 96 posts made their first ask after 90% of the page, and only about 8% of
// readers scroll that far (family-debate-night: 220 views, 18 deep scrolls).
// Meanwhile life-skills-before-12, with the quiz under its summary, turned
// 24 sessions into 6 leads. Which ask goes first is decided per post by
// earlyAskFor() below, so it always matches what the reader came for.

export const INLINE_CAPTURE_GUIDES = new Set<string>([
  'life-skills-for-kids',
  'stem-for-kids',
  'creativity-maker-activities',
]);

/**
 * Life-skills pages lead with the 2-minute quiz instead: it has the lowest
 * bounce rate on the site and asks for the email at the result, after the
 * parent has had something back. On these pages the quiz card takes the early
 * slot and the email form keeps the later one (before the second H2).
 */
export const QUIZ_FIRST_PAGES = new Set<string>([
  'life-skills-for-kids',
  'life-skills-before-12',
  'decision-making-skills-kids',
  // Oct 19 2026: Shark Tank had 51 organic sessions in 28 days and 0 leads on
  // the inline form, while quiz-first life-skills-before-12 took 5 of 8.
  'shark-tank-for-kids',
]);

/**
 * Which early ask a blog post shows under its summary.
 *
 * - A post with its own printable checklist leads with that checklist's
 *   email form: the most relevant free thing on the site for that reader.
 *   (Shark Tank is the known exception: 0 leads on the form, then 0 from 80
 *   sessions on the quiz. Much of its search traffic is teachers and
 *   students after a classroom activity, so neither ask fits; it stays
 *   quiz-first until a classroom offer exists.)
 * - Life-skills and character posts (the QUIZ_FIRST_PAGES list, plus any
 *   post whose offer is the general Capable Kid guide or the paid Skills
 *   Map) lead with the quiz, the best free converter, and keep the email
 *   form for the second slot.
 * - The Skills Map is paid, so it never gets an email form.
 */
export function earlyAskFor(
  postSlug: string,
  magnet: LeadMagnet,
): { quizFirst: boolean; formSlot: 0 | 1 | 2 } {
  const quizFirst =
    QUIZ_FIRST_PAGES.has(postSlug) ||
    magnet.kind === 'capable-kid' ||
    magnet.kind === 'skills-map';
  if (magnet.kind === 'skills-map') return { quizFirst, formSlot: 0 };
  return { quizFirst, formSlot: quizFirst ? 2 : 1 };
}

/**
 * Index of the nth H2 (1-based), the slot an inline ask is rendered before.
 * -1 when the page has fewer H2s than that.
 */
export function inlineCaptureIndex(content: BlogContentBlock[], nth = 1): number {
  let seen = 0;
  for (let i = 0; i < content.length; i++) {
    const b = content[i];
    if (b.type === 'heading' && b.level === 2) {
      seen += 1;
      if (seen === nth) return i;
    }
  }
  return -1;
}
