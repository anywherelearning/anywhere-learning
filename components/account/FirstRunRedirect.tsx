'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadProfile } from '@/lib/member-profile';
import { notifyLocalChanged } from '@/lib/account-sync';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const SEEN_KEY = 'al_onboarded_v1';

/**
 * First-run guide: once cross-device sync has settled, if the signed-in member
 * still has no kids profile, send them to set one up. Waits for the sync-ready
 * signal so a returning member on a new device (whose profile is on the server
 * but not yet pulled) is never wrongly treated as brand new. The welcome step
 * is skippable, so this nudges rather than traps.
 *
 * Never fires for guests. Setting up explorers is meaningless to someone who
 * cannot open an activity yet, and it would bury the paywall teaser under a
 * form. They stay on the page they asked for, faded, which answers "what do I
 * get?" far better. /post-sign-in makes the same call server-side.
 */
export default function FirstRunRedirect({ hasAccess = true }: { hasAccess?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasClerk || !hasAccess) return;
    let done = false;

    function decide() {
      if (done) return;
      if (!(window as { __alSyncReady?: boolean }).__alSyncReady) return;
      done = true;
      window.removeEventListener('al:sync-ready', decide);
      // Already has kids, or has already been shown the setup once: don't prompt.
      if (loadProfile() || localStorage.getItem(SEEN_KEY)) return;
      // Mark as shown (even if they skip) so it never auto-appears again.
      localStorage.setItem(SEEN_KEY, '1');
      notifyLocalChanged();
      router.replace('/account/welcome');
    }

    if ((window as { __alSyncReady?: boolean }).__alSyncReady) {
      decide();
    } else {
      window.addEventListener('al:sync-ready', decide);
      return () => window.removeEventListener('al:sync-ready', decide);
    }
  }, [router, hasAccess]);

  return null;
}
