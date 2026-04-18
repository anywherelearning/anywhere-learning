'use client';

/**
 * Pinterest tag user_data helpers — improve Event Quality Score by populating
 * the parameters Pinterest's matching algorithm needs:
 *
 *   - external_id: SHA-256 hash of a stable browser-persistent visitor UUID.
 *     Lets Pinterest match a conversion to a user even when no email is known
 *     (guest checkout, anonymous browsing).
 *
 *   - click_id (epik): captured from the URL when a user lands from a
 *     Pinterest ad (?epik=...) and persisted in a cookie so it can be sent
 *     with conversion events that fire on later pages.
 *
 * Without these, Pinterest's EQS dashboard reports "External ID not set up"
 * and "Click ID not set up", which degrades attribution accuracy and the
 * algorithm's ability to optimize ad delivery.
 *
 * All client-only — these helpers no-op safely on the server.
 */

const VISITOR_ID_COOKIE = 'aw_visitor_id';
const PINTEREST_EPIK_COOKIE = '_epik'; // Pinterest's standard cookie name

/** Read a cookie by name (browser-only, returns null if missing or SSR). */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  for (const c of cookies) {
    const idx = c.indexOf('=');
    if (idx === -1) continue;
    if (c.slice(0, idx) === name) {
      return decodeURIComponent(c.slice(idx + 1));
    }
  }
  return null;
}

/** Write a cookie with the given TTL in days. */
function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

/** SHA-256 hash of a string, returns lowercase hex. Returns '' on older browsers. */
async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '';
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns the SHA-256 hash of a stable browser-persistent visitor ID.
 * Generates a UUID on first visit and persists it for 1 year so the same
 * visitor produces the same hash across sessions and conversions.
 */
export async function getExternalIdHash(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  let id = readCookie(VISITOR_ID_COOKIE);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `aw_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    writeCookie(VISITOR_ID_COOKIE, id, 365);
  }
  const hashed = await sha256Hex(id);
  return hashed || null;
}

/**
 * Capture the Pinterest click ID (epik) from the current URL and persist
 * it in a cookie for 7 days. Pinterest's tag also auto-captures into the
 * same cookie, but we mirror it explicitly to handle:
 *   - SPA route changes (App Router doesn't trigger full page loads)
 *   - third-party-cookie environments where Pinterest's auto-capture fails
 * Returns the active epik (newly captured or previously stored).
 */
export function captureAndStoreEpik(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const epik = params.get('epik');
  if (epik) {
    writeCookie(PINTEREST_EPIK_COOKIE, epik, 7);
    return epik;
  }
  return readCookie(PINTEREST_EPIK_COOKIE);
}

/** Read the currently stored epik click ID, if any. */
export function getStoredEpik(): string | null {
  return readCookie(PINTEREST_EPIK_COOKIE);
}
