'use client';

import { useEffect, useState } from 'react';
import {
  SOURCE_STORAGE_KEY,
  sanitizeSource,
  sourceFromClickId,
  sourceFromReferrer,
} from '@/lib/attribution';

/**
 * The `from-{source}` value to send with a signup, captured once on mount.
 *
 * Shared by every email capture on the site (EmailForm, the quiz, the
 * challenge) so all three attribute the same way. Each used to carry its own
 * copy of this effect, which is how the referrer fallback came to be missing
 * from all of them at once.
 *
 * Stored in sessionStorage rather than resolved at submit time: someone can
 * land on a blog post from Facebook and subscribe three pages later, and by
 * then both the URL param and the referrer are gone.
 */
export default function useAttributionSource(): string {
  const [source, setSource] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const explicit = sanitizeSource(
        params.get('source') || params.get('utm_source') || '',
      );
      if (explicit) {
        setSource(explicit);
        sessionStorage.setItem(SOURCE_STORAGE_KEY, explicit);
        return;
      }

      // Whatever this session already worked out stays put: the first touch is
      // the one worth crediting.
      const stored = sessionStorage.getItem(SOURCE_STORAGE_KEY) || '';
      if (stored) {
        setSource(stored);
        return;
      }

      // Click ID before referrer: Facebook and Instagram open links in an
      // in-app browser that strips document.referrer, so for the two channels
      // that matter most this is the only signal that survives the trip.
      const resolved =
        sourceFromClickId(window.location.search) ||
        sourceFromReferrer(document.referrer, window.location.hostname);

      if (resolved) {
        setSource(resolved);
        sessionStorage.setItem(SOURCE_STORAGE_KEY, resolved);
      }
    } catch {
      // sessionStorage unavailable (private mode, etc.) - fail silently and
      // let the API fall back to `organic`.
    }
  }, []);

  return source;
}
