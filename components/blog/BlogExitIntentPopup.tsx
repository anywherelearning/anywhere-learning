'use client';

import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useAccessTier } from '@/hooks/useAccessTier';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import useAttributionSource from '@/components/useAttributionSource';
import type { LeadMagnet } from '@/lib/lead-magnets';
import {
  MEMBERSHIP_PRICE_YEAR,
  IS_FOUNDER_PHASE,
  FOUNDER_CAP,
} from '@/lib/membership';

// Set by the quiz when a visitor reaches their result (see LifeSkillQuiz).
const QUIZ_TAKEN_KEY = 'quiz-taken';
// Set by EmailForm (free guide, Capable Kid) and by this popup on success.
const GUIDE_SUBMITTED_KEY = 'free-guide-submitted';
// Set by the idea-list pages once one email has unlocked the printables.
const IDEAS_CLAIMED_KEY = 'al-ideas-offer-claimed';
// Set here when the popup itself captured an email.
const MAGNET_CLAIMED_KEY = 'lead-magnet-claimed';
// Three dismiss buckets so dismissing one popup doesn't suppress the others,
// plus one short shared cooldown so a reader never sees two different popups
// on two consecutive posts.
const MAGNET_DISMISS_KEY = 'magnet-exit-popup-dismissed';
const QUIZ_DISMISS_KEY = 'quiz-exit-popup-dismissed';
const MEMBER_DISMISS_KEY = 'membership-exit-popup-dismissed';
const COOLDOWN_KEY = 'exit-popup-cooldown';
const MAGNET_DISMISS_DAYS = 10;
const QUIZ_DISMISS_DAYS = 14;
const MEMBER_DISMISS_DAYS = 30;
const COOLDOWN_DAYS = 3;

// The popup fires on whichever comes first: an exit gesture (mouse leaving the
// top of the window) or the reader reaching the end of the article body.
// There is no timer: a popup that interrupts someone mid-paragraph costs
// more goodwill than it earns. A short floor keeps the exit path from firing
// the instant someone lands. (Note: mouse-leave doesn't exist on touch, so
// the end-of-article gate is what catches mobile readers, once they've
// actually finished.)
const EARLY_TRIGGER_FLOOR_MS = 8_000; // scroll/exit can't fire before this

// The scroll gate is the end of the article body, not a share of the page.
// Below the article sit the activities block, the quiz card, related posts
// and the footer, so a page percentage (the old 85%) only fired once the
// reader was already browsing other posts. "End of the body" is the FAQ
// heading when the post has one (the last thing a reader scans), otherwise
// the article's bottom edge. Once that point is on screen, they have read
// the post.
function findArticleEnd(): HTMLElement | null {
  const article = document.querySelector('article');
  if (!article) return null;
  const faq = Array.from(article.querySelectorAll('h2')).find((h) =>
    /frequently asked/i.test(h.textContent || ''),
  );
  return (faq as HTMLElement | undefined) ?? (article as HTMLElement);
}

type Variant = 'magnet' | 'quiz' | 'membership';

interface Props {
  /** The one free thing this page should offer. Omit to skip straight to the quiz. */
  magnet?: LeadMagnet;
}

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Gate: people who already have access (members incl. trial, and starters)
 * should never get the "unlock with membership" upsell. Everyone else (signed
 * out, or signed-in non-members) gets the normal popup.
 */
export default function BlogExitIntentPopup({ magnet }: Props) {
  if (!hasClerk) return <BlogExitIntentPopupInner magnet={magnet} />;
  return <MemberGate magnet={magnet} />;
}

function MemberGate({ magnet }: Props) {
  const { isLoaded, isSignedIn } = useUser();
  // Access comes from the database via useAccessTier, not Clerk's
  // publicMetadata.tier: the mirror only gets corrected by a Stripe webhook, so
  // an account whose subscription went away any other way keeps claiming
  // membership and would never be offered the upsell again.
  const tier = useAccessTier(!!isSignedIn);
  if (!isLoaded) return null;
  // Signed in but the tier hasn't landed yet: wait rather than risk showing a
  // member the "unlock with membership" pitch. Signed-out readers resolve to
  // null with no request, so nothing is delayed for them.
  if (isSignedIn && tier === null) return null;
  // Hide only from people who already have the library (paid or trialing).
  if (tier === 'member' || tier === 'trial') return null;
  return <BlogExitIntentPopupInner magnet={magnet} />;
}

