import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import FAQSection from '@/components/shared/FAQSection';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { POST_FOUNDER_PRICE_USD, MONTHLY_PLAN_PRICE_MONTH } from '@/lib/membership';
import { getMembership } from '@/lib/membership-runtime';
import HeroSaleBadge from '@/components/home/HeroSaleBadge';
import Testimonials from '@/components/home/Testimonials';
import EmailForm from '@/components/EmailForm';
import { coreFaqItems } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: {
    absolute: 'Anywhere Learning | Life Skills Activities for Kids',
  },
  description:
    'A library of 120+ guided real-world activities by a teacher. Cooking, budgeting, building, planning, for parents who want kids capable, not just credentialed. Ages 6-14.',
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

// One activity from each of the 9 categories.
// Order matches CARD_POSITIONS: index 3 = right side (Entrepreneurship), index 7 = left side (Planning).
const HERO_CARDS = [
  { slug: 'kitchen-math-challenge', alt: 'Kitchen Math & Meal Planning cover' },     // 10:30 top-left
  { slug: 'deepfake-spotter', alt: 'Deepfake & Manipulation Spotter cover' },        // 12 top peek
  { slug: 'family-debate-night', alt: 'Family Debate Night cover' },                  // 1:30 top-right
  { slug: 'shark-tank-pitch', alt: 'The Shark Tank Pitch cover' },                    // 3 right side
  { slug: 'rube-goldberg-machine', alt: 'Build a Rube Goldberg Machine cover' },     // 4:30 bottom-right
  { slug: 'currency-market-math', alt: 'Currency & Market Math cover' },              // 6 bottom peek
  { slug: 'nature-walk-task-cards', alt: 'Nature Walk Task Cards cover' },            // 7:30 bottom-left
  { slug: 'travel-day', alt: 'Travel Day Itinerary Challenge cover' },                // 9 left side
];

// 8 covers orbit the centered Skills Map at 45° intervals.
// Tuned to hug the Skills Map closely so the composition feels tight.
const CARD_POSITIONS = [
  // 10:30 — top-left corner
  { style: { top: '10%', left: '8%' }, rotate: -9, z: 2 },
  // 12 — top, peeking just behind top of SM
  { style: { top: '3%', left: '50%', transform: 'translateX(-50%)' }, rotate: -2, z: 1 },
  // 1:30 — top-right corner
  { style: { top: '10%', right: '8%' }, rotate: 9, z: 2 },
  // 3 — right side
  { style: { top: '50%', right: '-2%', transform: 'translateY(-50%)' }, rotate: 7, z: 3 },
  // 4:30 — bottom-right corner
  { style: { bottom: '10%', right: '8%' }, rotate: 5, z: 4 },
  // 6 — bottom, peeking just behind bottom of SM
  { style: { bottom: '3%', left: '50%', transform: 'translateX(-50%)' }, rotate: 2, z: 1 },
  // 7:30 — bottom-left corner
  { style: { bottom: '10%', left: '8%' }, rotate: -5, z: 4 },
  // 9 — left side
  { style: { top: '50%', left: '-2%', transform: 'translateY(-50%)' }, rotate: -7, z: 3 },
];

