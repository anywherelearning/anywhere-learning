'use client';

import { useState } from 'react';

interface MembershipPlansProps {
  /** Live founder-aware yearly price, e.g. "$99". */
  priceYear: string;
  /** Yearly price divided by 12, e.g. "$8.25". */
  priceMonthly: string;
  monthlyPrice: string;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  isFounderPhase: boolean;
  founderCap: number;
}

/**
 * Yearly/monthly toggle over a single price card. The plan choice is carried
 * straight through to /start-trial?plan=… so the visitor skips /choose-plan
 * (Stripe can't switch plans mid-session, so the pick has to happen up front).
 */
export default function MembershipPlans({
  priceYear,
  priceMonthly,
  monthlyPrice,
  monthlyPriceUSD,
  yearlyPriceUSD,
  isFounderPhase,
  founderCap,
}: MembershipPlansProps) {
  const [yearly, setYearly] = useState(true);

  const savings = monthlyPriceUSD * 12 - yearlyPriceUSD;

  return (
    <>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-forest/10 p-[5px]">
          {[
            { label: 'Yearly', on: yearly, set: () => setYearly(true) },
            { label: 'Monthly', on: !yearly, set: () => setYearly(false) },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={t.set}
              aria-pressed={t.on}
              className={`rounded-full px-[26px] py-[11px] text-[15px] font-semibold transition-all duration-300 ${
                t.on
                  ? 'bg-white text-forest-dark shadow-[0_1px_3px_0_rgba(60,50,30,0.12)]'
                  : 'text-gray-600 hover:text-forest-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mb-[52px] max-w-[520px] rounded-[24px] border-2 border-forest bg-white px-11 pb-[38px] pt-11 text-center shadow-[0_28px_60px_-14px_rgba(60,50,30,0.2)] max-md:px-6">
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-[7px] text-[11.5px] font-bold uppercase tracking-[0.14em] text-gray-900">
          {yearly
            ? isFounderPhase
              ? `Founder rate · first ${founderCap} families`
              : 'Best value'
            : 'Cancel any month'}
        </span>

        <div className="mb-2 flex items-baseline justify-center gap-2.5">
          <span className="text-[66px] font-bold leading-none text-forest-dark">
            {yearly ? priceYear : monthlyPrice}
          </span>
          <span className="text-[19px] text-gray-500">{yearly ? '/year' : '/month'}</span>
        </div>

        <p className="mb-[26px] text-[16.5px] text-gray-600">
          {yearly
            ? `Works out to ${priceMonthly} a month, saves $${savings} against monthly.`
            : 'Same library, same everything. Switch to yearly any time.'}
        </p>

        <a
          href={yearly ? '/start-trial?plan=annual' : '/start-trial?plan=monthly'}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-forest px-11 py-[18px] text-lg font-semibold text-cream shadow-[0_12px_28px_-8px_rgba(88,129,87,0.35)] transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark active:scale-[0.97]"
        >
          Start free trial
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>

        <p className="mt-4 text-sm text-gray-500">
          {yearly
            ? isFounderPhase
              ? '$0 today · founder rate locked in for life'
              : '$0 today · cancel in one click'
            : '$0 today · cancel in one click'}
        </p>
      </div>
    </>
  );
}
