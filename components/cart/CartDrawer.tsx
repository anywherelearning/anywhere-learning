'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { CategoryIcon } from '@/components/shop/icons';
import { formatPrice } from '@/lib/utils';
import { getBundleOverlaps } from '@/lib/cart';

export default function CartDrawer() {
  const { items, itemCount, totalCents, isCartOpen, closeCart, removeItem } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, closeCart]);

  // Focus trap — focus the panel when it opens
  useEffect(() => {
    if (isCartOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isCartOpen]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            stripePriceId: item.stripePriceId,
            slug: item.slug,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        setCheckingOut(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckingOut(false);
    }
  }

  // Bundle overlap warnings
  const bundleOverlaps = items
    .filter((item) => item.isBundle)
    .flatMap((bundle) => {
      const overlapping = getBundleOverlaps(items, bundle.slug);
      if (overlapping.length === 0) return [];
      return [{ bundleName: bundle.name, overlapping }];
    });

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={closeCart}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-cream shadow-2xl flex flex-col animate-slide-in-right outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60">
          <h2 className="font-display text-xl text-forest">
            Your Cart {itemCount > 0 && <span className="text-gray-400 font-body text-sm font-normal">({itemCount})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-gray-400 mb-1 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mb-6">Browse our activity packs and add some to get started.</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="text-forest font-semibold text-sm hover:underline"
              >
                Browse Packs
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-4"
                >
                  {/* Category icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    <CategoryIcon category={item.category} className="w-5 h-5 text-forest" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{item.name}</p>
                    <p className="text-sm text-forest font-semibold mt-1">{formatPrice(item.priceCents)}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.slug)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Bundle overlap warnings */}
          {bundleOverlaps.length > 0 && (
            <div className="mt-4 space-y-2">
              {bundleOverlaps.map(({ bundleName, overlapping }) => (
                <div key={bundleName} className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 text-sm text-gray-600">
                  <span className="font-medium">{overlapping.join(', ')}</span>
                  {overlapping.length === 1 ? ' is' : ' are'} already included in <span className="font-medium">{bundleName}</span>.
                  You can remove {overlapping.length === 1 ? 'it' : 'them'} to avoid paying twice.
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200/60 px-6 py-5 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-semibold text-forest">{formatPrice(totalCents)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="shimmer-effect w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkingOut ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Preparing checkout...
                </span>
              ) : (
                'Checkout'
              )}
            </button>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-gray-400 hover:text-forest transition-colors mt-3 py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
