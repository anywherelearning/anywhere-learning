'use client';

import { useEffect, useState } from 'react';

export type AccessTier = 'guest' | 'trial' | 'member';

/**
 * The signed-in user's access tier as the database sees it.
 *
 * Returns null until the answer arrives. Callers should treat null as "not a
 * member yet" rather than guessing from Clerk's publicMetadata mirror, which
 * can claim a membership the database won't honor. The public header already
 * renders its signed-out state until clerk-js hydrates, so one more async step
 * is not a new flash.
 *
 * Skips the request entirely when signed out.
 */
export function useAccessTier(isSignedIn: boolean): AccessTier | null {
  const [tier, setTier] = useState<AccessTier | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setTier(null);
      return;
    }
    let cancelled = false;
    fetch('/api/user/access', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tier?: AccessTier } | null) => {
        if (!cancelled && d?.tier) setTier(d.tier);
      })
      .catch(() => {
        /* Offline or rate-limited: stay null, i.e. show the marketing nav. */
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return tier;
}
