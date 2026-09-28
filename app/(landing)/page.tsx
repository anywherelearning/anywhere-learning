import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ScrollReveal from '@/components/shared/ScrollReveal';
import Eyebrow from '@/components/shared/PageEyebrow';
import { Tape, Magnet, PAPER_SHADOW } from '@/components/shared/Paper';
import HeroSaleBadge from '@/components/home/HeroSaleBadge';
import ChallengeHeroSticker from '@/components/home/ChallengeHeroSticker';
import HeroNextStop from '@/components/home/v2/HeroNextStop';
import InsideMembership from '@/components/home/v2/InsideMembership';
import ActivityExplorer from '@/components/home/v2/ActivityExplorer';
import MembershipPlans from '@/components/home/v2/MembershipPlans';
import HomeFaqAccordion from '@/components/home/v2/HomeFaqAccordion';
import { MONTHLY_PLAN_PRICE, MONTHLY_PRICE_USD, TRIAL_DAYS } from '@/lib/membership';
import { getMembership } from '@/lib/membership-runtime';
import { CHALLENGE, CHALLENGE_DAYS } from '@/lib/challenge';
import { isCoursePageVisible } from '@/lib/course';
import {
  SHOP_CATEGORIES,
  SKILL_AREAS,
  MEMBERSHIP_INCLUDES,
  HOME_FAQS,
  HOME_OBJECTIONS,
} from '@/lib/home-showcase';

