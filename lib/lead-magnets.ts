import { getListBySlug, getListByBlogSlug } from '@/lib/ideas';
import type { BlogContentBlock } from '@/lib/blog';
import type { ResourceTopic } from '@/lib/resources';

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

function ideasMagnet(listSlug: string): LeadMagnet | null {
  const found = getListBySlug(listSlug);
  if (!found) return null;
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
  'road-trip-math': 'travel-ideas',
  'teach-kids-about-money': 'life-skills-ideas',
  'allowance-vs-commission': 'life-skills-ideas',
  'financial-literacy-for-kids-by-age': 'life-skills-ideas',
  'shark-tank-for-kids': 'capable-kid',
  'project-based-learning-homeschool': 'stem-ideas',
  'kids-making-videos-learning': 'creative-ideas',
  'real-world-writing-for-kids': 'creative-ideas',
  'emotional-regulation-kids': 'resilience-ideas',
  'teaching-kids-to-fail': 'resilience-ideas',
  'what-to-do-when-kids-say-im-bored': 'resilience-ideas',
  'nature-journaling-for-kids': 'nature-walk-ideas',
  'bird-watching-with-kids': 'nature-walk-ideas',
  'risky-play-for-kids': 'forest-school-ideas',
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

/** The single free offer for a blog post. */
export function getLeadMagnetForPost(post: { slug: string; category: string }): LeadMagnet {
  const direct = getListByBlogSlug(post.slug);
  if (direct) return ideasMagnet(direct.list.slug) ?? FREE_GUIDE;
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
