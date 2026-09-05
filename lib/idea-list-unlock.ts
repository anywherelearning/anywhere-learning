import { createHmac, timingSafeEqual } from 'crypto';

// ─── Signed proof that someone gave an email for an idea-list printable ───
//
// The printables used to be gated in the browser only: a localStorage flag
// flipped the download buttons on, and the buttons linked straight to the
// public Blob files. Anyone who set the flag by hand or shared the raw link
// skipped the ask. Now the proof is a signed token the server minted, kept
// in an httpOnly cookie, and the files are served through a route that
// checks it. The same token also rides on the link in the Kit welcome
// email, so clicking that link both opens the PDF and unlocks the device.
//
// The token is not bound to an email or a list on purpose: one email
// unlocks every list's printable, which is what the page promises.

export const IDEAS_UNLOCK_COOKIE = 'al_ideas_unlock';
export const IDEAS_UNLOCK_QUERY = 't';

/** How long a device stays unlocked after one signup. */
export const IDEAS_UNLOCK_TTL_SECONDS = 365 * 24 * 60 * 60;

const VERSION = 'v1';

function secret(): string {
  const explicit = process.env.IDEAS_UNLOCK_SECRET;
  if (explicit) return explicit;
  // Derive from an existing secret so a missing env var degrades to a
  // working (if less rotatable) gate instead of breaking every download.
  const fallback =
    process.env.STRIPE_WEBHOOK_SECRET || process.env.CLERK_SECRET_KEY;
  if (fallback) {
    return createHmac('sha256', fallback).update('ideas-unlock').digest('hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('IDEAS_UNLOCK_SECRET is not set');
  }
  return 'dev-only-ideas-unlock-secret';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** Mint a token that proves a signup happened. Expiry is a unix timestamp. */
export function signIdeaUnlockToken(
  ttlSeconds: number = IDEAS_UNLOCK_TTL_SECONDS,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${VERSION}.${exp.toString(36)}`;
  return `${payload}.${sign(payload)}`;
}

/** True when the token was minted by us and has not expired. */
export function verifyIdeaUnlockToken(token: string | null | undefined): boolean {
  if (!token || token.length > 200) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== VERSION) return false;
  const [, expRaw, sig] = parts;
  const exp = parseInt(expRaw, 36);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${VERSION}.${expRaw}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Cookie settings shared by the subscribe route and the download route. */
export function ideaUnlockCookie(token: string) {
  return {
    name: IDEAS_UNLOCK_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    // Scoped to the one route that reads it, so it never rides along on
    // page loads or other API calls.
    path: '/api/ideas',
    maxAge: IDEAS_UNLOCK_TTL_SECONDS,
  };
}