const CATEGORIES = [
  { name: 'Real-World Math', slug: 'real-world-math', icon: '$', gradient: 'from-forest to-forest-dark', photo: '/images/money-grocery-shopping.jpeg' },
  { name: 'Creativity & Maker', slug: 'creativity-maker', icon: '✂', gradient: 'from-[#D8A77E] to-[#B07A4F]', photo: '/images/lego-glasses.jpeg' },
  { name: 'AI & Digital', slug: 'ai-literacy', icon: '⌘', gradient: 'from-[#3F4D40] to-[#1F2A21]', photo: '/images/teach-kids-prompt-ai-hero.jpeg' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', icon: '¢', gradient: 'from-gold to-[#C49F3F]', photo: '/images/money-popcorn-business.jpeg' },
  { name: 'Communication & Writing', slug: 'communication-writing', icon: '✎', gradient: 'from-[#3F4D40] to-[#1F2A21]', photo: '/images/life-skills-map-drawing.jpeg' },
  { name: 'Planning & Problem-Solving', slug: 'planning-problem-solving', icon: '⊞', gradient: 'from-[#C97B5C] to-[#A85A38]', photo: '/images/treasure-map.jpeg', objectPosition: 'center 25%' },
  { name: 'Outdoor Learning', slug: 'outdoor-learning', icon: '☘', gradient: 'from-[#7A9978] to-[#4E6B4D]', photo: '/images/forest-school-leaf-play.jpeg' },
  { name: 'Worldschooling', slug: 'worldschooling', icon: '✈', gradient: 'from-[#7A9978] to-[#4E6B4D]', photo: '/images/worldschool-day-market.jpeg' },
  { name: 'Emotional & Social Skills', slug: 'emotional-social-skills', icon: '♡', gradient: 'from-[#B6748A] to-[#7A4858]', photo: '/images/join-hero.jpeg' },
];

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
            01 HERO — Dual CTA: free guide (primary) + membership (secondary)
        ════════════════════════════════════════ */}
        <section className="relative py-10 md:py-12 lg:py-14 overflow-hidden">
          <div className="mx-auto max-w-[1180px] px-6">
            <HeroSaleBadge />
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-12 items-center">
              {/* MOBILE-ONLY title — shows above the hero on small screens */}
              <div className="lg:hidden text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Real-world activities &middot; Ages 6-14
                </p>
                <h1 className="font-display text-[clamp(2.25rem,6.2vw,4.8rem)] leading-[1.04] tracking-tight">
                  Raise kids who can{' '}
                  <span className="text-forest italic">actually do</span>{' '}
                  <span className="relative whitespace-nowrap">
                    things.
                    <span className="absolute left-[-1%] right-[-1%] bottom-[0.06em] h-[0.32em] bg-[#C97B5C]/[0.28] rounded-[0.3em_0.8em_0.2em_0.6em/0.6em_0.3em_0.8em_0.2em] -z-10" />
                  </span>
                </h1>
              </div>

              {/* Copy — lg:col-1; on mobile sits AFTER the hero (hero comes next in DOM) */}
              <div className="lg:col-start-1 lg:row-start-1 order-3 lg:order-none text-center lg:text-left flex flex-col items-center lg:items-start">
                {/* DESKTOP-ONLY title (mobile uses the dedicated block above) */}
                <div className="hidden lg:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center gap-2.5 mb-5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    Real-world activities &middot; Ages 6-14
                  </p>
                  <h1 className="font-display text-[clamp(2.6rem,6.2vw,4.8rem)] leading-[1.02] tracking-tight mb-6">
                    Raise kids who can{' '}
                    <span className="text-forest italic">actually do</span>{' '}
                    <span className="relative whitespace-nowrap">
                      things.
                      <span className="absolute left-[-1%] right-[-1%] bottom-[0.06em] h-[0.32em] bg-[#C97B5C]/[0.28] rounded-[0.3em_0.8em_0.2em_0.6em/0.6em_0.3em_0.8em_0.2em] -z-10" />
                    </span>
                  </h1>
                </div>
                <p className="text-[16.5px] md:text-xl text-gray-500 leading-relaxed mb-7 lg:mb-9 max-w-[560px]">
                  A library of 120+ guided activities. Cooking, budgeting, building, planning,
                  problem-solving, designed by a teacher to fill the gap between what schools
                  test and what life requires.
                </p>
                <div className="flex flex-wrap gap-5 items-center justify-center lg:justify-start">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-3.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-base shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_10px_24px_-12px_rgba(58,90,64,0.5),0_2px_0_rgba(45,58,46,0.05)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                  >
                    Take the 2-min quiz
                    <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-white/[0.18]">&rarr;</span>
                  </Link>
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-2 text-forest-dark font-semibold text-base border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                  >
                    Or explore the full membership
                    <span className="font-display italic text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
                <div className="mt-4 text-[13.5px] text-gray-400 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">Built by a teacher</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                  <span className="inline-flex items-center gap-1.5">Tested on her own kids</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                  <span className="inline-flex items-center gap-1.5">Free, takes 2 minutes</span>
                </div>
              </div>

              {/* Hero visual — real activity covers fanning around the Future-Ready Skills Map */}
              <div data-hero-collage className="relative w-full aspect-square max-lg:max-w-[440px] max-lg:mx-auto order-2 lg:order-none lg:col-start-2 lg:row-start-1" aria-hidden="true">
              {/* data-hero-collage is used by scripts/screenshot-hero.mjs to re-export this collage as /public/membership-hero.png whenever the hero changes */}
                {/* Skills Map — centerpiece, all viewports */}
                <div
                  className="absolute z-[5] w-[130px] sm:w-[220px] lg:w-[250px] aspect-[3/4] rounded-[12px] overflow-hidden border border-[#D8D4C5] shadow-[0_28px_48px_-22px_rgba(45,58,46,0.45)]"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%) rotate(-2deg)',
                  }}
                >
                  <Image
                    src="/skills-map-cover.jpg"
                    alt=""
                    width={800}
                    height={1067}
                    quality={95}
                    priority
                    unoptimized
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>

                {/* 8 activity covers — fanned around Skills Map at all viewports */}
                {HERO_CARDS.map((card, i) => {
                  const pos = CARD_POSITIONS[i];
                  const baseTransform = pos.style.transform || '';
                  const rotation = `rotate(${pos.rotate}deg)`;
                  const finalTransform = baseTransform ? `${baseTransform} ${rotation}` : rotation;
                  return (
                    <div
                      key={card.slug}
                      className="absolute w-[112px] sm:w-[140px] lg:w-[170px] aspect-[4/5] rounded-[10px] overflow-hidden border border-[#D8D4C5] bg-cream shadow-[0_16px_28px_-22px_rgba(45,58,46,0.42)] hover:shadow-[0_26px_42px_-22px_rgba(45,58,46,0.5)] hover:z-30 transition-all duration-250"
                      style={{
                        ...pos.style,
                        transform: finalTransform,
                        zIndex: pos.z,
                      }}
                    >
                      <Image
                        src={`/products/${card.slug}.jpg`}
                        alt=""
                        width={400}
                        height={500}
                        quality={95}
                        unoptimized
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>
                  );
                })}

                {/* 120+ sticker */}
                <div className="absolute right-[-40px] bottom-[-30px] sm:right-[-40px] sm:bottom-[-30px] max-sm:right-2 max-sm:bottom-2 w-[120px] h-[120px] max-sm:w-[96px] max-sm:h-[96px] rounded-full bg-[#C97B5C] text-cream grid place-items-center font-display italic text-center leading-[1.06] text-[16px] max-sm:text-[13px] rotate-[8deg] shadow-[0_14px_26px_-10px_rgba(201,123,92,0.55)] z-[6] p-2.5">
                  <span>
                    <span className="block text-[28px] max-sm:text-2xl mb-1">120+</span>
                    activities
                    <span className="block text-[10px] not-italic uppercase tracking-[0.15em] opacity-95 mt-1 font-semibold font-body">One membership</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            02 PROBLEM — What if (forward-looking, distinct from /join's "quiet worry")
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
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
        <section className="py-20 md:py-24">
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
                  You open a guide on your phone. Read a quick intro. Grab whatever you already have at home.
                  Then you and your kid <span className="font-display italic text-forest">do something real together</span>. Cook a meal, build a budget,
                  plan a road trip, start a business.
                </p>
                <p className="text-lg leading-relaxed text-gray-700">
                  Every activity has <span className="font-display italic text-forest">three built-in skill levels</span> so siblings
                  can work side by side without anyone feeling overwhelmed or under-challenged.
                </p>
                <p className="text-lg leading-relaxed text-gray-700">
                  No lesson plans. No grading. No prep that takes longer than the activity itself.
                  Just <span className="font-display italic text-forest">quality time that quietly builds real skills.</span>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            04 CATEGORIES — Chip grid
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  What&apos;s inside
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  Nine categories. <span className="italic text-forest">One library.</span>
                </h2>
                <p className="mt-4 text-lg text-gray-500">120+ activities across the skills school can&apos;t always make room for. More categories coming soon.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-[960px] mx-auto">
              {CATEGORIES.map((cat, i) => (
                <ScrollReveal key={cat.name} delay={i * 50}>
                  <Link
                    href={`/shop#track-${cat.slug}`}
                    className="group block rounded-[14px] overflow-hidden border border-[#D8D4C5] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-22px_rgba(45,58,46,0.3)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
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
                    <div className={`flex items-center gap-2.5 px-4 h-[52px] bg-gradient-to-br ${cat.gradient}`}>
                      <span className="w-[28px] h-[28px] rounded-md bg-white/[0.22] grid place-items-center text-white text-sm shrink-0">{cat.icon}</span>
                      <h3 className="font-display text-[14px] leading-tight tracking-tight text-white">{cat.name}</h3>
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
                  Browse all activities in the library
                  <span className="font-display italic text-lg leading-none">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 HOW IT WORKS — Three steps
        ════════════════════════════════════════ */}
        <section className="py-20 md:py-24" id="how-it-works">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-14">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  How it works
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
                  Three steps. <span className="italic text-forest">That&apos;s it.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { num: '1', title: 'Plan your next activities', body: 'Add a few to your plan in under a minute. Pick from 120+, by category, age, or time.' },
                { num: '2', title: 'Open on any device', body: 'Pull it up on your phone, tablet, or laptop. Skim the parent prep and grab what you need.' },
                { num: '3', title: 'Do it side by side', body: 'Follow the guide with your kid. Built-in prompts tell you what to say, what to ask, and what comes next.' },
              ].map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 100} className="h-full">
                  <div className="h-full border border-[#D8D4C5] rounded-[14px] bg-cream p-8 pt-8">
                    <div className="w-12 h-12 rounded-full bg-[#E6EBDF] border border-forest text-forest-dark grid place-items-center font-display italic text-2xl mb-5">
                      {step.num}
                    </div>
                    <h3 className="font-display text-[26px] leading-tight tracking-tight mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-[15.5px] leading-relaxed">{step.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06 MEET AMELIE — Founder bio (trust before the ask)
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] pt-20 md:pt-24 pb-14 md:pb-16">
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
            06b TESTIMONIALS — Founder credibility (in their words)
        ════════════════════════════════════════ */}
        <Testimonials />

        {/* ════════════════════════════════════════
            07 FREE GUIDE — Primary soft conversion (email capture).
            Placed AFTER Meet Amelie so visitors meet the person behind the
            guide before being asked for their email — the ask lands as
            "Amelie made this, let me try it" instead of a cold capture.
        ════════════════════════════════════════ */}
        <section className="py-20 md:py-24" id="free-guide">
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
            08 MEMBERSHIP OFFER — Light, invitational (heavy sell on /join)
        ════════════════════════════════════════ */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[860px] mx-auto bg-cream border border-[#D8D4C5] rounded-[20px] p-10 md:p-14 text-center shadow-[0_30px_60px_-40px_rgba(45,58,46,0.4)] relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C97B5C] via-[#E9C76B] to-forest" />
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Going further
                </p>
                <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  When you&apos;re ready: <span className="italic text-forest">unlimited access.</span>
                </h2>
                <div className="mt-5 mx-auto max-w-[580px] text-gray-500 text-[17px] leading-relaxed space-y-3">
                  <p>
                    The membership unlocks the full library: all 120+ activities, all nine
                    categories, new ones added every quarter. One simple price, no upsells,
                    no tracking your kids.
                  </p>
                  <p>
                    {m.isFounderPhase ? (
                      <>
                        Founding members (first {m.founderCap}) pay just{' '}
                        <span className="font-display italic text-[#C97B5C] text-lg">{m.priceMonth}</span>,
                        billed once a year at {m.priceYear}, locked in for life.{' '}
                        After that, ${POST_FOUNDER_PRICE_USD}. Prefer to go month to month?{' '}
                        {MONTHLY_PLAN_PRICE_MONTH}, cancel anytime.
                      </>
                    ) : (
                      <>
                        Membership is just{' '}
                        <span className="font-display italic text-[#C97B5C] text-lg">{m.priceMonth}</span>,
                        billed once a year at {m.priceYear}, or {MONTHLY_PLAN_PRICE_MONTH} month
                        to month.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex justify-center mt-8">
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-3.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-base shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_10px_24px_-12px_rgba(58,90,64,0.5),0_2px_0_rgba(45,58,46,0.05)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                  >
                    See what&apos;s in the membership
                    <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-white/[0.18]">&rarr;</span>
                  </Link>
                </div>
                <div className="mt-3.5 text-[13.5px] text-gray-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span>14-day money-back guarantee</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-gray-300 inline-block" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            09 FAQ — 4 homepage-relevant questions
        ════════════════════════════════════════ */}
        <section className="py-20 md:py-24">
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
        <section className="bg-gradient-to-b from-cream to-[#F2EFE4] border-t border-[#D8D4C5] py-20 md:py-24">
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