export const metadata: Metadata = {
  title: {
    absolute: 'Real-World Learning Activities for Kids | Anywhere Learning',
  },
  description:
    "Real-world learning activities for kids 6-14. A guided membership that hands you the next activity: academics and life skills in one task, nothing to print.",
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

// Real weeks, not stock: [file in /images/home, caption, alt].
const WHY_PHOTOS: [string, string, string][] = [
  ['baking-day', 'Baking day', 'A girl mixing batter in a big bowl'],
  ['sorting-cacao', 'Sorting cacao', 'A girl sorting cacao beans on a tray'],
  ['bagged-to-sell', 'Bagged to sell', 'A girl with bags of popcorn she made to sell'],
  ['sifting-finds', 'Sifting the finds', 'Two kids sifting through finds at an outdoor table'],
  ['at-the-roastery', 'At the roastery', 'Two kids at a coffee roaster reading about the beans'],
];

// Short lines from the endorsements on /about, word for word.
const TEACHER_QUOTES = [
  {
    quote:
      'Years after leaving her classroom, students still talk about Amelie as the best teacher they ever had.',
    who: 'Catherine',
    role: 'Colleague',
  },
  {
    quote:
      'She gave them real-world projects that had them thinking, building, presenting, and collaborating with enthusiasm.',
    who: 'Wendy',
    role: 'Parent',
  },
  {
    quote:
      "She helps shift the mindset from 'I need educational experts and structured programs to teach my child' to 'I already have what it takes to support my child's learning.'",
    who: 'Claudia, M.Sc.',
    role: 'Parenting coach',
  },
];

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
  // The free 5-day course button (hero + final CTA). Hidden in production until
  // the Kit sequence is live; always shown on previews for review.
  const showCourse = isCoursePageVisible();
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
          <div className="relative z-[2] mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 pb-14 pt-12 md:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-0 lg:px-16 lg:pb-20">
            <div className="relative z-[2] max-w-[620px]">
              <HeroSaleBadge />
              <ChallengeHeroSticker />
              <div data-reveal>
                <Eyebrow>From a teacher of 15 years &middot; <span className="whitespace-nowrap">Ages 6&ndash;14</span></Eyebrow>
              </div>
              <h1 className="mb-[26px] mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight text-balance">
                Real learning,{' '}
                <span className="italic text-forest">hiding in real life.</span>
              </h1>
              <p className="mb-9 max-w-[500px] text-[17px] leading-[1.62] text-gray-600 text-pretty md:text-xl">
                We hand you the next real-world activity, matched to your kids. Plan a party:
                that&apos;s fractions and budgeting. You just do it together.
              </p>
              <div className="mb-3.5 flex flex-wrap items-center gap-x-[22px] gap-y-4">
                <Link
                  href="/start-trial"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-forest px-9 py-[18px] text-lg font-semibold text-cream shadow-[0_12px_28px_-8px_rgba(88,129,87,0.4)] transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark active:scale-[0.97]"
                >
                  Start free trial
                  <ArrowIcon />
                </Link>
                {/* The free 5-day email course sits beside the trial as the second
                    main door: the trial for parents ready to try the library, the
                    course for everyone who wants to understand real-world learning
                    first. Hidden in production until COURSE.isLive (lib/course.ts). */}
                {showCourse ? (
                  <Link
                    href="/course?source=homepage-hero"
                    className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-forest px-8 py-4 text-lg font-semibold text-forest transition-all duration-200 hover:scale-[1.02] hover:bg-forest hover:text-cream active:scale-[0.97]"
                  >
                    Free 5-day course
                  </Link>
                ) : null}
              </div>
              {/* One line: the per-month figure answers "is $99 a lot?" at the
                  moment of decision, and the card requirement is said here so
                  Stripe isn't the one to spring it. m.* tracks the live price. */}
              <p className="mb-5 max-w-[470px] text-[14px] leading-[1.55] text-gray-500">
                {`${TRIAL_DAYS} days free · $0 today · then ${m.priceYr}${m.isFounderPhase ? ' founder rate' : ''} (about ${m.priceMonth}). A card is needed; cancel before day ${TRIAL_DAYS + 1} and you pay nothing.`}
              </p>
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
              <Eyebrow tone="dark">Why this exists</Eyebrow>
              {/* No max-w on either: the cards below run the full container
                  width, so a short measure up here leaves a ragged gap. */}
              <h2 className="mb-[22px] mt-[22px] font-display text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.04] text-cream">
                Kids don&apos;t need better worksheets.{' '}
                <span className="italic text-gold-light">They need a reason.</span>
              </h2>
              <p className="mb-14 text-[19px] leading-[1.7] text-cream/[0.78] text-pretty">
                Learning got separated from real life. Kids get taught all day and almost never get
                to try.
              </p>
            </ScrollReveal>

            <div className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  t: "They're actually learning",
                  b: "Plan a party, that's budgeting and fractions. Run a small business, that's writing and pricing.",
                },
                {
                  t: 'They actually want to',
                  b: 'Nobody needs convincing to plan a party. The reason to care is built in.',
                },
                {
                  t: 'And it sticks',
                  b: 'A skill they used is a skill they keep. Nothing memorized for a test.',
                },
              ].map((c, i) => (
                <ScrollReveal key={c.t} delay={i * 100} className="h-full">
                  {/* Warm paper panels rather than a tint of the green behind
                      them: at cream/0.07 they barely separated from the
                      background. Echoes the aged-paper panels in the member
                      world, so the two surfaces read as one product. */}
                  <div className="relative h-full bg-[#f5f0e5] px-7 pb-[30px] pt-9 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.5)]" style={{ transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)` }}>
                    <Tape color={i === 1 ? 'rgba(169,193,163,0.85)' : undefined} />
                    <div className="mb-2.5 text-xl font-semibold text-forest-dark">{c.t}</div>
                    <div className="text-[15.5px] leading-[1.65] text-[#6b675e]">{c.b}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Real weeks, taped up: the idea in pictures. */}
            <ul className="-mx-2 mb-14 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 sm:grid-cols-3 lg:grid-cols-5">
              {WHY_PHOTOS.map(([file, caption, alt], i) => (
                <li
                  key={file}
                  className={`relative bg-[#f5f0e5] p-2 pb-2.5 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)] ${i === 4 ? 'max-lg:hidden' : ''} ${i === 3 ? 'sm:max-lg:hidden' : ''}`}
                  style={{ transform: `rotate(${[-3, 2, -1.5, 2.5, -2][i]}deg)` }}
                >
                  <Tape className="left-1/2 -translate-x-1/2 -rotate-3 w-14 h-5" />
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={`/images/home/${file}.jpg`}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center font-display text-[14px] italic text-forest-dark">{caption}</p>
                </li>
              ))}
            </ul>

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
          <div className="mx-auto max-w-[1240px]">
            <ScrollReveal>
              <div className="mb-10 max-w-[700px] lg:mb-11">
                <Eyebrow>Inside the membership</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] tracking-tight text-balance">
                  A map, a month, a record.
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InsideMembership trialDays={TRIAL_DAYS} />
            </ScrollReveal>
          </div>
        </section>

        {/* ════════ 05 WHAT'S INSIDE ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{ background: '#F2EFE4' }}
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
                  <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.7rem)] leading-[1.06] tracking-tight text-balance md:col-start-1 md:row-start-1">
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

        {/* ════════ 06 AMELIE ════════ */}
        {/* Contained rather than full-bleed: edge-to-edge the photo ran past
            the content column every other section sits in. */}
        <section className="bg-cream px-6 py-20 md:px-16 md:py-24">
          <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-14">
            <figure className={`relative m-0 -rotate-[1.5deg] self-center bg-white p-3 pb-4 ${PAPER_SHADOW}`}>
              <Tape className="left-10 -rotate-6" />
              <Tape className="right-10 rotate-6" color="rgba(169,193,163,0.85)" />
              <div className="relative min-h-[320px] overflow-hidden lg:min-h-[480px]">
                <Image
                  src="/amelie.jpg"
                  alt="Amelie and her kids on a mountain hike"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  quality={90}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-center font-display text-[20px] italic text-[#C97B5C]">
                xo, Amelie
              </figcaption>
            </figure>
            <div className="flex flex-col justify-center">
            <ScrollReveal direction="right">
              <div>
                <Eyebrow>Made by a teacher, for parents</Eyebrow>
                <h2 className="mb-[22px] mt-[18px] font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] tracking-tight text-balance">
                  Hi, I&apos;m Amelie.
                </h2>
                <p className="mb-4 text-lg leading-[1.72] text-gray-600 text-pretty">
                  Fifteen years in classrooms, two degrees in education, a boy and a girl of my
                  own. Then I left teaching to homeschool them. Partly because I missed them,
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

          {/* From the people who saw her teach (full quotes on /about). */}
          <ul className="mx-auto mt-14 grid max-w-[1100px] list-none gap-6 p-0 md:grid-cols-3">
            {TEACHER_QUOTES.map((t, i) => (
              <li
                key={t.who}
                className={`bg-[#FBF3DC] px-6 py-5 ${PAPER_SHADOW}`}
                style={{ transform: `rotate(${[-1.2, 0.9, -0.6][i]}deg)` }}
              >
                <p className="m-0 font-display text-[16.5px] italic leading-[1.5] text-[#2b2a26]">&ldquo;{t.quote}&rdquo;</p>
                <p className="mb-0 mt-3 text-[13px] font-semibold text-forest-dark">
                  {t.who} <span className="font-normal text-gray-500">&middot; {t.role}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ════════ 07 TESTIMONIALS ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          style={{ background: '#E9EEE6' }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-12 text-center">
                <Eyebrow center>Parents talking</Eyebrow>
                <h2 className="mb-3 mt-4 font-display text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.06] tracking-tight text-balance">
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
                  <figure className={`relative m-0 h-full bg-[#FFFDF8] px-9 pb-[34px] pt-10 ${PAPER_SHADOW}`} style={{ transform: `rotate(${i ? 0.9 : -0.9}deg)` }}>
                    <Tape color={i ? 'rgba(169,193,163,0.85)' : undefined} />
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

        {/* ════════ 08 MEMBERSHIP + FAQ ════════ */}
        <section
          className="px-6 py-20 md:px-16 md:py-24"
          id="membership"
          style={{ background: '#F2EFE4' }}
        >
          <div className="mx-auto max-w-[1100px]">
            <ScrollReveal>
              <div className="mb-10 text-center">
                <Eyebrow center>The membership</Eyebrow>
                <h2 className="mb-3.5 mt-4 font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.06] tracking-tight text-balance">
                  One price. All of it.
                </h2>
                <p className="mx-auto max-w-[520px] text-lg leading-[1.65] text-gray-600">
                  {`No bundles to pick between, no upsells. Start with ${TRIAL_DAYS} days free, you're not charged until they're up.`}
                </p>
              </div>
            </ScrollReveal>

            {/* The two objections that decide it, answered before the price
                rather than at the bottom of the FAQ. Someone who thinks this is
                homeschoolers-only, or that Pinterest already does it, doesn't
                scroll far enough to find out otherwise. Copy comes from the FAQ
                entries themselves so the two can't drift. */}
            <ScrollReveal delay={60}>
              <div className="mb-9 grid grid-cols-1 gap-4 md:grid-cols-2">
                {HOME_OBJECTIONS.map((f, i) => (
                  <div
                    key={f.q}
                    className={`bg-[#FBF3DC] px-6 py-5 ${PAPER_SHADOW}`}
                    style={{ transform: `rotate(${i ? 0.8 : -0.8}deg)` }}
                  >
                    <p className="mb-1.5 text-[15.5px] font-semibold text-forest-dark">{f.q}</p>
                    <p className="text-[15px] leading-[1.6] text-gray-600">{f.a}</p>
                  </div>
                ))}
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

            {/* A price on its own doesn't tell a parent whether it's a lot.
                The per-month figure and the per-kid one both do, and both are
                ours to state. A comparison to tutoring did the same job but
                rested on someone else's prices, so it's deliberately absent. */}
            <p className="mb-10 mt-5 text-center text-[15px] leading-[1.6] text-gray-500">
              {`${m.priceYear} is about ${m.priceMonth}, and it covers every kid in the house.`}
            </p>

            <ScrollReveal delay={150}>
              <div className={`relative mb-10 bg-[#FFFDF8] px-11 pb-10 pt-12 max-md:px-6 ${PAPER_SHADOW}`}>
                <Magnet color="#588157" size={26} />
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
                <h2 className="mb-7 text-center font-display text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.08] tracking-tight text-balance">
                  You might be wondering&hellip;
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <HomeFaqAccordion />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════ 09 FINAL CTA ════════ */}
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
                {`${TRIAL_DAYS} days free · $0 today · cancel anytime`}
                {m.isFounderPhase ? ` · Founder rate for the first ${m.founderCap} families` : ''}
              </p>
              <p className="mt-2.5 text-[13.5px] leading-[1.55] text-cream/[0.45]">
                Then {m.priceYr}, about {m.priceMonth}. A card is required to start.
              </p>
              <p className="mt-[30px]">
                <Link
                  href={showCourse ? '/course?source=homepage-final' : '/free-guide'}
                  className="text-[15px] text-gold-light/[0.92] underline-offset-4 transition-colors hover:text-gold-light hover:underline"
                >
                  {showCourse
                    ? 'Rather start free? Take the 5-day email course \u2192'
                    : 'Rather start free? Get the 7-day guide by email \u2192'}
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
