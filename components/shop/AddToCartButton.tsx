'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface AddToCartButtonProps {
  stripePriceId: string;
  slug: string;
  productName: string;
  priceCents: number;
}

export default function AddToCartButton({
  stripePriceId,
  slug,
  productName,
  priceCents,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripePriceId, slug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="shimmer-effect block w-full bg-forest hover:bg-forest-dark active:scale-[0.98] text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center text-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Preparing checkout...
        </span>
      ) : (
        `Get ${productName} \u2014 ${formatPrice(priceCents)}`
      )}
    </button>
  );
}
