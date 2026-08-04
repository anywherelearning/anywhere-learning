import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import FAQSection from '@/components/shared/FAQSection';
import ScrollReveal from '@/components/shared/ScrollReveal';
import PhotoMosaic from '@/components/shared/PhotoMosaic';
import { MONTHLY_PLAN_PRICE_MONTH } from '@/lib/membership';
import { getMembership } from '@/lib/membership-runtime';
import HeroSaleBadge from '@/components/home/HeroSaleBadge';
import Testimonials from '@/components/home/Testimonials';
import FamilyProof from '@/components/home/FamilyProof';
import EmailForm from '@/components/EmailForm';
import { coreFaqItems } from '@/lib/faq-data';

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

const homepageFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: coreFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

// Hero collage constants (HERO_CARDS / CARD_POSITIONS) moved to
// components/shared/HeroCollage.tsx, which now powers the /shop hero. The
// homepage hero is a PhotoMosaic of real families.

const CATEGORIES = [
  { name: 'Real-World Math', slug: 'real-world-math', gradient: 'from-forest to-forest-dark', photo: '/images/money-grocery-shopping.jpeg' },
  { name: 'Creativity & Making', slug: 'creativity-maker', gradient: 'from-[#D8A77E] to-[#B07A4F]', photo: '/images/lego-glasses.jpeg' },
  { name: 'AI & Digital', slug: 'ai-literacy', gradient: 'from-[#3F4D40] to-[#1F2A21]', photo: '/images/teach-kids-prompt-ai-hero.jpeg' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', gradient: 'from-gold to-[#C49F3F]', photo: '/images/money-popcorn-business.jpeg' },
  { name: 'Communication & Writing', slug: 'communication-writing', gradient: 'from-[#3F4D40] to-[#1F2A21]', photo: '/images/life-skills-map-drawing.jpeg' },
  { name: 'Planning & Problem-Solving', slug: 'planning-problem-solving', gradient: 'from-[#C97B5C] to-[#A85A38]', photo: '/images/treasure-map.jpeg', objectPosition: 'center 25%' },
  { name: 'Outdoor Learning', slug: 'outdoor-learning', gradient: 'from-[#7A9978] to-[#4E6B4D]', photo: '/images/forest-school-leaf-play.jpeg' },
  { name: 'Worldschooling', slug: 'worldschooling', gradient: 'from-[#7A9978] to-[#4E6B4D]', photo: '/images/worldschool-day-market.jpeg' },
  { name: 'Emotional & Social Skills', slug: 'emotional-social-skills', gradient: 'from-[#B6748A] to-[#7A4858]', photo: '/images/join-hero.jpeg' },
];

// Line icons for the topic cards (white stroke on the gradient chip). One per
// slug, drawn on a 24x24 grid so they read consistently at 16px.
const CATEGORY_ICON_PATHS: Record<string, React.ReactNode> = {
  'real-world-math': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8.5" y1="12" x2="8.51" y2="12" />
      <line x1="12" y1="12" x2="12.01" y2="12" />
      <line x1="15.5" y1="12" x2="15.51" y2="12" />
      <line x1="8.5" y1="16" x2="8.51" y2="16" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
      <line x1="15.5" y1="16" x2="15.51" y2="16" />
    </>
  ),
  'creativity-maker': (
    <>
      <path d="M12 3l1.9 4.4L18 9l-4.1 1.6L12 15l-1.9-4.4L6 9l4.1-1.6z" />
      <path d="M18.2 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
    </>
  ),
  'ai-literacy': (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  entrepreneurship: (
    <>
      <path d="M20.6 13.4l-7.1 7.1a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7.6a2 2 0 0 1 1.4.6l6.2 6.2a2 2 0 0 1 0 2.8z" />
      <line x1="8" y1="8" x2="8.01" y2="8" />
    </>
  ),
  'communication-writing': (
    <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
  ),
  'planning-problem-solving': (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  'outdoor-learning': (
    <>
      <path d="M11 20A8 8 0 0 1 4 12C4 6 9 3.5 20 3c.5 11-4 16-9 17z" />
      <path d="M4 21c3.5-3.5 5.5-5.5 8-8" />
    </>
  ),
  worldschooling: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  'emotional-social-skills': (
    <path d="M20.8 6.6a5 5 0 0 0-7.1-.1l-1.7 1.6-1.7-1.6a5 5 0 0 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7z" />
  ),
};

function CategoryIcon({ slug }: { slug: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CATEGORY_ICON_PATHS[slug]}
    </svg>
  );
}

export default async function HomePage() {
  // Live founder state (DB-counted). Replaces the static membership flags
  // for this page so the founder framing closes automatically at 100.
  const m = await getMembership();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqLd) }} />
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-forest focus-visible:px-4 focus-visible:py-2 focus-visible:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">

        {/* ════════════════════════════════════════
            01 HERO — "Handle real life" tension. Co-primary CTAs:
            Start free trial (membership) + Take the quiz.
        ════════════════════════════════════════ */}
        <section className="relative py-7 md:py-9 lg:py-10 overflow-hidden">
          <div className="mx-auto max-w-[1180px] px-6">
            <HeroSaleBadge />
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-12 items-start">
              {/* MOBILE-ONLY title — shows above the hero on small screens */}
              <div className="lg:hidden text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Real-world activities &middot; Ages 6-14
                </p>
                <h1 className="font-display text-[clamp(2.25rem,6.2vw,4.8rem)] leading-[1.04] tracking-tight">
                  Your kid is smart.{' '}
                  <span className="block">
                    But can they handle{' '}
                    <span className="relative whitespace-nowrap">
                      <span className="text-forest italic">real life?</span>
                      <span className="absolute left-[-1%] right-[-1%] bottom-[0.06em] h-[0.32em] bg-[#C97B5C]/[0.28] rounded-[0.3em_0.8em_0.2em_0.6em/0.6em_0.3em_0.8em_0.2em] -z-10" />
                    </span>
                  </span>
                </h1>
              </div>

              {/* Copy — lg:col-1; on mobile sits ABOVE the collage so the CTA
                  lands near the fold (title block → copy+CTA → collage). */}
              <div className="lg:col-start-1 lg:row-start-1 order-2 lg:order-none text-center lg:text-left flex flex-col items-center lg:items-start">
                {/* DESKTOP-ONLY title (mobile uses the dedicated block above) */}
                <div className="hidden lg:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center gap-2.5 mb-5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    Real-world activities &middot; Ages 6-14
                  </p>
                  <h1 className="font-display text-[clamp(2.6rem,6.2vw,4.8rem)] leading-[1.02] tracking-tight mb-6">
                    Your kid is smart.{' '}
                    <span className="block">
                      But can they handle{' '}
                      <span className="relative whitespace-nowrap">
                        <span className="text-forest italic">real life?</span>
                        <span className="absolute left-[-1%] right-[-1%] bottom-[0.06em] h-[0.32em] bg-[#C97B5C]/[0.28] rounded-[0.3em_0.8em_0.2em_0.6em/0.6em_0.3em_0.8em_0.2em] -z-10" />
                      </span>
                    </span>
                  </h1>
                </div>
                <p className="text-[16.5px] md:text-xl text-gray-500 leading-relaxed mb-7 lg:mb-9 max-w-[560px]">
                  A membership that hands you your family&apos;s next real-world activity, matched
                  to your kids, so you just do it together. Cooking, budgeting, problem-solving,
                  the life skills school skips. No planning, nothing to print. A teacher picks
                  your next stop, you make the memory.
                </p>
                <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                  <Link
                    href="/start-trial"
                    className="inline-flex items-center gap-3.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-base shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_10px_24px_-12px_rgba(58,90,64,0.5),0_2px_0_rgba(45,58,46,0.05)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                  >
                    Start free trial
                    <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-white/[0.18]">&rarr;</span>
                  </Link>
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-3 bg-cream text-forest-dark font-semibold py-4 px-6 rounded-xl text-base border border-[#D8D4C5] shadow-[0_10px_24px_-16px_rgba(45,58,46,0.4)] hover:border-forest hover:-translate-y-px transition-all duration-200"
                  >
                    Take the 2-min quiz
                    <span className="font-display italic text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
                <div className="mt-4">
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-2 text-forest-dark font-semibold text-[15px] border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                  >
                    Or see everything inside the membership
                    <span className="font-display italic text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
                {/* Mobile-only price + trust: keeps the number beside the CTAs on
                    phones. Desktop shows the same strip under the mosaic instead. */}
                <div className="lg:hidden mt-6 flex flex-col items-center gap-3.5">
                  <div className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-[#D8D4C5] bg-[#F2EFE4]/70 px-4 py-1.5 text-[13px] text-gray-600">
                    <span className="font-semibold text-forest-dark">One membership</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span>
                      <span className="font-semibold text-[#C97B5C]">{m.priceYr}</span>
                      {m.isFounderPhase ? ' founder rate' : ''}
                    </span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span>14 days free</span>
                  </div>
                  <div className="text-[13.5px] text-gray-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">Built by a teacher</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span className="inline-flex items-center gap-1.5">Tested on her own kids</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span className="inline-flex items-center gap-1.5">$0 today, cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Hero visual — a scrapbook mosaic of real families doing real-world
                  activities. lg:mt-9 drops the frames past the eyebrow so the first
                  row's top lines up with the headline, not the kicker above it. */}
              <div className="w-full max-lg:max-w-[460px] max-lg:mx-auto order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-9">
                <PhotoMosaic />
                {/* Price snapshot + trust, tucked under the mosaic so the number is
                    visible without hunting and the scrapbook feels grounded. Live
                    founder state via `m` (self-updates to $149/yr past the cap).
                    Desktop only; mobile shows the same strip under the CTAs. The
                    mt lines the pill top up with the "Start free trial" button top
                    (the 1180px-capped layout is identical across desktop widths). */}
                <div className="hidden lg:flex mt-[45px] flex-col items-center gap-3.5">
                  <div className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-[#D8D4C5] bg-[#F2EFE4]/70 px-4 py-1.5 text-[13px] text-gray-600">
                    <span className="font-semibold text-forest-dark">One membership</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span>
                      <span className="font-semibold text-[#C97B5C]">{m.priceYr}</span>
                      {m.isFounderPhase ? ' founder rate' : ''}
                    </span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span>14 days free</span>
                  </div>
                  <div className="text-[13.5px] text-gray-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">Built by a teacher</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span className="inline-flex items-center gap-1.5">Tested on her own kids</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                    <span className="inline-flex items-center gap-1.5">$0 today, cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            02 PROBLEM — What if (forward-looking, distinct from /join's "quiet worry")
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  What if
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  What if your kid could <span className="italic text-forest">actually handle it?</span>
                </h2>
                <p className="mt-4 text-lg text-gray-500">Not someday. This week.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 max-w-[1020px] mx-auto">
              {[
                "Plan dinner for the family, shopping list, budget, and all.",
                "Speak up for themselves without falling apart.",
                "Start a small business from the kitchen table.",
              ].map((text, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <p className={`py-5 md:py-2 px-8 text-center font-display italic text-[clamp(1.25rem,1.9vw,1.5rem)] leading-[1.32] text-balance ${i > 0 ? 'md:border-l border-t md:border-t-0 border-[#D8D4C5]' : ''}`}>
                    {text}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 HOW IT FEELS — Product experience, not cultural problem (/join does that)
        ════════════════════════════════════════ */}
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  How it feels
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  Not a curriculum. <span className="italic text-forest">A toolkit.</span>
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="max-w-[620px] mx-auto text-center space-y-5">
                <p className="text-lg leading-relaxed text-gray-700">
                  You open a guide on your phone, grab whatever&apos;s already at home, and you and your
                  kid <span className="font-display italic text-forest">do something real together</span>. Cook a meal, build a budget,
                  plan a road trip, start a business.
                </p>
                <p className="text-lg leading-relaxed text-gray-700">
                  No lesson plans. No grading. No prep that takes longer than the activity.
                  Just <span className="font-display italic text-forest">quality time that quietly builds real skills.</span>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03b IF THIS IS YOUR KID — Fit, not treatment.
            ADHD/autism/neurodivergence was the single most common unprompted
            theme in the voice-of-customer research (501 mentions) and nothing
            on the site spoke to it. Deliberately claims FIT ("none of this
            happens at a table"), never therapeutic outcome.
        ════════════════════════════════════════ */}
        <section className="bg-[#E6EBDF] border-y border-[#C9D3BE] py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  If this is your kid
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  The one who <span className="italic text-forest">cannot sit still.</span>
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="max-w-[620px] mx-auto text-center space-y-5">
                <p className="text-lg leading-relaxed text-gray-700">
                  One kid can&apos;t sit still. One freezes the second anything is graded. One finishes
                  in four minutes and cares about none of it. Diagnosis or not, it never changed what
                  they needed: to learn <span className="font-display italic text-forest">standing up, outside, in the kitchen, with their hands.</span>
                </p>
                <p className="text-lg leading-relaxed text-gray-700">
                  Nothing here is timed or graded, and you pitch each activity where your kid actually
                  is. I won&apos;t promise it fixes anything. But if the table is where it all falls apart
                  in your house, <span className="font-display italic text-forest">none of this happens at a table.</span>
                </p>
                <p className="pt-2">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-2 text-forest-dark font-semibold text-base border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                  >
                    Not sure where your kid is? Take the 2-min quiz
                    <span className="font-display italic text-lg leading-none">&rarr;</span>
                  </Link>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            04 CATEGORIES — Chip grid
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  What&apos;s inside
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  Every topic. <span className="italic text-forest">One membership.</span>
                </h2>
                <p className="mt-4 text-lg text-gray-500">120+ real-world activities that build the life skills school skips.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-[800px] mx-auto">
              {CATEGORIES.map((cat, i) => (
                <ScrollReveal key={cat.name} delay={i * 50}>
                  <Link
                    href={`/shop#track-${cat.slug}`}
                    className="group block rounded-[14px] overflow-hidden border border-[#D8D4C5] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-22px_rgba(45,58,46,0.3)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={cat.photo}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                        quality={90}
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        style={cat.objectPosition ? { objectPosition: cat.objectPosition } : undefined}
                      />
                    </div>
                    <div className={`flex items-center gap-2 px-3.5 h-[44px] bg-gradient-to-br ${cat.gradient}`}>
                      <span className="w-[24px] h-[24px] rounded bg-white/[0.22] grid place-items-center text-white shrink-0">
                        <CategoryIcon slug={cat.slug} />
                      </span>
                      <h3 className="font-display text-[13px] leading-tight tracking-tight text-white">{cat.name}</h3>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={200}>
              <p className="mt-9 text-center font-display italic text-lg leading-relaxed text-gray-500 text-balance max-w-[600px] mx-auto">
                Each guide includes <span className="not-italic text-forest-dark font-normal">three built-in difficulty levels</span>,
                so a first-grader and a middle-schooler can work on the same activity at the same table.
              </p>
              <div className="flex justify-center mt-5">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-forest-dark font-semibold text-base border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                >
                  Browse all activities
                  <span className="font-display italic text-lg leading-none">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 INSIDE THE MEMBERSHIP — The guided trail: set up explorers,
            we pick the next stop, do it together. Merged with the old
            Adventure Map, whose feature cards just repackaged these steps
            (This Month = step ii, earn-gear + printable Record = step iii).
        ════════════════════════════════════════ */}
        <section className="bg-[#E6EBDF] border-y border-[#C9D3BE] py-14 md:py-16" id="how-it-works">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Inside the membership
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  It&apos;s a trail, <span className="italic text-forest">not a to-do list.</span>
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Not a shelf of files to manage. We hand you the next real-world activity for
                  your family, you do it together, and your kids climb the trail as you go.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1020px] mx-auto">
              {[
                { num: 'i', title: 'Set up your explorers', body: "Tell us your kids' names, ages, and the skills you care about. Two minutes, once. Each child becomes an explorer on your family's trail." },
                { num: 'ii', title: 'We pick your next stop', body: "No scrolling, no second-guessing. We choose the next activity for you, matched to your kids and the time you've got, with a fresh curated pick every month. Not feeling it? Swap it in a tap." },
                { num: 'iii', title: 'Do it together, mark it reached', body: 'Open the guide, live it together, then tap "We reached it." Your explorers move forward and earn gear, and everything saves into a printable Record, a keepsake that doubles as a homeschool log.' },
              ].map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 100} className="h-full">
                  <div className="h-full border border-[#C9D3BE] rounded-[14px] bg-cream p-8 pt-8">
                    <div className="w-12 h-12 rounded-full bg-[#E6EBDF] border border-forest text-forest-dark grid place-items-center font-display italic text-2xl mb-5">
                      {step.num}
                    </div>
                    <h3 className="font-display text-[26px] leading-tight tracking-tight mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-[15.5px] leading-relaxed">{step.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={200}>
              <div className="flex justify-center mt-10">
                <Link
                  href="/start-trial"
                  className="inline-flex items-center gap-3.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-base shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_10px_24px_-12px_rgba(58,90,64,0.5),0_2px_0_rgba(45,58,46,0.05)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                >
                  Start your trail free
                  <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-white/[0.18]">&rarr;</span>
                </Link>
              </div>
              <p className="mt-3.5 text-center text-[13.5px] text-gray-400">
                14-day free trial, $0 today. {m.priceMonth} billed yearly after, or {MONTHLY_PLAN_PRICE_MONTH}.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06 MEET AMELIE — Founder bio (trust before the ask)
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
              <ScrollReveal direction="left">
                <div className="relative aspect-[4/5] max-lg:max-w-[360px] max-lg:mx-auto -rotate-[1.4deg] rounded-[14px] border border-[#D8D4C5] overflow-hidden shadow-[0_24px_40px_-28px_rgba(45,58,46,0.4)]">
                  <Image
                    src="/amelie.jpg"
                    alt="Amelie and her kids on a mountain hike"
                    fill
                    sizes="(max-width: 1024px) 90vw, 42vw"
                    quality={90}
                    priority
                    className="object-cover"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={100}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center gap-2.5 mb-4">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    Made by a teacher, for parents
                  </p>
                  <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-tight mt-3.5 mb-4">
                    Hi, I&apos;m Amelie. I built this because I wanted{' '}
                    <span className="italic text-forest">more time with my own kids.</span>
                  </h2>
                  <div className="space-y-3.5 text-gray-500 text-[17px] leading-relaxed">
                    <p>
                      Fifteen years in classrooms. Two degrees in education. A boy and a girl of my
                      own. Last year I made the hardest call of my career: I left teaching to
                      homeschool them. Partly because I missed them, mostly because I wanted to
                      be the one helping them get ready for the life they&apos;re actually going to live.
                    </p>
                    <p>
                      Anywhere Learning is what I wish I&apos;d had: small, doable, real-world activities
                      a parent and a kid can do together. The stuff that builds the underlying
                      muscle: self-regulation, focus, finishing things, the way childhood used
                      to, before we scheduled it all out.
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['B.Ed', 'M.Ed', '15 yrs classroom teaching', 'Now homeschooling her own'].map((cred) => (
                      <span key={cred} className="bg-cream border border-[#D8D4C5] px-3.5 py-1.5 rounded-full text-[13px] text-gray-500">{cred}</span>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 text-forest-dark font-semibold text-base border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                    >
                      Read more about Amelie
                      <span className="font-display italic text-lg leading-none">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06a PRODUCT PROOF — Families already doing this (outcomes, star-rated;
            distinct from the star-free founder-credibility block that follows).
        ════════════════════════════════════════ */}
        <FamilyProof />

        {/* ════════════════════════════════════════
            06b TESTIMONIALS — Founder credibility (in their words)
        ════════════════════════════════════════ */}
        <Testimonials />

        {/* ════════════════════════════════════════
            07 FREE GUIDE — Primary soft conversion (email capture).
            Placed AFTER Meet Amelie so visitors meet the person behind the
            guide before being asked for their email — the ask lands as
            "Amelie made this, let me try it" instead of a cold capture.
        ════════════════════════════════════════ */}
        <section className="py-14 md:py-16" id="free-guide">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="bg-[#F2DECF] border border-[#C97B5C]/35 rounded-[22px] p-10 md:p-14 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center shadow-[0_30px_56px_-36px_rgba(201,123,92,0.4)] relative overflow-hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] flex items-center gap-2.5 mb-4">
                    <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                    Free 7-day guide
                  </p>
                  <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.75rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                    7 Days of Real-World Learning, <span className="italic text-[#7A3D24]">free in your inbox.</span>
                  </h2>
                  <p className="mt-4 text-gray-600 text-[17px] leading-relaxed max-w-[480px]">
                    One activity a day. A few hours each. Zero worksheets. Seven categories,
                    from outdoor science to budgeting to entrepreneurship. Each one builds
                    different life skills. Pick the one that fits today, and let your kid go.
                  </p>
                  <div className="mt-6 max-w-[480px]">
                    <EmailForm variant="light" buttonText="Send me the guide" />
                  </div>
                  <p className="mt-3.5 text-[13px] text-gray-400 leading-normal">
                    No spam. Unsubscribe in one click. We hate inbox clutter as much as you do.
                  </p>
                </div>

                {/* Guide visual — real cover photo */}
                <div className="relative min-h-[420px] flex items-center justify-center max-lg:hidden" aria-hidden="true">
                  <div className="relative w-[300px] h-[400px]">
                    {/* Soft back card for depth */}
                    <div className="absolute inset-0 bg-cream border border-[#D8D4C5] rounded-xl shadow-[0_12px_22px_-16px_rgba(45,58,46,0.3)] -rotate-[4deg] -translate-x-[22px] translate-y-[6px]" />
                    {/* Real PDF cover */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden border border-[#D8D4C5] shadow-[0_24px_44px_-22px_rgba(45,58,46,0.45)] -rotate-[1.5deg] z-[3]">
                      <Image
                        src="/free-guide-cover.jpg"
                        alt="Cover of the 7 Days of Real-World Learning free guide"
                        fill
                        sizes="300px"
                        className="object-cover object-top"
                      />
                    </div>
                    {/* "Free" sticker */}
                    <span className="absolute -top-3 -right-3 bg-forest text-cream font-display italic text-base px-3.5 py-1.5 rounded-full rotate-[8deg] shadow-[0_8px_16px_-8px_rgba(88,129,87,0.6)] z-[5]">
                      Free
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            09 FAQ — 4 homepage-relevant questions
        ════════════════════════════════════════ */}
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Common questions
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  You might be <span className="italic text-forest">wondering...</span>
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="max-w-[760px] mx-auto">
                <FAQSection items={coreFaqItems} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            10 FINAL CTA — Two paths: free guide vs membership
        ════════════════════════════════════════ */}
        <section className="bg-gradient-to-b from-cream to-[#F2EFE4] border-t border-[#D8D4C5] py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6 text-center">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Where to start
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  Two paths. <span className="italic text-forest">Pick yours.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[760px] mx-auto">
              <ScrollReveal delay={0}>
                <div className="bg-cream border border-[#D8D4C5] rounded-[18px] p-8 text-left flex flex-col h-full hover:-translate-y-[3px] hover:shadow-[0_20px_36px_-24px_rgba(45,58,46,0.3)] transition-all duration-200">
                  <span className="self-start text-[11.5px] tracking-[0.16em] uppercase font-semibold text-forest-dark px-3 py-1 rounded-full bg-[#E6EBDF] mb-4">
                    Free
                  </span>
                  <h3 className="font-display text-[26px] leading-tight tracking-tight mb-3">
                    Get the <span className="italic text-forest">free guide.</span>
                  </h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                    Seven real-world activities, one a day for a week. Sent to your inbox, no commitment.
                  </p>
                  <div className="mt-auto">
                    <Link
                      href="/free-guide"
                      className="inline-flex items-center gap-2.5 font-semibold text-[15px] text-forest-dark bg-[#E6EBDF] px-5 py-3 rounded-xl hover:bg-[#D4DCC5] transition-colors"
                    >
                      Send me the guide
                      <span className="font-display italic text-lg">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={75}>
                <div className="bg-forest-dark text-cream border border-forest-dark rounded-[18px] p-8 text-left flex flex-col h-full shadow-[0_28px_50px_-30px_rgba(58,90,64,0.5)] hover:-translate-y-[3px] hover:shadow-[0_32px_56px_-30px_rgba(58,90,64,0.6)] transition-all duration-200">
                  <span className="self-start text-[11.5px] tracking-[0.16em] uppercase font-semibold text-[#E6EBDF] px-3 py-1 rounded-full bg-white/[0.14] mb-4">
                    Full access
                  </span>
                  <h3 className="font-display text-[26px] leading-tight tracking-tight mb-3">
                    Join the <span className="italic text-[#E9C76B]">membership.</span>
                  </h3>
                  <p className="text-cream/85 text-[15px] leading-relaxed mb-6">
                    Full library, all categories, new activities every quarter.{' '}
                    {m.priceMonth} billed yearly, or {MONTHLY_PLAN_PRICE_MONTH}.{' '}
                    {m.isFounderPhase ? `Founder rate for the first ${m.founderCap} families.` : ''}
                  </p>
                  <div className="mt-auto">
                    <Link
                      href="/join"
                      className="inline-flex items-center gap-2.5 font-semibold text-[15px] text-forest-dark bg-cream px-5 py-3 rounded-xl hover:bg-white transition-colors"
                    >
                      See the membership
                      <span className="font-display italic text-lg">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
