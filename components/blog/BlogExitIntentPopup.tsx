'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  MEMBERSHIP_PRICE_YEAR,
  IS_FOUNDER_PHASE,
  FOUNDER_CAP,
} from '@/lib/membership';

// Set by the quiz when a visitor reaches their result (see LifeSkillQuiz).
const QUIZ_TAKEN_KEY = 'quiz-taken';
// Two dismiss buckets so dismissing the quiz popup doesn't suppress the
// membership popup (and vice versa).
const QUIZ_DISMISS_KEY = 'quiz-exit-popup-dismissed';
const MEMBER_DISMISS_KEY = 'membership-exit-popup-dismissed';
const QUIZ_DISMISS_DAYS = 14;
const MEMBER_DISMISS_DAYS = 30;

// Trigger gates
const DESKTOP_TIME_GATE_MS = 25_000;
const DESKTOP_SCROLL_GATE = 0.3;
const MOBILE_TIME_GATE_MS = 25_000;
const MOBILE_SCROLL_GATE = 0.35;
const MOBILE_SCROLL_UP_PX = 200;

type Variant = 'quiz' | 'membership';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Gate: people who already have access (members incl. trial, and starters)
 * should never get the "unlock with membership" upsell. Everyone else (signed
 * out, or signed-in non-members) gets the normal popup.
 */
export default function BlogExitIntentPopup() {
  if (!hasClerk) return <BlogExitIntentPopupInner />;
  return <MemberGate />;
}

function MemberGate() {
  const { isLoaded, user } = useUser();
  const tier = user?.publicMetadata?.tier as string | undefined;
  // Hide only from full members (incl. trial). Starters haven't unlocked the
  // full library, so the upgrade upsell is still relevant to them.
  const isFullMember = tier === 'member';
  if (!isLoaded || isFullMember) return null;
  return <BlogExitIntentPopupInner />;
}

function BlogExitIntentPopupInner() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [variant, setVariant] = useState<Variant>('quiz');
  const mountTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const firedRef = useRef(false);

  /* ─── Decide variant + eligibility ─── */
  // Returns the variant to show, or null if neither popup should fire.
  const resolveVariant = useCallback((): Variant | null => {
    try {
      const quizDone = !!localStorage.getItem(QUIZ_TAKEN_KEY);
      if (!quizDone) {
        // Quiz variant — suppressed by its own dismiss bucket.
        const expiry = localStorage.getItem(QUIZ_DISMISS_KEY);
        if (expiry && Date.now() < Number(expiry)) return null;
        return 'quiz';
      }
      // Membership variant — suppressed by its own dismiss bucket.
      const expiry = localStorage.getItem(MEMBER_DISMISS_KEY);
      if (expiry && Date.now() < Number(expiry)) return null;
      return 'membership';
    } catch {
      return 'quiz';
    }
  }, []);

  /* ─── Show popup ─── */
  const trigger = useCallback(() => {
    if (firedRef.current) return;
    const v = resolveVariant();
    if (!v) return;
    firedRef.current = true;
    setVariant(v);
    setShow(true);
    requestAnimationFrame(() => setAnimating(true));
    document.body.style.overflow = 'hidden';
  }, [resolveVariant]);

  /* ─── Dismiss popup ─── */
  const dismiss = useCallback(() => {
    setAnimating(false);
    const dismissedVariant = variant;
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 300);
    try {
      const key = dismissedVariant === 'membership' ? MEMBER_DISMISS_KEY : QUIZ_DISMISS_KEY;
      const days = dismissedVariant === 'membership' ? MEMBER_DISMISS_DAYS : QUIZ_DISMISS_DAYS;
      localStorage.setItem(key, String(Date.now() + days * 24 * 60 * 60 * 1000));
    } catch {}
  }, [variant]);

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
    // Don't attach listeners if neither variant is eligible right now.
    if (!resolveVariant()) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 0) return;
      const timeOnPage = Date.now() - mountTimeRef.current;
      if (timeOnPage < DESKTOP_TIME_GATE_MS) return;
      if (maxScrollRef.current < DESKTOP_SCROLL_GATE) return;
      trigger();
    }

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
  }, [resolveVariant, trigger]);

  /* ─── Escape key ─── */
  useEffect(() => {
    if (!show) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [show, dismiss]);

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
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-cream rounded-3xl shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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

        {variant === 'quiz' ? (
          <QuizVariant onDismiss={dismiss} />
        ) : (
          <MembershipVariant onDismiss={dismiss} />
        )}
      </div>
    </div>
  );
}

/* ─── Variant 1: Quiz (first-time visitor) ─── */
function QuizVariant({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="px-6 sm:px-8 pt-7 sm:pt-9 pb-6 sm:pb-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97B5C] mb-3">
        2-minute quiz
      </p>
      <h2
        id="blog-exit-popup-title"
        className="font-display text-[1.6rem] sm:text-[2rem] text-forest leading-[1.08] mb-3 text-balance"
      >
        What&apos;s your kid&apos;s missing life skill?
      </h2>
      <p className="text-[14px] sm:text-[15px] text-gray-500 leading-relaxed max-w-[380px] mx-auto mb-6">
        Eight quick questions, and you get your kid&apos;s type, the one skill to focus
        on next, and three activities to start with.
      </p>

      <Link
        href="/quiz"
        onClick={onDismiss}
        className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl text-[15px] text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md no-underline"
      >
        Take the quiz
      </Link>

      <button
        onClick={onDismiss}
        className="mt-3 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
      >
        No thanks, I&rsquo;ll keep reading
      </button>
    </div>
  );
}

/* ─── Variant 2: Membership pitch (visitor who already grabbed the guide) ─── */
function MembershipVariant({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="px-6 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">
      <div className="flex items-start gap-4 sm:gap-5 mb-5">
        <div className="relative w-20 sm:w-32 flex-shrink-0 aspect-square rounded-lg overflow-hidden shadow-md bg-[#E6EBDF]">
          <Image
            src="/membership-hero.png"
            alt="The Anywhere Learning library"
            fill
            sizes="(max-width: 640px) 80px, 128px"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 pt-1 sm:pt-2">
          {IS_FOUNDER_PHASE && (
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#B6913F] mb-1.5">
              First {FOUNDER_CAP} only
            </p>
          )}
          <h2
            id="blog-exit-popup-title"
            className="font-display text-xl sm:text-[1.65rem] text-forest leading-tight mb-1.5 sm:mb-2"
          >
            Ready for the rest of the library?
          </h2>
          <p className="text-[13px] sm:text-[15px] text-gray-500 leading-relaxed">
            100+ guided activities across nine categories. New ones added every quarter
            {IS_FOUNDER_PHASE ? ', founder rate locked in for life' : ''}.
          </p>
        </div>
      </div>

      <Link
        href="/join"
        onClick={onDismiss}
        className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
      >
        Unlock with membership
      </Link>

      <p className="mt-2.5 text-center text-[13px] text-gray-500">
        {MEMBERSHIP_PRICE_YEAR}
        {IS_FOUNDER_PHASE ? ' · founder rate' : ''} · 14-day refund
      </p>

      <button
        onClick={onDismiss}
        className="mt-3 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
      >
        Maybe later
      </button>
    </div>
  );
}
