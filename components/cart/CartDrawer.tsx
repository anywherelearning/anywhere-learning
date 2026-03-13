'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { CategoryIcon } from '@/components/shop/icons';
import { formatPrice } from '@/lib/utils';
import { getBundleOverlaps, getBundleUpsell, loadCartEmail, saveCartEmail } from '@/lib/cart';
import type { BundleUpsell } from '@/lib/cart';

export default function CartDrawer() {
  const { items, itemCount, totalCents, isCartOpen, closeCart, removeItem, addItem } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [dismissedUpsell, setDismissedUpsell] = useState<string | null>(null);
  const [cartEmail, setCartEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoaded, setEmailLoaded] = useState(false);
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

  // Load persisted email on mount
  useEffect(() => {
    const saved = loadCartEmail();
    if (saved) setCartEmail(saved);
    setEmailLoaded(true);
  }, []);

  // Persist email to localStorage on change
  useEffect(() => {
    if (emailLoaded && cartEmail) {
      saveCartEmail(cartEmail);
    }
  }, [cartEmail, emailLoaded]);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail(): boolean {
    if (!cartEmail.trim()) {
      setEmailError('Please enter your email for your receipt.');
      return false;
    }
    if (!EMAIL_REGEX.test(cartEmail.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  }

  async function handleCheckout() {
    if (items.length === 0) return;

    // Validate email before proceeding
    if (!validateEmail()) return;

    // Guard: if any item is missing a price ID, remove them and abort
    const invalid = items.filter((i) => !i.stripePriceId);
    if (invalid.length > 0) {
      invalid.forEach((i) => removeItem(i.slug));
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            stripePriceId: item.stripePriceId,
            slug: item.slug,
          })),
          email: cartEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        setCheckoutError('Something went wrong. Please try again.');
        setCheckingOut(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutError('Could not connect. Please check your internet and try again.');
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

  // Bundle upsell suggestion
  const upsell: BundleUpsell | null = getBundleUpsell(items);
  const showUpsell = upsell && upsell.bundle.slug !== dismissedUpsell;

  const [swappingBundle, setSwappingBundle] = useState(false);

  async function handleBundleSwap(suggestion: BundleUpsell) {
    setSwappingBundle(true);
    try {
      // Fetch real product data from DB (BUNDLE_DATA has empty stripePriceId)
      const res = await fetch(`/api/products/lookup?slug=${encodeURIComponent(suggestion.bundle.slug)}`);
      if (!res.ok) {
        console.error('Bundle lookup failed:', res.status);
        return;
      }
      const product = await res.json();
      if (!product.stripePriceId) {
        console.error('Bundle has no stripePriceId:', suggestion.bundle.slug);
        return;
      }

      // Remove the individual packs that the bundle replaces
      for (const slug of suggestion.matchingSlugs) {
        removeItem(slug);
      }
      // Add the bundle with real DB data (including valid stripePriceId)
      addItem({
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        stripePriceId: product.stripePriceId,
        category: product.category,
        isBundle: product.isBundle,
        imageUrl: product.imageUrl,
      });
    } catch (error) {
      console.error('Bundle swap error:', error);
    } finally {
      setSwappingBundle(false);
    }
  }

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
                  {/* Product image */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gray-50 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon category={item.category} className="w-5 h-5 text-forest" />
                      </div>
                    )}
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

          {/* Bundle upsell suggestion */}
          {showUpsell && upsell && (
            <div className="mt-4 bg-forest/5 border border-forest/15 rounded-2xl p-4 animate-fade-in-up">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  <span className="text-sm font-semibold text-forest">
                    {upsell.savingsCents > 0 ? 'Bundle & save' : 'Upgrade to the bundle'}
                  </span>
                </div>
                <button
                  onClick={() => setDismissedUpsell(upsell.bundle.slug)}
                  className="text-gray-300 hover:text-gray-400 transition-colors p-0.5"
                  aria-label="Dismiss suggestion"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </button>
              </div>

              {upsell.savingsCents > 0 ? (
                /* Savings frame — bundle is cheaper than what they already have */
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    You have {upsell.matchingSlugs.length} packs from the{' '}
                    <span className="font-medium">{upsell.bundle.name}</span>.
                    Get the full bundle and save{' '}
                    <span className="font-semibold text-forest">{formatPrice(upsell.savingsCents)}</span>.
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(upsell.individualTotal)}
                      </span>
                      <span className="text-sm font-semibold text-forest">
                        {formatPrice(upsell.bundle.priceCents)}
                      </span>
                    </div>
                    <span className="text-xs bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full font-medium">
                      Save {formatPrice(upsell.savingsCents)}
                    </span>
                  </div>
                </>
              ) : (
                /* Upgrade frame — bundle costs more but gives way more value */
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    You have {upsell.matchingSlugs.length} of {upsell.totalChildCount} packs from the{' '}
                    <span className="font-medium">{upsell.bundle.name}</span>.
                    Get all {upsell.totalChildCount} for just{' '}
                    <span className="font-semibold text-forest">{formatPrice(upsell.additionalCostCents)} more</span>.
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-forest">
                      {formatPrice(upsell.bundle.priceCents)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(upsell.bundle.compareAtPriceCents)} if bought separately
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={() => handleBundleSwap(upsell)}
                disabled={swappingBundle}
                className="w-full bg-forest hover:bg-forest-dark text-cream text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {swappingBundle ? 'Switching to bundle...' : 'Get the Bundle Instead'}
              </button>
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
            {/* Email for receipt */}
            <div className="mb-4">
              <label htmlFor="cart-email" className="block text-sm text-gray-500 mb-1.5">
                Where should we send your receipt?
              </label>
              <input
                id="cart-email"
                type="email"
                placeholder="you@example.com"
                value={cartEmail}
                onChange={(e) => {
                  setCartEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCheckout();
                  }
                }}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
                  emailError ? 'border-red-300' : 'border-gray-200'
                }`}
                autoComplete="email"
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
            </div>
            {checkoutError && (
              <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-shake">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {checkoutError}
              </div>
            )}
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
