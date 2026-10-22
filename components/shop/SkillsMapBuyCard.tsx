'use client';

import { useEffect, useState } from 'react';
import { Magnet, PAPER_SHADOW } from '@/components/shared/Paper';

/**
 * Buy card for the one product sold on its own: the Skills Map. Carries the
 * course email's `?ref=` (a Kit subscriber id) through to checkout, where it
 * unlocks the course bonus inside its window.
 */
export default function SkillsMapBuyCard({ priceLabel }: { priceLabel: string }) {
  const [href, setHref] = useState('/api/checkout/skills-map');
  const [isCourse, setIsCourse] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const ref = sp.get('ref');
    if (ref && /^\d{1,15}$/.test(ref)) {
      setHref(`/api/checkout/skills-map?ref=${ref}`);
      setIsCourse(true);
    }
    setError(sp.get('error') === 'checkout');
  }, []);

  return (
    <div className={`relative max-w-[400px] rotate-[1deg] bg-white px-4 pb-3 pt-6 ${PAPER_SHADOW}`}>
      <Magnet color="#C97B5C" size={22} />
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="inline-flex items-center gap-1.5 bg-[#F2EFE4] text-forest-dark text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full">
          Instant download
        </span>
        <span className="font-display italic text-[17px] text-[#C97B5C]">{priceLabel}</span>
      </div>
      <a
        href={href}
        className="w-full inline-flex items-center justify-center gap-1.5 bg-forest text-cream font-semibold py-2.5 px-3 rounded-xl text-[13.5px] whitespace-nowrap shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all"
      >
        Get the Skills Map
        <span aria-hidden="true">→</span>
      </a>
      <p className="mt-1.5 text-center text-[11.5px] text-gray-500">
        {isCourse ? 'Course readers: bonus guide included this week' : 'Phone, color and black & white versions'}
      </p>
      {error && (
        <p className="mt-2 text-center text-[12px] text-[#B5533C]">
          Checkout didn&apos;t open. Please try again, or email info@anywherelearning.co.
        </p>
      )}
    </div>
  );
}
