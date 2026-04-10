'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useCapacitor } from '@/components/mobile/CapacitorProvider';
import { isCoveredByCart, BUNDLE_CONTENTS } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { ga4AddToCart, pinterestTrack } from '@/lib/tracking';
import { usePurchased } from './PurchasedContext';

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
  const { isNative } = useCapacitor();
  const [visible, setVisible] = useState(false);
  const { items, addItem, isInCart, openCart, swapBundle } = useCart();
  const [justAdded, setJustAdded] = useState(false);

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
  const coveredBy = isCoveredByCart(items, slug);

  const purchased = usePurchased();

  // Hide in native app, when covered by bundle, or already purchased
  if (isNative || coveredBy || purchased.has(slug)) return null;

  function handleClick() {
    if (alreadyInCart) {
      openCart();
      return;
    }

    const bundleItem = {
      slug,
      name: productName,
      priceCents,
      stripePriceId,
      category,
      isBundle,
      imageUrl: imageUrl ?? null,
    };

    // When adding a bundle, auto-remove individual items AND smaller bundles it fully covers
    if (isBundle) {
      const childSlugs = BUNDLE_CONTENTS[slug] || [];
      const overlapping = items
        .filter((i) => {
          if (childSlugs.includes(i.slug)) return true;
          if (i.isBundle && i.slug !== slug) {
            const smallerChildren = BUNDLE_CONTENTS[i.slug] || [];
            return smallerChildren.length > 0 && smallerChildren.every((c) => childSlugs.includes(c));
          }
          return false;
        })
        .map((i) => i.slug);
      if (overlapping.length > 0) {
        swapBundle(overlapping, bundleItem);
        trackAddToCart();
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
        return;
      }
    }

    const added = addItem(bundleItem);

    if (added) {
      trackAddToCart();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  }

  function trackAddToCart() {
    const price = priceCents / 100;
    pinterestTrack('AddToCart', {
      value: price,
      order_quantity: 1,
      currency: 'USD',
      line_items: [
        {
          product_id: slug,
          product_name: productName,
          product_category: category,
          product_price: price,
          product_quantity: 1,
        },
      ],
    });
    ga4AddToCart({
      item_id: slug,
      item_name: productName,
      item_category: category,
      price,
      quantity: 1,
    });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden animate-slide-up-bar">
      <div className="bg-forest border-t border-forest-dark shadow-2xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-cream text-sm font-medium truncate">{productName}</p>
          <p className="text-cream text-sm font-semibold">{formatPrice(priceCents)}</p>
        </div>
        <button
          onClick={handleClick}
          aria-label={`${alreadyInCart ? 'View cart' : `Add ${productName} to cart`}`}
          className="bg-gold hover:bg-gold-light text-gray-900 font-semibold py-2.5 px-6 rounded-xl text-sm transition-all flex-shrink-0"
        >
          {justAdded ? '✓ Added!' : alreadyInCart ? 'View Cart' : 'Get This'}
        </button>
      </div>
    </div>
  );
}
