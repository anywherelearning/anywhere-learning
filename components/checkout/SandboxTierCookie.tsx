'use client';

import { useEffect } from 'react';

/**
 * Sandbox-era cookie cleanup.
 *
 * This component used to WRITE an `al_tier_preview` cookie after a successful
 * Stripe Checkout so the library, account, and product pages would unlock
 * before our webhook + Clerk wiring was complete. It worked as a dev hack but
 * became a real security hole at launch: the cookie persisted in browsers for
 * 7 days, letting refunded customers keep access until the cookie expired.
 *
 * Now: the access tier is read exclusively from the DB on every server render
 * (no cookie fallback anywhere in the codebase). This component is left in
 * place to actively CLEAR any stale `al_tier_preview` cookie a returning
 * sandbox tester might still be carrying — once everyone's browser has been
 * to /checkout/success at least once post-launch, the component can be
 * removed entirely.
 */
export default function SandboxTierCookie(_props: { tier?: 'member' | 'starter' }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.cookie = 'al_tier_preview=; path=/; max-age=0; samesite=lax';
  }, []);
  return null;
}
