'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { getBundleUpsell } from '@/lib/cart';
import { BUNDLE_CONTENTS, BUNDLE_DATA } from '@/lib/bundles';
import { formatPrice } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import EmailForm from '@/components/EmailForm';

const DISMISS_KEY = 'exit-popup-dismissed';
const DISMISS_DAYS = 7;

const GUIDE_SUBMITTED_KEY = 'free-guide-submitted';

// Trigger gates - shop listing page
const SHOP_DESKTOP_TIME_MS = 10_000;
const SHOP_DESKTOP_SCROLL = 0.15;
const SHOP_MOBILE_TIME_MS = 20_000;
const SHOP_MOBILE_SCROLL = 0.3;

// Trigger gates - product detail pages (longer, visitor needs time to read)
const PDP_DESKTOP_TIME_MS = 15_000;
const PDP_DESKTOP_SCROLL = 0.25;
const PDP_MOBILE_TIME_MS = 25_000;
const PDP_MOBILE_SCROLL = 0.35;

const MOBILE_SCROLL_UP_PX = 300;

/** Find the best (largest) bundle containing a given product slug. */
function findBundleForProduct(slug: string) {
  let best: { bundleSlug: string; childCount: number } | null = null;
  for (const [bundleSlug, children] of Object.entries(BUNDLE_CONTENTS)) {
    if (children.includes(slug) && (!best || children.length > best.childCount)) {
      best = { bundleSlug, childCount: children.length };
    }
  }
  if (!best) return null;
  return BUNDLE_DATA[best.bundleSlug] || null;
}

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const pathname = usePathname();
  const { items, itemCount, totalCents, openCart, nextByobTier } = useCart();
  const mountTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const firedRef = useRef(false);

  const isProductPage = pathname.startsWith('/shop/');
  const isShopPage = pathname.startsWith('/shop') && !isProductPage;
  const isActive = isShopPage || isProductPage;

  // Extract product slug from /shop/[slug]
  const currentProductSlug = isProductPage ? pathname.split('/').pop() || '' : '';

  const upsell = useMemo(() => getBundleUpsell(items), [items]);

  // Bundle that contains the product being viewed (for product page upsell)
  const pdpBundle = useMemo(
    () => (isProductPage ? findBundleForProduct(currentProductSlug) : null),
    [isProductPage, currentProductSlug],
  );

  // Variant logic:
  // Shop page: bundle-upgrade > cart-recovery > bundle-promo
  // Product page: bundle-upgrade > cart-recovery > pdp-bundle-upsell > free-guide
  const variant = upsell
    ? 'bundle-upgrade'
    : itemCount > 0
      ? 'cart-recovery'
      : isProductPage && pdpBundle
        ? 'pdp-bundle-upsell'
        : isProductPage
          ? 'free-guide'
          : 'bundle-promo';

  // Gate values depend on page type
  const desktopTimeGate = isProductPage ? PDP_DESKTOP_TIME_MS : SHOP_DESKTOP_TIME_MS;
  const desktopScrollGate = isProductPage ? PDP_DESKTOP_SCROLL : SHOP_DESKTOP_SCROLL;
  const mobileTimeGate = isProductPage ? PDP_MOBILE_TIME_MS : SHOP_MOBILE_TIME_MS;
  const mobileScrollGate = isProductPage ? PDP_MOBILE_SCROLL : SHOP_MOBILE_SCROLL;

  const dismiss = useCallback(() => {
    document.body.style.overflow = '';
    setAnimating(false);
    setTimeout(() => setShow(false), 300);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
  }, []);

  const trigger = useCallback(() => {
    // Don't show if already visible, already fired, or dismissed recently
    if (show || firedRef.current) return;
    try {
      const expiry = localStorage.getItem(DISMISS_KEY);
      if (expiry && Date.now() < Number(expiry)) return;
    } catch {}
    firedRef.current = true;
    document.body.style.overflow = 'hidden';
    setShow(true);
    requestAnimationFrame(() => setAnimating(true));
  }, [show]);

  /* ─── Track max scroll depth ─── */
  useEffect(() => {
    if (!isActive) return;
    function trackScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const depth = window.scrollY / scrollHeight;
        if (depth > maxScrollRef.current) maxScrollRef.current = depth;
      }
    }
    window.addEventListener('scroll', trackScroll, { passive: true });
    return () => window.removeEventListener('scroll', trackScroll);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    // Desktop: mouse leaves viewport toward top
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 0) return;
      const timeOnPage = Date.now() - mountTimeRef.current;
      if (timeOnPage < desktopTimeGate) return;
      if (maxScrollRef.current < desktopScrollGate) return;
      trigger();
    }

    // Mobile: detect back-button intent via scroll to top + pause
    let lastScrollY = window.scrollY;
    let scrollUpDistance = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY < lastScrollY) {
        scrollUpDistance += lastScrollY - currentY;
      } else {
        scrollUpDistance = 0;
      }
      lastScrollY = currentY;

      const viewportHeight = window.innerHeight;
      const inTopZone = currentY < viewportHeight * 0.4;

      if (scrollUpDistance >= MOBILE_SCROLL_UP_PX && inTopZone) {
        const timeOnPage = Date.now() - mountTimeRef.current;
        if (timeOnPage < mobileTimeGate) return;
        if (maxScrollRef.current < mobileScrollGate) return;

        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          trigger();
          scrollUpDistance = 0;
        }, 500);
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isActive, trigger, desktopTimeGate, desktopScrollGate, mobileTimeGate, mobileScrollGate]);

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [show, dismiss]);

  const focusTrapRef = useFocusTrap(show && animating);

  // Don't show free-guide variant if already submitted
  if (variant === 'free-guide') {
    try {
      if (localStorage.getItem(GUIDE_SUBMITTED_KEY)) return null;
    } catch {}
  }

  if (!show || !isActive) return null;

  const ariaLabel =
    variant === 'bundle-upgrade'
      ? 'Bundle upgrade suggestion'
      : variant === 'cart-recovery'
        ? 'Cart reminder'
        : variant === 'pdp-bundle-upsell'
          ? 'Bundle suggestion'
          : variant === 'free-guide'
            ? 'Free guide offer'
            : 'Free guide offer with bundle purchase';

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${
        animating ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={focusTrapRef}
        className={`relative w-full max-w-[500px] bg-cream rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          variant === 'bundle-promo' ? 'flex flex-col sm:flex-row max-h-[85vh] sm:max-h-none' : 'max-h-[85vh]'
        } ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className={`absolute top-2.5 right-2.5 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
            variant === 'bundle-promo'
              ? 'bg-black/20 hover:bg-black/40 text-white/90 hover:text-white'
              : 'bg-gray-200/60 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {variant === 'bundle-promo' && <BundlePromoContent dismiss={dismiss} />}
        {variant === 'cart-recovery' && (
          <CartRecoveryContent
            items={items}
            itemCount={itemCount}
            totalCents={totalCents}
            nextByobTier={nextByobTier}
            openCart={openCart}
            dismiss={dismiss}
          />
        )}
        {variant === 'bundle-upgrade' && upsell && (
          <BundleUpgradeContent upsell={upsell} openCart={openCart} dismiss={dismiss} />
        )}
        {variant === 'pdp-bundle-upsell' && pdpBundle && (
          <PdpBundleUpsellContent bundle={pdpBundle} dismiss={dismiss} />
        )}
        {variant === 'free-guide' && <FreeGuideContent dismiss={dismiss} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Variant B: Bundle Promo (empty cart - original popup)
   ═══════════════════════════════════════════════════════════════════ */

function BundlePromoContent({ dismiss }: { dismiss: () => void }) {
  return (
    <>
      {/* Top banner */}
      <div className="w-full sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:z-10 bg-forest-dark px-5 py-2.5 text-center">
        <p className="text-gold-light text-[11px] font-semibold uppercase tracking-[0.2em]">
          Free with any bundle
        </p>
      </div>

      {/* Mobile image band */}
      <div className="sm:hidden relative w-full h-40 overflow-hidden">
        <Image
          src="/products/future-ready-skills-map.jpg"
          alt="The Future-Ready Skills Map"
          fill
          sizes="500px"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-forest text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
          42 pages
        </div>
      </div>

      {/* Desktop image column */}
      <div className="hidden sm:block sm:w-[44%] relative sm:mt-[36px]">
        <Image
          src="/products/future-ready-skills-map.jpg"
          alt="The Future-Ready Skills Map"
          fill
          sizes="220px"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-forest text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
          42 pages
        </div>
      </div>

      {/* Content column */}
      <div className="w-full sm:w-[56%] px-5 py-5 sm:px-6 sm:py-7 sm:mt-[36px] popup-stagger overflow-y-auto">
        <div className="inline-flex items-center gap-1.5 bg-gold/15 text-forest-dark text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
          </svg>
          Your starting point
        </div>

        <h2 className="font-display text-[22px] sm:text-2xl leading-tight text-forest mb-2">
          Start with the big picture
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          The Future-Ready Skills Map covers the 10 skills that matter most for your
          child&rsquo;s future. It&rsquo;s the foundation for every activity guide we make.
        </p>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4">
          {[
            { icon: 'compass', label: '10 key skills', color: 'text-forest' },
            { icon: 'calendar', label: 'Sample weeks', color: 'text-gold' },
            { icon: 'users', label: 'Ages 0\u201314+', color: 'text-forest' },
            { icon: 'check', label: 'Low-prep activities', color: 'text-gold' },
          ].map((chip) => (
            <div key={chip.label} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <FeatureIcon type={chip.icon} className={`w-4 h-4 ${chip.color} flex-shrink-0`} />
              <span className="text-[12px] font-medium text-gray-700">{chip.label}</span>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2.5 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-5">
          <span className="text-[13px] text-gray-400 line-through">$9.99</span>
          <span className="text-[13px] font-bold text-forest">FREE with any bundle</span>
        </div>

        <Link
          href="/shop?category=bundle"
          onClick={dismiss}
          className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-md"
        >
          Browse Bundles
        </Link>

        <button
          onClick={dismiss}
          className="mt-2.5 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
        >
          No thanks, I&rsquo;ll keep browsing
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Variant A: Cart Recovery (has items, no bundle upsell)
   ═══════════════════════════════════════════════════════════════════ */

function CartRecoveryContent({
  items,
  itemCount,
  totalCents,
  nextByobTier,
  openCart,
  dismiss,
}: {
  items: { slug: string; name: string; priceCents: number; imageUrl: string | null; category: string }[];
  itemCount: number;
  totalCents: number;
  nextByobTier: { tier: { minItems: number; discountPercent: number }; itemsNeeded: number } | null;
  openCart: () => void;
  dismiss: () => void;
}) {
  const previewItems = items.slice(0, 3);
  const remaining = itemCount - previewItems.length;

  return (
    <div className="px-6 py-7 popup-stagger overflow-y-auto">
      {/* Top banner */}
      <div className="bg-forest-dark rounded-2xl px-5 py-3 text-center mb-5 -mx-1">
        <p className="text-gold-light text-[11px] font-semibold uppercase tracking-[0.2em]">
          Don&rsquo;t forget your picks
        </p>
      </div>

      {/* Headline */}
      <h2 className="font-display text-[22px] sm:text-2xl leading-tight text-forest mb-1 text-center">
        You&rsquo;ve got great taste
      </h2>
      <p className="text-sm text-gray-500 text-center mb-5">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} &middot; {formatPrice(totalCents)}
      </p>

      {/* Item previews */}
      <div className="space-y-2.5 mb-5">
        {previewItems.map((item) => (
          <div key={item.slug} className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-2.5 border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 relative">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-[13px] font-medium text-gray-700 flex-1 line-clamp-1">{item.name}</span>
            <span className="text-[13px] font-semibold text-forest flex-shrink-0">{formatPrice(item.priceCents)}</span>
          </div>
        ))}
        {remaining > 0 && (
          <p className="text-[12px] text-gray-400 text-center">
            +{remaining} more {remaining === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {/* BYOB nudge */}
      {nextByobTier && nextByobTier.itemsNeeded <= 3 && (
        <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-2.5 mb-5 text-center">
          <p className="text-[13px] text-forest-dark font-medium">
            Add {nextByobTier.itemsNeeded} more {nextByobTier.itemsNeeded === 1 ? 'guide' : 'guides'} for{' '}
            <span className="font-bold">{nextByobTier.tier.discountPercent}% off</span>
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => {
          dismiss();
          // Small delay so popup closes before drawer opens
          setTimeout(() => openCart(), 350);
        }}
        className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-md"
      >
        View Cart
      </button>

      <button
        onClick={dismiss}
        className="mt-2.5 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
      >
        I&rsquo;ll come back later
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Variant C: Bundle Upgrade (has items matching a bundle)
   ═══════════════════════════════════════════════════════════════════ */

function BundleUpgradeContent({
  upsell,
  openCart,
  dismiss,
}: {
  upsell: { bundle: { slug: string; name: string; priceCents: number; imageUrl: string | null; totalChildCount?: number }; matchingSlugs: string[]; savingsCents: number; additionalCostCents: number; totalChildCount: number };
  openCart: () => void;
  dismiss: () => void;
}) {
  const saves = upsell.savingsCents > 0;

  return (
    <div className="popup-stagger overflow-y-auto">
      {/* Bundle image banner */}
      <div className="relative w-full h-36 sm:h-44 overflow-hidden">
        <Image
          src={upsell.bundle.imageUrl || '/products/mega-bundle-preview.jpg'}
          alt={upsell.bundle.name}
          fill
          sizes="500px"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {saves && (
          <div className="absolute bottom-3 left-3 bg-gold text-forest-dark text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
            Save {formatPrice(upsell.savingsCents)}
          </div>
        )}
      </div>

      <div className="px-6 py-5 sm:py-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 bg-forest/10 text-forest-dark text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Smart upgrade
        </div>

        {/* Headline */}
        <h2 className="font-display text-[22px] sm:text-2xl leading-tight text-forest mb-2">
          You&rsquo;re {upsell.matchingSlugs.length} of {upsell.totalChildCount} guides in
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          Get the <span className="font-semibold text-forest-dark">{upsell.bundle.name}</span>{' '}
          {saves
            ? `and save ${formatPrice(upsell.savingsCents)} vs buying individually.`
            : `\u2014 all ${upsell.totalChildCount} guides for just ${formatPrice(upsell.bundle.priceCents)}.`}
          {' '}Plus a free Future-Ready Skills Map.
        </p>

        {/* Price comparison */}
        <div className="flex items-center justify-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 mb-5">
          <div className="text-center">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Bundle price</p>
            <p className="text-lg font-bold text-forest">{formatPrice(upsell.bundle.priceCents)}</p>
          </div>
          {saves && (
            <>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">You save</p>
                <p className="text-lg font-bold text-gold">{formatPrice(upsell.savingsCents)}</p>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/shop/${upsell.bundle.slug}`}
          onClick={dismiss}
          className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-md"
        >
          View Bundle
        </Link>

        {/* Secondary CTA */}
        <button
          onClick={() => {
            dismiss();
            setTimeout(() => openCart(), 350);
          }}
          className="mt-2 text-[13px] text-forest hover:text-forest-dark font-medium transition-colors text-center w-full py-1"
        >
          View my cart instead
        </button>

        <button
          onClick={dismiss}
          className="mt-1 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
        >
          No thanks, I&rsquo;ll keep browsing
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Variant D: PDP Bundle Upsell (product page, empty cart, bundle available)
   ═══════════════════════════════════════════════════════════════════ */

function PdpBundleUpsellContent({
  bundle,
  dismiss,
}: {
  bundle: { slug: string; name: string; priceCents: number; compareAtPriceCents: number; imageUrl: string | null; activityCount: number | null };
  dismiss: () => void;
}) {
  const childCount = BUNDLE_CONTENTS[bundle.slug]?.length || 0;
  const savingsCents = bundle.compareAtPriceCents - bundle.priceCents;

  return (
    <div className="popup-stagger overflow-y-auto">
      {/* Bundle image banner */}
      {bundle.imageUrl && (
        <div className="relative w-full h-36 sm:h-44 overflow-hidden">
          <Image
            src={bundle.imageUrl}
            alt={bundle.name}
            fill
            sizes="500px"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {savingsCents > 0 && (
            <div className="absolute bottom-3 left-3 bg-gold text-forest-dark text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
              Save {formatPrice(savingsCents)}
            </div>
          )}
        </div>
      )}

      <div className="px-6 py-5 sm:py-6">
        <div className="inline-flex items-center gap-1.5 bg-forest/10 text-forest-dark text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Better value
        </div>

        <h2 className="font-display text-[22px] sm:text-2xl leading-tight text-forest mb-2">
          This guide is part of a bundle
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          Get the <span className="font-semibold text-forest-dark">{bundle.name}</span>{' '}
          with all {childCount} guides for just {formatPrice(bundle.priceCents)}.
          {savingsCents > 0 && ` That\u2019s ${formatPrice(savingsCents)} less than buying them separately.`}
          {' '}Plus a free Future-Ready Skills Map.
        </p>

        <Link
          href={`/shop/${bundle.slug}`}
          onClick={dismiss}
          className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-md"
        >
          View Bundle
        </Link>

        <button
          onClick={dismiss}
          className="mt-2.5 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
        >
          No thanks, I&rsquo;ll keep browsing
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Variant E: Free Guide (product page, empty cart, no bundle match)
   ═══════════════════════════════════════════════════════════════════ */

function FreeGuideContent({ dismiss }: { dismiss: () => void }) {
  return (
    <div className="px-6 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">
      <div className="flex items-start gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="relative w-20 sm:w-32 flex-shrink-0 aspect-[773/1000] rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/free-guide-cover.jpg"
            alt="7 Days of Real-World Learning, free guide cover"
            fill
            sizes="(max-width: 640px) 80px, 128px"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 pt-1 sm:pt-2">
          <h2 className="font-display text-xl sm:text-[1.65rem] text-forest leading-tight mb-1.5 sm:mb-2">
            Before you go, grab this free guide
          </h2>
          <p className="text-[13px] sm:text-[15px] text-gray-500 leading-relaxed">
            7 Days of Real-World Learning. One activity a day, zero worksheets, just meaningful learning.
          </p>
        </div>
      </div>

      <EmailForm variant="light" />

      <button
        onClick={dismiss}
        className="mt-2 sm:mt-3 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
      >
        No thanks, I&rsquo;ll keep browsing
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Shared tiny icon helper for the bundle promo feature chips
   ═══════════════════════════════════════════════════════════════════ */

function FeatureIcon({ type, className }: { type: string; className?: string }) {
  const props = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  switch (type) {
    case 'compass':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'check':
      return <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    default:
      return null;
  }
}
