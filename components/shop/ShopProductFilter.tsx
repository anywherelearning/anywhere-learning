'use client';

import { useState, useEffect } from 'react';
import { usePurchased } from './PurchasedContext';
import ProductGrid from './ProductGrid';

interface ShopProductFilterProps {
  products: Parameters<typeof ProductGrid>[0]['products'];
}

/**
 * Client wrapper around ProductGrid that listens for the
 * "shop:hide-purchased" custom event from ShopSidebar and
 * filters out already-purchased products when the toggle is on.
 */
export default function ShopProductFilter({ products }: ShopProductFilterProps) {
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

  return <ProductGrid products={filtered} />;
}
