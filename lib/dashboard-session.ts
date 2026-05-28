/**
 * Resolves the dashboard userId for the current request.
 *
 * If the user is signed in with Clerk, returns their Clerk userId.
 * Otherwise issues / reads an anonymous cookie-based identifier so the
 * unauthenticated /discover demo still has per-browser persistence.
 *
 * The DB stores both shapes as a plain text user_id. When auth is fully
 * wired we can migrate anon-cookie rows by claiming them on first sign-in.
 */

import { cookies } from 'next/headers';

const ANON_COOKIE_NAME = 'al-dashboard-anon';
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function generateAnonId(): string {
  // crypto.randomUUID() is available in Node 19+ and all edge runtimes.
  return `anon-${crypto.randomUUID()}`;
}

/**
 * Returns the user_id to use for DB queries in dashboard routes.
 * Sets the anonymous cookie if missing. Safe to call from route handlers.
 */
export async function getDashboardUserId(): Promise<string> {
  // Clerk integration: when auth is enabled and a user is signed in, prefer their id.
  // We dynamically import to avoid breaking when Clerk env vars are missing.
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();
      if (userId) return userId;
    } catch {
      // Fall through to anon cookie.
    }
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_COOKIE_NAME);
  if (existing?.value) return existing.value;

  const fresh = generateAnonId();
  // Note: Next route handlers can write cookies via the cookies() API.
  cookieStore.set(ANON_COOKIE_NAME, fresh, {
    maxAge: ANON_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // readable from client for parity (no secrets here)
  });
  return fresh;
}
