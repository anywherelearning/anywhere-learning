// ---------------------------------------------------------------------------
// Cross-links between the editorial side (blog posts, pillar guides, idea
// lists) and the activity library (/shop/*).
//
// Why this exists: the September 2026 audit found that 86 of 87 blog posts
// linked to zero activities and 136 of 137 activity pages linked to zero posts
// or guides. Posts and guides earn most of the organic traffic; activity pages
// are where trials start. These helpers give every page on either side a
// deterministic, category-matched set of links to the other side, so the two
// halves of the site stop behaving like two separate sites.
//
// Everything here reads static data (fallback products, blog, resources), so
// it is safe in server components and needs no database.
// ---------------------------------------------------------------------------

import { getFallbackProducts, type FallbackProduct } from '@/lib/fallback-products';
import { getAllPosts, type BlogCategory, type BlogPost } from '@/lib/blog';
import { getAllResources, type ResourceTopic, type ResourcePage } from '@/lib/resources';

/** Blog category -> the product category whose activities fit it best. */
export const BLOG_TO_PRODUCT_CATEGORY: Record<BlogCategory, string> = {
  'ai-digital-literacy': 'ai-literacy',
  'creativity-maker': 'creativity-maker',
  'future-ready-skills': 'planning-problem-solving',
  'homeschool-journey': 'planning-problem-solving',
  'nature-learning': 'outdoor-learning',
  'real-world-skills': 'real-world-math',
  'stem-for-kids': 'outdoor-learning',
  'travel-worldschool': 'worldschooling',
};

/** Pillar guide topic -> product category. */
export const RESOURCE_TOPIC_TO_PRODUCT_CATEGORY: Record<ResourceTopic, string> = {
  'real-world-learning': 'real-world-math',
  'nature-stem': 'outdoor-learning',
  'worldschooling': 'worldschooling',
  'creativity-maker': 'creativity-maker',
  'ai-digital-literacy': 'ai-literacy',
  'homeschool-journey': 'planning-problem-solving',
  'future-ready-skills': 'planning-problem-solving',
  'stem-for-kids': 'outdoor-learning',
};

/** Product category -> blog categories to draw "read more" posts from, best first. */
export const PRODUCT_TO_BLOG_CATEGORIES: Record<string, BlogCategory[]> = {
  'ai-literacy': ['ai-digital-literacy', 'future-ready-skills'],
  'communication-writing': ['real-world-skills', 'future-ready-skills'],
  'creativity-maker': ['creativity-maker', 'stem-for-kids'],
  'emotional-social-skills': ['future-ready-skills', 'homeschool-journey'],
  'entrepreneurship': ['real-world-skills', 'future-ready-skills'],
  'outdoor-learning': ['nature-learning', 'stem-for-kids'],
  'planning-problem-solving': ['future-ready-skills', 'real-world-skills'],
  'real-world-math': ['real-world-skills', 'stem-for-kids'],
  'worldschooling': ['travel-worldschool', 'homeschool-journey'],
  'start-here': ['future-ready-skills', 'homeschool-journey'],
};

/** Product category -> the pillar guide that frames it. */
export const PRODUCT_TO_RESOURCE_TOPIC: Record<string, ResourceTopic> = {
  'ai-literacy': 'ai-digital-literacy',
  'communication-writing': 'real-world-learning',
  'creativity-maker': 'creativity-maker',
  'emotional-social-skills': 'future-ready-skills',
  'entrepreneurship': 'real-world-learning',
  'outdoor-learning': 'nature-stem',
  'planning-problem-solving': 'future-ready-skills',
  'real-world-math': 'real-world-learning',
  'worldschooling': 'worldschooling',
  'start-here': 'future-ready-skills',
};

/** Small stable hash so each page rotates through its pool differently. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function rotate<T>(arr: T[], seed: string): T[] {
  if (arr.length === 0) return arr;
  const k = hash(seed) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function liveProducts(): FallbackProduct[] {
  return getFallbackProducts().filter((p) => p.active && !p.isBundle);
}

/**
 * Activities to show on an editorial page. The page's recommended product (if
 * any) leads, then same-category activities fill in, rotated by `seed` so
 * neighbouring posts do not all show the same three.
 */
export function pickActivities(
  productCategory: string,
  opts: { prefer?: string; seed: string; limit?: number } = { seed: '' },
): FallbackProduct[] {
  const limit = opts.limit ?? 3;
  const all = liveProducts();
  const out: FallbackProduct[] = [];

  // When the page names an activity, that activity's own category is a better
  // guide to the fill than the blog-category map (a Shark Tank post wants the
  // other entrepreneurship projects, not the math ones its category maps to).
  let fillCategory = productCategory;
  if (opts.prefer) {
    const p = all.find((x) => x.slug === opts.prefer);
    if (p) {
      out.push(p);
      fillCategory = p.category;
    }
  }

  const pool = rotate(
    all
      .filter((p) => p.category === fillCategory && !out.some((o) => o.slug === p.slug))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    opts.seed,
  );

  for (const p of pool) {
    if (out.length >= limit) break;
    out.push(p);
  }

  // Thin category: top up from anything else so the block never renders short.
  if (out.length < limit) {
    for (const p of rotate(all.filter((p) => !out.some((o) => o.slug === p.slug)), opts.seed)) {
      if (out.length >= limit) break;
      out.push(p);
    }
  }

  return out;
}

/** Blog posts to show on an activity page, category-matched and rotated. */
/**
 * Activities that have a blog post written about the exact same project.
 * That post is pinned first on the activity page so the two stop competing
 * for one query and the post inherits a link from the page that ranks.
 * Keyed by product slug (the `seed`).
 */
const PRODUCT_POST_PINS: Record<string, string[]> = {
  'rube-goldberg-machine': ['rube-goldberg-kids'],
  'invent-a-sport': ['invent-a-sport-kids'],
  'shark-tank-pitch': ['shark-tank-for-kids'],
  'board-game-studio': ['board-game-design-kids'],
  'build-a-museum': ['real-world-history-for-kids'],
  'road-trip-calculator': ['real-world-math-activities'],
  'outdoor-stem-challenges': ['outdoor-stem-challenges', 'forest-school-activities'],
  'outdoor-stem-challenges-volume-2': ['outdoor-stem-challenges', 'outdoor-stem-by-age'],
  'nature-walk-task-cards': ['forest-school-activities'],
  'nature-journal-walks': ['nature-journaling-for-kids', 'forest-school-activities'],
  'outdoor-survival-planner': ['forest-school-activities'],
};

export function pickPostsForProduct(productCategory: string, seed: string, limit = 2): BlogPost[] {
  const cats = PRODUCT_TO_BLOG_CATEGORIES[productCategory] ?? ['future-ready-skills'];
  const posts = getAllPosts();
  const out: BlogPost[] = [];

  for (const slug of PRODUCT_POST_PINS[seed] ?? []) {
    const p = posts.find((x) => x.slug === slug);
    if (p && out.length < limit && !out.some((o) => o.slug === p.slug)) out.push(p);
  }

  for (const cat of cats) {
    const pool = rotate(posts.filter((p) => p.category === cat), seed);
    for (const p of pool) {
      if (out.length >= limit) return out;
      if (!out.some((o) => o.slug === p.slug)) out.push(p);
    }
  }
  return out;
}

/** The pillar guide that frames an activity's category. */
export function pickGuideForProduct(productCategory: string): ResourcePage | undefined {
  const topic = PRODUCT_TO_RESOURCE_TOPIC[productCategory];
  if (!topic) return undefined;
  return getAllResources().find((r) => r.topic === topic);
}
