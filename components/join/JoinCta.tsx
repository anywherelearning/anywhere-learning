'use client';

/**
 * The /join CTA block: plan toggle (Yearly / Monthly) + checkout button +
 * fine print. Extracted from the join page's old server-side CtaBlock when
 * the monthly plan launched — the toggle needs client state.
 *
 * Yearly stays the featured plan (founder rate, locked for life). Monthly is
 * the low-commitment door: $15/month, no founder framing, cancel anytime.
 * Both plans share the same 14-day free trial rules.
 */

import { useState } from 'react';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import {
  TRIAL_DAYS,
  POST_FOUNDER_PRICE_USD,
  MONTHLY_PLAN_PRICE_MONTH,
  annualSavingsPct,
} from '@/lib/membership';

export interface JoinCtaMembership {
  isFounderPhase: boolean;
  priceUSD: number;
  priceYear: string;
  priceMonth: string;
}

export default function JoinCta({
  center = false,
  darkMode = false,
  m,
  trialEligible = true,
}: {
  center?: boolean;
  darkMode?: boolean;
  /** Live membership state — passed from the JoinPage server component. */
  m: JoinCtaMembership;
  /** False for a returning customer who already used their one free trial:
   *  they'd be charged immediately, so we drop all trial framing. */
  trialEligible?: boolean;
}) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const savings = annualSavingsPct(m.priceUSD);
  const isMonthly = plan === 'monthly';

  const pillBase =
    'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer';
  const pillActive = darkMode
    ? 'bg-gold-light text-[#2A362B]'
    : 'bg-forest text-cream';
  const pillIdle = darkMode
    ? 'text-[#B7BFB6] hover:text-cream'
    : 'text-gray-500 hover:text-forest-dark';

  return (
    <div
      className={`inline-flex flex-col gap-3 ${center ? 'items-center text-center' : 'items-start'}`}
    >
      {/* Plan toggle */}
      <div
        role="radiogroup"
        aria-label="Billing plan"
        className={`inline-flex items-center gap-1 rounded-full border p-1 ${
          darkMode ? 'border-[#4C5A4D] bg-white/5' : 'border-gray-200 bg-cream'
        }`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isMonthly}
          onClick={() => setPlan('annual')}
          className={`${pillBase} ${!isMonthly ? pillActive : pillIdle}`}
        >
          Yearly · save {savings}%
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isMonthly}
          onClick={() => setPlan('monthly')}
          className={`${pillBase} ${isMonthly ? pillActive : pillIdle}`}
        >
          Monthly
        </button>
      </div>

      <CheckoutButton
        kind="membership"
        plan={plan}
        className="inline-flex items-center gap-3.5 rounded-xl bg-forest px-7 py-[18px] text-[17px] font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,.18),inset_0_-1px_0_rgba(0,0,0,.1),0_10px_24px_-12px_rgba(58,90,64,.5)] transition-all hover:-translate-y-px hover:bg-forest-dark hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-1px_0_rgba(0,0,0,.12),0_16px_30px_-10px_rgba(58,90,64,.55)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="inline-flex items-center gap-3.5">
          {trialEligible ? `Start your ${TRIAL_DAYS}-day free trial` : 'Get the membership'}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition-transform">
            →
          </span>
        </span>
      </CheckoutButton>

      <div className={`text-[15px] ${darkMode ? 'text-[#B7BFB6]' : 'text-gray-500'}`}>
        {trialEligible ? '$0 today, then ' : ''}
        <span
          className={`font-bold text-[17px] ${darkMode ? 'text-gold-light' : 'text-forest-dark'}`}
        >
          {isMonthly ? MONTHLY_PLAN_PRICE_MONTH : m.priceMonth}
        </span>
      </div>

      <div className={`-mt-1.5 text-[13px] ${darkMode ? 'text-[#9AA59B]' : 'text-gray-400'}`}>
        {isMonthly ? (
          <>
            billed monthly · cancel anytime{' · '}
            <button
              type="button"
              onClick={() => setPlan('annual')}
              className="cursor-pointer font-medium underline decoration-dotted underline-offset-2 hover:text-forest-dark"
            >
              switch to yearly and save {savings}%
            </button>
          </>
        ) : (
          <>
            billed once a year at <span className="font-medium">{m.priceYear}</span>
            {m.isFounderPhase && (
              <>
                {' · '}
                <span className={`line-through ${darkMode ? 'text-[#7F8B80]' : 'text-gray-400'}`}>
                  usually ${POST_FOUNDER_PRICE_USD}
                </span>
                {' · '}
                <span className="font-display italic text-[#c4836a]">Locked in for life</span>
              </>
            )}
          </>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] ${darkMode ? 'text-[#9AA59B]' : 'text-gray-400'}`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`font-bold ${darkMode ? 'text-gold-light' : 'text-forest'}`}>✓</span>{' '}
          14-day money-back guarantee
        </span>
        <span
          className={`h-[3px] w-[3px] rounded-full ${darkMode ? 'bg-[#4C5A4D]' : 'bg-[#d4c4a8]'}`}
        />
        <span>Instant access</span>
        <span
          className={`h-[3px] w-[3px] rounded-full ${darkMode ? 'bg-[#4C5A4D]' : 'bg-[#d4c4a8]'}`}
        />
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}
