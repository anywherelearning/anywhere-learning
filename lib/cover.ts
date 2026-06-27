/**
 * Central cache-bust for product cover images.
 *
 * Cover JPGs live at /public/products/<slug>.jpg and are served at a stable URL,
 * so when a cover is redesigned the old version can linger in browser, CDN, and
 * next/image optimizer caches. Appending ?v=<COVER_VERSION> changes the URL, so
 * every cache refetches.
 *
 * To force every cover to refresh after a redesign: bump COVER_VERSION here AND
 * update the matching `search` value in next.config.ts `images.localPatterns`
 * (next/image rejects query strings that aren't allow-listed).
 */
export const COVER_VERSION = '2';

/** Append the cover cache-bust version to a local /products/*.jpg path. */
export function coverSrc(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  // External URLs (e.g. Vercel Blob) are content-addressed already; leave them.
  if (path.startsWith('http')) return path;
  const base = path.split('?')[0];
  return `${base}?v=${COVER_VERSION}`;
}
