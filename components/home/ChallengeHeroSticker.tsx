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
        className="relative z-20 mb-5 inline-flex items-center gap-2.5 rounded-full border-2 border-gold bg-forest px-4 py-2 text-cream shadow-lg transition hover:bg-forest-dark lg:hidden"
        aria-label={`Free 5-day Real-World Skills Challenge, ${when}`}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold">Free</span>
        <span className="text-[13.5px] font-semibold leading-tight">5-Day Challenge</span>
        <span aria-hidden className="text-cream/45">|</span>
        <span className="text-[12.5px] text-cream/85">{when}</span>
      </Link>

      {/* ── Desktop: the round sticker ── */}
      <div
        className="pointer-events-none absolute -bottom-6 -right-4 z-20 hidden lg:block xl:-right-20"
        aria-hidden="false"
      >
        <Link
          href="/challenge?source=hero-sticker"
          className="pointer-events-auto group relative block -rotate-[7deg] transition-transform duration-300 hover:-rotate-[3deg] hover:scale-[1.04]"
          aria-label={`Free 5-day Real-World Skills Challenge, ${when}. Save your spot.`}
        >
          <span
            className="absolute -inset-2 rounded-full bg-gold/35 blur-xl transition group-hover:bg-gold/50"
            aria-hidden="true"
          />
          <span className="relative flex h-[164px] w-[164px] flex-col items-center justify-center rounded-full border-[3px] border-gold bg-forest text-center shadow-[0_18px_40px_-14px_rgba(60,50,30,0.65)]">
            <span className="text-[9.5px] font-extrabold uppercase tracking-[0.24em] text-gold">
              Free
            </span>
            <span className="mt-0.5 font-display text-[38px] leading-none text-cream">5&#8209;Day</span>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
              Challenge
            </span>
            <span
              className="my-2 block h-px w-8 bg-gold/60"
              aria-hidden="true"
            />
            <span className="px-3 text-[11.5px] font-medium leading-tight text-cream/85">{when}</span>
            <span className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-gold">
              Save your spot
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
