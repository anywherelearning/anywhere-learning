'use client';

// ─── Shared state for the gated checklist download on an idea list page ───
//
// One email unlocks the printable version of the list. That is the whole offer.
//
// It used to be two cards: a printable that was free with no email, beside a
// complete guided activity that cost one. The free card took everything and the
// gated one collected zero real signups in a month. The first fix bundled them,
// which broke on the second visit: the claim ledger allows one activity per
// address ever, so someone working through several lists was pitched a new
// guide on every page and handed back the same one each time.
//
// So the activity is out of the idea lists entirely and the printable is the
// ask. It is the thing that is actually per-list, so it is the thing that can
// honestly be offered again on the next list.
//
// The 50 ideas themselves stay open on the page. They are the crawlable content
// that earns the traffic, so only the printable sits behind the ask.
//
// The offer appears twice, top and below the list, because most visitors never
// scroll. They sit in different subtrees with server-rendered content between
// them, so a context provider would mean restructuring the page around them.
// This syncs through a browser event instead, and persists so a returning
// visitor is greeted rather than asked twice.
//
// The persisted flag only decides what the card shows. The proof that counts
// is a signed httpOnly cookie the subscribe route sets, which the download
// route checks before streaming the file. If the flag says unlocked but the
// cookie is gone, the route bounces back with ?unlock=needed and the form
// comes back.

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import useAttributionSource from '@/components/useAttributionSource';

const STORAGE_KEY = 'al-ideas-offer-claimed';
const SYNC_EVENT = 'al-ideas-offer-claimed';

export type OfferStatus = 'idle' | 'loading' | 'success' | 'error';

function hasUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function useIdeaOffer(listSlug: string, categorySlug: string) {
  // The channel, not the page. This capture used to hardcode `ideas-{category}`
  // as its source, which is why every idea-list signup was invisible in the
  // channel breakdown. The page is recorded separately by the `checklist:{list}`
  // tag, so sending the channel here costs nothing and restores the attribution.
  const attributionSource = useAttributionSource();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<OfferStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  // Pick up an earlier unlock, from this page load or a previous visit. One
  // email unlocks the printable on every list: they are the same ask repeated,
  // and re-asking someone who already subscribed just costs them the download.
  useEffect(() => {
    // The download route bounces here with ?unlock=needed when the browser
    // showed the buttons but held no valid server cookie (cleared cookies,
    // an expired token, or a hand-set localStorage flag). Drop the stale
    // flag and ask again, then tidy the URL so a reload doesn't repeat it.
    let bounced = false;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('unlock') === 'needed') {
        bounced = true;
        localStorage.removeItem(STORAGE_KEY);
        url.searchParams.delete('unlock');
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      // nothing to tidy
    }
    if (!bounced && hasUnlocked()) {
      setUnlocked(true);
      setStatus('success');
    }
    const onSync = () => {
      setUnlocked(true);
      setStatus('success');
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, []);

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage('');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      setStatus('loading');

      try {
        // Shared browser/server id so Meta dedupes the pixel + Conversions API pair.
        const { newMetaEventId } = await import('@/lib/tracking');
        const metaEventId = newMetaEventId();
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            metaEventId,
            source: attributionSource || 'organic',
            // Routes the signup to the checklist funnel instead of the
            // `lead` one, and records which list did the work. The server
            // resolves the slug, so an unknown one is rejected rather than
            // silently minting a junk Kit tag.
            checklist: listSlug,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setErrorMessage(
            data.error || 'Something went wrong. Please try again.',
          );
          setStatus('error');
          return;
        }

        setUnlocked(true);
        setStatus('success');

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now() }));
        } catch {
          // private mode: the offer just asks again next visit
        }
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));

        try {
          const { pinterestSetEnhancedMatch, metaLead } = await import(
            '@/lib/tracking'
          );
          pinterestSetEnhancedMatch(email);
          metaLead(`ideas:${categorySlug}`, metaEventId);
        } catch {
          // tracking is best-effort, never block delivery
        }
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
        setStatus('error');
      }
    },
    [email, listSlug, categorySlug, attributionSource],
  );

  return {
    email,
    setEmail,
    status,
    errorMessage,
    setErrorMessage,
    /** They have given an email, here or on an earlier idea list, so this
     *  page's printable is theirs. One email unlocks every list's printable. */
    unlocked,
    submit,
  };
}
