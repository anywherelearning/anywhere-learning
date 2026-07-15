import type { Metadata } from 'next';
import Link from 'next/link';
import { getMembership } from '@/lib/membership-runtime';
import {
  TRIAL_DAYS,
  POST_FOUNDER_PRICE_USD,
  MONTHLY_PRICE_USD,
  annualSavingsPct,
} from '@/lib/membership';

/**
 * /choose-plan — the one step where a visitor picks yearly vs monthly.
 *
 * Stripe's hosted checkout can't switch plans mid-session, so the choice has
 * to happen before the session is created. Every generic "Start free trial"
 * CTA (nav pill, shop banners, FAQ, about) lands on /start-trial WITHOUT a
 * plan, and that route redirects here. Visitors who already picked a plan
 * (the /join toggle) carry ?plan=… and skip this page entirely.
 *
 * Funnel: /choose-plan → /start-trial?plan=… → sign-up (if needed) → Stripe.
 */

export const metadata: Metadata = {
  title: 'Choose Your Plan',
  description: 'Pick yearly or monthly. Both start with a 14-day free trial.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ChoosePlanPage() {
  const m = await getMembership();
  const savings = annualSavingsPct(m.priceUSD);

  return (
    <main className="bg-cream px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[880px]">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-[620px] text-center">
          <span className="inline-flex items-center gap-2.5 text-[12.5px] font-medium uppercase tracking-[.16em] text-forest-dark before:block before:h-px before:w-[22px] before:bg-forest">
            Start your free trial
          </span>
          <h1 className="mt-3.5 text-balance font-display text-[clamp(34px,4.6vw,52px)] leading-[1.08] tracking-tight text-gray-900">
            Pick how you&apos;d like{' '}
            <em className="font-display not-italic text-forest">to join.</em>
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-gray-500">
            Both plans open the full library and start with {TRIAL_DAYS} days
            free. $0 today, cancel anytime during the trial and pay nothing.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
          {/* Yearly — featured */}
          <div className="relative flex flex-col rounded-[18px] border-2 border-forest bg-white px-8 py-9 shadow-[0_28px_50px_-32px_rgba(58,90,64,.45)]">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-4 py-1.5 text-[11.5px] font-semibold uppercase tracking-[.12em] text-cream">
              Best value · Save {savings}%
            </span>
            <h2 className="font-display text-[26px] leading-tight text-gray-900">Yearly</h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[44px] italic leading-none text-forest-dark">
                {m.priceMonthly}
              </span>
              <span className="text-[15px] text-gray-500">/month</span>
            </div>
            <p className="mt-1.5 text-[14px] text-gray-400">
              billed once a year at {m.priceYear}
              {m.isFounderPhase && (
                <>
                  {' · '}
                  <s>${POST_FOUNDER_PRICE_USD}</s>
                </>
              )}
            </p>
            {m.isFounderPhase && (
              <p className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-[#c4836a]/45 bg-[#f5e1d2] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#7A3D24]">
                Founder rate · Locked in for life
              </p>
            )}
            <ul className="mt-5 flex flex-col gap-2 text-[14.5px] text-gray-600">
              {[
                'Full library, all 120+ activities',
                'New activities every quarter',
                m.isFounderPhase
                  ? `Your ${m.priceYear} rate never goes up`
                  : 'One payment covers the whole year',
                '14-day money-back guarantee on top',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-[#E6EBDF] text-[10px] font-bold text-forest-dark">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/start-trial?plan=annual"
              className="mt-7 inline-flex items-center justify-center gap-3 rounded-xl bg-forest px-6 py-4 text-[16px] font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_24px_-12px_rgba(58,90,64,.5)] transition-all hover:-translate-y-px hover:bg-forest-dark"
            >
              Start {TRIAL_DAYS}-day free trial
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">→</span>
            </Link>
          </div>

          {/* Monthly */}
          <div className="flex flex-col rounded-[18px] border border-gray-200 bg-white px-8 py-9 shadow-[0_18px_36px_-28px_rgba(45,58,46,.3)]">
            <h2 className="font-display text-[26px] leading-tight text-gray-900">Monthly</h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[44px] italic leading-none text-forest-dark">
                ${MONTHLY_PRICE_USD}
              </span>
              <span className="text-[15px] text-gray-500">/month</span>
            </div>
            <p className="mt-1.5 text-[14px] text-gray-400">billed monthly, cancel anytime</p>
            <ul className="mt-5 flex flex-col gap-2 text-[14.5px] text-gray-600">
              {[
                'Same full library, all 120+ activities',
                'Same new activities every quarter',
                'No yearly commitment',
                'Switch to yearly anytime and save',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-[#E6EBDF] text-[10px] font-bold text-forest-dark">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/start-trial?plan=monthly"
              className="mt-auto pt-7 inline-flex"
            >
              <span className="inline-flex w-full items-center justify-center gap-3 rounded-xl border-2 border-forest bg-cream px-6 py-4 text-[16px] font-semibold text-forest-dark transition-all hover:-translate-y-px hover:bg-[#E6EBDF]">
                Start {TRIAL_DAYS}-day free trial
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Reassurance row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-forest">✓</span> $0 charged today
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-[#d4c4a8]" />
          <span>Card required, charged only after {TRIAL_DAYS} days</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[#d4c4a8]" />
          <span>14-day money-back guarantee</span>
        </div>

        <p className="mt-6 text-center text-[14px] text-gray-400">
          Want the full tour first?{' '}
          <Link
            href="/join"
            className="font-semibold text-forest-dark underline decoration-dotted underline-offset-2 hover:text-forest"
          >
            See everything the membership includes
          </Link>
        </p>
      </div>
    </main>
  );
}
