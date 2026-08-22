'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  areSignupsOpen,
  hasChallengeStarted,
  daysUntilChallenge,
} from '@/lib/challenge';

/**
 * A round "sticker" for the free challenge, slapped on the homepage hero.
 *
 * Deliberately smaller than HeroSaleBadge: the sale badge is the focal point
 * of its week and takes the whole right side, while this sits beside the
 * headline without competing with "Start free trial", which is still the
 * primary action on the page.
 *
 * Desktop gets the actual round sticker, tilted and floating. Mobile gets a
 * horizontal pill instead, because a 160px circle above the h1 pushes the
 * headline below the fold on a phone.
 *
 * Sits at z-30 so it laps over the HeroNextStop card, which is z-20. That
 * overlap is the point: it reads as something stuck on top of the page
 * rather than another panel laid out beside the others.
 *
 * Renders only while signups are open, and vanishes on its own the night the
 * challenge ends. The date check runs in an effect because the homepage is
 * statically generated, so a build-time date would freeze at deploy time.
 */
export default function ChallengeHeroSticker() {
  const [state, setState] = useState<{ open: boolean; started: boolean; days: number } | null>(null);

  useEffect(() => {
    setState({
      open: areSignupsOpen(),
      started: hasChallengeStarted(),
      days: daysUntilChallenge(),
    });
  }, []);

  if (!state?.open) return null;

  const when = state.started
    ? 'Happening now'
    : state.days <= 1
      ? 'Starts tomorrow'
      : state.days <= 7
        ? `Starts in ${state.days} days`
        : `Sept 14 to 18`;

  return (
    <>
      {/* ── Mobile: a pill above the headline ── */}
      <Link
        href="/challenge?source=hero-sticker"
        className="relative z-20 mb-5 inline-flex items-center gap-2.5 rounded-full border-2 border-gold-light bg-[#c4836a] px-4 py-2 text-cream shadow-lg transition hover:brightness-95 lg:hidden"
        aria-label={`Free 5-day Real-World Skills Challenge, ${when}`}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cream/85">Free</span>
        <span className="text-[13.5px] font-semibold leading-tight">5-Day Challenge</span>
        <span aria-hidden className="text-cream/45">|</span>
        <span className="text-[12.5px] text-cream/85">{when}</span>
      </Link>

      {/* ── Desktop: the round sticker ── */}
      <div
        className="pointer-events-none absolute top-[56px] -right-[150px] z-30 hidden lg:block xl:-right-[270px]"
        aria-hidden="false"
      >
        <Link
          href="/challenge?source=hero-sticker"
          className="pointer-events-auto group relative block -rotate-[7deg] transition-transform duration-300 hover:-rotate-[3deg] hover:scale-[1.04]"
          aria-label={`Free 5-day Real-World Skills Challenge, ${when}. Save your spot.`}
        >
          <span
            className="absolute -inset-3 rounded-full bg-[#c4836a]/45 blur-2xl transition group-hover:bg-[#c4836a]/60"
            aria-hidden="true"
          />
          <span className="relative flex h-[210px] w-[210px] flex-col items-center justify-center rounded-full border-[4px] border-gold-light bg-[#c4836a] text-center shadow-[0_22px_50px_-16px_rgba(60,50,30,0.7)]">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-cream/90">
              Free
            </span>
            <span className="mt-1 font-display text-[50px] leading-none text-cream">5&#8209;Day</span>
            <span className="text-[15px] font-semibold uppercase tracking-[0.14em] text-cream">
              Challenge
            </span>
            <span
              className="my-2.5 block h-px w-10 bg-cream/45"
              aria-hidden="true"
            />
            <span className="px-4 text-[13px] font-medium leading-tight text-cream/90">{when}</span>
            <span className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-gold-light">
              Save your spot
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
