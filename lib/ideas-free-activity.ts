// ─── The free guided activity that idea list pages used to give away ───
//
// RETIRED from the idea lists (Sept 2026). The pages now trade the printable
// checklist for an email and nothing else. The activity was pulled because the
// claim ledger allows one per address ever, so a visitor working through
// several lists got pitched a different guide on every page and handed back the
// same one each time. A promise the page could not keep.
//
// Kept, not deleted, for two reasons. `getFreeActivityBySlug` is still live:
// lib/guide-names.ts uses it to name whichever guide a subscriber took, for the
// funnels that DO still deliver activities (the quiz and the flagship
// giveaway). And keeping CATEGORY_TO_ACTIVITY intact makes restoring the idea
// list giveaway a small change if gating the checklists alone does not grow the
// list.
//
// `getFreeActivityForCategory` and `getAllFreeActivitySlugs` have no callers
// while the giveaway is retired. Safe to delete once that decision is settled.
//
// The original reasoning, still true if it comes back: the match matters, and
// the contrast is the pitch. A list gives you ideas; the guide shows you how to
// actually run one, with three skill levels and what to say when they get
// stuck. That gap is what the membership sells.

import { ACTIVITY_BLOB_URLS } from '@/lib/activity-blob-urls';
import { getFallbackProductBySlug } from '@/lib/fallback-products';

/** Idea category slug -> the activity slug given away on that category's lists. */
const CATEGORY_TO_ACTIVITY: Record<string, string> = {
  nature: 'nature-walk-task-cards',
  kitchen: 'kitchen-science-lab',
  'life-skills': 'body-owners-manual',
  stem: 'rube-goldberg-machine',
  creative: 'board-game-studio',
  travel: 'pack-like-a-pro',
  'ai-digital': 'deepfake-spotter',
  mindset: 'boredom-toolkit',
};

/** One warm line per activity, describing what the family actually does. */
const BLURBS: Record<string, string> = {
  'nature-walk-task-cards':
    'Thirty task cards that turn any ordinary walk into a proper expedition. Pull one, hand it over, follow where it goes.',
  'kitchen-science-lab':
    'Real experiments using what is already in your cupboards. Your kid runs the test, predicts the result, and figures out why it happened.',
  'body-owners-manual':
    'Your kid maps how their own body actually works, from what fuels it to why sleep matters, and builds a manual for running it well.',
  'rube-goldberg-machine':
    'Build a gloriously overcomplicated machine to do one simple job. Every failed attempt teaches more than the working one.',
  'board-game-studio':
    'Your kid designs an original board game from scratch, writes the rules, and playtests it on the family until it actually works.',
  'pack-like-a-pro':
    'Your kid packs their own bag for a real trip, weighs the tradeoffs, and lives with what they chose. Independence you can hand over.',
  'deepfake-spotter':
    'Your kid learns to spot manipulated images and video, then tries to fool you with their own. The best way to build a sharp eye.',
  'boredom-toolkit':
    'Build a toolkit your kid reaches for instead of you when boredom hits. Made together, so they own it.',
};

export interface IdeaFreeActivity {
  slug: string;
  name: string;
  blurb: string;
  priceLabel: string;
  downloadUrl: string;
  /** Kit tag (`guide:{tag}`) so a delivery automation can be added later. */
  guideTag: string;
}

/**
 * The free activity for an idea category. Returns null when the category has no
 * mapping or the activity has no Blob URL yet, so the page can hide the offer
 * rather than render a broken download.
 */
export function getFreeActivityForCategory(
  categorySlug: string,
): IdeaFreeActivity | null {
  const activitySlug = CATEGORY_TO_ACTIVITY[categorySlug];
  if (!activitySlug) return null;
  return getFreeActivityBySlug(activitySlug);
}

/**
 * Look an activity up directly. Used when someone has already claimed their one
 * free guide and we need to show them which one they have.
 */
export function getFreeActivityBySlug(
  activitySlug: string,
): IdeaFreeActivity | null {
  const downloadUrl = ACTIVITY_BLOB_URLS[activitySlug];
  const product = getFallbackProductBySlug(activitySlug);
  if (!downloadUrl || !product) return null;

  return {
    slug: activitySlug,
    name: product.name,
    blurb: BLURBS[activitySlug] ?? product.shortDescription,
    priceLabel: `$${(product.priceCents / 100).toFixed(2)}`,
    downloadUrl,
    guideTag: activitySlug,
  };
}

/** Every activity given away through the idea lists, for callers that need the set. */
export function getAllFreeActivitySlugs(): string[] {
  return Object.values(CATEGORY_TO_ACTIVITY);
}
