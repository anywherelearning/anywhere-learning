'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSaleActive, SALE_CONFIG, saleDaysLeft } from '@/lib/sale';

/**
 * Floating sale card overlaid on the hero image during Home Educators'
 * Appreciation Week. Renders only while the sale is active. On mobile it
 * sits as a card above the hero text; on desktop it floats over the right
 * side of the hero image (on top of the kids photo).
 */
export default function HeroSaleBadge() {
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
      className="
        relative z-20
        mx-auto mb-6 max-w-md
        lg:absolute lg:right-6 lg:top-16 xl:right-12 xl:top-20
        lg:mx-0 lg:mb-0 lg:max-w-sm
        animate-gentle-float
      "
      role="region"
      aria-label="Home Educators' Appreciation Week sale"
    >
      <div className="rounded-3xl border-2 border-gold bg-cream/95 p-6 shadow-2xl backdrop-blur-sm lg:p-7">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
          {SALE_CONFIG.name}
        </p>
        <p className="mb-3 font-display text-3xl leading-tight text-forest lg:text-4xl">
          25% off everything
        </p>
        <p className="mb-5 text-sm leading-relaxed text-gray-700 lg:text-base">
          To recognize the hard work you do every day. Thank you for showing
          up for your kids. This week is for you.
        </p>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark lg:px-5 lg:py-3"
          >
            Shop the sale
          </Link>
          <span className="text-xs font-medium italic text-forest-dark/70">
            {daysCopy}
          </span>
        </div>
      </div>
    </div>
  );
}
