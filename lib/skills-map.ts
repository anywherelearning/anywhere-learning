/**
 * The Future-Ready Skills Map as a one-time purchase (Oct 2026).
 *
 * The only thing still sold outside the membership. Bought without an
 * account: Stripe Checkout in payment mode, files delivered by a signed link
 * (thank-you page + delivery email), no Clerk user created.
 *
 * Two time-boxed perks:
 *   - Course bonus: course readers who buy within COURSE_BONUS_DAYS of joining
 *     the 5-day course also get the full Directions Challenge guide. The
 *     course emails link here with `?ref={{ subscriber.id }}`; the checkout
 *     route checks the reader's course-rwl tag date with Kit.
 *   - Owner offer: for OWNER_OFFER_HOURS after buying, 20% off the first year
 *     of the yearly membership. Applied automatically at trial checkout when
 *     the signed-in email has a recent map purchase.
 */

import crypto from 'node:crypto';

export const SKILLS_MAP = {
  slug: 'future-ready-skills-map',
  name: 'The Future-Ready Skills Map',
  priceUsd: 12.99,
  priceCents: 1299,
  // Stripe price (live), created by scripts/create-skills-map-stripe.ts
  stripePriceId: 'price_1UTOgEAkIBECpwGmLbYMJIgI',
} as const;

export const COURSE_BONUS_DAYS = 5;
export const OWNER_OFFER_HOURS = 72;

export const OWNER_OFFER = {
  slug: 'map',
  percentOff: 20,
  // Stripe coupon (live): 20% off, repeating 12 months so it lands on the
  // first paid invoice after the trial. Annual products only.
  couponId: 'map_owner_20',
} as const;

const BLOB = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com';

/** What a buyer can download. `bonus` files only unlock with the course bonus. */
export const MAP_FILES = {
  'map-phone': { label: 'Skills Map, phone version', url: `${BLOB}/Skills%20Map%202026%20-%20Phone.pdf`, bonus: false },
  'map-color': { label: 'Skills Map, print in color', url: `${BLOB}/Skills%20Map%202026%20-%20Color.pdf`, bonus: false },
  'map-bw': { label: 'Skills Map, print in black & white', url: `${BLOB}/Skills%20Map%202026%20-%20Black%20and%20White.pdf`, bonus: false },
  'bonus-phone': { label: 'Directions Challenge, phone version', url: `${BLOB}/Bonus%20-%20Directions%20Challenge%20v3%20-%20Phone.pdf`, bonus: true },
  'bonus-color': { label: 'Directions Challenge, print in color', url: `${BLOB}/Bonus%20-%20Directions%20Challenge%20v3%20-%20Color.pdf`, bonus: true },
  'bonus-bw': { label: 'Directions Challenge, print in black & white', url: `${BLOB}/Bonus%20-%20Directions%20Challenge%20v3%20-%20Black%20and%20White.pdf`, bonus: true },
} as const;

export type MapFileKey = keyof typeof MAP_FILES;

// ─── Download tokens ───
// A token is `<sessionId>.<bonus 0|1>.<hmac>`. It never expires: a buyer can
// re-download from the same email years later, like the old shop.

function secret(): string {
  const s = process.env.MAP_DOWNLOAD_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error('MAP_DOWNLOAD_SECRET (or STRIPE_WEBHOOK_SECRET) is not set');
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url').slice(0, 32);
}

export function makeDownloadToken(sessionId: string, bonus: boolean): string {
  const payload = `${sessionId}.${bonus ? 1 : 0}`;
  return `${payload}.${sign(payload)}`;
}

export function readDownloadToken(token: string): { sessionId: string; bonus: boolean } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [sessionId, b, mac] = parts;
  const expected = sign(`${sessionId}.${b}`);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) {
    return null;
  }
  return { sessionId, bonus: b === '1' };
}

export function downloadUrl(origin: string, token: string, file: MapFileKey): string {
  return `${origin}/api/skills-map/download?t=${encodeURIComponent(token)}&f=${file}`;
}

/** Files this buyer may download, in display order. */
export function filesFor(bonus: boolean): MapFileKey[] {
  return (Object.keys(MAP_FILES) as MapFileKey[]).filter((k) => bonus || !MAP_FILES[k].bonus);
}

export function ownerOfferEndsAt(purchasedAt: Date): Date {
  return new Date(purchasedAt.getTime() + OWNER_OFFER_HOURS * 60 * 60 * 1000);
}
