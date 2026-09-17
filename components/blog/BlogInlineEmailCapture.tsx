'use client';

// ─── The page's free magnet, asked for inside the article body ───
//
// The exit popup (BlogExitIntentPopup) offers the same magnet on the way out.
// This is the same ask placed after the first section, for the reader who
// arrived from Google, got what they came for, and will never trigger an exit
// gesture on a phone. It shares the popup's localStorage keys, so a reader who
// gives an email here is not asked again at exit, and vice versa.
//
// The lead_source is `inline:{page}` so GA4 can compare it with `popup:*`.

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import useAttributionSource from '@/components/useAttributionSource';
import type { LeadMagnet } from '@/lib/lead-magnets';

const GUIDE_SUBMITTED_KEY = 'free-guide-submitted';
const IDEAS_CLAIMED_KEY = 'al-ideas-offer-claimed';
const MAGNET_CLAIMED_KEY = 'lead-magnet-claimed';

interface Props {
  magnet: LeadMagnet;
  /** Post or guide slug, recorded in the lead_source. */
  pageSlug: string;
}

function alreadyClaimed(magnet: LeadMagnet): boolean {
  try {
    if (localStorage.getItem(MAGNET_CLAIMED_KEY)) return true;
    if (magnet.kind === 'ideas') return !!localStorage.getItem(IDEAS_CLAIMED_KEY);
    return !!localStorage.getItem(GUIDE_SUBMITTED_KEY);
  } catch {
    return false;
  }
}

export default function BlogInlineEmailCapture({ magnet, pageSlug }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hidden, setHidden] = useState(false);
  const source = useAttributionSource();

  // Someone who already has this magnet (from here, the popup, or an idea
  // list) gets the article without the ask.
  useEffect(() => {
    if (alreadyClaimed(magnet)) setHidden(true);
  }, [magnet]);

  if (hidden) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const { newMetaEventId } = await import('@/lib/tracking');
      const metaEventId = newMetaEventId();
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: source || 'blog-inline',
          ...(magnet.kind === 'ideas' ? { checklist: magnet.slug } : {}),
          ...(magnet.kind === 'capable-kid' ? { guide: 'capable-kid' } : {}),
          metaEventId,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
      try {
        localStorage.setItem(MAGNET_CLAIMED_KEY, '1');
        if (magnet.kind === 'ideas') {
          localStorage.setItem(IDEAS_CLAIMED_KEY, JSON.stringify({ at: Date.now() }));
        } else {
          localStorage.setItem(GUIDE_SUBMITTED_KEY, 'true');
        }
      } catch {}
      try {
        const { pinterestSetEnhancedMatch, trackLead } = await import('@/lib/tracking');
        pinterestSetEnhancedMatch(email);
        trackLead(`inline:${pageSlug}`, metaEventId);
      } catch {}
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <aside
      aria-label={`Free: ${magnet.title}`}
      className="my-10 md:my-12 rounded-2xl border border-gold/15 bg-gradient-to-br from-[#fefbf6] via-[#fdf6ec] to-[#faf9f6] p-6 md:p-8 shadow-[0_2px_24px_-4px_rgba(212,163,115,0.12)]"
    >
      {status === 'success' ? (
        <div className="text-center py-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-2">
            On its way
          </p>
          <p className="font-display text-[1.4rem] md:text-[1.6rem] text-forest leading-[1.1] mb-2 text-balance">
            Check your inbox.
          </p>
          <p className="text-[14.5px] text-gray-500 leading-relaxed max-w-[420px] mx-auto">
            {magnet.title} is on its way to {email}. If it is not there in a few minutes, check the
            promotions folder.
          </p>
          {magnet.kind === 'ideas' && (
            <Link
              href={magnet.href}
              className="mt-5 inline-block rounded-full bg-forest px-7 py-3 text-sm font-semibold text-cream transition-all hover:bg-forest-dark no-underline"
            >
              Open the printable now
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97B5C] mb-2">
            {magnet.eyebrow}
          </p>
          <p className="font-display text-[1.4rem] md:text-[1.7rem] text-forest leading-[1.08] mb-2 text-balance">
            {magnet.title}
          </p>
          <p className="text-[14.5px] md:text-[15px] text-gray-600 leading-relaxed max-w-[560px]">
            {magnet.blurb}
          </p>
          <form onSubmit={handleSubmit} noValidate className="mt-5">
            <label htmlFor={`inline-capture-${pageSlug}`} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id={`inline-capture-${pageSlug}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={status === 'loading'}
                aria-describedby={errorMessage ? `inline-capture-${pageSlug}-error` : undefined}
                className={`flex-1 min-w-0 rounded-xl border bg-white px-4 py-3 text-[15px] text-forest-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/40 ${
                  errorMessage ? 'border-red-400' : 'border-[#C9D3BE]'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-xl bg-forest px-6 py-3 text-[15px] font-semibold text-cream whitespace-nowrap transition-all hover:bg-forest-dark active:scale-[0.98] disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending…' : magnet.cta}
              </button>
            </div>
            {errorMessage && (
              <p id={`inline-capture-${pageSlug}-error`} role="alert" className="mt-2 text-[13.5px] text-red-600">
                {errorMessage}
              </p>
            )}
            <p className="mt-2.5 text-[12.5px] text-gray-500">
              Free, one email. No spam, unsubscribe any time.
            </p>
          </form>
        </>
      )}
    </aside>
  );
}
