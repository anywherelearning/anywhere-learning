'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { SALE_CONFIG, isSaleActive, saleDaysLeft } from '@/lib/sale';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SaleBanner() {
  if (!hasClerk) return <SaleBannerInner />;
  return <Gated />;
}

/** Hide only from full members (incl. trial). Starters still see it so they can
 *  upgrade to membership at the sale price. */
function Gated() {
  const { isLoaded, user } = useUser();
  const tier = user?.publicMetadata?.tier as string | undefined;
  const isFullMember = tier === 'member';
  if (!isLoaded || isFullMember) return null;
  return <SaleBannerInner />;
}

function SaleBannerInner() {
  const [active, setActive] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setActive(isSaleActive());
    setDaysLeft(saleDaysLeft());
  }, []);

  if (!active) return null;

  const daysCopy =
    daysLeft <= 1 ? 'Last day' : daysLeft === 2 ? 'Ends tomorrow' : `${daysLeft} days left`;

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
