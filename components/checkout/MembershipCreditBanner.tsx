'use client';

/**
 * Two-state banner on the join page covering the Starter Pack credit flow:
 *
 *   1. Signed-in eligible buyer → "Your $45 credit applies at checkout."
 *      Reassuring confirmation, Stripe Checkout will reflect the discount.
 *
 *   2. Guest (not signed in) → "Bought the Starter Pack? Sign in to apply
 *      your $45 credit." Softer nudge with a sign-in link, so existing
 *      buyers don't accidentally pay full price.
 *
 * In all other cases (signed in but no Starter Pack, or credit already used)
 * the component renders nothing.
 *
 * The actual discount is applied server-side by the membership checkout
 * route. This banner is purely UI clarity so buyers know what to expect.
 */

import { useEffect, useState } from 'react';

interface PricingResponse {
  eligible: boolean;
  /** 'eligible' | 'no-user' | 'no-starter-pack' | 'already-applied' */
  reason: string;
  creditUsd: number;
  creditLabel: string;
  standardPriceUsd: number;
  firstYearPriceUsd: number;
  appliedAt: string | null;
}

interface Props {
  /** 'banner' for hero, 'inline' for compact CTAs. */
  variant?: 'banner' | 'inline';
  /**
   * URL to send the user to after sign-in. Should be the same page they
   * came from so they land back on /join with eligibility resolved.
   */
  signInRedirectUrl?: string;
}

export default function MembershipCreditBanner({
  variant = 'banner',
  signInRedirectUrl = '/join',
}: Props) {
  const [data, setData] = useState<PricingResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership/pricing', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  // Build a properly-encoded sign-in URL so Clerk lands us back here after auth.
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(signInRedirectUrl)}`;

  // ─── State 1: signed-in eligible buyer ──────────────────────────────────
  if (data.eligible) {
    if (variant === 'inline') {
      return (
        <span
          role="status"
          className="inline-flex items-center gap-2 rounded-full"
          style={{
            background: '#E6EBDF',
            color: '#3A5A40',
            padding: '4px 10px',
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
            border: '1px solid #C9D3BE',
          }}
        >
          <span aria-hidden style={{ fontSize: 11 }}>✓</span>
          {`Your ${data.creditLabel} Starter Pack credit applies at checkout`}
        </span>
      );
    }
    return (
      <div
        role="status"
        className="rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #E6EBDF 0%, #F5E7D6 100%)',
          border: '1px solid #C9D3BE',
          padding: '16px 20px',
          fontFamily: '"DM Sans", sans-serif',
          boxShadow: '0 1px 0 rgba(255,255,255,.5) inset',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: '#3A5A40',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          ✓ Starter Pack credit
        </div>
        <div
          style={{
            fontSize: 15.5,
            color: '#2D3A2E',
            lineHeight: 1.45,
          }}
        >
          We&apos;ll take <strong>{data.creditLabel} off your first year</strong>.
          Same {data.creditLabel} you paid for the Starter Pack. You&apos;ll pay{' '}
          <strong>${data.firstYearPriceUsd}</strong>{' '}
          today, then ${data.standardPriceUsd}/year on renewal.
        </div>
      </div>
    );
  }

  // Guests + signed-in-but-no-Starter-Pack + already-redeemed: stay silent.
  //
  // For unauthenticated visitors we can't know if they bought the Starter
  // Pack, so a generic "sign in to apply your credit" nudge would mislead
  // the vast majority who never bought one. If a real Starter Pack buyer
  // visits while signed out, the membership checkout's 401 + auto-resume
  // flow still applies their credit at Stripe Checkout after sign-in, so
  // they aren't penalized for not seeing the banner here.
  return null;
}
