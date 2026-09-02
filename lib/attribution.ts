/**
 * Where a subscriber came from, resolved once per session.
 *
 * Precedence: an explicit `?source=` beats `?utm_source=`, which beats whatever
 * the session already captured, which beats a platform click ID on the URL,
 * which beats the referring domain.
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

/**
 * Click-ID parameter to source tag.
 *
 * The referrer fallback below covers a link opened in a normal browser, but
 * misses the case that matters most here: Facebook and Instagram open links in
 * their own in-app browser, which strips `document.referrer`. Someone tapping a
 * link in a Facebook group therefore arrives looking exactly like direct
 * traffic, which is how the largest channel kept landing in `from-organic`.
 *
 * These platforms all append their own click ID to the URL, and that survives
 * the in-app browser. Checked in order, first match wins.
 */
const CLICK_ID_SOURCES: ReadonlyArray<readonly [string, string]> = [
  ['fbclid', 'facebook'],
  ['igshid', 'instagram'],
  ['igsh', 'instagram'],
  ['epik', 'pinterest'],
  ['ttclid', 'tiktok'],
  ['gclid', 'google'],
  ['msclkid', 'bing'],
  ['li_fat_id', 'linkedin'],
  ['twclid', 'twitter'],
];

/**
 * Map the current URL's query string to a source tag via its click ID.
 * Returns '' when no known click ID is present.
 */
export function sourceFromClickId(search: string): string {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return '';
  }
  for (const [param, source] of CLICK_ID_SOURCES) {
    if (params.has(param)) return source;
  }
  return '';
}

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
