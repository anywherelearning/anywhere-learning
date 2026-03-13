'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DISMISS_KEY = 'exit-popup-dismissed';
const DISMISS_DAYS = 7;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const pathname = usePathname();

  const isShopPage = pathname.startsWith('/shop');

  const dismiss = useCallback(() => {
    setAnimating(false);
    setTimeout(() => setShow(false), 200);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
  }, []);

  const trigger = useCallback(() => {
    // Don't show if already visible or dismissed recently
    if (show) return;
    try {
      const expiry = localStorage.getItem(DISMISS_KEY);
      if (expiry && Date.now() < Number(expiry)) return;
    } catch {}
    setShow(true);
    requestAnimationFrame(() => setAnimating(true));
  }, [show]);

  useEffect(() => {
    if (!isShopPage) return;

    // Desktop: mouse leaves viewport toward top
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        trigger();
      }
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

      // If user scrolled up 300px+ rapidly, they might be leaving
      if (scrollUpDistance > 300 && currentY < 100) {
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
  }, [isShopPage, trigger]);

  if (!show || !isShopPage) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${
        animating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className={`relative w-full max-w-md bg-cream rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Top banner */}
        <div className="bg-forest px-6 py-4 text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest">
            Limited-Time Bundle Bonus
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Product visual */}
          <div className="mx-auto mb-6 w-28 h-28 rounded-2xl bg-forest/10 flex items-center justify-center">
            <svg className="w-14 h-14 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M9 15l3-3 3 3" />
            </svg>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-forest mb-2">
            Wait — don&rsquo;t miss this!
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            Get <span className="font-semibold text-forest">The Future-Ready Skills Map</span> completely
            free when you grab any bundle.
          </p>

          <p className="text-gray-400 text-xs mb-6">
            A 42-page parent guide to the 10 skills that matter most — yours at no extra cost.
          </p>

          {/* Price badge */}
          <div className="inline-flex items-center gap-2 bg-gold/15 rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm text-gray-400 line-through">$9.99</span>
            <span className="text-sm font-bold text-forest">FREE with any bundle</span>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/shop?category=bundle"
              onClick={dismiss}
              className="shimmer-effect block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl text-base transition-all hover:scale-[1.01] shadow-md"
            >
              Browse Bundles &rarr;
            </Link>
          </div>

          <button
            onClick={dismiss}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            No thanks, I&rsquo;ll keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