function notExpired(key: string): boolean {
  const expiry = localStorage.getItem(key);
  return !!expiry && Date.now() < Number(expiry);
}

function magnetAlreadyClaimed(magnet: LeadMagnet): boolean {
  if (localStorage.getItem(MAGNET_CLAIMED_KEY)) return true;
  if (magnet.kind === 'ideas') return !!localStorage.getItem(IDEAS_CLAIMED_KEY);
  return !!localStorage.getItem(GUIDE_SUBMITTED_KEY);
}

function BlogExitIntentPopupInner({ magnet }: Props) {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [variant, setVariant] = useState<Variant>('quiz');
  const mountTimeRef = useRef(Date.now());
  const firedRef = useRef(false);

  /* ─── Decide variant + eligibility ─── */
  // Returns the variant to show, or null if no popup should fire. Order:
  // the page's free magnet (inline email), then the quiz, then membership.
  const resolveVariant = useCallback((): Variant | null => {
    try {
      if (notExpired(COOLDOWN_KEY)) return null;
      if (magnet && !magnetAlreadyClaimed(magnet) && !notExpired(MAGNET_DISMISS_KEY)) {
        return 'magnet';
      }
      const quizDone = !!localStorage.getItem(QUIZ_TAKEN_KEY);
      if (!quizDone) {
        if (notExpired(QUIZ_DISMISS_KEY)) return null;
        return 'quiz';
      }
      if (notExpired(MEMBER_DISMISS_KEY)) return null;
      return 'membership';
    } catch {
      return magnet ? 'magnet' : 'quiz';
    }
  }, [magnet]);

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
      const [key, days] =
        dismissedVariant === 'membership'
          ? [MEMBER_DISMISS_KEY, MEMBER_DISMISS_DAYS]
          : dismissedVariant === 'magnet'
            ? [MAGNET_DISMISS_KEY, MAGNET_DISMISS_DAYS]
            : [QUIZ_DISMISS_KEY, QUIZ_DISMISS_DAYS];
      const day = 24 * 60 * 60 * 1000;
      localStorage.setItem(key, String(Date.now() + days * day));
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_DAYS * day));
    } catch {}
  }, [variant]);

  /* ─── Fire on whichever comes first: end of article, or exit gesture ─── */
  useEffect(() => {
    // Don't arm anything if no variant is eligible right now.
    if (!resolveVariant()) return;

    const pastFloor = () => Date.now() - mountTimeRef.current >= EARLY_TRIGGER_FLOOR_MS;

    // 1. Fire once the end of the article body is on screen.
    const articleEnd = findArticleEnd();
    function handleScroll() {
      if (!pastFloor()) return;
      if (!articleEnd) return;
      const rect = articleEnd.getBoundingClientRect();
      // For the FAQ heading: fire when the heading scrolls into view. For a
      // post without FAQ (rect is the whole article): fire when its bottom
      // edge comes into view.
      const y = articleEnd.tagName === 'ARTICLE' ? rect.bottom : rect.top;
      if (y <= window.innerHeight) trigger();
    }

    // 2. Fire on exit intent (mouse leaves the top of the window).
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 0 || !pastFloor()) return;
      trigger();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
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

        {variant === 'magnet' && magnet ? (
          <MagnetVariant magnet={magnet} onDismiss={dismiss} />
        ) : variant === 'quiz' ? (
          <QuizVariant onDismiss={dismiss} />
        ) : (
          <MembershipVariant onDismiss={dismiss} />
        )}
      </div>
    </div>
  );
}

