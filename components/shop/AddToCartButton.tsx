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
      className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-center text-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading
        ? 'Redirecting to checkout...'
        : `Get ${productName} \u2014 ${formatPrice(priceCents)}`}
    </button>
  );
}
