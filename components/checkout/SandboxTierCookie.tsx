'use client';

import { useEffect } from 'react';

/**
 * SANDBOX-ONLY: writes the `al_tier_preview` cookie after a successful Stripe
 * Checkout, so the user's library, account, and product pages unlock the way
 * they would for a real member without us having wired Clerk + webhook +
 * Resend yet.
 *
 * Cookie expires in 7 days. The `detectAccessTier` helpers on the product and
 * account pages already read this cookie as a fallback.
 *
 * REPLACE BEFORE LAUNCH: in production, the Stripe webhook should create
 * a Clerk account, link it to the Stripe customer ID, and the tier should be
 * read from the database via the authenticated session — not a client cookie.
 */
export default function SandboxTierCookie({ tier }: { tier: 'member' | 'starter' }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `al_tier_preview=${tier}; path=/; max-age=${maxAge}; samesite=lax`;
  }, [tier]);
  return null;
}
