'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isGiftSeason } from '@/lib/gift';

/**
 * Sitewide holiday strip for gift memberships, mounted with the other banners
 * in app/layout.tsx. Shows itself for GIFT_SEASON (Nov 20 to Dec 22) and
 * disappears on its own after. `?giftbanner=1` forces it on, to check it
 * outside the season.
 *
 * Shown to members too: a member gifting a year to a friend is the best kind
 * of sale. Hidden on the gift pages themselves and inside the member zone.
 *
 * The date check runs in an effect, not at render, because most pages are
 * statically generated and a build-time `new Date()` would freeze the day.
 */
export default function GiftBanner() {
  const pathname = usePathname() || '';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('giftbanner') === '1';
    setShow(forced || isGiftSeason());
  }, []);

  if (!show) return null;
  if (/^\/(gift|account|admin)(\/|$)/.test(pathname)) return null;

  return (
    <div className="w-full bg-[#9E5B43] text-cream text-sm sm:text-base" role="region" aria-label="Holiday gift announcement">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center">
        <span className="font-semibold tracking-wide">Give a year of real-world adventures</span>
        <span aria-hidden className="hidden text-gold-light sm:inline">&middot;</span>
        <span className="text-cream/90">The holiday gift that isn&apos;t more stuff</span>
        <Link
          href="/gift?source=site-banner"
          className="rounded-full bg-cream px-4 py-1 font-semibold text-[#7A3D24] transition hover:bg-white"
        >
          Give a gift
        </Link>
      </div>
    </div>
  );
}
