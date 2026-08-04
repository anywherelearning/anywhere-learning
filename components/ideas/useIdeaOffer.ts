'use client';

// ─── Shared state for the two free-activity offers on an idea list page ───
//
// The offer appears twice: compact, beside the PDF download near the top (most
// visitors take the PDF and leave, so the ask has to reach them there), and in
// full below the list for anyone who scrolls. They are the same offer, so
// submitting either has to settle both. Otherwise someone who signs up at the
// top scrolls down and gets asked again for something they already have.
//
// The two instances sit in different subtrees with server-rendered content
// between them, so a context provider would mean restructuring the page around
// them. This syncs through a browser event instead, and persists so a returning
// visitor is greeted rather than asked twice.

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import type { IdeaFreeActivity } from '@/lib/ideas-free-activity';

const STORAGE_KEY = 'al-ideas-offer-claimed';
const SYNC_EVENT = 'al-ideas-offer-claimed';

export type OfferStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ClaimedState {
  /** The guide they ended up with, which may not be this page's. */
  name: string;
  downloadUrl: string;
  /** True when they'd already used their one claim on another list. */
  wasPrior: boolean;
}

function readStored(): ClaimedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClaimedState) : null;
  } catch {
    return null;
  }
}

export function useIdeaOffer(categorySlug: string, activity: IdeaFreeActivity) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<OfferStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [claimed, setClaimed] = useState<ClaimedState | null>(null);

  // Pick up an earlier claim, from this page load or a previous visit.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setClaimed(stored);
      setStatus('success');
    }
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<ClaimedState>).detail;
      if (!detail) return;
      setClaimed(detail);
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
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            source: `ideas-${categorySlug}`,
            guide: activity.guideTag,
            oncePerEmail: true,
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

        const next: ClaimedState = data.alreadyClaimed
          ? {
              name: data.alreadyClaimed.name,
              downloadUrl: data.alreadyClaimed.downloadUrl,
              wasPrior: true,
            }
          : {
              name: activity.name,
              downloadUrl: activity.downloadUrl,
              wasPrior: false,
            };

        setClaimed(next);
        setStatus('success');

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // private mode: the offer just asks again next visit
        }
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));

        try {
          const { pinterestSetEnhancedMatch, metaLead } = await import(
            '@/lib/tracking'
          );
          pinterestSetEnhancedMatch(email);
          metaLead(`ideas:${categorySlug}`);
        } catch {
          // tracking is best-effort, never block delivery
        }
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
        setStatus('error');
      }
    },
    [email, categorySlug, activity],
  );

  return {
    email,
    setEmail,
    status,
    errorMessage,
    setErrorMessage,
    claimed,
    submit,
  };
}
