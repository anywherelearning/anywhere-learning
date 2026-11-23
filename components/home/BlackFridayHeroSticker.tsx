'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAccessTier } from '@/hooks/useAccessTier';
import {
  BLACK_FRIDAY_OFFER,
  BLACK_FRIDAY_PRICE_USD,
  blackFridayDaysLeft,
} from '@/lib/black-friday';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const HREF = '/black-friday?source=hero-sticker';

/**
 * Black Friday sticker on the homepage hero, built on ChallengeHeroSticker:
 * a round, tilted gold sticker on desktop, parked in the open map space just
 * right of the hero buttons (higher up it covered the photo and the
 * HeroNextStop title), and a pill above the headline on phones (a big circle
 * there would push the h1 below the fold).
 *
 * Gold on purpose: the top strip is forest, and the hero's main button is
 * forest, so gold reads as the offer without fighting "Start free trial".
 *
 * Same audience as the Black Friday strip: hidden from members and trials.
 * Date check runs in an effect because the homepage is statically generated.
 * `?bfbanner=1` forces it on (with the strip) to check it outside the window.
 */
export default function BlackFridayHeroSticker() {
  if (!hasClerk) return <StickerInner />;
  return <Gated />;
}

function Gated() {
  const { isLoaded, isSignedIn } = useUser();
  const tier = useAccessTier(!!isSignedIn);
  if (!isLoaded) return null;
  if (isSignedIn && tier === null) return null;
  if (tier === 'member' || tier === 'trial') return null;
  return <StickerInner />;
}

function StickerInner() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('bfbanner') === '1';
    setDaysLeft(forced ? 8 : blackFridayDaysLeft());
  }, []);

  if (daysLeft <= 0) return null;

  const when =
    daysLeft <= 1 ? 'Last day' : daysLeft === 2 ? 'Ends tomorrow' : `Through ${BLACK_FRIDAY_OFFER.endsLabelShort}`;
  const label = `${BLACK_FRIDAY_OFFER.name}: your first year for $${BLACK_FRIDAY_PRICE_USD}. ${when}.`;

  return (
    <>
      {/* ── Mobile: a pill above the headline ── */}
      <Link
        href={HREF}
        className="relative z-20 mb-5 inline-flex items-center gap-2.5 rounded-full border-2 border-forest bg-gold px-4 py-2 text-forest-dark shadow-lg transition hover:bg-gold-light lg:hidden"
        aria-label={label}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]">{BLACK_FRIDAY_OFFER.name}</span>
        <span className="text-[13.5px] font-semibold leading-tight">First year ${BLACK_FRIDAY_PRICE_USD}</span>
        <span aria-hidden className="text-forest-dark/40">|</span>
        <span className="text-[12.5px] text-forest-dark/80">{when}</span>
      </Link>

      {/* ── Desktop: the round sticker ── */}
      <div className="pointer-events-none absolute bottom-0 left-[calc(100%-70px)] z-30 hidden lg:block">
        <Link
          href={HREF}
          className="pointer-events-auto group relative block -rotate-[7deg] transition-transform duration-300 hover:-rotate-[3deg] hover:scale-[1.04]"
          aria-label={label}
        >
          <span
            className="absolute -inset-3 rounded-full bg-gold/45 blur-2xl transition group-hover:bg-gold/60"
            aria-hidden="true"
          />
          <span className="relative flex h-[210px] w-[210px] flex-col items-center justify-center rounded-full border-[4px] border-forest bg-gold text-center text-forest-dark shadow-[0_22px_50px_-16px_rgba(60,50,30,0.7)]">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.26em]">
              {BLACK_FRIDAY_OFFER.name}
            </span>
            <span className="mt-1 font-display text-[60px] leading-none">${BLACK_FRIDAY_PRICE_USD}</span>
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em]">your first year</span>
            <span className="my-2.5 block h-px w-10 bg-forest-dark/40" aria-hidden="true" />
            <span className="px-4 text-[13px] font-medium leading-tight text-forest-dark/85">{when}</span>
            <span className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-forest-dark">
              Get the offer
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
