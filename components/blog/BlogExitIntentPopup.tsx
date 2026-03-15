'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const GUIDE_SUBMITTED_KEY = 'free-guide-submitted';
const DISMISS_KEY = 'blog-exit-popup-dismissed';
const DISMISS_DAYS = 14;

// Trigger gates
const DESKTOP_TIME_GATE_MS = 30_000;
const DESKTOP_SCROLL_GATE = 0.25;
const MOBILE_TIME_GATE_MS = 45_000;
const MOBILE_SCROLL_GATE = 0.5;
const MOBILE_SCROLL_UP_PX = 200;

export default function BlogExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const firedRef = useRef(false);

  /* ─── Eligibility check ─── */
  const isEligible = useCallback(() => {
    try {
      if (localStorage.getItem(GUIDE_SUBMITTED_KEY)) return false;
      const expiry = localStorage.getItem(DISMISS_KEY);
      if (expiry && Date.now() < Number(expiry)) return false;
    } catch {}
    return true;
  }, []);

  /* ─── Show popup ─── */
  const trigger = useCallback(() => {
    if (firedRef.current || !isEligible()) return;
    firedRef.current = true;
    setShow(true);
    requestAnimationFrame(() => setAnimating(true));
    // Lock body scroll
    document.body.style.overflow = 'hidden';
  }, [isEligible]);

  /* ─── Dismiss popup ─── */
  const dismiss = useCallback(() => {
    setAnimating(false);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 300);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
  }, []);

  /* ─── Track max scroll depth ─── */
  useEffect(() => {
    function trackScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const depth = window.scrollY / scrollHeight;
        if (depth > maxScrollRef.current) maxScrollRef.current = depth;
      }
    }
    window.addEventListener('scroll', trackScroll, { passive: true });
    return () => window.removeEventListener('scroll', trackScroll);
  }, []);

  /* ─── Exit-intent detection ─── */
  useEffect(() => {
    if (!isEligible()) return;

    // ── Desktop: mouseleave toward top of viewport ──
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 0) return;
      const timeOnPage = Date.now() - mountTimeRef.current;
      if (timeOnPage < DESKTOP_TIME_GATE_MS) return;
      if (maxScrollRef.current < DESKTOP_SCROLL_GATE) return;
      trigger();
    }

    // ── Mobile: scroll-up detection ──
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

      // If user scrolled up significantly in the top portion of the page
      const viewportHeight = window.innerHeight;
      const inTopZone = currentY < viewportHeight * 0.4;

      if (scrollUpDistance >= MOBILE_SCROLL_UP_PX && inTopZone) {
        const timeOnPage = Date.now() - mountTimeRef.current;
        if (timeOnPage < MOBILE_TIME_GATE_MS) return;
        if (maxScrollRef.current < MOBILE_SCROLL_GATE) return;

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
  }, [isEligible, trigger]);

  /* ─── Escape key ─── */
  useEffect(() => {
    if (!show) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [show, dismiss]);

  /* ─── Focus trap ─── */
  const focusTrapRef = useFocusTrap(show && animating);

  /* ─── Clean up body scroll on unmount ─── */
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!show) return null;

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
      aria-labelledby="blog-exit-popup-title"
    >
      <div
        ref={focusTrapRef}
        className={`relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-cream rounded-3xl shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content with inline cover */}
        <div className="px-5 sm:px-8 pt-4 sm:pt-5 pb-5 sm:pb-7">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Guide cover — compact */}
            <div className="relative w-16 sm:w-28 flex-shrink-0 aspect-[707/1000] rounded-lg overflow-hidden shadow-md">
              <Image
                src="/images/free-guide-cover.jpg"
                alt="10 Life Skills Your Kids Can Learn This Week — free guide cover"
                fill
                sizes="(max-width: 640px) 64px, 112px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 pt-0.5 sm:pt-1">
              <h2
                id="blog-exit-popup-title"
                className="font-display text-lg sm:text-[1.5rem] text-forest leading-tight mb-1 sm:mb-1.5"
              >
                Before you go &mdash; grab this free guide
              </h2>
              <p className="text-[12px] sm:text-sm text-gray-500 leading-relaxed">
                10 Real-World Activities You Can Start Today &mdash; no prep, no planning, just meaningful learning.
              </p>
            </div>
          </div>

          {/* Email form */}
          <EmailForm variant="light" />

          {/* Dismiss link */}
          <button
            onClick={dismiss}
            className="mt-2 sm:mt-3 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
          >
            No thanks, I&rsquo;ll keep reading
          </button>
        </div>
      </div>
    </div>
  );
}
