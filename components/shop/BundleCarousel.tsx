'use client';

import { useState, useEffect } from 'react';
import ProductCarousel from './ProductCarousel';
import { usePurchased } from './PurchasedContext';
import type { ShopProduct } from '@/lib/types';

export default function BundleCarousel({ products }: { products: ShopProduct[] }) {
  const purchased = usePurchased();
  const [hidePurchased, setHidePurchased] = useState(false);

  useEffect(() => {
    function onToggle(e: Event) {
      const { hide } = (e as CustomEvent).detail;
      setHidePurchased(hide);
    }
    window.addEventListener('shop:hide-purchased', onToggle);
    return () => window.removeEventListener('shop:hide-purchased', onToggle);
  }, []);

  const filtered = hidePurchased
    ? products.filter((p) => !purchased.has(p.slug))
    : products;

  if (filtered.length === 0) return null;

  return <ProductCarousel products={filtered} />;
}
