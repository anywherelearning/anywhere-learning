import type { Metadata } from 'next';
import Image from 'next/image';
import ScrollReveal from '@/components/shared/ScrollReveal';
import Eyebrow from '@/components/shared/PageEyebrow';
import { Tape, PAPER_SHADOW } from '@/components/shared/Paper';
import InsideMembership from '@/components/home/v2/InsideMembership';
import HomeFaqAccordion from '@/components/home/v2/HomeFaqAccordion';
import { coverSrc } from '@/lib/cover';
import { getMembership } from '@/lib/membership-runtime';
import { FOUNDER_RATE_CLOSES_LABEL } from '@/lib/black-friday';
import { MONTHLY_PRICE_USD, POST_FOUNDER_PRICE_USD, TRIAL_DAYS } from '@/lib/membership';

/**
 * /try: the evergreen landing page for cold membership-trial ads at the
 * regular price (no promo). Same skeleton as /fall, the page behind the only
 * profitable trial campaign so far: taped polaroids, the map/month/record
 * tour, a peek inside a guide, testimonials, Amelie, pricing, FAQ. Logo only,
 * no nav, nothing that leads away. Not indexed, not in the sitemap.
 *
 * Why it exists (Nov 2026): GA4 showed cold Facebook visitors dropped onto
 * the bare /choose-plan price table leave in seconds. Ads now land here, and
 * /choose-plan forwards `?source=meta-*` traffic to this page.
 *
 * No countdown: the only deadline shown is the real one, the founder rate
 * closing to new members. After that the page shows the standard price.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Try Anywhere Learning free for 7 days' },
  description:
    'Real-world activities for kids 6 to 14, step by step, made to do together. 7 days free, $0 today.',
  robots: { index: false, follow: false },
};

const TRIAL_HREF = '/start-trial?plan=annual';
const MONTHLY_HREF = '/start-trial?plan=monthly';

// Real afternoons, each one a guide in the library, labelled with the guide
// and the school subject hiding inside it. Each photo is the one on that
// guide's cover (guides/assets/[slug].jpg) so the page and the covers match.
const MOMENTS: { src: string; guide: string; skill: string; alt: string; rot: number }[] = [
  { src: '/images/fall/party-planner-math-cover.jpg', guide: 'Party Planner Math', skill: 'budgets + fractions', alt: 'Kids at a table set for the Italian night they planned', rot: -3 },
  { src: '/images/fall/market-stall.jpg', guide: 'Market Stall Pitch', skill: 'pricing + persuasive writing', alt: 'A girl at her popcorn stand with a $2 sign she made', rot: 2 },
  { src: '/images/fall/community-service-business.jpg', guide: 'Marketing Campaign Creator', skill: 'persuasive writing + counting', alt: 'A boy at a table with the banner he made for his babysitting app', rot: -1.5 },
  { src: '/images/fall/grow-it-eat-it.jpg', guide: 'Grow It, Eat It', skill: 'biology', alt: 'A girl planting tomatoes in pots on the deck', rot: 2.5 },
  { src: '/images/fall/garden-plot-planner-cover.jpg', guide: 'Garden Plot Planner', skill: 'measuring + area', alt: 'A girl, her dad and her brother measuring the garden box they built', rot: -2 },
  { src: '/images/fall/kitchen-math-v2.jpg', guide: 'Kitchen Math & Meal Planning', skill: 'servings + package prices', alt: 'A girl in a store aisle reading her own shopping list', rot: 1.5 },
];

// Invent a New Sport, word for word from the guide.
const SPORT_STEPS = [
  'Pick the type and the win',
  'Mark out the field',
  'Write the rules and the scoring',
  'Make the equipment',
  'Playtest, fix and play the championship',
];
const SPORT_SKILLS = ['Fair thinking', 'Design thinking', 'Clear explaining', 'Sportsmanship'];

const PEEK_PINS: { n: number; top: string; title: string; body: string }[] = [
  { n: 1, top: '34.3%', title: "Your kid's job", body: 'the part they own, so they do the thinking.' },
  { n: 2, top: '45.9%', title: 'Your job', body: 'so you always know which part to hand over.' },
  { n: 3, top: '57.1%', title: 'Questions to ask', body: 'so you guide with a question instead of the answer.' },
  { n: 4, top: '80.7%', title: 'Three levels', body: 'pick the one that fits each kid, from 6 to 14.' },
];

// Word-for-word excerpts. Victoria: member, website consent Nov 2 2026,
// first name only, never her kids' names.
const QUOTES: { quote: string; who: string; role: string }[] = [
  {
    quote: 'Everything we have done so far has kept them so engaged and they have had so much fun.',
    who: 'Victoria',
    role: 'Member, UK',
  },
  {
    quote: 'She gave them real-world projects that had them thinking, building, presenting, and collaborating with enthusiasm.',
    who: 'Wendy',
    role: 'Parent',
  },
  {
    quote: "She helps shift the mindset from 'I need educational experts and structured programs to teach my child' to 'I already have what it takes to support my child's learning.'",
    who: 'Claudia, M.Sc.',
    role: 'Certified parenting coach',
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

export default async function TryPage() {
  const m = await getMembership();
  const founder = m.isFounderPhase;

  const faqs = [
    {
      q: `What happens after ${TRIAL_DAYS} days?`,
      a: founder
        ? `Your membership starts at ${m.priceYear}, your founder rate locked in for life. Cancel any time before your trial ends and you pay nothing. You get an email before you're charged.`
        : `Your membership starts at ${m.priceYear}. Cancel any time before your trial ends and you pay nothing. You get an email before you're charged.`,
    },
    ...(founder
      ? [
          {
            q: `Will the ${m.price} price go up?`,
            a: `Not for you. The founder rate closes to new members on ${FOUNDER_RATE_CLOSES_LABEL}, and yearly becomes $${POST_FOUNDER_PRICE_USD} after that. Join before then and your renewal stays ${m.priceYear} for life.`,
          },
        ]
      : []),
    { q: 'What ages is it for?', a: 'Kids 6 to 14. Every guide has three levels, so a 7-year-old and a 12-year-old can work on the same activity.' },
    { q: 'Do we need to homeschool?', a: 'No. It works after school, on weekends and on holidays, for any family that wants hands-on, real-world learning at home.' },
    { q: 'How much prep is there?', a: 'Very little. Open the guide on your phone, tablet or computer and follow it step by step together. Most activities use things you already have.' },
    { q: 'What if my kid can’t sit still for worksheets?', a: 'There are no worksheets. Kids plan, build, measure, sell and present, so they are moving and doing, and each guide has three levels you can pick from as you go.' },
    { q: 'Can I get my money back?', a: `Yes. On top of the ${TRIAL_DAYS}-day free trial, you have a 14-day money-back guarantee once you're charged.` },
    { q: 'Is there a monthly plan?', a: `Yes, $${MONTHLY_PRICE_USD}/month with the same ${TRIAL_DAYS}-day free trial. Yearly works out cheaper.` },
  ];

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
                {TRIAL_DAYS} days free &middot; Ages 6&ndash;14
              </Eyebrow>
              <h1 className="mb-5 mt-4 font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.02] tracking-tight text-balance">
                Real things. <span className="italic text-forest">Real learning.</span> Right at home.
              </h1>
              <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-[1.62] text-gray-600 text-pretty md:text-xl lg:mx-0">
                120+ step-by-step activities you do together. Plan a party: that&apos;s budgets and fractions. Run a
                stall: that&apos;s pricing and persuasive writing. Real school subjects, inside a real job.
              </p>
              <div className="mx-auto max-w-[460px] lg:mx-0">
                <div className={`relative rounded-2xl border border-[#e7d3b0] bg-[#FBF3DC] px-5 pb-5 pt-6 text-left ${PAPER_SHADOW}`}>
                  <Tape className="left-8 -rotate-3" />
                  <p className="text-[17px] leading-snug text-ink">
                    <span className="font-semibold">{TRIAL_DAYS} days free</span>, then{' '}
                    <span className="font-semibold">{m.priceYear}</span>
                    <span className="text-gray-600"> (about {m.priceMonthly} a month)</span>
                  </p>
                  {founder && (
                    <p className="mt-1 text-[14.5px] leading-snug text-gray-700">
                      Founder rate, locked in for life. After {FOUNDER_RATE_CLOSES_LABEL}, new members pay $
                      {POST_FOUNDER_PRICE_USD}.
                    </p>
                  )}
                </div>
                <TrialButton className="mt-6 w-full">Try it free for {TRIAL_DAYS} days</TrialButton>
                <p className="mt-3 text-center text-[13.5px] text-gray-500 lg:text-left">
                  $0 today &middot; cancel anytime &middot; 14-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Big taped polaroids of real afternoons, each a real guide. */}
            <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 lg:order-2">
              {MOMENTS.map((mo, i) => (
                <li
                  key={mo.src}
                  className={`relative bg-white p-1.5 pb-2 sm:p-2 sm:pb-3 ${PAPER_SHADOW}`}
                  style={{ transform: `rotate(${mo.rot}deg)` }}
                >
                  {i % 2 === 0 && <Tape className="left-1/2 w-14 -translate-x-1/2 -rotate-3 sm:w-16" />}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={mo.src}
                      alt={mo.alt}
                      fill
                      sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 260px"
                      className="object-cover"
                      priority={i < 3}
                    />
                  </div>
                  <p className="mt-2 text-center font-display text-[14px] font-semibold leading-tight text-forest-dark sm:text-[16px]">
                    {mo.guide}
                  </p>
                  <p className="mt-0.5 text-center text-[12.5px] italic text-gray-500 sm:text-[13px]">{mo.skill}</p>
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
                ctaNote={`${TRIAL_DAYS} days free, then ${m.priceYear}.`}
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
                  sport in five steps, from the playing field to the rulebook to a family championship. Here&apos;s
                  Step 2, where they mark out the field.
                </p>
              </div>
            </ScrollReveal>

            <ol className="m-0 mt-8 flex list-none gap-2 overflow-x-auto p-0 pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible">
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
                    <div className="relative aspect-[900/1165] overflow-hidden">
                      <Image
                        src="/images/fall/invent-a-sport-step-2-v2.jpg"
                        alt="Step 2 of Invent a New Sport: mark out the field, with what your kid does, what you do, questions to ask and three levels"
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
                  What families <span className="italic text-forest">are saying.</span>
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
                <Image src="/images/fall/amelie-portrait.jpg" alt="Amelie and her kids on a mountain hike" fill sizes="(max-width: 768px) 90vw, 380px" quality={90} className="object-cover" />
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
                <Eyebrow center>Start with {TRIAL_DAYS} days free</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.06] tracking-tight">
                  Everything, for <span className="italic text-forest">{m.price} a year.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className={`relative rounded-[22px] border-2 border-forest bg-[#fffdf9] p-7 ${PAPER_SHADOW}`}>
              {founder && (
                <span className="absolute -top-3.5 left-7 rounded-full bg-[#C97B5C] px-3.5 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white">
                  Founder rate until {FOUNDER_RATE_CLOSES_LABEL}
                </span>
              )}
              <p className="mt-1 font-semibold">Yearly membership</p>
              <p className="mt-1 flex items-baseline gap-2.5">
                <span className="font-display text-[56px] leading-none tracking-tight text-ink">{m.price}</span>
                <span className="text-gray-600">a year</span>
              </p>
              <p className="mt-1 text-[14px] text-gray-500">About {m.priceMonthly} a month</p>
              <ul className="m-0 mt-6 list-none space-y-3 p-0 text-[15.5px] text-gray-700">
                {[
                  `${TRIAL_DAYS} days free, $0 today`,
                  founder
                    ? `Then ${m.priceYear}, locked in for life (new members pay $${POST_FOUNDER_PRICE_USD} after ${FOUNDER_RATE_CLOSES_LABEL})`
                    : `Then ${m.priceYear}`,
                  'Every guide, the map, the monthly plan and the record',
                  'Basecamp: a live session with me every month',
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
            <HomeFaqAccordion faqs={faqs} />
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
              <a
                href={TRIAL_HREF}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-cream px-11 py-[18px] text-lg font-semibold text-forest-dark no-underline shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.03] hover:bg-white active:scale-[0.97]"
              >
                Try it free for {TRIAL_DAYS} days
                <ArrowIcon />
              </a>
              <p className="mt-[22px] text-[14.5px] text-cream/[0.62]">
                $0 today &middot; then {m.priceYear} &middot; cancel anytime
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
          <span className="text-[14px]">$0 today, then {m.priceYear}</span>
        </a>
      </div>
    </div>
  );
}
