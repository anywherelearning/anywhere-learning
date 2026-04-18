'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { pinterestPageVisit, pinterestSetUserData } from '@/lib/tracking';
import { captureAndStoreEpik, getExternalIdHash } from '@/lib/pinterest-id';

/**
 * Pinterest tag lifecycle:
 * - On initial mount: capture the epik click ID from the URL (if landing
 *   from a Pinterest ad), generate or read the persistent visitor UUID,
 *   and push both into Pinterest's user_data block. Together these lift
 *   the Event Quality Score (EQS) for External ID and Click ID matching.
 * - On every client-side route change: re-capture epik (in case of
 *   intra-site links carrying it) and fire a pagevisit (the base tag in
 *   layout.tsx only fires once on initial page load).
 */
export default function PinterestTracker() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  // Set user_data once on first mount. external_id is stable per visitor,
  // epik persists in cookie for 7 days, so we don't need to re-set on every
  // route change — just re-capture epik in case it appears mid-session.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const click_id = captureAndStoreEpik() ?? undefined;
      const external_id = (await getExternalIdHash()) ?? undefined;
      if (cancelled) return;
      pinterestSetUserData({ external_id, click_id });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    // Cheap re-capture on every route change so cross-page epik
    // additions are caught (rare but possible).
    captureAndStoreEpik();
    pinterestPageVisit();
  }, [pathname]);

  return null;
}
