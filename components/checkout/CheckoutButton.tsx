'use client';

/**
 * Generic checkout button. Hits one of the new checkout API routes
 * (`/api/checkout/membership` or `/api/checkout/starter-pack`), then redirects
 * the browser to the Stripe-hosted Checkout URL.
 *
 * Loading + error states are inline so we don't need a global toast system.
 */

import { useState, useTransition } from 'react';

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

  function startCheckout() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/checkout/${kind}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(email ? { email } : {}),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error || 'Could not start checkout. Please try again.');
          return;
        }
        window.location.href = data.url;
      } catch {
        setError('Network error. Please check your connection and try again.');
      }
    });
  }

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
