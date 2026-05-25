'use client';

/**
 * Generic checkout button. Hits one of the new checkout API routes
 * (`/api/checkout/membership` or `/api/checkout/starter-pack`), then redirects
 * the browser to the Stripe-hosted Checkout URL.
 *
 * Auto-resume after sign-in: if the API returns 401 (membership requires
 * auth), we redirect to /sign-in with `?continue=<kind>` in the return URL.
 * When we land back, the URL param triggers checkout immediately, so the
 * user doesn't have to click the button twice.
 *
 * Loading + error states are inline so we don't need a global toast system.
 */

import { useEffect, useRef, useState, useTransition } from 'react';

type Kind = 'membership' | 'starter-pack';

interface Props {
  kind: Kind;
  /** Button label. */
  children: React.ReactNode;
  /** Optional Tailwind class override. */
  className?: string;
  /** Optional aria-label. */
  ariaLabel?: string;
  /** Optional pre-filled email (for capture forms that own the email field). */
  email?: string;
}

export default function CheckoutButton({
  kind,
  children,
  className,
  ariaLabel,
  email,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const autoResumedRef = useRef(false);

  function startCheckout() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/checkout/${kind}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(email ? { email } : {}),
        });
        const data = (await res.json()) as {
          url?: string;
          error?: string;
          message?: string;
          signInUrl?: string;
        };
        // Sign-in gate: server responds 401 + signInUrl when the route
        // requires auth (e.g. membership checkout, to apply the credit).
        // We append `continue=<kind>` to the redirect-after-sign-in URL so
        // the user lands back here and we auto-resume the checkout — no
        // second click required.
        if (res.status === 401 && data.signInUrl) {
          const base = data.signInUrl;
          const sep = base.includes('?') ? '&' : '?';
          // Re-parse the embedded redirect_url so we can append our continue param
          // without breaking the encoding.
          try {
            const u = new URL(base, window.location.origin);
            const redirect = u.searchParams.get('redirect_url') || '/join';
            const redirectWithContinue =
              redirect + (redirect.includes('?') ? '&' : '?') + `continue=${kind}`;
            u.searchParams.set('redirect_url', redirectWithContinue);
            window.location.href = u.toString();
          } catch {
            window.location.href = base + sep + 'continue=' + encodeURIComponent(kind);
          }
          return;
        }
        if (!res.ok || !data.url) {
          setError(data.message || data.error || 'Could not start checkout. Please try again.');
          return;
        }
        window.location.href = data.url;
      } catch {
        setError('Network error. Please check your connection and try again.');
      }
    });
  }

  // Auto-resume: when the page loads with ?continue=<kind> matching this
  // button's kind, fire the checkout immediately. Removes the URL param
  // afterward so a page refresh doesn't loop the user back into checkout.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (autoResumedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('continue') === kind) {
      autoResumedRef.current = true;
      params.delete('continue');
      const cleanQs = params.toString();
      const cleanUrl =
        window.location.pathname + (cleanQs ? `?${cleanQs}` : '') + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
      startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return (
    <>
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending}
        aria-label={ariaLabel}
        className={className}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Starting checkout…
          </span>
        ) : (
          children
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-[#C97B5C]">
          {error}
        </p>
      )}
    </>
  );
}
