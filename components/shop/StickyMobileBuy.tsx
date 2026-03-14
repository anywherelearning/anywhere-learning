'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';

interface StickyMobileBuyProps {
  productName: string;
  priceCents: number;
  stripePriceId: string;
  slug: string;
  category: string;
  isBundle: boolean;
  imageUrl?: string | null;
}

export default function StickyMobileBuy({
  productName,
  priceCents,
  stripePriceId,
  slug,
  category,
  isBundle,
  imageUrl,
}: StickyMobileBuyProps) {
  const [visible, setVisible] = useState(false);
  const { addItem, isInCart, openCart } = useCart();

  useEffect(() => {
    const buyButton = document.getElementById('buy-button');
    if (!buyButton) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(buyButton);
    return () => observer.disconnect();
  }, []);

  const alreadyInCart = isInCart(slug);

  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    if (alreadyInCart) {
      openCart();
      return;
    }

    const added = addItem({
      slug,
      name: productName,
      priceCents,
      stripePriceId,
      category,
      isBundle,
      imageUrl: imageUrl ?? null,
    });

    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden animate-slide-up-bar">
      <div className="bg-forest border-t border-forest-dark shadow-2xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-cream text-sm font-medium truncate">{productName}</p>
          <p className="text-cream/70 text-xs">{formatPrice(priceCents)}</p>
        </div>
        <button
          onClick={handleClick}
          className="shimmer-effect bg-gold hover:bg-gold-light text-gray-900 font-semibold py-2.5 px-6 rounded-xl text-sm transition-all flex-shrink-0"
        >
          {justAdded ? '✓ Added!' : alreadyInCart ? 'View Cart' : 'Get This'}
        </button>
      </div>
    </div>
  );
}