/* ─── Variant 0: the page's free magnet, email captured right here ─── */
function MagnetVariant({ magnet, onDismiss }: { magnet: LeadMagnet; onDismiss: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const source = useAttributionSource();

  const cover =
    magnet.kind === 'capable-kid'
      ? '/images/capable-kid-cover.jpg'
      : magnet.kind === 'free-guide'
        ? '/images/free-guide-cover.jpg'
        : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const { newMetaEventId } = await import('@/lib/tracking');
      const metaEventId = newMetaEventId();
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: source || 'blog-popup',
          ...(magnet.kind === 'ideas' ? { checklist: magnet.slug } : {}),
          ...(magnet.kind === 'capable-kid' ? { guide: 'capable-kid' } : {}),
          metaEventId,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
      try {
        localStorage.setItem(MAGNET_CLAIMED_KEY, '1');
        if (magnet.kind === 'ideas') {
          localStorage.setItem(IDEAS_CLAIMED_KEY, JSON.stringify({ at: Date.now() }));
        } else {
          localStorage.setItem(GUIDE_SUBMITTED_KEY, 'true');
        }
      } catch {}
      try {
        const { pinterestSetEnhancedMatch, trackLead } = await import('@/lib/tracking');
        pinterestSetEnhancedMatch(email);
        const label =
          magnet.kind === 'ideas'
            ? `ideas:${magnet.slug}`
            : magnet.kind === 'capable-kid'
              ? 'free-guide:capable-kid'
              : 'free-guide';
        trackLead(`popup:${label}`, metaEventId);
      } catch {}
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-7 sm:pb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-3">
          On its way
        </p>
        <h2
          id="blog-exit-popup-title"
          className="font-display text-[1.5rem] sm:text-[1.85rem] text-forest leading-[1.1] mb-3 text-balance"
        >
          Check your inbox.
        </h2>
        <p className="text-[14px] sm:text-[15px] text-gray-500 leading-relaxed max-w-[380px] mx-auto mb-6">
          {magnet.title} is on its way to {email}. If it is not there in a few minutes, check the
          promotions folder.
        </p>
        {magnet.kind === 'ideas' ? (
          <Link
            href={magnet.href}
            onClick={onDismiss}
            className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl text-[15px] text-center transition-all duration-200 no-underline"
          >
            Open the printable now
          </Link>
        ) : (
          <button
            onClick={onDismiss}
            className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3.5 rounded-xl text-[15px] text-center transition-all duration-200"
          >
            Back to the article
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-8 pt-7 sm:pt-8 pb-6 sm:pb-7">
      <div className={`flex items-start gap-4 sm:gap-5 mb-5 ${cover ? '' : 'text-center flex-col items-center'}`}>
        {cover && (
          <div className="relative w-[72px] sm:w-[104px] flex-shrink-0 aspect-[800/1035] rounded-lg overflow-hidden shadow-md bg-[#E6EBDF]">
            <Image
              src={cover}
              alt={`${magnet.title} cover`}
              fill
              sizes="(max-width: 640px) 72px, 104px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97B5C] mb-2">
            {magnet.eyebrow}
          </p>
          <h2
            id="blog-exit-popup-title"
            className="font-display text-[1.45rem] sm:text-[1.8rem] text-forest leading-[1.08] mb-2 text-balance"
          >
            {magnet.title}
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-gray-500 leading-relaxed">
            {magnet.blurb}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="blog-exit-popup-email" className="sr-only">
          Email address
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id="blog-exit-popup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1 min-w-0 rounded-xl border border-[#C9D3BE] bg-white px-4 py-3 text-[15px] text-forest-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/40"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-forest hover:bg-forest-dark disabled:opacity-70 text-cream font-semibold px-5 py-3 rounded-xl text-[15px] whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
          >
            {status === 'loading' ? 'Sending…' : magnet.cta}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-2 text-[13px] text-[#B5473A]" role="alert">
            {errorMessage}
          </p>
        )}
        <p className="mt-2.5 text-center text-[12px] text-gray-400">
          One email, no spam, unsubscribe any time.
        </p>
      </form>

      <button
        onClick={onDismiss}
        className="mt-3 text-[12px] text-gray-400 hover:text-gray-500 transition-colors text-center w-full"
      >
        No thanks, I&rsquo;ll keep reading
      </button>
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
            120+ guided activities across nine categories. New ones added every quarter
            {IS_FOUNDER_PHASE ? ', founder rate locked in for life' : ''}.
          </p>
        </div>
      </div>

      <Link
        href="/#membership"
        onClick={onDismiss}
        className="block w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl text-[15px] text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
      >
        Unlock with membership
      </Link>

      <p className="mt-2.5 text-center text-[13px] text-gray-500">
        {MEMBERSHIP_PRICE_YEAR}
        {IS_FOUNDER_PHASE ? ' · founder rate' : ''} · or $15/mo · 14-day refund
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
