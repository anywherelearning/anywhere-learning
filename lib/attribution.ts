/**
 * Where a subscriber came from, resolved once per session.
 *
 * Precedence: an explicit `?source=` beats `?utm_source=`, which beats whatever
 * the session already captured, which beats the referring domain.
 *
 * The referrer fallback is the part that matters. Capturing only URL params
 * assumes every link is tagged by hand, and a link pasted bare into a Facebook
 * group never is. That is why `from-facebook`, `from-pinterest` and
 * `from-instagram` all sat at zero subscribers while `from-organic` collected
 * everything, despite Facebook groups being the largest traffic source.
 *
 * The result becomes a Kit `from-{source}` tag (see lib/convertkit.ts), so it
 * is sanitised here exactly the way /api/subscribe sanitises it. Keep the two
 * in sync: a value that survives here but not there produces a tag nobody
 * expects.
 */

export const SOURCE_STORAGE_KEY = 'subscribe-source';

/**
 * Referring hostname fragment to source tag. Checked in order, first match
 * wins, so put the specific entries above the general ones (`fb.com` before
 * anything that could also match, `youtu.be` alongside `youtube.`).
 *
 * Fragments are matched with `includes` against the hostname, so `facebook.`
 * covers facebook.com, m.facebook.com, l.facebook.com and the country domains
 * without needing an entry each.
 */
const REFERRER_SOURCES: ReadonlyArray<readonly [string, string]> = [
  ['facebook.', 'facebook'],
  ['fb.com', 'facebook'],
  ['messenger.com', 'facebook'],
  ['instagram.', 'instagram'],
  ['pinterest.', 'pinterest'],
  ['pin.it', 'pinterest'],
  ['youtube.', 'youtube'],
  ['youtu.be', 'youtube'],
  ['tiktok.', 'tiktok'],
  ['reddit.', 'reddit'],
  ['teacherspayteachers.', 'tpt'],
  ['etsy.', 'etsy'],
  ['linkedin.', 'linkedin'],
  ['lnkd.in', 'linkedin'],
  ['t.co', 'twitter'],
  ['twitter.', 'twitter'],
  ['x.com', 'twitter'],
  ['google.', 'google'],
  ['bing.', 'bing'],
  ['duckduckgo.', 'duckduckgo'],
  ['yahoo.', 'yahoo'],
  ['ecosia.', 'ecosia'],
];

/** The same rule /api/subscribe applies, so a tag can never be a surprise. */
export function sanitizeSource(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
}

/**
 * Map a referring URL to a source tag. Returns '' for no referrer and for our
 * own pages, so internal navigation never overwrites the real source. An
 * external referrer we don't recognise becomes `referral`, which is still more
 * informative than the `organic` default: it says someone linked to us.
 */
export function sourceFromReferrer(referrer: string, ownHost: string): string {
  if (!referrer) return '';

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return '';
  }
  if (!host) return '';

  // Our own pages, including any subdomain, are not a source.
  const own = ownHost.toLowerCase().replace(/^www\./, '');
  const bare = host.replace(/^www\./, '');
  if (bare === own || bare.endsWith('.' + own)) return '';

  for (const [fragment, source] of REFERRER_SOURCES) {
    if (host.includes(fragment)) return source;
  }
  return 'referral';
}
