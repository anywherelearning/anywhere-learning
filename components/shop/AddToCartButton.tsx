'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';

interface AddToCartButtonProps {
  stripePriceId: string;
  slug: string;
  productName: string;
  priceCents: number;
  category: string;
  isBundle: boolean;
  imageUrl?: string | null;
}

export default function AddToCartButton({
  stripePriceId,
  slug,
  productName,
  priceCents,
  category,
  isBundle,
  imageUrl,
}: AddToCartButtonProps) {
  const { addItem, isInCart, openCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const alreadyInCart = isInCart(slug);

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

  return (
    <button
      onClick={handleClick}
      className="shimmer-effect block w-full bg-forest hover:bg-forest-dark active:scale-[0.98] text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center text-lg cursor-pointer"
    >
      <span aria-live="polite">
        {justAdded ? (
          <span className="flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added!
          </span>
        ) : alreadyInCart ? (
          <span className="flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            In Your Cart
          </span>
        ) : (
          `Get This — ${formatPrice(priceCents)}`
        )}
      </span>
    </button>
  );
}
