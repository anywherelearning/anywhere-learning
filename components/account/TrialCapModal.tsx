'use client';

/**
 * Upgrade-to-download modal. Trial members are view-only; when they try to
 * download, this explains that downloads come with membership and offers a
 * one-tap "start my membership now" that ends the trial early (charges the
 * card already on file) so downloads unlock immediately.
 *
 * Honest billing: the button copy states the exact charge before they tap.
 */

import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** ISO date the trial converts on its own. Optional; phrasing adapts. */
  trialEndsAt?: string | null;
  /** Price label, e.g. "$99/year". */
  priceLabel?: string;
  /** Whether this member locked the founder rate (for the locked-in line). */
  isFounder?: boolean;
}

export default function TrialCapModal({
  open,
  onClose,
  trialEndsAt,
  priceLabel = '$99/year',
  isFounder = true,
}: Props) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !working && !done) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, working, done]);

  if (!open) return null;

  const endLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;
  const priceNumber = priceLabel.split('/')[0];
  // The label already encodes the plan ("$99/year" vs "$15/month"), so the
  // billing-cadence fine print can key off it without extra plumbing.
  const isMonthlyPlan = priceLabel.includes('/month');

  async function handleSubscribe() {
    setError(null);
    setWorking(true);
    try {
      const res = await fetch('/api/checkout/upgrade-trial', { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (res.ok && data.ok) {
        // Show the congrats step; the "Start downloading" button reloads
        // /account so the tier resolves to member and downloads unlock.
        setDone(true);
        setWorking(false);
        return;
      }
      setError(data.message || 'Could not start your membership. Please try again.');
      setWorking(false);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setWorking(false);
    }
  }

  // ── Step 2: congrats / membership confirmed ──
  if (done) {
    return (
      <div
        className="fixed inset-0 z-[80] grid place-items-center p-5 bg-[#2D3A2E]/45 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-done-title"
      >
        <div className="w-full max-w-[440px] bg-cream border border-[#D8D4C5] rounded-[18px] shadow-[0_32px_64px_-16px_rgba(45,58,46,0.35)] p-7 text-center">
          <span
            aria-hidden="true"
            className="inline-grid place-items-center w-12 h-12 rounded-full bg-forest text-cream"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h2 id="trial-done-title" className="mt-4 font-display text-[24px] leading-[1.15] tracking-tight text-ink">
            You&apos;re in. <em className="not-italic italic text-forest">Welcome.</em>
          </h2>
          <p className="mt-3 font-body text-[14.5px] leading-[1.6] text-gray-600">
            Your membership is active and every guide is yours to download now. Thank you for
            being one of the early ones, it means the world.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/account?upgraded=1')}
            className="mt-6 w-full bg-forest text-cream font-body font-semibold text-[14.5px] py-3 rounded-xl border-0 cursor-pointer hover:bg-forest-dark transition-colors"
          >
            Start downloading
          </button>
          <p className="mt-3.5 mb-0 font-body text-[12px] text-gray-400">
            xo, Amelie · A receipt is on its way to your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-5 bg-[#2D3A2E]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-upgrade-title"
      onClick={() => !working && onClose()}
    >
      <div
        className="w-full max-w-[440px] bg-cream border border-[#D8D4C5] rounded-[18px] shadow-[0_32px_64px_-16px_rgba(45,58,46,0.35)] p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden="true"
          className="inline-grid place-items-center w-12 h-12 rounded-full bg-[#E6EBDF] border border-[#C9D3BE] text-forest-dark"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <h2
          id="trial-upgrade-title"
          className="mt-4 font-display text-[24px] leading-[1.15] tracking-tight text-ink"
        >
          Downloads come with{' '}
          <em className="not-italic italic text-forest">membership.</em>
        </h2>
        <p className="mt-3 font-body text-[14.5px] leading-[1.6] text-gray-600">
          During your free trial you can open and read every guide in your browser, as
          much as you like. To save guides as PDFs, start your membership, it&apos;s the
          same {priceLabel}{isFounder ? ' founder rate' : ''} that begins
          {endLabel ? ` on ${endLabel}` : ' when your trial ends'} anyway.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-[13px] text-[#7A3D24] bg-[#F7EBE2] border border-[#E8D4C2] rounded-[10px] px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={working}
          className="mt-6 w-full bg-forest text-cream font-body font-semibold text-[14.5px] py-3 rounded-xl border-0 cursor-pointer hover:bg-forest-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {working ? 'Starting your membership…' : `Start membership now · ${priceNumber} today`}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={working}
          className="mt-2.5 w-full bg-transparent border-0 font-body text-[13.5px] text-gray-500 cursor-pointer hover:text-forest-dark transition-colors disabled:opacity-50"
        >
          Keep reading in my browser
        </button>
        <p className="mt-3.5 mb-0 font-body text-[12px] text-gray-400">
          Your card on file is charged today, then {isMonthlyPlan ? 'once a month' : 'once a year'}. Cancel anytime.{' '}
          <a
            href="/api/billing/portal"
            className="text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-forest-dark"
          >
            Use a different card
          </a>
          .
        </p>
      </div>
    </div>
  );
}
