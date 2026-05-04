'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSaleActive, SALE_CONFIG, saleDaysLeft } from '@/lib/sale';

/**
 * Sale callout overlaid on the hero during Home Educators' Appreciation
 * Week. Two distinct treatments:
 *
 * - Mobile: a soft cream card with gold border above the hero text.
 * - Desktop: a BIG centered punchy card with forest background, cream
 *   text, gold border + glow, and a slight tilt. Designed to be the
 *   visual focal point of the hero for the sale week.
 *
 * Renders only while the sale is active; disappears automatically once
 * the sale window closes.
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
    <>
      {/* === MOBILE: soft card above hero text === */}
      <div
        className="relative z-20 mx-auto mb-6 max-w-md lg:hidden animate-gentle-float"
        role="region"
        aria-label="Home Educators' Appreciation Week sale"
      >
        <div className="rounded-3xl border-2 border-gold bg-cream/95 p-6 shadow-2xl backdrop-blur-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
            {SALE_CONFIG.name}
          </p>
          <p className="mb-3 font-display text-3xl leading-tight text-forest">
            25% off everything
          </p>
          <p className="mb-5 text-sm leading-relaxed text-gray-700">
            To recognize the hard work you do every day. Thank you for showing
            up for your kids. This week is for you.
          </p>
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark"
            >
              Shop the sale
            </Link>
            <span className="text-xs font-medium italic text-forest-dark/70">
              {daysCopy}
            </span>
          </div>
        </div>
      </div>

      {/* === DESKTOP: big bold card on the right with tilt === */}
      <div
        className="pointer-events-none absolute right-4 top-4 z-20 hidden lg:block xl:right-0 xl:top-8"
        role="region"
        aria-label="Home Educators' Appreciation Week sale"
      >
        <div className="pointer-events-auto relative -rotate-2 transform animate-gentle-float">
          {/* Soft gold glow behind the card */}
          <div className="absolute -inset-3 rounded-[2rem] bg-gold/40 blur-2xl" aria-hidden="true" />

          {/* Main card */}
          <div className="relative w-[26rem] xl:w-[28rem] rounded-[2rem] border-[3px] border-gold bg-forest px-9 py-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              {/* Decorative star */}
              <svg
                className="h-5 w-5 text-gold flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" />
              </svg>
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-gold">
                {SALE_CONFIG.name}
              </p>
            </div>

            <p className="font-display text-7xl leading-none text-cream mb-4">
              25% off
            </p>
            <p className="text-2xl font-semibold text-cream mb-2">
              Everything. All week.
            </p>
            <p className="mb-6 max-w-md text-base leading-relaxed text-cream/85">
              To recognize the hard work you do every day. Thank you for
              showing up for your kids. This week is for you.
            </p>

            <div className="flex items-center gap-5">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-xl bg-gold px-7 py-3.5 text-base font-bold text-forest-dark shadow-lg transition-all hover:scale-[1.03] hover:bg-gold-light hover:shadow-xl"
              >
                Shop the sale
              </Link>
              <span className="text-sm font-medium italic text-cream/75">
                {daysCopy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
