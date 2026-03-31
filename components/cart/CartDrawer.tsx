'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { CategoryIcon } from '@/components/shop/icons';
import { formatPrice } from '@/lib/utils';
import { getBundleOverlaps, getBundleUpsell, loadCartEmail, saveCartEmail, FREE_BONUS_SLUG } from '@/lib/cart';
import type { BundleUpsell } from '@/lib/cart';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useCapacitor } from '@/components/mobile/CapacitorProvider';
import { openExternalBrowser } from '@/lib/capacitor';

export default function CartDrawer() {
  const { items, itemCount, totalCents, isCartOpen, closeCart, removeItem, addItem, swapBundle, byobTier, byobDiscountCents, byobTotalCents, nextByobTier } = useCart();
  const { isNative } = useCapacitor();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [dismissedUpsell, setDismissedUpsell] = useState<string | null>(null);
  const [cartEmail, setCartEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoaded, setEmailLoaded] = useState(false);
  const focusTrapRef = useFocusTrap(isCartOpen);

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
    // Email is optional — only validate format if they entered something
    if (cartEmail.trim() && !EMAIL_REGEX.test(cartEmail.trim())) {
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
        // In Capacitor: open Stripe checkout in external browser (reader model — no in-app purchase)
        // On web: redirect normally
        await openExternalBrowser(data.url);
        if (isNative) {
          setCheckingOut(false);
          closeCart();
        }
      } else {
        console.error('Checkout error:', data.error);
        setCheckoutError('Hmm, something didn\u2019t work. Give it another try!');
        setCheckingOut(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutError('Couldn\u2019t connect \u2014 check your internet and try again.');
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

      // Atomically remove individual packs and add the bundle (single dispatch)
      swapBundle(suggestion.matchingSlugs, {
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
        ref={focusTrapRef}
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
              <p className="text-gray-400 mb-1 font-medium">Nothing here yet!</p>
              <p className="text-gray-400 text-sm mb-6">Find your family&apos;s next adventure in our activity packs.</p>
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
                      <Image
                        src={item.imageUrl}
                        alt=""
                        width={56}
                        height={56}
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
                    {item.slug === FREE_BONUS_SLUG && items.some((i) => i.isBundle) ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-forest">FREE</span>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(item.priceCents)}</span>
                        <span className="text-xs font-medium text-gold-dark bg-gold/15 px-1.5 py-0.5 rounded-full">
                          Bundle bonus
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-forest font-semibold mt-1">{formatPrice(item.priceCents)}</p>
                    )}
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

          {/* Free Skills Map bonus with any bundle */}
          {items.some((i) => i.isBundle) && !items.some((i) => i.slug === 'future-ready-skills-map') && (
            <div className="mt-4">
              <div className="flex items-start gap-4 bg-gold/5 border border-gold/20 rounded-xl p-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden">
                  <Image
                    src="/products/future-ready-skills-map.jpg"
                    alt=""
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    The Future-Ready Skills Map
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-forest">FREE</span>
                    <span className="text-xs text-gray-400 line-through">$9.99</span>
                    <span className="text-xs font-medium text-gold-dark bg-gold/15 px-1.5 py-0.5 rounded-full">
                      Bundle bonus
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
            {/* Bundle nudge when only the Skills Map is in the cart */}
            {items.length === 1 && items[0].slug === FREE_BONUS_SLUG && (
              <Link
                href="/shop"
                onClick={closeCart}
                className="mb-3 flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-xl px-4 py-2.5 text-sm text-gold-dark hover:bg-gold/15 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span>
                  Get any bundle and <span className="font-semibold">this is free</span>
                </span>
              </Link>
            )}

            {/* BYOB next-tier nudge (hide when only the Skills Map is in the cart) */}
            {nextByobTier && !items.some((i) => i.isBundle) && !(items.length === 1 && items[0].slug === FREE_BONUS_SLUG) && (
              <div className="mb-3 flex items-center gap-2 bg-forest/5 border border-forest/15 rounded-xl px-4 py-2.5 text-sm text-forest">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <span>
                  Add {nextByobTier.itemsNeeded} more {nextByobTier.itemsNeeded === 1 ? 'pack' : 'packs'} for{' '}
                  <span className="font-semibold">{nextByobTier.tier.discountPercent}% off</span>
                </span>
              </div>
            )}

            {/* Subtotal with BYOB discount */}
            {byobTier ? (
              <div className="mb-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(totalCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-forest font-medium flex items-center gap-1.5">
                    <span className="bg-forest/10 text-forest text-xs font-semibold px-2 py-0.5 rounded-full">
                      {byobTier.discountPercent}% off
                    </span>
                    Multi-pack discount
                  </span>
                  <span className="text-sm text-forest font-medium">-{formatPrice(byobDiscountCents)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/40">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-lg font-semibold text-forest">{formatPrice(byobTotalCents)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-semibold text-forest">{formatPrice(totalCents)}</span>
              </div>
            )}
            {/* Email for receipt */}
            <div className="mb-4">
              <label htmlFor="cart-email" className="block text-sm text-gray-500 mb-1.5">
                Email <span className="text-gray-400">(for your receipt)</span>
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
                aria-describedby={emailError ? 'cart-email-error' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
                  emailError ? 'border-red-300' : 'border-gray-200'
                }`}
                autoComplete="email"
              />
              {emailError && (
                <p id="cart-email-error" role="alert" className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
            </div>
            {checkoutError && (
              <div role="alert" className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-shake">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {checkoutError}
              </div>
            )}
            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                Secure checkout
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Instant download
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254v11.505a20.01 20.01 0 013.78.501.75.75 0 11-.339 1.462A18.558 18.558 0 0010 17.5c-1.442 0-2.845.165-4.191.477a.75.75 0 01-.338-1.462 20.01 20.01 0 013.779-.501V4.509c-1.129.026-2.243.112-3.34.254l1.771 7.85a.75.75 0 01-.387.83A4.981 4.981 0 015 14a4.981 4.981 0 01-2.294-.556.75.75 0 01-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232a.75.75 0 01-.336-1.462 33.186 33.186 0 016.668-.829V2.75A.75.75 0 0110 2zM5 12.662l-1.395-6.177C4.6 6.32 5.283 6.246 6 6.2L5 12.662zm10 0l-1-6.462c.717.046 1.4.12 2.395.285L15 12.662z" clipRule="evenodd" />
                </svg>
                48-hr refund guarantee
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center disabled:opacity-60 disabled:cursor-not-allowed"
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
                `Checkout — ${formatPrice(byobTier ? byobTotalCents : totalCents)}`
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
