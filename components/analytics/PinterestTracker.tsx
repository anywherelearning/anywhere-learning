'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { pinterestPageVisit } from '@/lib/tracking';

/**
 * Fires a Pinterest pagevisit on every client-side route change.
 * The base tag in layout.tsx handles the initial page load; this handles
 * subsequent navigations in the App Router (which don't trigger a full reload).
 */
export default function PinterestTracker() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    pinterestPageVisit();
  }, [pathname]);

  return null;
}
