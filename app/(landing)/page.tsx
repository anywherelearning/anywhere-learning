import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ScrollReveal from '@/components/shared/ScrollReveal';
import HeroSaleBadge from '@/components/home/HeroSaleBadge';
import HeroNextStop from '@/components/home/v2/HeroNextStop';
import TrailSteps from '@/components/home/v2/TrailSteps';
import ActivityExplorer from '@/components/home/v2/ActivityExplorer';
import MembershipPlans from '@/components/home/v2/MembershipPlans';
import HomeFaqAccordion from '@/components/home/v2/HomeFaqAccordion';
import { MONTHLY_PLAN_PRICE, MONTHLY_PRICE_USD } from '@/lib/membership';
import { getMembership } from '@/lib/membership-runtime';
import {
  SHOP_CATEGORIES,
  SKILL_AREAS,
  MEMBERSHIP_INCLUDES,
  HOME_FAQS,
} from '@/lib/home-showcase';

export const metadata: Metadata = {
  title: {
    absolute: 'Anywhere Learning | Life Skills Activities for Kids',
  },
  description:
    "A guided membership that hands you your family's next real-world activity, so you just do it together. Life skills school skips: cooking, budgeting, problem-solving. Nothing to plan or print. Ages 6-14.",
  alternates: {
    canonical: 'https://anywherelearning.co',
  },
};

// Same array the accordion renders, so the structured data can never drift
// from what's actually on the page.
const homepageFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

