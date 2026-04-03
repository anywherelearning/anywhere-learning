import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import FAQSection from '@/components/shared/FAQSection';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SocialProofTicker from '@/components/shared/SocialProofTicker';
import HomepageBundleCarousel from '@/components/home/HomepageBundleCarousel';
import EmailForm from '@/components/EmailForm';
import { coreFaqItems } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'Anywhere Learning — Meaningful Learning, Wherever You Are',
  description:
    'No-prep activity guides for homeschool and worldschool families. Real-world learning that meets your kids where they are.',
  alternates: {
    canonical: 'https://anywherelearning.co',
  },
};

const featuredProducts = [
  {
    name: 'The Future-Ready Skills Map',
    slug: 'future-ready-skills-map',
    shortDescription:
      'The 10 future-ready skills mapped by age, with activities, milestones, and sample weeks.',
    priceCents: 999,
    compareAtPriceCents: null,
    imageUrl: '/products/future-ready-skills-map.jpg',
    category: 'start-here',
    isBundle: false,
    activityCount: null,
    ageRange: 'Ages 0–14+',
    isFreeWithBundle: true,
  },
  {
    name: 'Full Seasonal Bundle',
    slug: 'seasonal-bundle',
    shortDescription:
      'All 4 seasonal packs — 80 outdoor activities for every time of year.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/four-seasons-bundle.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 80,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Creativity Mega Bundle',
    slug: 'creativity-mega-bundle',
    shortDescription:
      'All 10 Creativity Anywhere activities — design, build, and create without limits.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-creativity.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Real-World Relevance Mega Bundle',
    slug: 'real-world-mega-bundle',
    shortDescription:
      'All 10 Real-World Relevance challenges — life skills, financial literacy, and project-based learning.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-real-world.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 9–14',
  },
  {
    name: 'AI & Digital Literacy Bundle',
    slug: 'ai-digital-bundle',
    shortDescription:
      'All 10 AI & Digital Literacy activities — responsible tech, critical thinking, and digital citizenship.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-ai-digital.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 9–14',
  },
  {
    name: 'Real-World Math Mega Bundle',
    slug: 'real-world-math-bundle',
    shortDescription:
      'All 10 Real-World Math guides — budgeting, planning, and problem-solving with real numbers.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-real-world-math.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Communication & Writing Bundle',
    slug: 'communication-writing-bundle',
    shortDescription:
      'All 10 Communication & Writing guides — storytelling, debate, interviews, and more.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-communication-writing.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Entrepreneurship Mega Bundle',
    slug: 'entrepreneurship-bundle',
    shortDescription:
      'All 10 Entrepreneurship guides — brand building, pitching, marketing, and real business skills.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-entrepreneurship.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Planning & Problem-Solving Bundle',
    slug: 'planning-problem-solving-bundle',
    shortDescription:
      'All 10 Planning & Problem-Solving guides — survival, decision-making, and thinking ahead.',
    priceCents: 4499,
    compareAtPriceCents: 5999,
    imageUrl: '/products/mega-bundle-planning-problem-solving.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 6–14',
  },
  {
    name: 'Outdoor & Nature Mega Bundle',
    slug: 'outdoor-mega-bundle',
    shortDescription:
      'All 7 outdoor & nature packs — task cards, missions, STEM challenges, land art, and more.',
    priceCents: 4199,
    compareAtPriceCents: 5593,
    imageUrl: '/products/mega-bundle-outdoor.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 7,
    ageRange: 'Ages 6–14',
  },
];

const homepageFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: coreFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function HomePage() {
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

        {/* ═══════════════════════════════════════════
            HERO — Punchy, warm, direct
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px]">
          {/* Full-bleed background image */}
          <Image
            src="/hero.jpg"
            alt="Children exploring and learning together outdoors"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            priority
          />
          {/* Gradient overlay — heavier on the left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/30 lg:from-cream/95 lg:via-cream/70 lg:to-transparent" />
          {/* Bottom fade to cream */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream to-transparent" />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-12 md:py-16 lg:py-20">
            <div className="max-w-xl lg:max-w-2xl">
              <div className="hero-stagger">
                <p className="text-xs sm:text-sm font-semibold text-gold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-5">
                  For Homeschool &amp; Worldschool Families
                </p>
                <h1 className="font-display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.2rem] leading-[1.05] mb-6">
                  <span className="text-forest heading-underline">Meaningful Learning</span>
                  <br /><span className="text-gold">Happens Everywhere</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                  No-prep activity guides you open on any device and follow
                  along with your kids. Real-world learning in 15 minutes &mdash; from $5.99.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl text-lg"
                  >
                    Get the Activity Packs
                  </Link>
                  <Link
                    href="/free-guide"
                    className="inline-flex items-center justify-center border-2 border-forest/30 hover:border-forest/50 text-forest font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:bg-forest/[0.06] text-lg backdrop-blur-sm"
                  >
                    Free Guide &rarr;
                  </Link>
                </div>
                {/* Trust signals */}
                <p className="mt-6 text-sm text-gray-500">
                  Instant download &middot; Ages 6&ndash;14 &middot; 48-hour money-back guarantee
                </p>
              </div>
            </div>
          </div>

          {/* Bottom transition */}
          <div className="h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
        </section>

        {/* ═══════════════════════════════════════════
            SOCIAL PROOF TICKER — Scrolling marquee
        ═══════════════════════════════════════════ */}
        <SocialProofTicker />

        {/* ═══════════════════════════════════════════
            PAIN POINTS — Compact emotional hook
        ═══════════════════════════════════════════ */}
        <section className="bg-forest-section py-14 md:py-16 relative overflow-hidden">
          <div className="absolute top-6 right-[10%] w-48 h-48 rounded-full border border-white/[0.04]" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
            <ScrollReveal>
              <p className="text-sm sm:text-base font-semibold text-gold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center mb-8">
                Every homeschool parent&apos;s week
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-8 md:gap-12 text-center sm:text-left">
              <ScrollReveal delay={0}>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-cream/90 leading-snug mb-2">
                    200 Pinterest boards saved.
                  </h3>
                  <p className="text-cream/80 text-base">Still no plan for Monday.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-cream/90 leading-snug mb-2">
                    You found the perfect activity.
                  </h3>
                  <p className="text-cream/80 text-base">Prepping it took longer than doing it.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-cream/90 leading-snug mb-2">
                    You planned the whole week.
                  </h3>
                  <p className="text-cream/80 text-base">They lost interest by Tuesday.</p>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={400}>
              <p className="mt-10 font-display text-xl md:text-2xl text-gold text-center leading-snug">
                That&apos;s exactly why we made these.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PRODUCT SHOWCASE
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
                  Our Activity Packs
                </p>
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-forest mb-4 text-balance">
                  Activity Packs for Every Family
                </h2>
                <p className="mx-auto max-w-xl text-gray-500 text-lg">
                  Bundles save up to 25%. Pick the one that fits your family &mdash; or grab them all.
                </p>
              </div>
            </ScrollReveal>

            <HomepageBundleCarousel products={featuredProducts} />

            <ScrollReveal delay={400}>
              <div className="mt-14 text-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-cream font-semibold px-8 py-3.5 rounded-2xl transition-all duration-300 text-lg group shadow-md hover:shadow-lg"
                >
                  View all activity packs
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS — Dead simple
        ═══════════════════════════════════════════ */}
        <section className="bg-warm-gradient py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ScrollReveal>
              <h2 className="text-center font-display text-3xl md:text-5xl lg:text-6xl text-forest mb-4 text-balance">
                Three Steps. That&apos;s It.
              </h2>
              <p className="text-center text-gray-500 text-lg mb-16 max-w-md mx-auto">
                No onboarding. No learning curve. Just download and go.
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
              <ScrollReveal delay={0}>
                <div className="text-center group">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-forest/8 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="relative w-full h-full bg-white rounded-3xl shadow-md flex items-center justify-center border border-forest/10 group-hover:shadow-lg transition-shadow">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-forest">
                        <path d="M4 6H20M4 12H20M4 18H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M17 15L19 17L22 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="inline-block text-xs font-bold text-gold uppercase tracking-widest mb-2">Step 1</span>
                  <h3 className="text-xl font-semibold text-forest mb-2">Choose</h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Browse by category &mdash; nature, creativity, math, and more. Not sure where to start? Bundles cover everything.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="text-center group">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gold/12 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="relative w-full h-full bg-white rounded-3xl shadow-md flex items-center justify-center border border-gold/15 group-hover:shadow-lg transition-shadow">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold">
                        <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M9 7H15M9 10H15M9 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="inline-block text-xs font-bold text-gold uppercase tracking-widest mb-2">Step 2</span>
                  <h3 className="text-xl font-semibold text-forest mb-2">Open</h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Download. Open on any device. Done. No printing required — just follow along.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="text-center group">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-[#c4836a]/10 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="relative w-full h-full bg-white rounded-3xl shadow-md flex items-center justify-center border border-[#c4836a]/15 group-hover:shadow-lg transition-shadow">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#c4836a]">
                        <path d="M12 22C12 22 20 16 20 10C20 6 16.5 3 12 3C7.5 3 4 6 4 10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  </div>
                  <span className="inline-block text-xs font-bold text-gold uppercase tracking-widest mb-2">Step 3</span>
                  <h3 className="text-xl font-semibold text-forest mb-2">Go</h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Pick a card. Do it together. Watch your kids light up. That&apos;s the whole method.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHY FAMILIES CHOOSE THIS — Verifiable product facts
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ScrollReveal>
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] text-center mb-4">
                Built for real life
              </p>
              <h2 className="text-center font-display text-3xl md:text-5xl lg:text-6xl text-forest mb-6 text-balance">
                Built for How Your Family Actually Lives
              </h2>
              <p className="text-center text-gray-500 text-lg mb-16 max-w-xl mx-auto">
                No gimmicks, no fluff &mdash; just activity guides designed around the way your family actually learns.
              </p>
            </ScrollReveal>

            {/* Featured card */}
            <ScrollReveal>
              <div className="relative bg-forest-section rounded-3xl p-10 md:p-14 mb-8 shadow-2xl">
                <div className="flex items-start gap-5">
                  <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gold/20 items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-cream leading-snug mb-4">
                      Real Skills, Not Busywork
                    </h3>
                    <p className="text-cream/70 text-lg leading-relaxed max-w-2xl">
                      Kids cook a meal on a budget, build a birdhouse, plan a neighbourhood clean-up,
                      learn how AI works. Skills they&apos;ll actually use &mdash; through activities that feel like play.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Two supporting cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={0}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-forest/8 flex items-center justify-center mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-forest">
                      <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 3.12598C17.7252 3.57004 19 5.13616 19 7C19 8.86384 17.7252 10.43 16 10.874" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-2">Works for Ages 6&ndash;14</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    Every activity includes adaptation notes so siblings at different levels
                    can do the same thing together.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gold">
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.05078 11.0002C3.27441 7.10088 5.72266 3.55127 9.5 2.14648" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14.5 2.14648C18.2773 3.55127 20.7256 7.10088 20.9492 11.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M20.9492 13C20.5977 17.3389 17.1309 20.8057 12.792 21.1572" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M11.208 21.1572C6.86914 20.8057 3.40234 17.3389 3.05078 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-2">Use Year After Year</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    These aren&apos;t one-time worksheets. Come back to the same activities as your
                    kids grow &mdash; they&apos;ll get something new every time.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MEET THE MAKER — Personal brand
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
              <ScrollReveal direction="left">
                <div className="relative mx-auto md:mx-0 w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                  <Image
                    src="/amelie.jpg"
                    alt="Amelie and her kids on a mountain hike"
                    fill
                    sizes="(max-width: 768px) 192px, 256px"
                    className="object-cover rounded-3xl shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-full h-full rounded-3xl border-2 border-gold/20 -z-10" />
                </div>
              </ScrollReveal>

              {/* Text */}
              <ScrollReveal direction="right" delay={150}>
                <div>
                  <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-3">
                    Meet the Maker
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-forest mb-5">
                    Hi, I&apos;m Amelie.
                  </h2>
                  <div className="space-y-4 text-gray-500 text-lg leading-relaxed">
                    <p>
                      I spent 15 years as a teacher, and I loved watching kids
                      light up when something clicked. But the longer I was in
                      the classroom, the harder it became to ignore what
                      wasn&apos;t working &mdash; kids who walked in loving to
                      learn were slowly checking out.
                    </p>
                    <p>
                      When it came time to choose for my own kids, I chose
                      differently. We took seven months to travel as a family,
                      and I noticed something shift &mdash; they were curious
                      again, figuring things out on their own, learning without
                      even realizing it.
                    </p>
                    <p>
                      I left the classroom for good and started creating the
                      activities I wished the system offered &mdash; hands-on,
                      real-world, zero prep. Things that feel like play but
                      build real skills.
                    </p>
                    <p className="text-forest font-semibold">
                      That&apos;s what became Anywhere Learning. Now your family can have them too.
                    </p>
                  </div>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-forest font-medium text-base mt-4 group"
                  >
                    Read my full story
                    <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════ */}
        <section className="bg-warm-gradient py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <ScrollReveal>
              <h2 className="text-center font-display text-3xl md:text-5xl text-forest mb-12 text-balance">
                Questions? We&apos;ve Got Answers.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <FAQSection items={coreFaqItems} />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="mt-10 text-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-forest font-semibold text-lg group hover:text-forest-dark transition-colors"
                >
                  Browse the Activity Packs
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            EMAIL CAPTURE — Soft opt-in for visitors not ready to buy
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <ScrollReveal>
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
                Free Resource
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-forest mb-4 text-balance">
                Not Sure Where to Start?
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                Grab the free guide &mdash; 10 real-world activities you can try this week
                with zero prep. See if this approach works for your family.
              </p>
              <EmailForm variant="light" />
              <p className="mt-5 text-sm text-gray-400 flex items-center justify-center gap-2">
                <span className="flex -space-x-1.5">
                  {['#8faa8b', '#d4a373', '#c4836a'].map((c, i) => (
                    <span key={i} className="w-5 h-5 rounded-full border-2 border-cream inline-block" style={{ backgroundColor: c }} />
                  ))}
                </span>
                Join families learning differently
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FINAL CTA — Bold, warm
        ═══════════════════════════════════════════ */}
        <section className="relative bg-forest-texture py-20 md:py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.04]" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.03]" aria-hidden="true" />

          <div className="relative mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-6xl text-cream mb-5">
                Start This Week.
              </h2>
              <p className="text-lg text-cream/80 mb-10 leading-relaxed max-w-lg mx-auto">
                Pick a pack, open it on your phone or tablet, and do the first activity together.
                No planning, no prep &mdash; just 15 minutes and your kids.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-gray-900 font-semibold py-4 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-lg shadow-lg hover:shadow-xl"
              >
                Get the Activity Packs
              </Link>
              <p className="mt-8 text-cream/80 text-sm">
                48-hour money-back guarantee &middot; Instant download &middot; Use year after year
              </p>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
