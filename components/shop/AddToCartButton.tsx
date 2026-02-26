'use client';

import { useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

interface AddToCartButtonProps {
  lemonVariantId: string;
  productName: string;
  priceCents: number;
}

export default function AddToCartButton({
  lemonVariantId,
  productName,
  priceCents,
}: AddToCartButtonProps) {
  useEffect(() => {
    // Load Lemon Squeezy embed script
    if (document.querySelector('script[src*="lemonsqueezy"]')) return;
    const script = document.createElement('script');
    script.src = 'https://assets.lemonsqueezy.com/lemon.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Don't remove on unmount since other buttons may use it
    };
  }, []);

  const checkoutUrl = `https://anywherelearning.lemonsqueezy.com/checkout/buy/${lemonVariantId}?embed=1`;

  return (
    <a
      href={checkoutUrl}
      className="lemonsqueezy-button block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md text-center text-lg"
    >
      Get {productName} &mdash; {formatPrice(priceCents)}
    </a>
  );
}
