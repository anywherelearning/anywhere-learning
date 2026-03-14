'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const DISMISS_KEY = 'exit-popup-dismissed';
const DISMISS_DAYS = 7;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const pathname = usePathname();

  const isShopPage = pathname.startsWith('/shop');

  const dismiss = useCallback(() => {
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

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [show, dismiss]);

  if (!show || !isShopPage) return null;

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
      aria-label="Free guide offer with bundle purchase"
    >
      <div
        className={`relative w-full max-w-[500px] bg-cream rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[85vh] sm:max-h-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all duration-200"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Top banner (full width) ── */}
        <div className="w-full sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:z-10 bg-forest-dark px-5 py-2.5 text-center">
          <p className="text-gold-light text-[11px] font-semibold uppercase tracking-[0.2em]">
            Free with any bundle
          </p>
        </div>

        {/* ── Mobile image band ── */}
        <div className="sm:hidden relative w-full h-40 overflow-hidden">
          <Image
            src="/products/future-ready-skills-map.jpg"
            alt="The Future-Ready Skills Map"
            fill
            sizes="500px"
            className="object-cover"
            loading="lazy"
          />
          {/* Page count badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-forest text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            42 pages
          </div>
        </div>

        {/* ── Desktop image column ── */}
        <div className="hidden sm:block sm:w-[44%] relative sm:mt-[36px]">
          <Image
            src="/products/future-ready-skills-map.jpg"
            alt="The Future-Ready Skills Map"
            fill
            sizes="220px"
            className="object-cover"
            loading="lazy"
          />
          {/* Page count badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-forest text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            42 pages
          </div>
        </div>

        {/* ── Content column ── */}
        <div className="w-full sm:w-[56%] px-5 py-5 sm:px-6 sm:py-7 sm:mt-[36px] popup-stagger overflow-y-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 bg-gold/15 text-forest-dark text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
            </svg>
            Your starting point
          </div>

          {/* Headline */}
          <h2 className="font-display text-[22px] sm:text-2xl leading-tight text-forest mb-2">
            Start with the big picture
          </h2>

          {/* Subheading */}
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            The Future-Ready Skills Map covers the 10 skills that matter most for your
            child&rsquo;s future. It&rsquo;s the foundation for every activity pack we make.
          </p>

          {/* Feature chips */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <svg className="w-4 h-4 text-forest flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span className="text-[12px] font-medium text-gray-700">10 key skills</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-[12px] font-medium text-gray-700">Sample weeks</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <svg className="w-4 h-4 text-forest flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-[12px] font-medium text-gray-700">Ages 0&ndash;14+</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-[12px] font-medium text-gray-700">No-prep activities</span>
            </div>
          </div>

          {/* Price badge */}
          <div className="inline-flex items-center gap-2.5 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-5">
            <span className="text-[13px] text-gray-400 line-through">$9.99</span>
            <span className="text-[13px] font-bold text-forest">FREE</span>
          </div>

          {/* CTA */}
          <Link
            href="/shop?category=bundle"
            onClick={dismiss}
            className="shimmer-effect block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-md"
          >
            Browse Bundles &rarr;
          </Link>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="mt-2.5 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
          >
            No thanks, I&rsquo;ll keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
