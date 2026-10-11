'use client';

import { useEffect } from 'react';
import useAttributionSource from '@/components/useAttributionSource';
import { SOURCE_COOKIE } from '@/lib/attribution';

/**
 * Resolves the visitor's source on every page (not just pages with a form)
 * and mirrors it into a cookie the server can read. See SOURCE_COOKIE.
 *
 * Only a non-empty source is written, so a later direct visit never wipes
 * the Facebook click that brought them in. 30 days covers the gap between an
 * ad click and coming back to start the trial.
 */
export default function AttributionCookie() {
  const source = useAttributionSource();

  useEffect(() => {
    if (!source) return;
    try {
      document.cookie = `${SOURCE_COOKIE}=${encodeURIComponent(source)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    } catch {
      /* cookies blocked: the server falls back to `organic` */
    }
  }, [source]);

  return null;
}
