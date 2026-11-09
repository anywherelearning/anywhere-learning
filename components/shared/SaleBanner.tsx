'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAccessTier } from '@/hooks/useAccessTier';
import { SALE_CONFIG, isSaleActive, saleDaysLeft } from '@/lib/sale';
import {
  BLACK_FRIDAY_OFFER,
  BLACK_FRIDAY_PRICE_USD,
  blackFridayDaysLeft,
} from '@/lib/black-friday';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SaleBanner() {
  if (!hasClerk) return <SaleBannerInner />;
  return <Gated />;
}

/**
 * Hide only from people who already have the library (paid or trialing).
 * Everyone else sees the sale, including signed-in non-members.
 *
 * Access comes from the database via useAccessTier, not Clerk's
 * publicMetadata.tier: the mirror only gets corrected by a Stripe webhook, so
 * an account whose subscription went away any other way keeps claiming
 * membership and would hide its own sale banner.
 */
function Gated() {
  const { isLoaded, isSignedIn } = useUser();
  const tier = useAccessTier(!!isSignedIn);
  if (!isLoaded) return null;
  // Signed in but the tier hasn't landed yet: wait, rather than flashing the
  // banner at a member and shifting the page when it disappears. Signed-out
  // visitors resolve to null with no request, so they see it immediately.
  if (isSignedIn && tier === null) return null;
  if (tier === 'member' || tier === 'trial') return null;
  return <SaleBannerInner />;
}

function daysLeftCopy(daysLeft: number): string {
  return daysLeft <= 1 ? 'Last day' : daysLeft === 2 ? 'Ends tomorrow' : `${daysLeft} days left`;
}

/**
 * Black Friday strip. Separate from SALE_CONFIG on purpose: isSaleActive also
 * discounts the shop at /api/checkout, and this sale is membership only.
 * `?bfbanner=1` forces it on, to check it outside the window.
 */
function BlackFridayStrip({ daysLeft }: { daysLeft: number }) {
  return (
    <div
      className="w-full bg-forest text-cream text-sm sm:text-base"
      role="region"
      aria-label="Black Friday announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
        <span className="font-semibold tracking-wide">{BLACK_FRIDAY_OFFER.name}</span>
        <span className="opacity-80 hidden sm:inline">·</span>
        <span className="opacity-90">Your first year for ${BLACK_FRIDAY_PRICE_USD}</span>
        <span className="opacity-80 hidden sm:inline">·</span>
        <span className="opacity-90 italic">{daysLeftCopy(daysLeft)}</span>
        <Link
          href="/black-friday?source=bf-banner"
          className="ml-1 sm:ml-3 inline-block bg-gold text-forest-dark font-semibold px-3 py-1 rounded-full hover:bg-gold-light transition-colors"
        >
          Get the offer
        </Link>
      </div>
    </div>
  );
}

function SaleBannerInner() {
  const pathname = usePathname() || '';
  const [active, setActive] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [bfDaysLeft, setBfDaysLeft] = useState(0);

  useEffect(() => {
    setActive(isSaleActive());
    setDaysLeft(saleDaysLeft());
    const forced = new URLSearchParams(window.location.search).get('bfbanner') === '1';
    setBfDaysLeft(forced ? 8 : blackFridayDaysLeft());
  }, []);

  if (bfDaysLeft > 0) {
    // The offer page is logo-only, with one job.
    if (/^\/black-friday(\/|$)/.test(pathname)) return null;
    return <BlackFridayStrip daysLeft={bfDaysLeft} />;
  }

  if (!active) return null;

  const daysCopy = daysLeftCopy(daysLeft);

  return (
    <div
      className="w-full bg-forest text-cream text-sm sm:text-base"
      role="region"
      aria-label="Sitewide sale announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
        <span className="font-semibold tracking-wide">
          {SALE_CONFIG.percentOff}% off everything
        </span>
        <span className="opacity-80 hidden sm:inline">·</span>
        <span className="opacity-90">{SALE_CONFIG.name}</span>
        <span className="opacity-80 hidden sm:inline">·</span>
        <span className="opacity-90 italic">{daysCopy}</span>
        <Link
          href="/shop"
          className="ml-1 sm:ml-3 inline-block bg-gold text-forest-dark font-semibold px-3 py-1 rounded-full hover:bg-gold-light transition-colors"
        >
          {SALE_CONFIG.bannerCta}
        </Link>
      </div>
    </div>
  );
}
