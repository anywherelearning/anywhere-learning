// ─── Human-readable name for whichever free guide someone just grabbed ───
//
// Written to the Kit `last_guide` custom field on every signup, so the welcome
// sequence can say "Thanks for grabbing {{ subscriber.last_guide }}" instead of
// naming one hardcoded lead magnet. Nine different guides now feed the same
// sequence, and email 1 used to thank every one of them for the 7-day guide.
//
// Must return something for every path: a blank custom field would render an
// empty sentence in the email, which is worse than a slightly generic one.

import { getFreeActivityBySlug } from '@/lib/ideas-free-activity';

/** The default lead magnet, sent when no specific guide was requested. */
const DEFAULT_GUIDE_NAME = '7 Days of Real-World Learning';

/** Guides that aren't idea-list activities and so need naming by hand. */
const STANDALONE_GUIDE_NAMES: Record<string, string> = {
  'capable-kid': 'The Capable Kid Guide',
  'kitchen-math-challenge': 'the Kitchen Math & Meal Planning Challenge',
};

/** Product names that read badly mid-sentence. The email says "Thanks for
 *  grabbing {{ last_guide }}", and "grabbing Build a Rube Goldberg Machine"
 *  is not a sentence, so those get a phrasing that is. */
const EMAIL_PHRASING: Record<string, string> = {
  'rube-goldberg-machine': 'the Rube Goldberg Machine guide',
};

/**
 * Display name for a guide slug, safe to drop straight into email copy.
 * Falls back to the default lead magnet's name for unknown or missing slugs.
 */
export function guideDisplayName(guide?: string): string {
  if (!guide) return DEFAULT_GUIDE_NAME;

  const standalone = STANDALONE_GUIDE_NAMES[guide];
  if (standalone) return standalone;

  const phrased = EMAIL_PHRASING[guide];
  if (phrased) return phrased;

  const activity = getFreeActivityBySlug(guide);
  if (activity) return activity.name;

  return DEFAULT_GUIDE_NAME;
}

const SITE = 'https://anywherelearning.co';

/** Cover art for the default lead magnet. */
const DEFAULT_GUIDE_COVER = `${SITE}/images/free-guide-cover.jpg`;

/** Covers for the guides that aren't idea-list activities. */
const STANDALONE_GUIDE_COVERS: Record<string, string> = {
  'capable-kid': `${SITE}/images/capable-kid-cover.jpg`,
};

/**
 * Absolute cover-image URL for a guide slug, for the `last_guide_cover` Kit
 * field. Email 1 shows the cover under the thank-you line, so personalizing the
 * name while leaving one hardcoded image would just look broken.
 *
 * Absolute because email clients have no page to resolve a relative path from.
 */
export function guideCoverUrl(guide?: string): string {
  if (!guide) return DEFAULT_GUIDE_COVER;

  const standalone = STANDALONE_GUIDE_COVERS[guide];
  if (standalone) return standalone;

  const activity = getFreeActivityBySlug(guide);
  if (activity) return `${SITE}/products/${activity.slug}.jpg`;

  return DEFAULT_GUIDE_COVER;
}

const BLOB = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com';

/** Download for the default lead magnet. */
const DEFAULT_GUIDE_DOWNLOAD = `${BLOB}/Free%20guide%20-%207%20Days%20of%20Real-World%20Learning%20-%20compressed.pdf`;

/** Downloads for the guides that aren't idea-list activities. */
const STANDALONE_GUIDE_DOWNLOADS: Record<string, string> = {
  'capable-kid': `${BLOB}/guides/the-capable-kid-guide.pdf`,
};

/**
 * Download URL for a guide slug, for the `last_guide_download` Kit field.
 *
 * Email 1's button used to point at one hardcoded PDF, so anyone who took a
 * different guide was handed the wrong file. A wrong download is worse than a
 * wrong headline, which is why this is a field rather than fixed copy.
 */
export function guideDownloadUrl(guide?: string): string {
  if (!guide) return DEFAULT_GUIDE_DOWNLOAD;

  const standalone = STANDALONE_GUIDE_DOWNLOADS[guide];
  if (standalone) return standalone;

  const activity = getFreeActivityBySlug(guide);
  if (activity) return activity.downloadUrl;

  return DEFAULT_GUIDE_DOWNLOAD;
}
