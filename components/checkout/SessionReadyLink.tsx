'use client';

/**
 * A link to a Clerk-protected route (e.g. /account) that waits for the
 * Clerk session to be live before navigating.
 *
 * Why: Clerk's session cookie is short-lived (~60s). Coming back from Stripe
 * Checkout, the visitor spent minutes off-site, so the cookie has expired by
 * the time the success page renders. clerk-js refreshes it within a second
 * or two of page load, but a fast click on "Open my library" races that
 * refresh — the middleware sees a stale session and bounces to /sign-in.
 * Production domains usually recover via Clerk's handshake redirect, but
 * development instances don't, and even in production the handshake is an
 * extra round-trip. Forcing a token refresh before navigating makes the
 * click reliable everywhere.
 */

import { useClerk } from '@clerk/nextjs';

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function SessionReadyLink({ href, className, children }: Props) {
  const clerk = useClerk();

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      // Wait for clerk-js to finish loading (poll up to ~4s), then force a
      // token refresh, which also re-syncs the __session cookie the server
      // middleware reads.
      const deadline = Date.now() + 4000;
      while (!clerk.loaded && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (clerk.session) {
        await clerk.session.getToken({ skipCache: true });
      }
    } catch {
      /* Navigate anyway — worst case the middleware redirects to sign-in. */
    }
    window.location.assign(href);
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