/** Section eyebrow: hairline rule + small caps label. */
function Eyebrow({
  children,
  tone = 'gold',
  center = false,
}: {
  children: React.ReactNode;
  tone?: 'gold' | 'cream';
  center?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] ${
        tone === 'gold' ? 'text-gold-dark' : 'text-gold-light'
      } ${center ? 'justify-center' : ''}`}
    >
      {children}
    </p>
  );
}

function ArrowIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#588157"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-1 flex-shrink-0"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default async function HomePage() {
  // Live founder state (DB-counted), so the founder framing and price close
  // themselves at the cap without a code change.
  const m = await getMembership();
  // The ticker runs the taxonomy, not activity titles: the 9 shop categories
  // followed by the 12 Skills Map areas. Exact duplicates between the two lists
  // (Real-World Math, Creativity & Making, AI & Digital) are dropped so the
  // strip doesn't visibly repeat itself.
  const ticker = [...new Set([...SHOP_CATEGORIES, ...SKILL_AREAS])].join('  ·  ');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-2 focus-visible:top-2 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-forest focus-visible:px-4 focus-visible:py-2 focus-visible:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">

        {/* ════════ 01 HERO ════════ */}
        <section className="relative overflow-hidden bg-cream">
          {/* The member trail map, faded back into the cream, so the hero shows
              the actual product world behind the card rather than a stock photo.
              Section-level (not grid-cell) so there's no seam where the row ends.

              app-trail.svg is generated from the real scene in
              components/account/AdventureMapHome.tsx (Highland Peaks region:
              same geometry, palette and TREES coordinates), minus the chrome and
              the activity card. It is a copy, not a live import, so if that
              scene changes the SVG has to be regenerated to match. */}
          {/* Mobile: a band across the bottom, behind the card, where the hero
              copy has already ended. A fixed 340px keeps the crop close to the
              illustration's own 8:5 ratio; stretching it full-height zoomed a
              1600-wide scene into an unreadable slice on a 375px screen. The
              veil never drops below 0.42 here because the caption sits on top
              of it. */}
          <div
            className="absolute inset-x-0 bottom-0 z-0 h-[340px] bg-cover bg-center opacity-[0.8] lg:hidden"
            style={{ backgroundImage: "url('/product-shots/app-trail.svg')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 z-[1] h-[340px] lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, #faf9f6 0%, rgba(250,249,246,0.8) 22%, rgba(250,249,246,0.58) 48%, rgba(250,249,246,0.46) 75%, rgba(250,249,246,0.42) 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 z-0 hidden w-[56%] bg-[#e8eee4] bg-cover bg-[left_center] opacity-[0.85] lg:block"
            style={{ backgroundImage: "url('/product-shots/app-trail.svg')" }}
            aria-hidden="true"
          />
          {/* Cream veil over the map: one long horizontal ramp, seven stops, so
              the illustration dissolves into the cream with no visible edge.

              Strictly horizontal on purpose. A vertical mask makes the explorers
              pop, but it also thins the veil at the bottom-left, and the veil is
              what hides this layer's own left edge — so the map ends in a hard
              vertical line down the lower half. Keeping the ramp uniform costs
              some contrast on the explorers and is the right trade. */}
          <div
            className="absolute inset-y-0 right-0 z-[1] hidden w-[56%] lg:block"
            style={{
              background:
                'linear-gradient(90deg, #faf9f6 0%, rgba(250,249,246,0.9) 4%, rgba(250,249,246,0.62) 11%, rgba(250,249,246,0.42) 19%, rgba(250,249,246,0.28) 30%, rgba(250,249,246,0.2) 45%, rgba(250,249,246,0.16) 70%, rgba(250,249,246,0.14) 100%)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-[2] mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-[1.02fr_1fr] lg:gap-0 lg:px-16 lg:py-20">
            <div className="relative z-[2] max-w-[620px]">
              <HeroSaleBadge />
              <div data-reveal>
                <Eyebrow>Real-world activities &middot; Ages 6&ndash;14</Eyebrow>
              </div>
              <h1 className="mb-[26px] mt-6 font-display text-[clamp(2.5rem,4.9vw,4rem)] leading-[1.0] tracking-[-0.015em] text-forest-dark">
                Your kid is smart.
                <br />
                But can they handle{' '}
                <span className="relative inline-block text-[1.05em] text-[#c4674a]">
                  real life
                  <span className="absolute -left-[2%] -right-[2%] bottom-[0.04em] -z-10 h-[0.13em] rounded-full bg-gold opacity-80" />
                </span>
                ?
              </h1>
              <p className="mb-9 max-w-[500px] text-[17px] leading-[1.62] text-gray-600 text-pretty md:text-xl">
                We hand you the next real-world activity, matched to your kids. Do one every other
                day, once a week, twice a week, whenever it suits you. Cooking, budgeting,
                problem-solving, the life skills school skips. You just do it together.
              </p>
              <div className="mb-5 flex flex-wrap items-center gap-x-[22px] gap-y-4">
                <Link
                  href="/start-trial"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-forest px-9 py-[18px] text-lg font-semibold text-cream shadow-[0_12px_28px_-8px_rgba(88,129,87,0.4)] transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark active:scale-[0.97]"
                >
                  Start free trial
                  <ArrowIcon />
                </Link>
                <span className="text-[15px] leading-[1.5] text-gray-500">
                  14 days free &middot; $0 today
                  <br />
                  {m.priceYr}
                  {m.isFounderPhase ? ' founder rate' : ''}
                </span>
              </div>
              <Link
                href="/quiz"
                className="inline-block border-b border-forest/30 pb-0.5 text-[15px] font-medium text-forest transition-colors hover:border-forest hover:text-forest-dark"
              >
                Not sure where your kid is? Take the 2-min quiz &rarr;
              </Link>
            </div>

            {/* The playable next-stop card, floating over the photo wash. */}
            <div className="relative lg:h-[640px]">
              {/* A hair above dead centre. Centred, the card's bottom edge and
                  the lead explorer's head clear each other by 1px, which any
                  change to the card's height would close. */}
              <div className="flex justify-center lg:absolute lg:right-0 lg:top-1/2 lg:translate-y-[calc(-50%-12px)]">
                <HeroNextStop />
              </div>
            </div>
          </div>
        </section>

        {/* ════════ 02 MARQUEE ════════ */}
        <div className="relative overflow-hidden bg-forest-dark py-[18px]" aria-hidden="true">
          <div className="flex w-max animate-marquee">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="whitespace-nowrap pr-[34px] text-[15px] font-medium text-cream/[0.72]"
              >
                {ticker}
                {'  ·  '}
              </div>
            ))}
          </div>
        </div>

        {/* ════════ 03 WHY + STATS ════════ */}
        <section
          className="bg-forest-dark px-6 py-20 md:px-16 md:py-24"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 60% at 12% 0%, rgba(88,129,87,0.55), transparent), radial-gradient(ellipse 60% 55% at 92% 100%, rgba(212,163,115,0.18), transparent)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <Eyebrow tone="cream">Why this exists</Eyebrow>
              {/* No max-w on either: the cards below run the full container
                  width, so a short measure up here leaves a ragged gap. */}
              <h2 className="mb-[22px] mt-[22px] font-display text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.04] text-cream">
                200 Pinterest boards saved. Still no plan for Monday.
              </h2>
              <p className="mb-14 text-[19px] leading-[1.7] text-cream/[0.78] text-pretty">
                It&apos;s not a curriculum and it isn&apos;t a shelf of files to manage. It&apos;s
                one thing to do together, already picked, already matched to your kids.
              </p>
            </ScrollReveal>

            <div className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  t: 'Nothing to plan',
                  b: 'No lesson plans, no grading, no prep that takes longer than the activity.',
                },
                {
                  t: 'Nothing to print',
                  b: "Open it on your phone, grab whatever's already in the kitchen drawer.",
                },
                {
                  t: 'Nothing at a table',
                  b: 'Nothing here is timed or graded. Kids learn standing up, outside, with their hands.',
                },
              ].map((c, i) => (
                <ScrollReveal key={c.t} delay={i * 100} className="h-full">
                  {/* Warm paper panels rather than a tint of the green behind
                      them: at cream/0.07 they barely separated from the
                      background. Echoes the aged-paper panels in the member
                      world, so the two surfaces read as one product. */}
                  <div className="h-full rounded-[20px] border border-[#e3dcc9] bg-[#f5f0e5] px-7 py-[30px] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-16px_rgba(0,0,0,0.5)]">
                    <div className="mb-2.5 text-xl font-semibold text-forest-dark">{c.t}</div>
                    <div className="text-[15.5px] leading-[1.65] text-[#6b675e]">{c.b}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={150}>
              <div className="grid grid-cols-3 border-t border-cream/[0.14] pt-11">
                {[
                  { n: '120+', l: 'Activities' },
                  { n: '9', l: 'Topics' },
                  { n: '12', l: 'Skill areas' },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className={`text-center ${i < 2 ? 'border-r border-cream/[0.14]' : ''}`}
                  >
                    <div className="font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-gold-light">
                      {s.n}
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/60 md:text-[13px]">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 04 HOW IT WORKS ════════ */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24" id="how-it-works">
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-[60px] text-center">
                <Eyebrow center>Inside the membership</Eyebrow>
                <h2 className="mb-3.5 mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] text-forest-dark">
                  It&apos;s a trail, not a to-do list.
                </h2>
                <p className="mx-auto max-w-[560px] text-lg leading-[1.65] text-gray-600">
                  We hand you the next stop, you do it together, and your kids climb the trail as
                  you go.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <TrailSteps />
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 05 WHAT'S INSIDE ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{
            background:
              'linear-gradient(168deg, rgba(232,201,154,0.14) 0%, rgba(212,163,115,0.22) 50%, rgba(232,201,154,0.14) 100%)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-9">
                <Eyebrow>What&apos;s inside</Eyebrow>
                {/* Eyebrow above the row so the link can sit on the headline's
                    own line, top-aligned, rather than dropping to the baseline
                    of the paragraph. */}
                {/* Grid only from md up. In DOM order the link comes last, so on
                    a phone it follows the description instead of wedging between
                    the headline and its own copy; on desktop the grid lifts it
                    back up to sit beside the headline. */}
                <div className="mt-4 md:grid md:grid-cols-[1fr_auto] md:items-start md:gap-x-10">
                  <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.7rem)] leading-[1.06] text-forest-dark md:col-start-1 md:row-start-1">
                    120+ activities. Every topic.
                  </h2>
                  <p className="mt-3 text-lg leading-[1.65] text-gray-600 md:col-start-1 md:row-start-2">
                    Nine topics, twelve skill areas, and three levels in every guide, so a
                    first-grader and a middle-schooler work on the same thing at the same table.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block whitespace-nowrap text-base font-semibold text-forest transition-colors hover:text-forest-dark md:col-start-2 md:row-start-1 md:mt-2"
                  >
                    Browse all activities &rarr;
                  </Link>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <ActivityExplorer />
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 06 THIS MONTH ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{
            background:
              'linear-gradient(168deg, rgba(88,129,87,0.05) 0%, rgba(88,129,87,0.16) 50%, rgba(88,129,87,0.05) 100%)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            {/* Eyebrow sits above the grid so the grid's first row starts at the
                headline. That is what lets the picture's top edge line up with
                the title rather than with the small caps label. */}
            <ScrollReveal>
              <div className="mb-[18px]">
                <Eyebrow>This month at Anywhere Learning</Eyebrow>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[1fr_1.02fr] lg:gap-14">
              {/* Copy column: headline, intro, then the cards and the support
                  list side by side. */}
              <div>
                <ScrollReveal>
                  <div className="mb-7">
                    <h2 className="mb-4 font-display text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.06] text-forest-dark">
                      Something new waiting every month.
                    </h2>
                    <p className="text-lg leading-[1.7] text-gray-600">
                      Three things land each month, on a new subject every time, with everything
                      you need gathered around them.
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_0.66fr]">
                  <ScrollReveal delay={80}>
                    <div className="flex flex-col gap-3">
                      {[
                        {
                          k: 'Skill of the month',
                          b: 'One theme worth a month. Screens now, money next, speaking up after that.',
                        },
                        {
                          k: 'Seasonal pick',
                          b: 'A multi-day set for where the year actually is.',
                        },
                        {
                          k: 'Family challenge',
                          b: 'One small thing the whole house does together.',
                        },
                      ].map((c) => (
                        <div
                          key={c.k}
                          className="rounded-[16px] border border-gray-200/60 bg-white px-5 py-[15px] shadow-[0_1px_3px_0_rgba(60,50,30,0.08)] transition-all duration-300 hover:translate-x-1 hover:shadow-[0_12px_28px_-8px_rgba(88,129,87,0.14)]"
                        >
                          <div className="mb-1 font-display text-[19px] leading-tight text-forest-dark">
                            {c.k}
                          </div>
                          <div className="text-[14.5px] leading-[1.5] text-gray-500">{c.b}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollReveal>

                  {/* Beside the cards, not under them, and deliberately not a
                      card: a plain vertical list reads as supporting material
                      instead of competing with the three headline items. */}
                  <ScrollReveal delay={200} className="self-start">
                    <div>
                      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-dark">
                        Gathered around them
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 sm:grid-cols-1 sm:divide-y sm:divide-gray-300/40">
                        {[
                          'A read for you',
                          'Books by age',
                          'Read together',
                          'Blog deep-dive',
                          'Videos & podcasts',
                          'Games & apps',
                          'More activities',
                          'Set-up tips',
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 py-[5px] text-[13.5px] text-gray-500 sm:gap-2.5 sm:py-[7px] sm:text-[14.5px]"
                          >
                            <span
                              className="h-1 w-1 flex-shrink-0 rounded-full bg-gold"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                </div>
              </div>

              {/* Picture column. h-full so it stretches to the copy column,
                  putting its top edge on the headline and its bottom edge on the
                  last card. `contain` keeps the month view uncropped. */}
              <ScrollReveal direction="right" delay={140} className="relative flex h-full flex-col">
                <div
                  role="img"
                  aria-label="A month inside the membership: skill of the month, what to read together, and tools to try"
                  className="w-full flex-1 rounded-[20px] border border-gray-200/80 bg-[#f7f5f0] bg-contain bg-center bg-no-repeat shadow-[0_24px_48px_-12px_rgba(60,50,30,0.18)]"
                  style={{ backgroundImage: "url('/product-shots/app-month-full.webp')" }}
                />
                {/* Absolute so the caption doesn't eat into the stretched
                    height, which would leave the picture short of the cards. */}
                <p className="absolute left-0 right-0 top-full mt-3 text-center text-sm text-gray-500">
                  One month, as an example.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════ 07 THE RECORD ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{
            background: 'linear-gradient(168deg, #faf9f6 0%, #f5f0e8 50%, #faf9f6 100%)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
              <ScrollReveal>
                <div>
                  <Eyebrow>The Record</Eyebrow>
                  <h2 className="mb-[18px] mt-[18px] font-display text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.06] text-forest-dark">
                    Everything you did, written down for you.
                  </h2>
                  <p className="mb-7 text-lg leading-[1.7] text-gray-600 text-pretty">
                    Every activity you mark reached lands in a printable home education record.
                    Activities completed, days and hours estimated, coverage across all twelve
                    skill areas, and a dated log of the work. You never have to write it up.
                  </p>
                  <div className="flex flex-col gap-[13px]">
                    {[
                      'One record per child, generated the moment you need it',
                      'Add a photo of their work to any entry',
                      'Print it for your portfolio or keep it on the shelf',
                    ].map((line) => (
                      <div
                        key={line}
                        className="flex items-start gap-[11px] text-base leading-[1.6] text-gray-600"
                      >
                        <CheckIcon />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={100}>
                <div className="-rotate-[1.2deg]">
                  <div
                    role="img"
                    aria-label="A child's learning record, showing coverage by skill area and a dated log of activities"
                    className="h-[420px] rounded-2xl border border-gray-200/90 bg-[#f7f5f0] bg-cover bg-[top_center] shadow-[0_28px_60px_-14px_rgba(60,50,30,0.24)] md:h-[560px]"
                    style={{ backgroundImage: "url('/product-shots/app-record.webp')" }}
                  />
                </div>
              </ScrollReveal>
            </div>

          </div>
        </section>

        {/* ════════ 08 AMELIE ════════ */}
        {/* Contained rather than full-bleed: edge-to-edge the photo ran past
            the content column every other section sits in. */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24">
          <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-14">
            <div className="relative min-h-[340px] overflow-hidden rounded-[20px] lg:min-h-[520px]">
              <Image
                src="/amelie.jpg"
                alt="Amelie and her kids on a mountain hike"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                quality={90}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
            <ScrollReveal direction="right">
              <div>
                <Eyebrow>Made by a teacher, for parents</Eyebrow>
                <h2 className="mb-[22px] mt-[18px] font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] text-forest-dark">
                  Hi, I&apos;m Amelie.
                </h2>
                <p className="mb-4 text-lg leading-[1.72] text-gray-600 text-pretty">
                  Fifteen years in classrooms, two degrees in education, a boy and a girl of my
                  own. Last year I left teaching to homeschool them. Partly because I missed them,
                  mostly because I wanted to be the one helping them get ready for the life
                  they&apos;re actually going to live.
                </p>
                <p className="mb-7 text-lg leading-[1.72] text-gray-600">
                  Anywhere Learning is what I wish I&apos;d had.
                </p>
                <div className="mb-[26px] flex flex-wrap gap-[30px]">
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
                <Link
                  href="/about"
                  className="text-base font-semibold text-forest transition-colors hover:text-forest-dark"
                >
                  Read my full story &rarr;
                </Link>
              </div>
            </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════ 09 TESTIMONIALS ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{
            background:
              'linear-gradient(168deg, rgba(88,129,87,0.02) 0%, rgba(88,129,87,0.09) 50%, rgba(88,129,87,0.02) 100%)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-12 text-center">
                <Eyebrow center>Parents talking</Eyebrow>
                <h2 className="mb-3 mt-4 font-display text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.06] text-forest-dark">
                  Families already doing this.
                </h2>
                <p className="mx-auto max-w-[520px] text-[17px] text-gray-500">
                  We asked parents to tell us about their kid, not the product.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  quote:
                    "Honestly thought they'd hate it. We picked a recipe together, she had the list and bossed me around the aisles, then all three of us were in the kitchen fighting over the measuring cups. It was messy but we laughed a lot.",
                  initials: 'ML',
                  bg: '#588157',
                  who: 'Marie-Eve · Alberta · Girl 8, boy 12',
                },
                {
                  quote:
                    'My boys and I planned a whole day out together with a real budget. They argued about the arcade versus mini golf for a solid twenty minutes. I just kept asking questions, they kept solving them. We ended up squeezing in both.',
                  initials: 'DL',
                  bg: '#c4836a',
                  who: 'Diana · Texas · Boy 10, boy 13',
                },
              ].map((t, i) => (
                <ScrollReveal key={t.initials} delay={i * 100} className="h-full">
                  <figure className="h-full rounded-[20px] border border-gray-200/50 bg-white px-9 py-[34px] shadow-[0_1px_3px_0_rgba(60,50,30,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-14px_rgba(88,129,87,0.18)]">
                    <div
                      className="mb-[18px] text-[17px] tracking-[3px] text-gold"
                      aria-label="5 out of 5 stars"
                    >
                      ★★★★★
                    </div>
                    <blockquote className="mb-6 text-[17.5px] leading-[1.7] text-gray-900 text-pretty">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <span
                        className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full text-[13px] font-semibold text-white"
                        style={{ background: t.bg }}
                        aria-hidden="true"
                      >
                        {t.initials}
                      </span>
                      <span className="text-[14.5px] text-gray-500">{t.who}</span>
                    </figcaption>
                  </figure>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ 10 MEMBERSHIP + FAQ ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          id="membership"
          style={{
            background:
              'linear-gradient(168deg, rgba(232,201,154,0.22) 0%, rgba(212,163,115,0.13) 45%, rgba(250,249,246,0.96) 100%)',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-10 text-center">
                <Eyebrow center>The membership</Eyebrow>
                <h2 className="mb-3.5 mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] text-forest-dark">
                  One price. All of it.
                </h2>
                <p className="mx-auto max-w-[520px] text-lg leading-[1.65] text-gray-600">
                  No bundles to pick between, no upsells. Start with 14 days free, you&apos;re not
                  charged until they&apos;re up.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <MembershipPlans
                priceYear={m.price}
                priceMonthly={m.priceMonthly}
                monthlyPrice={MONTHLY_PLAN_PRICE}
                monthlyPriceUSD={MONTHLY_PRICE_USD}
                yearlyPriceUSD={m.priceUSD}
                isFounderPhase={m.isFounderPhase}
                founderCap={m.founderCap}
              />
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="mb-10 rounded-[24px] border border-gray-200/60 bg-white px-11 py-10 shadow-[0_4px_12px_-2px_rgba(60,50,30,0.09)] max-md:px-6">
                <Eyebrow>Everything in the membership</Eyebrow>
                <div className="mt-6 grid grid-cols-1 gap-x-11 gap-y-[15px] md:grid-cols-2">
                  {MEMBERSHIP_INCLUDES.map((inc) => (
                    <div
                      key={inc}
                      className="flex items-start gap-[11px] text-base leading-[1.6] text-gray-600"
                    >
                      <CheckIcon />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mb-20 flex flex-wrap justify-center gap-x-7 gap-y-3 text-[15.5px] text-gray-600">
                <span>14-day free trial</span>
                <span className="text-gray-300">·</span>
                <span>$0 charged today</span>
                <span className="text-gray-300">·</span>
                <span>14-day money-back guarantee after that</span>
                <span className="text-gray-300">·</span>
                <span>Cancel in one click</span>
              </div>
            </ScrollReveal>

            <div className="mx-auto max-w-[1100px]">
              <ScrollReveal>
                <h2 className="mb-7 text-center font-display text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.08] text-forest-dark">
                  You might be wondering&hellip;
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <HomeFaqAccordion />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════ 11 FINAL CTA ════════ */}
        <section className="relative px-6 py-24 md:px-16 md:py-[120px]">
          <div
            className="absolute inset-0 bg-cover bg-[center_45%]"
            style={{ backgroundImage: "url('/hero.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-forest-dark/[0.82]" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1100px] text-center">
            <ScrollReveal>
              <h2 className="mb-5 font-display text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.06] text-cream">
                Your kids are only this age once.
              </h2>
              <p className="mx-auto mb-9 max-w-[560px] text-lg leading-[1.7] text-cream/[0.82]">
                Another year of &ldquo;I should really do more with them,&rdquo; or a Saturday
                afternoon where your kid builds a budget, plans a road trip, or starts a business
                from the kitchen table.
              </p>
              <Link
                href="/start-trial"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-cream px-11 py-[18px] text-lg font-semibold text-forest-dark shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.03] hover:bg-white active:scale-[0.97]"
              >
                Start free trial
                <ArrowIcon />
              </Link>
              <p className="mt-[22px] text-[14.5px] text-cream/[0.62]">
                14 days free &middot; $0 today &middot; cancel anytime
                {m.isFounderPhase ? ` · Founder rate for the first ${m.founderCap} families` : ''}
              </p>
              <p className="mt-[30px]">
                <Link
                  href="/free-guide"
                  className="text-[15px] text-gold-light/[0.92] underline-offset-4 transition-colors hover:text-gold-light hover:underline"
                >
                  Rather start free? Get the 7-day guide by email &rarr;
                </Link>
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
