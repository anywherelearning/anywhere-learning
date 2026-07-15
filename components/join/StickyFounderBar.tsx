'use client';

import { useState, useEffect } from 'react';
import {
  IS_FOUNDER_PHASE,
  MEMBERSHIP_PRICE_YEAR,
  MEMBERSHIP_PRICE_YR,
  POST_FOUNDER_PRICE_USD,
  MONTHLY_PLAN_PRICE_MO,
} from '@/lib/membership';

export default function StickyFounderBar({ claimed = 47, cap = 100 }: { claimed?: number; cap?: number }) {
  const remaining = cap - claimed;
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem('al_sticky_dismissed') === '1') {
        setDismissed(true);
        return;
      }
    }

    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem('al_sticky_dismissed', '1');
    } catch {}
  }

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-3.5 left-1/2 z-[60] flex w-[min(1060px,calc(100%-28px))] -translate-x-1/2 items-center justify-between gap-3.5 rounded-[14px] bg-forest-dark/95 px-5 py-2.5 text-sm text-cream shadow-2xl backdrop-blur-sm transition-all duration-400 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[160%] opacity-0 pointer-events-none'
      }`}
      role="region"
      aria-label="Founder pricing reminder"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-gold-light animate-pulse" aria-hidden="true" />
        <span className="truncate">
          <span className="hidden sm:inline">
            {IS_FOUNDER_PHASE ? 'Founder pricing: ' : 'Membership: '}
            <b className="text-gold-light">{MEMBERSHIP_PRICE_YEAR}</b>
            {IS_FOUNDER_PHASE && (
              <>
                {' '}
                <s className="text-cream/50">${POST_FOUNDER_PRICE_USD}</s>
              </>
            )}
            {' or '}
            {MONTHLY_PLAN_PRICE_MO}
            {' · '}
            <b className="text-gold-light">{remaining} of {cap}</b> spots left
          </span>
          <span className="sm:hidden">
            <b className="text-gold-light">{MEMBERSHIP_PRICE_YR}</b>{' '}
            {IS_FOUNDER_PHASE ? 'founder rate' : 'membership'} · {remaining} left
          </span>
        </span>
      </div>
      <a
        href="#checkout"
        className="flex-shrink-0 rounded-full bg-gold-light px-4 py-2 text-[13.5px] font-semibold text-gray-900 transition-all hover:brightness-105 hover:-translate-y-px"
      >
        Claim Spot →
      </a>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md px-2 py-1.5 text-lg leading-none text-cream/65 transition-colors hover:bg-white/10 hover:text-cream"
        aria-label="Dismiss founder pricing reminder"
      >
        ×
      </button>
    </div>
  );
}
