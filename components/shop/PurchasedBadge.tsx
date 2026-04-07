'use client';

import { usePurchased } from './PurchasedContext';

export default function PurchasedBadge({ slug }: { slug: string }) {
  const purchased = usePurchased();
  if (!purchased.has(slug)) return null;

  return (
    <div className="absolute top-3 left-3 bg-forest text-cream text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm z-20 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      Purchased
    </div>
  );
}
