import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Countdown from '@/components/fall/Countdown';
import ScrollReveal from '@/components/shared/ScrollReveal';
import Eyebrow from '@/components/shared/PageEyebrow';
import { Tape, PAPER_SHADOW } from '@/components/shared/Paper';
import InsideMembership from '@/components/home/v2/InsideMembership';
import HomeFaqAccordion from '@/components/home/v2/HomeFaqAccordion';
import { coverSrc } from '@/lib/cover';
import { FALL_OFFER, FALL_OFFER_PRICE_USD, isFallOfferActive } from '@/lib/fall-offer';
import { FOUNDER_PRICE_USD, MONTHLY_PRICE_USD, TRIAL_DAYS, isFounderPhaseOpen } from '@/lib/membership';

/**
 * /fall: the Meta ad landing page for the membership trial + Fall offer
 * ($79 first year, ends Oct 19). One job: start the trial. Built from the
 * homepage's own pieces (taped polaroids, eyebrows, the map/month/record
 * tour, testimonials, FAQ accordion) so it reads as the same site, but with
 * no nav and nothing that leads away. Not indexed, not in the sitemap.
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

// Real afternoons, each one a guide in the library, labelled with the guide
// and the school subject hiding inside it.
const MOMENTS: { src: string; guide: string; skill: string; alt: string; rot: number }[] = [
  { src: '/images/fall/party-planner-math.jpg', guide: 'Party Planner Math', skill: 'budgets + fractions', alt: 'Two kids icing cupcakes for a party they planned', rot: -3 },
  { src: '/images/fall/market-stall.jpg', guide: 'Market Stall Pitch', skill: 'pricing + persuasive writing', alt: 'A girl at her popcorn stand with a $2 sign she made', rot: 2 },
  { src: '/images/fall/community-service-business.jpg', guide: 'Community Service Business', skill: 'planning + pitching', alt: 'A boy at a table presenting the babysitting service he designed', rot: -1.5 },
  { src: '/images/fall/grow-it-eat-it.jpg', guide: 'Grow It, Eat It', skill: 'biology', alt: 'A girl planting tomatoes in pots on the deck', rot: 2.5 },
  { src: '/images/fall/garden-plot-planner.jpg', guide: 'Garden Plot Planner', skill: 'measuring + area', alt: 'A girl and her dad building a garden box with a drill', rot: -2 },
  { src: '/images/fall/kitchen-math.jpg', guide: 'Kitchen Math Challenge', skill: 'fractions + measuring', alt: 'A girl mixing batter in a big bowl', rot: 1.5 },
];

// Invent a New Sport, word for word from the guide.
const SPORT_STEPS = [
  'Pick your sport',
  'Design the playing area',
  'Write the rules and scoring',
  'Make the equipment',
  'Playtest and fix',
  'The championship game',
];
const SPORT_SKILLS = ['Design thinking', 'Math and measurement', 'Fairness and ethics', 'Communication'];

const PEEK_PINS: { n: number; top: string; title: string; body: string }[] = [
  { n: 1, top: '26.5%', title: "Your kid's job", body: 'the part they own, so they do the thinking.' },
  { n: 2, top: '31%', title: 'Your job', body: 'so you always know which part to hand over.' },
  { n: 3, top: '56%', title: 'Questions to ask', body: 'so you guide with a question instead of the answer.' },
  { n: 4, top: '77%', title: 'Three levels', body: 'pick the one that fits each kid, from 6 to 14.' },
];

// Short, word-for-word excerpts from the testimonials on the homepage.
const QUOTES: { quote: string; who: string; role: string }[] = [
  {
    quote: "She helps shift the mindset from 'I need educational experts and structured programs to teach my child' to 'I already have what it takes to support my child's learning.'",
    who: 'Claudia, M.Sc.',
    role: 'Certified parenting coach',
  },
  {
    quote: 'She gave them real-world projects that had them thinking, building, presenting, and collaborating with enthusiasm.',
    who: 'Wendy',
    role: 'Parent',
  },
  {
    quote: 'Years after leaving her classroom, students still talk about Amelie as the best teacher they ever had.',
    who: 'Catherine',
    role: 'Colleague',
  },
];

const FAQS = [
  {
    q: `What happens after ${TRIAL_DAYS} days?`,
    a: `Your first year is charged at $${FALL_OFFER_PRICE_USD}, then $${FOUNDER_PRICE_USD}/year after that, your founder rate locked in for life. Cancel any time before your trial ends and you pay nothing. You get an email 3 days before.`,
  },
  { q: 'What ages is it for?', a: 'Kids 6 to 14. Every guide has three levels, so a 7-year-old and a 12-year-old can work on the same activity.' },
  { q: 'Do we need to homeschool?', a: 'No. It works after school, on weekends and on holidays, for any family that wants hands-on, real-world learning at home.' },
  { q: 'How much prep is there?', a: 'Very little. Open the guide on any device and follow along together. Most activities use things you already have.' },
  { q: 'Can I get my money back?', a: `Yes. On top of the ${TRIAL_DAYS}-day free trial, you have a 14-day money-back guarantee once you're charged.` },
  {
    q: `Does the $${FALL_OFFER_PRICE_USD} offer work on the monthly plan?`,
    a: `The ${FALL_OFFER.name} is for the yearly plan. Monthly is $${MONTHLY_PRICE_USD}/month with the same ${TRIAL_DAYS}-day free trial.`,
  },
];

function CheckIcon() {
  return (
    <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
        <path d="M5 10.5l3 3 7-7" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrialButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={TRIAL_HREF}
      className={`inline-flex items-center justify-center gap-2.5 rounded-2xl bg-forest px-9 py-[18px] text-lg font-semibold text-cream no-underline shadow-[0_12px_28px_-8px_rgba(88,129,87,0.45)] transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark active:scale-[0.97] ${className}`}
    >
      {children}
      <ArrowIcon />
    </a>
  );
}

function OfferBox({ endsAt }: { endsAt: string }) {
  return (
    <div className={`relative rounded-2xl border border-[#e7d3b0] bg-[#FBF3DC] px-5 pb-5 pt-6 ${PAPER_SHADOW}`}>
      <Tape className="left-8 -rotate-3" />
      <p className="text-[17px] leading-snug text-ink">
        <span className="font-semibold">{FALL_OFFER.name}:</span> your first year for{' '}
        <span className="font-semibold">${FALL_OFFER_PRICE_USD}</span>{' '}
        <s className="text-gray-500">${FOUNDER_PRICE_USD}</s>
      </p>
      <p className="mb-4 mt-1 text-[13.5px] text-gray-600">Ends {FALL_OFFER.endsLabel} at midnight PT</p>
      <Countdown endsAt={endsAt} />
    </div>
  );
}

export default async function FallOfferPage() {
  // Founder-only offer ($20 off $99). If the offer is over or the founder
  // rate has closed, don't advertise it.
  if (!isFallOfferActive() || !(await isFounderPhaseOpen())) redirect('/choose-plan');

  const endsAt = FALL_OFFER.endsAt.toISOString();

  return (
    <div className="min-h-screen overflow-x-clip bg-cream pb-24 text-ink md:pb-0">
      {/* Logo only: no nav, nothing that leads away from the trial. */}
      <header className="mx-auto flex max-w-[1240px] justify-center px-6 pt-6 md:justify-start md:px-16">
        <span className="inline-flex items-center gap-2.5" aria-label="Anywhere Learning">
          <Image src="/logo-icon-transparent.png" alt="" width={36} height={36} className="h-9 w-auto" priority />
          <span className="inline-flex items-baseline gap-1">
            <span className="font-body text-[17px] tracking-wide">anywhere</span>
            <span className="font-display text-[18px] italic leading-none text-forest-dark">learning</span>
          </span>
        </span>
      </header>

      <main>
        {/* ════════ 01 HERO ════════ */}
        <section className="px-6 pb-16 pt-6 md:px-16 md:pb-20 md:pt-12">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div className="text-center lg:order-1 lg:text-left">
              <Eyebrow center className="lg:!inline-flex">
                {FALL_OFFER.name} &middot; Ages 6&ndash;14
              </Eyebrow>
              <h1 className="mb-5 mt-4 font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.02] tracking-tight text-balance">
                Real things. <span className="italic text-forest">Real learning.</span> Right at home.
              </h1>
              <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-[1.62] text-gray-600 text-pretty md:text-xl lg:mx-0">
                120+ step-by-step activities you do together. Plan a party: that&apos;s budgets and fractions. Run a
                stall: that&apos;s pricing and persuasive writing. Real school subjects, inside a real job.
              </p>
              <div className="mx-auto max-w-[460px] lg:mx-0">
                <OfferBox endsAt={endsAt} />
                <TrialButton className="mt-6 w-full">Try it free for {TRIAL_DAYS} days</TrialButton>
                <p className="mt-3 text-center text-[13.5px] text-gray-500 lg:text-left">
                  $0 today &middot; cancel anytime &middot; 14-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Big taped polaroids of real afternoons, each a real guide. */}
            <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 lg:order-2">
              {MOMENTS.map((m, i) => (
                <li
                  key={m.src}
                  className={`relative bg-white p-1.5 pb-2 sm:p-2 sm:pb-3 ${PAPER_SHADOW}`}
                  style={{ transform: `rotate(${m.rot}deg)` }}
                >
                  {i % 2 === 0 && <Tape className="left-1/2 w-14 -translate-x-1/2 -rotate-3 sm:w-16" />}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 260px"
                      className="object-cover"
                      priority={i < 3}
                    />
                  </div>
                  <p className="mt-2 text-center font-display text-[14px] font-semibold leading-tight text-forest-dark sm:text-[16px]">
                    {m.guide}
                  </p>
                  <p className="mt-0.5 text-center text-[12.5px] italic text-gray-500 sm:text-[13px]">{m.skill}</p>
                </li>
              ))}
            </ul>
          </div>

          <ScrollReveal delay={100}>
            <div className="mx-auto mt-14 grid max-w-[900px] grid-cols-3 border-t border-forest-dark/[0.16] pt-9">
              {[
                { n: '120+', l: 'Activities' },
                { n: '9', l: 'Topics' },
                { n: '12', l: 'Skill areas' },
              ].map((s, i) => (
                <div key={s.l} className={`text-center ${i < 2 ? 'border-r border-forest-dark/[0.16]' : ''}`}>
                  <div className="font-display text-[clamp(2rem,4vw,3rem)] leading-none text-forest">{s.n}</div>
                  <div className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 md:text-[13px]">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ════════ 02 WHAT YOU GET ════════ */}
        <section className="px-6 py-20 md:px-16 md:py-24" style={{ background: '#F2EFE4' }}>
          <div className="mx-auto max-w-[1240px]">
            <ScrollReveal>
              <div className="mb-10 max-w-[720px]">
                <Eyebrow>What you get the day you join</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] tracking-tight text-balance">
                  A map, a month, a record.
                </h2>
                <p className="mt-3 text-lg leading-[1.65] text-gray-600">
                  No more deciding what to do. Each kid gets their own trail, you get a plan every month, and every
                  activity you finish adds to what they&apos;ve learned.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InsideMembership
                trialDays={TRIAL_DAYS}
                ctaHref={TRIAL_HREF}
                ctaNote={`${TRIAL_DAYS} days free, then $${FALL_OFFER_PRICE_USD} for your first year.`}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 03 PEEK INSIDE A GUIDE ════════ */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="max-w-[760px]">
                <Eyebrow>Peek inside a guide</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] tracking-tight text-balance">
                  Every step tells you <span className="italic text-forest">who does what.</span>
                </h2>
                <p className="mt-3 text-lg leading-[1.65] text-gray-600">
                  In <strong className="font-semibold text-ink">Invent a New Sport</strong>, your kid creates a brand-new
                  sport in six steps, from the playing field to the rulebook to a family championship. Here&apos;s
                  Step 2, where they design the playing area.
                </p>
              </div>
            </ScrollReveal>

            {/* The six steps, Step 2 highlighted, so the page has context. */}
            <ol className="m-0 mt-8 flex list-none gap-2 overflow-x-auto p-0 pb-2 [scrollbar-width:none] md:grid md:grid-cols-6 md:overflow-visible">
              {SPORT_STEPS.map((s, i) => (
                <li
                  key={s}
                  className={`min-w-[132px] rounded-xl border px-3 py-2.5 text-[13.5px] leading-snug md:min-w-0 ${
                    i === 1
                      ? 'border-forest bg-forest text-cream shadow-[0_10px_22px_-12px_rgba(61,92,59,0.7)]'
                      : 'border-forest-dark/15 bg-white text-gray-600'
                  }`}
                >
                  <span className={`block text-[11px] font-semibold uppercase tracking-[0.14em] ${i === 1 ? 'text-gold-light' : 'text-gold-dark'}`}>
                    Step {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <div className="mt-12 grid items-center gap-12 md:grid-cols-[1fr_1.05fr] md:gap-14">
              <div className="md:order-2">
                <div className="relative mx-auto w-full max-w-[470px]">
                  <div className={`absolute -left-4 top-10 hidden w-[38%] -rotate-[7deg] bg-white p-1.5 sm:block ${PAPER_SHADOW}`}>
                    <div className="relative aspect-[8.5/11] overflow-hidden">
                      <Image
                        src={coverSrc('/products/invent-a-sport.jpg')!}
                        alt="Invent a New Sport guide cover"
                        fill
                        sizes="180px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <div className={`relative ml-auto w-full rotate-[1.5deg] bg-white p-1.5 sm:w-[82%] ${PAPER_SHADOW}`}>
                    <Tape className="left-1/2 -translate-x-1/2 -rotate-2" />
                    <div className="relative aspect-[900/1272] overflow-hidden">
                      <Image
                        src="/images/fall/invent-a-sport-step-2.jpg"
                        alt="Step 2 of Invent a New Sport: design the playing area, with the child's job, the parent's job, prompts to ask and three levels"
                        fill
                        sizes="(max-width: 640px) 90vw, 390px"
                        className="object-cover"
                      />
                      {PEEK_PINS.map((p) => (
                        <span
                          key={p.n}
                          aria-hidden="true"
                          className="absolute -left-1 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#C97B5C] text-[13px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(0,0,0,0.35)] ring-2 ring-white"
                          style={{ top: p.top }}
                        >
                          {p.n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:order-1">
                <ul className="m-0 list-none space-y-5 p-0">
                  {PEEK_PINS.map((p) => (
                    <li key={p.n} className="flex gap-4 text-[16.5px] leading-[1.55] text-gray-700">
                      <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#C97B5C] text-[14px] font-bold text-white">
                        {p.n}
                      </span>
                      <span>
                        <strong className="font-semibold text-ink">{p.title}</strong>, {p.body}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-2xl border border-forest-dark/10 bg-white px-5 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-dark">What this guide builds</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SPORT_SKILLS.map((s) => (
                      <span key={s} className="rounded-full bg-[#eef3ea] px-3 py-1 text-[14px] font-medium text-forest-dark">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ 04 TESTIMONIALS ════════ */}
        <section className="px-6 py-20 md:px-16 md:py-24" style={{ background: '#F2EFE4' }}>
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-10 text-center">
                <Eyebrow center>In their words</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.06] tracking-tight">
                  The people who <span className="italic text-forest">know my work.</span>
                </h2>
              </div>
            </ScrollReveal>
            <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
              {QUOTES.map((q, i) => (
                <li
                  key={q.who}
                  className={`relative bg-[#FBF3DC] px-6 pb-5 pt-7 ${PAPER_SHADOW}`}
                  style={{ transform: `rotate(${[-1.2, 0.9, -0.6][i]}deg)` }}
                >
                  <Tape className="left-1/2 w-16 -translate-x-1/2 -rotate-2" />
                  <p className="m-0 font-display text-[17px] italic leading-[1.5] text-ink">&ldquo;{q.quote}&rdquo;</p>
                  <p className="mb-0 mt-4 text-[13.5px] font-semibold text-forest-dark">
                    {q.who} <span className="font-normal text-gray-500">&middot; {q.role}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ════════ 05 AMELIE ════════ */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24">
          <div className="mx-auto grid max-w-[1000px] grid-cols-1 items-center gap-10 md:grid-cols-[0.8fr_1fr] md:gap-14">
            <figure className={`relative m-0 mx-auto w-full max-w-[380px] -rotate-[1.5deg] bg-white p-3 pb-4 ${PAPER_SHADOW}`}>
              <Tape className="left-10 -rotate-6" />
              <Tape className="right-10 rotate-6" color="rgba(169,193,163,0.85)" />
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="/amelie.jpg" alt="Amelie and her kids on a mountain hike" fill sizes="380px" quality={90} className="object-cover" />
              </div>
              <figcaption className="mt-3 text-center font-display text-[20px] italic text-[#C97B5C]">xo, Amelie</figcaption>
            </figure>
            <ScrollReveal direction="right">
              <div>
                <Eyebrow>Made by a teacher, for parents</Eyebrow>
                <h2 className="mb-5 mt-4 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] tracking-tight">
                  Hi, I&apos;m Amelie.
                </h2>
                <p className="mb-6 text-lg leading-[1.72] text-gray-600">
                  Fifteen years in classrooms, two degrees in education, and two kids of my own. I watched kids get hours
                  of instruction and almost no practice. So I built the thing I wished I&apos;d had: real-world activities,
                  written for you, step by step, so the learning happens while you do it together.
                </p>
                <div className="flex flex-wrap gap-[30px]">
                  {[
                    { n: 'B.Ed · M.Ed', l: 'Education' },
                    { n: '15 yrs', l: 'Classroom teaching' },
                    { n: 'Now', l: 'Homeschooling her own' },
                  ].map((c) => (
                    <div key={c.n}>
                      <div className="text-xl font-semibold text-forest">{c.n}</div>
                      <div className="text-sm text-gray-500">{c.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 06 PRICING ════════ */}
        <section className="px-6 py-20 md:px-16 md:py-24" style={{ background: '#F2EFE4' }} id="pricing">
          <div className="mx-auto max-w-[520px]">
            <ScrollReveal>
              <div className="mb-8 text-center">
                <Eyebrow center>{FALL_OFFER.name}</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.06] tracking-tight">
                  Your first year for <span className="italic text-forest">${FALL_OFFER_PRICE_USD}.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className={`relative rounded-[22px] border-2 border-forest bg-[#fffdf9] p-7 ${PAPER_SHADOW}`}>
              <span className="absolute -top-3.5 left-7 rounded-full bg-[#C97B5C] px-3.5 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white">
                Ends {FALL_OFFER.endsLabelShort}
              </span>
              <p className="mt-1 font-semibold">Yearly membership</p>
              <p className="mt-1 flex items-baseline gap-2.5">
                <s className="text-[22px] text-gray-400">${FOUNDER_PRICE_USD}</s>
                <span className="font-display text-[56px] leading-none tracking-tight text-ink">${FALL_OFFER_PRICE_USD}</span>
                <span className="text-gray-600">first year</span>
              </p>
              <p className="mt-1 text-[14px] text-gray-500">About ${(FALL_OFFER_PRICE_USD / 12).toFixed(2)} a month</p>
              <ul className="m-0 mt-6 list-none space-y-3 p-0 text-[15.5px] text-gray-700">
                {[
                  `${TRIAL_DAYS} days free, $0 today`,
                  `Then $${FALL_OFFER_PRICE_USD} for your first year, $${FOUNDER_PRICE_USD}/year after that, locked in for life`,
                  'Every guide, the map, the monthly plan and the record',
                  '14-day money-back guarantee on top',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <CheckIcon />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <TrialButton className="mt-7 w-full">Start my free trial</TrialButton>
            </div>
            <p className="mt-5 text-center text-[14.5px] text-gray-600">
              Prefer monthly?{' '}
              <a href={MONTHLY_HREF} className="font-semibold text-forest-dark underline underline-offset-2">
                ${MONTHLY_PRICE_USD}/month
              </a>
              , same free trial.
            </p>
          </div>
        </section>

        {/* ════════ 07 FAQ ════════ */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-8">
                <Eyebrow>Questions</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.06] tracking-tight">
                  Before you start
                </h2>
              </div>
            </ScrollReveal>
            <HomeFaqAccordion faqs={FAQS} />
          </div>
        </section>

        {/* ════════ 08 FINAL CTA ════════ */}
        <section className="relative px-6 py-24 md:px-16 md:py-[110px]">
          <div className="absolute inset-0 bg-cover bg-[center_45%]" style={{ backgroundImage: "url('/hero.jpg')" }} aria-hidden="true" />
          <div className="absolute inset-0 bg-forest-dark/[0.84]" aria-hidden="true" />
          <div className="relative mx-auto max-w-[760px] text-center">
            <ScrollReveal>
              <h2 className="mb-5 font-display text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.06] text-cream">
                Your kids are only this age once.
              </h2>
              <p className="mx-auto mb-8 max-w-[560px] text-lg leading-[1.7] text-cream/[0.82]">
                Another year of &ldquo;I should really do more with them,&rdquo; or a Saturday afternoon where your kid
                plans a party, runs a stall, or invents a sport, with you right there.
              </p>
              <div className="mx-auto mb-8 max-w-[300px]">
                <Countdown endsAt={endsAt} tone="dark" />
              </div>
              <a
                href={TRIAL_HREF}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-cream px-11 py-[18px] text-lg font-semibold text-forest-dark no-underline shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.03] hover:bg-white active:scale-[0.97]"
              >
                Try it free for {TRIAL_DAYS} days
                <ArrowIcon />
              </a>
              <p className="mt-[22px] text-[14.5px] text-cream/[0.62]">
                $0 today &middot; then ${FALL_OFFER_PRICE_USD} for your first year &middot; {FALL_OFFER.name} ends{' '}
                {FALL_OFFER.endsLabel}
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-[12.5px] text-gray-500">
        © {new Date().getFullYear()} Anywhere Learning &middot;{' '}
        <a href="/privacy" className="underline">Privacy</a> &middot; <a href="/terms" className="underline">Terms</a>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-dark/10 bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <a href={TRIAL_HREF} className="flex items-center justify-between rounded-xl bg-forest px-4 py-3 text-cream no-underline">
          <span className="font-semibold">Try it free</span>
          <span className="text-[14px]">
            then ${FALL_OFFER_PRICE_USD} first year <s className="opacity-70">${FOUNDER_PRICE_USD}</s>
          </span>
        </a>
      </div>
    </div>
  );
}
