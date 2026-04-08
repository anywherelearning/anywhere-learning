'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useCapacitor } from '@/components/mobile/CapacitorProvider';
import { isCoveredByCart } from '@/lib/cart';
import { usePurchased } from './PurchasedContext';

interface QuickAddButtonProps {
  stripePriceId: string;
  slug: string;
  name: string;
  priceCents: number;
  category: string;
  isBundle: boolean;
  imageUrl: string | null;
}

export default function QuickAddButton({
  stripePriceId,
  slug,
  name,
  priceCents,
  category,
  isBundle,
  imageUrl,
}: QuickAddButtonProps) {
  const { isNative } = useCapacitor();
  const { items, addItem, removeItem, isInCart } = useCart();
  const purchased = usePurchased();
  const [justAdded, setJustAdded] = useState(false);
  const [justRemoved, setJustRemoved] = useState(false);

  // Hide in native app (Apple compliance)
  if (isNative) return null;

  // Hide for already-purchased products
  if (purchased.has(slug)) return null;

  const alreadyInCart = isInCart(slug);
  const coveredBy = isCoveredByCart(items, slug);

  // Product is included in a bundle already in the cart - show non-interactive indicator
  if (coveredBy) {
    return (
      <span
        aria-label={`Included in ${coveredBy}`}
        title={`Included in ${coveredBy}`}
        className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-forest/10 text-forest"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (alreadyInCart) {
      removeItem(slug);
      setJustRemoved(true);
      setTimeout(() => setJustRemoved(false), 1500);
      return;
    }

    const added = addItem({
      slug,
      name,
      priceCents,
      stripePriceId,
      category,
      isBundle,
      imageUrl,
    });

    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  }

  const label = justAdded
    ? 'Added!'
    : justRemoved
      ? 'Removed'
      : alreadyInCart
        ? 'Remove from cart'
        : 'Get this';

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
        justAdded
          ? 'bg-forest text-cream scale-110'
          : justRemoved
            ? 'bg-gray-200 text-gray-500 scale-95'
            : alreadyInCart
              ? 'bg-forest text-cream hover:bg-red-500 hover:scale-110 active:scale-95'
              : 'bg-forest/5 text-forest hover:bg-forest hover:text-cream hover:scale-110 active:scale-95'
      }`}
    >
      {justAdded ? (
        /* Checkmark */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : justRemoved ? (
        /* Minus */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ) : alreadyInCart ? (
        /* Checkmark - in cart */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        /* Shopping bag - matches header cart icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      )}
    </button>
  );
}
