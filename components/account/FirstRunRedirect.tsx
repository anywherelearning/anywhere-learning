'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadProfile } from '@/lib/member-profile';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * First-run guide: once cross-device sync has settled, if the signed-in member
 * still has no kids profile, send them to set one up. Waits for the sync-ready
 * signal so a returning member on a new device (whose profile is on the server
 * but not yet pulled) is never wrongly treated as brand new. The welcome step
 * is skippable, so this nudges rather than traps.
 */
export default function FirstRunRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!hasClerk) return;
    let done = false;

    function decide() {
      if (done) return;
      if (!(window as { __alSyncReady?: boolean }).__alSyncReady) return;
      done = true;
      window.removeEventListener('al:sync-ready', decide);
      if (!loadProfile()) router.replace('/account/welcome');
    }

    if ((window as { __alSyncReady?: boolean }).__alSyncReady) {
      decide();
    } else {
      window.addEventListener('al:sync-ready', decide);
      return () => window.removeEventListener('al:sync-ready', decide);
    }
  }, [router]);

  return null;
}
