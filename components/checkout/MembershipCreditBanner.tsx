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

  // ─── State 2: guest nudge ───────────────────────────────────────────────
  // Soft prompt so existing Starter Pack buyers don't accidentally pay
  // full price. Renders for all unauthenticated visitors since we can't
  // know until they sign in whether they qualify.
  if (data.reason === 'no-user') {
    if (variant === 'inline') {
      return (
        <span
          role="status"
          className="inline-flex flex-wrap items-center gap-2 rounded-full"
          style={{
            background: '#FFFDF7',
            color: '#4F5A50',
            padding: '4px 10px 4px 12px',
            fontSize: 12.5,
            fontFamily: '"DM Sans", sans-serif',
            border: '1px solid #E5E0D2',
          }}
        >
          Bought the Starter Pack?
          <a
            href={signInHref}
            style={{
              color: '#3A5A40',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '1px solid rgba(58,90,64,.3)',
            }}
          >
            Sign in to apply your {data.creditLabel} credit →
          </a>
        </span>
      );
    }
    return (
      <div
        role="status"
        className="rounded-2xl"
        style={{
          background: '#FFFDF7',
          border: '1px solid #E5E0D2',
          padding: '14px 18px',
          fontFamily: '"DM Sans", sans-serif',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: '#7B8378',
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Already a Starter Pack buyer?
          </div>
          <div style={{ fontSize: 14, color: '#2D3A2E', lineHeight: 1.45 }}>
            Sign in first and we&apos;ll apply your{' '}
            <strong>{data.creditLabel} credit</strong> at checkout. First year
            is <strong>${data.standardPriceUsd - data.creditUsd > 0
              ? Math.round(data.standardPriceUsd - data.creditUsd)
              : 0}</strong> instead of ${data.standardPriceUsd}.
          </div>
        </div>
        <a
          href={signInHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#588157',
            color: '#FAF9F6',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: 13,
            padding: '9px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow:
              '0 1px 0 rgba(255,255,255,.18) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 10px 24px -14px rgba(58,90,64,.55)',
          }}
        >
          Sign in →
        </a>
      </div>
    );
  }

  // States 3-4: signed in but no Starter Pack, or already applied. Stay silent.
  return null;
}
