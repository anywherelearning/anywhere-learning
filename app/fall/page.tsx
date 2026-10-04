import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Countdown from '@/components/fall/Countdown';
import { FALL_OFFER, FALL_OFFER_PRICE_USD, isFallOfferActive } from '@/lib/fall-offer';
import { FOUNDER_PRICE_USD, MONTHLY_PRICE_USD, TRIAL_DAYS, isFounderPhaseOpen } from '@/lib/membership';

/**
 * /fall: the Meta ad landing page for the membership trial + Fall offer
 * ($79 first year, ends Oct 19). One job: start the trial. Logo only, no nav,
 * no footer links that lead away. Not indexed, not in the sitemap.
 *
 * Every yearly CTA carries ?offer=fall so /start-trial applies the coupon.
 * Once the offer ends (or the founder rate closes), the page hands off to
 * /choose-plan instead of advertising a price nobody can get.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Try Anywhere Learning free for 14 days' },
  description:
    'Real-world activities for kids 6 to 14, step by step, made to do together. 14 days free, then your first year for $79.',
  robots: { index: false, follow: false },
};

const TRIAL_HREF = `/start-trial?plan=annual&offer=${FALL_OFFER.slug}`;
const MONTHLY_HREF = '/start-trial?plan=monthly';

// Real moments, each one labelled with the learning inside it.
const COLLAGE: { src: string; label: string; alt: string; rot: number }[] = [
  { src: '/images/home/baking-day.jpg', label: 'fractions', alt: 'A girl mixing batter in a big bowl', rot: -6 },
  { src: '/images/course/popcorn-stand.jpg', label: 'pricing + profit', alt: 'A girl at her popcorn stand with a $2 sign', rot: 3 },
  { src: '/images/home/sifting-finds.jpg', label: 'archaeology', alt: 'Two kids sifting through finds at an outdoor table', rot: 4 },
  { src: '/images/course/building-with-dad.jpg', label: 'measuring', alt: 'A girl and her dad building a garden box', rot: 4 },
  { src: '/images/home/at-the-roastery.jpg', label: 'roasting science', alt: 'Kids learning to roast coffee beans', rot: -4 },
];

const GET_LIST: [string, string][] = [
  ['120+ real-world activities,', 'each one a step-by-step guide you open on your phone'],
  ['A map for each kid,', 'with the next activity matched to their age'],
  ['A plan every month,', 'so you never wonder what to do next'],
  ['A record', 'of the skills each kid is building'],
  ['Three levels in every guide,', 'so siblings can do the same activity together'],
];

const FAQS: [string, string][] = [
  [
    `What happens after ${TRIAL_DAYS} days?`,
    `Your first year is charged at $${FALL_OFFER_PRICE_USD}, then $${FOUNDER_PRICE_USD}/year after that, your founder rate locked in for life. Cancel any time before your trial ends and you pay nothing. We email you 3 days before.`,
  ],
  ['What ages is it for?', 'Kids 6 to 14. Every guide has three levels, so a 7-year-old and a 12-year-old can work on the same activity.'],
  ['Do we need to homeschool?', 'No. It works after school, on weekends and on holidays. It fits any family that wants hands-on, real-world learning at home.'],
  ['How much prep is there?', 'Very little. Open the guide on any device and follow along together. Printing is optional.'],
  ['Can I get my money back?', `Yes. On top of the ${TRIAL_DAYS}-day free trial, you have a 14-day money-back guarantee once you're charged.`],
  [
    `Does the $${FALL_OFFER_PRICE_USD} offer work on the monthly plan?`,
    `The Fall offer is for the yearly plan. Monthly is $${MONTHLY_PRICE_USD}/month with the same ${TRIAL_DAYS}-day free trial.`,
  ],
];

function Check() {
  return (
    <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
        <path d="M5 10.5l3 3 7-7" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function TrialButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={TRIAL_HREF}
      className={`block rounded-2xl bg-forest px-6 py-4 text-center text-[17px] font-bold text-white no-underline shadow-[0_8px_20px_-8px_rgba(61,92,59,0.6)] transition-colors hover:bg-forest-dark ${className}`}
    >
      {children}
    </a>
  );
}

function Polaroid({ src, label, alt, rot, className = '' }: (typeof COLLAGE)[number] & { className?: string }) {
  return (
    <figure
      className={`relative bg-white p-1.5 pb-0 shadow-[0_12px_26px_-12px_rgba(0,0,0,0.45)] ${className}`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 34vw, 180px" className="object-cover" priority />
      </div>
      <figcaption
        className="whitespace-nowrap px-1 pb-1 pt-0.5 text-center text-[16px] leading-tight text-ink md:text-[21px]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
      </figcaption>
    </figure>
  );
}

export default async function FallOfferPage() {
  // Founder-only offer ($20 off $99). If the offer is over or the founder
  // rate has closed, don't advertise it.
  if (!isFallOfferActive() || !(await isFounderPhaseOpen())) redirect('/choose-plan');

  const endsAt = FALL_OFFER.endsAt.toISOString();

  return (
    <div className="min-h-screen bg-cream pb-24 text-ink md:pb-0">
      {/* Logo only: no nav, nothing that leads away from the trial. */}
      <header className="flex justify-center px-5 pt-5 md:justify-start md:px-10">
        <span className="inline-flex items-center gap-2.5" aria-label="Anywhere Learning">
          <Image src="/logo-icon-transparent.png" alt="" width={34} height={34} className="h-[34px] w-auto" priority />
          <span className="inline-flex items-baseline gap-1">
            <span className="text-[17px] tracking-wide">anywhere</span>
            <span className="font-display text-[18px] italic leading-none text-forest-dark">learning</span>
          </span>
        </span>
      </header>

      {/* ── Hero: scrapbook + offer + countdown ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-6 px-5 pb-12 pt-2 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-10 md:pb-20 md:pt-10">
        <div className="md:order-2">
          <div className="flex justify-center">
            {COLLAGE.slice(0, 3).map((p, i) => (
              <Polaroid key={p.src} {...p} className={`w-[29%] max-w-[180px] ${i === 1 ? 'z-10 -mx-2.5 -mt-1' : 'mt-3'}`} />
            ))}
          </div>
          <div className="-mt-1 flex justify-center gap-4">
            {COLLAGE.slice(3).map((p) => (
              <Polaroid key={p.src} {...p} className="z-20 w-[33%] max-w-[210px]" />
            ))}
          </div>
        </div>

        <div className="text-center md:order-1 md:text-left">
          <h1 className="text-[36px] font-extrabold leading-[1.04] tracking-tight md:text-[60px]">
            Real things.
            <br />
            <span className="italic text-forest">Real learning.</span>
            <br />
            Right at home.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-gray-700 md:mx-0 md:text-[19px]">
            120+ step-by-step activities for kids 6 to 14, made to do together. The math and the writing come along
            for the ride.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-dashed border-gold bg-[#fff6e8] px-4 py-4 md:mx-0">
            <p className="text-[16px]">
              <span className="font-bold">{FALL_OFFER.name}:</span> your first year{' '}
              <span className="font-bold">${FALL_OFFER_PRICE_USD}</span>{' '}
              <s className="text-gray-500">${FOUNDER_PRICE_USD}</s>
            </p>
            <p className="mb-3 mt-0.5 text-[13px] text-gray-600">Ends {FALL_OFFER.endsLabel} at midnight PT</p>
            <Countdown endsAt={endsAt} />
          </div>

          <div className="mx-auto mt-6 max-w-md md:mx-0">
            <TrialButton>Try it free for {TRIAL_DAYS} days</TrialButton>
            <p className="mt-2.5 text-center text-[13px] text-gray-600">$0 today · cancel anytime · ages 6 to 14</p>
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="bg-[#f2efe6] px-5 py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-[38px]">
            What you get the day you join
          </h2>
          <ul className="mt-6 space-y-4">
            {GET_LIST.map(([bold, rest]) => (
              <li key={bold} className="flex gap-3 text-[17px] leading-snug">
                <Check />
                <span>
                  <strong>{bold}</strong> {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Peek inside a guide ── */}
      <section className="px-5 py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-14">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-gold-dark">Peek inside a guide</p>
            <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight md:text-[38px]">
              Every step tells you <span className="italic text-forest">who does what.</span>
            </h2>
            <ul className="mt-5 space-y-3 text-[16px] leading-snug">
              <li className="flex gap-3">
                <Check />
                <span>
                  <strong>Their job and your job,</strong> so you always know which part to hand over.
                </span>
              </li>
              <li className="flex gap-3">
                <Check />
                <span>
                  <strong>Questions to ask,</strong> so you guide with a question instead of the answer.
                </span>
              </li>
              <li className="flex gap-3">
                <Check />
                <span>
                  <strong>Three levels.</strong> Explore, Develop, Extend, so it fits a 6-year-old and a 12-year-old.
                </span>
              </li>
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-md rotate-[1.5deg]">
            <Image
              src="/images/fall/invent-a-sport-step-2.jpg"
              alt="Step 2 of the Invent a New Sport guide: design the playing area, with the child's job, the parent's job, prompts and three levels"
              width={900}
              height={1272}
              sizes="(max-width: 768px) 90vw, 440px"
              className="h-auto w-full rounded-xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-[#f2efe6] px-5 py-14 md:py-20" id="pricing">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border-2 border-forest bg-white p-6 shadow-[0_14px_30px_-18px_rgba(45,58,46,0.5)]">
            <span className="inline-block rounded-full bg-gold px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-white">
              {FALL_OFFER.name} · ends {FALL_OFFER.endsLabelShort}
            </span>
            <p className="mt-4 font-bold">Yearly membership</p>
            <p className="mt-1 flex items-baseline gap-2">
              <s className="text-[20px] text-gray-500">${FOUNDER_PRICE_USD}</s>
              <span className="text-[48px] font-extrabold leading-none tracking-tight">${FALL_OFFER_PRICE_USD}</span>
              <span className="text-gray-600">first year</span>
            </p>
            <ul className="mt-5 space-y-2.5 text-[15px]">
              <li className="flex gap-3">
                <Check />
                <span>{TRIAL_DAYS} days free, $0 today</span>
              </li>
              <li className="flex gap-3">
                <Check />
                <span>
                  Then ${FALL_OFFER_PRICE_USD} for your first year, ${FOUNDER_PRICE_USD}/year after that, locked in for life
                </span>
              </li>
              <li className="flex gap-3">
                <Check />
                <span>14-day money-back guarantee on top</span>
              </li>
            </ul>
            <div className="mt-5">
              <Countdown endsAt={endsAt} />
            </div>
            <TrialButton className="mt-5">Start my free trial</TrialButton>
          </div>
          <p className="mt-4 text-center text-[14px] text-gray-600">
            Prefer monthly?{' '}
            <a href={MONTHLY_HREF} className="font-semibold text-forest-dark underline underline-offset-2">
              ${MONTHLY_PRICE_USD}/month
            </a>
            , same free trial.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-[28px] font-extrabold tracking-tight md:text-[38px]">Questions</h2>
          <div className="mt-4">
            {FAQS.map(([q, a]) => (
              <div key={q} className="border-t border-[#e3ddcf] py-4">
                <p className="font-bold">{q}</p>
                <p className="mt-1 text-[16px] leading-relaxed text-gray-700">{a}</p>
              </div>
            ))}
          </div>
          <TrialButton className="mt-8">Try it free for {TRIAL_DAYS} days</TrialButton>
          <p className="mt-2.5 text-center text-[13px] text-gray-600">
            {FALL_OFFER.name} ends {FALL_OFFER.endsLabel}
          </p>
        </div>
      </section>

      <footer className="px-5 pb-8 text-center text-[12px] text-gray-500">
        © {new Date().getFullYear()} Anywhere Learning ·{' '}
        <a href="/privacy" className="underline">Privacy</a> · <a href="/terms" className="underline">Terms</a>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-dark/10 bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <a
          href={TRIAL_HREF}
          className="flex items-center justify-between rounded-xl bg-forest px-4 py-3 text-white no-underline"
        >
          <span className="font-bold">Try it free</span>
          <span className="text-[14px]">
            then ${FALL_OFFER_PRICE_USD} first year <s className="opacity-70">${FOUNDER_PRICE_USD}</s>
          </span>
        </a>
      </div>
    </div>
  );
}
