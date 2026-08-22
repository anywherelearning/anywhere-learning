'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CHALLENGE,
  areSignupsOpen,
  hasChallengeStarted,
  daysUntilChallenge,
} from '@/lib/challenge';

/**
 * Sitewide strip for the free 5-day challenge, mounted above SaleBanner in
 * app/layout.tsx. Disappears on its own the night the challenge ends, and
 * disappears immediately if CHALLENGE.isLive is switched off.
 *
 * Unlike SaleBanner this is NOT hidden from members. The challenge is free and
 * community-run, so a member seeing it is being invited to something, not sold
 * to. The Day 5 pitch lands by email on a tag they will not be carrying.
 *
 * The date check runs in an effect rather than at render, because the pages
 * this sits on are statically generated and a build-time `new Date()` would
 * freeze whatever day the deploy happened.
 */
export default function ChallengeBanner() {
  const [state, setState] = useState<{ open: boolean; started: boolean; days: number } | null>(null);

  useEffect(() => {
    setState({
      open: areSignupsOpen(),
      started: hasChallengeStarted(),
      days: daysUntilChallenge(),
    });
  }, []);

  if (!state?.open) return null;

  const lead = state.started
    ? 'Happening now'
    : state.days <= 1
      ? 'Starts tomorrow'
      : state.days <= 7
        ? `Starts in ${state.days} days`
        : `Starts ${CHALLENGE.startLabel}`;

  return (
    <div
      className="w-full bg-forest-dark text-cream text-sm sm:text-base"
      role="region"
      aria-label="Free 5-day challenge announcement"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center">
        <span className="font-semibold tracking-wide">Free 5-Day Real-World Skills Challenge</span>
        <span aria-hidden className="hidden text-gold-light sm:inline">&middot;</span>
        <span className="text-cream/85">{lead}</span>
        <Link
          href="/challenge?source=site-banner"
          className="rounded-full bg-gold px-4 py-1 font-semibold text-forest-dark transition hover:bg-gold-light"
        >
          {state.started ? 'Join in' : 'Save your spot'}
        </Link>
      </div>
    </div>
  );
}
