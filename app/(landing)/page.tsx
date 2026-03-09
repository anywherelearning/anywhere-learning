import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProductCard from '@/components/shop/ProductCard';
import FAQSection from '@/components/shared/FAQSection';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SocialProofTicker from '@/components/shared/SocialProofTicker';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import BundleCarousel from '@/components/shop/BundleCarousel';
import PeekInsidePack from '@/components/shared/PeekInsidePack';
import EmailForm from '@/components/EmailForm';

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
    name: 'Full Seasonal Bundle',
    slug: 'seasonal-bundle',
    shortDescription:
      'All 4 seasonal packs — 80 outdoor activities for every time of year.',
    priceCents: 4999,
    compareAtPriceCents: 2995,
    imageUrl: '/products/four-seasons-bundle.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 80,
    ageRange: 'Ages 4–14',
  },
  {
    name: 'Creativity Mega Bundle',
    slug: 'creativity-mega-bundle',
    shortDescription:
      'All 10 Creativity Anywhere projects — design, build, and create without limits.',
    priceCents: 2999,
    compareAtPriceCents: 4990,
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
    priceCents: 2999,
    compareAtPriceCents: 4990,
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
    priceCents: 2999,
    compareAtPriceCents: 4990,
    imageUrl: '/products/mega-bundle-ai-digital.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: 10,
    ageRange: 'Ages 9–14',
  },
  {
    name: 'Nature Art Bundle',
    slug: 'nature-art-bundle',
    shortDescription:
      'Land Art + Nature Crafts + Nature Journal — turn the outdoors into an art studio.',
    priceCents: 2999,
    compareAtPriceCents: 1497,
    imageUrl: '/products/nature-art-bundle.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: null,
    ageRange: 'Ages 4–14',
  },
  {
    name: 'Outdoor Toolkit Bundle',
    slug: 'outdoor-toolkit-bundle',
    shortDescription:
      'Nature Walk Cards + Missions + STEM Challenges + Choice Boards — your complete outdoor toolkit.',
    priceCents: 2999,
    compareAtPriceCents: 1996,
    imageUrl: '/products/outdoor-toolkit-bundle.jpg',
    category: 'bundle',
    isBundle: true,
    activityCount: null,
    ageRange: 'Ages 4–14',
  },
];

const testimonials = [
  {
    quote:
      'My kids asked to do activities every single day. That has never happened before.',
    name: 'Sarah M.',
    location: 'Tennessee, homeschool family of 3',
  },
  {
    quote:
      'We took these on our road trip and the kids were engaged the entire drive.',
    name: 'Mia R.',
    location: 'Colorado, worldschool family of 4',
  },
  {
    quote:
      'I stopped planning and started living. These packs gave me permission to let go of the curriculum guilt.',
    name: 'Jen K.',
    location: 'Oregon, eclectic homeschool',
  },
];

const faqItems = [
  {
    question: 'What ages are these for?',
    answer:
      'Every activity pack includes adaptation notes for ages 4\u201314. Younger kids work alongside a parent; older kids can tackle activities independently.',
  },
  {
    question: 'Do I need to follow a specific schedule or curriculum?',
    answer:
      'Nope. These are standalone activity cards. Pick one when you have 15 minutes or spend a whole afternoon. There\u2019s no sequence, no lesson plan, no curriculum to follow.',
  },
  {
    question: 'What if my kids don\u2019t like it?',
    answer:
      'We\u2019re confident they will, but if not, email us within 14 days for a full refund. No questions asked.',
  },
  {
    question: 'How is this different from free printables I can find online?',
    answer:
      'These aren\u2019t worksheets. They\u2019re real-world activity cards that get kids doing things \u2014 cooking, budgeting, building, exploring outside. No fill-in-the-blanks, no busywork.',
  },
  {
    question: 'Can I use these with multiple kids at different ages?',
    answer:
      'Absolutely. Every activity includes adaptation notes so siblings can do the same activity at their own level. Families with kids ages 4\u201314 use these together.',
  },
];

const counterStats = [
  { end: 220, suffix: '+', label: 'Activities', duration: 2200 },
  { end: 500, suffix: '+', label: 'Families', duration: 2500 },
  { end: 7, suffix: '', label: 'Categories', duration: 1800 },
  { end: 14, suffix: '-day', label: 'Guarantee', duration: 1600 },
];

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Anywhere Learning',
  url: 'https://anywherelearning.co',
  logo: 'https://anywherelearning.co/logo.png',
  description: 'No-prep activity guides for homeschool and worldschool families. Real-world learning that meets your kids where they are.',
  email: 'info@anywherelearning.co',
  sameAs: [
    'https://ca.pinterest.com/anywherelearning/',
  ],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Anywhere Learning',
  url: 'https://anywherelearning.co',
};

const homepageFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqLd) }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">

        {/* ═══════════════════════════════════════════
            HERO — Punchy, warm, direct
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Warm golden-hour gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-[#f7f0e4] to-[#f0ead8]" />
          {/* Subtle warm light glow */}
          <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(ellipse_at_70%_30%,rgba(212,163,115,0.15)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_20%_80%,rgba(88,129,87,0.06)_0%,transparent_60%)]" />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 md:py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Text content — punchier */}
              <div className="hero-stagger max-w-xl">
                <p className="text-xs sm:text-sm font-semibold text-gold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-5">
                  For Homeschool &amp; Worldschool Families
                </p>
                <h1 className="font-display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.2rem] leading-[1.05] text-forest mb-6">
                  <span className="heading-underline">Meaningful</span>
                  <br />Learning Happens
                  <br /><span className="text-gold">Everywhere</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
                  Stop planning. Start living. Activity guides that
                  turn your everyday life into the richest education your
                  kids will ever get.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl text-lg animate-pulse-glow"
                  >
                    Get the Activity Packs
                  </Link>
                  <Link
                    href="/free-guide"
                    className="inline-flex items-center justify-center border-2 border-forest/20 hover:border-forest/40 text-forest font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:bg-forest/[0.04] text-lg"
                  >
                    Free Guide &rarr;
                  </Link>
                </div>
                {/* Micro social proof */}
                <p className="mt-6 text-sm text-gray-400 flex items-center gap-2">
                  <span className="flex -space-x-1.5">
                    {['#8faa8b', '#d4a373', '#c4836a', '#588157'].map((c, i) => (
                      <span key={i} className="w-6 h-6 rounded-full border-2 border-cream inline-block" style={{ backgroundColor: c }} />
                    ))}
                  </span>
                  Trusted by 500+ families worldwide
                </p>
              </div>

              {/* Right: Warm lifestyle illustration */}
              {/* TIP: Replace this entire div with <Image src="/hero.jpg" ... /> when you have a real photo */}
              <div className="relative hidden lg:block" aria-hidden="true">
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  {/* Warm golden-hour sky gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f0d9b5] via-[#e8c99a] to-[#8faa8b]" />
                  {/* Sun glow */}
                  <div className="absolute top-[15%] right-[25%] w-24 h-24 rounded-full bg-[#f5deb3] blur-2xl opacity-80" />
                  <div className="absolute top-[18%] right-[27%] w-14 h-14 rounded-full bg-[#faf0dc] blur-sm opacity-90" />
                  {/* Distant hills */}
                  <svg className="absolute bottom-0 w-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                    <path d="M0 140 Q60 90 120 120 T240 100 T360 115 T400 105 V200 H0Z" fill="#6b8e6b" opacity="0.5"/>
                    <path d="M0 160 Q80 120 160 145 T320 130 T400 140 V200 H0Z" fill="#588157" opacity="0.7"/>
                    <path d="M0 175 Q50 155 120 165 T280 158 T400 170 V200 H0Z" fill="#3d5c3b" opacity="0.85"/>
                    <path d="M0 185 Q100 175 200 180 T400 178 V200 H0Z" fill="#2d4a2b"/>
                  </svg>
                  {/* Simple tree silhouettes */}
                  <svg className="absolute bottom-[15%] left-[10%] w-16 h-24" viewBox="0 0 60 90" fill="#2d4a2b">
                    <ellipse cx="30" cy="30" rx="22" ry="28"/>
                    <rect x="27" y="50" width="6" height="35" rx="2"/>
                  </svg>
                  <svg className="absolute bottom-[18%] right-[8%] w-12 h-20" viewBox="0 0 60 90" fill="#3d5c3b" opacity="0.8">
                    <ellipse cx="30" cy="28" rx="18" ry="24"/>
                    <rect x="27" y="46" width="6" height="35" rx="2"/>
                  </svg>
                  {/* Parent + child silhouette walking */}
                  <svg className="absolute bottom-[12%] left-[35%] w-20 h-20" viewBox="0 0 80 80" fill="#2d4a2b">
                    <circle cx="30" cy="12" r="7"/>
                    <path d="M30 19 L30 48 M30 28 L18 38 M30 28 L42 34 M30 48 L22 68 M30 48 L38 68" stroke="#2d4a2b" strokeWidth="4" strokeLinecap="round" fill="none"/>
                    <circle cx="55" cy="25" r="5"/>
                    <path d="M55 30 L55 50 M55 36 L47 43 M55 36 L63 42 M55 50 L49 64 M55 50 L61 64" stroke="#2d4a2b" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <path d="M42 34 L47 43" stroke="#2d4a2b" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </svg>
                  {/* Birds */}
                  <svg className="absolute top-[22%] left-[15%]" width="30" height="12" viewBox="0 0 30 12" fill="none">
                    <path d="M2 8 Q8 2 14 8" stroke="#5a4a3a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                    <path d="M16 6 Q22 1 28 6" stroke="#5a4a3a" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </div>
                {/* Frame overlay */}
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-3xl border-2 border-gold/20 -z-10" />
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
            PROBLEM — Pure typography, no cards
        ═══════════════════════════════════════════ */}
        <section className="bg-forest-section py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full border border-white/[0.04]" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/[0.03]" aria-hidden="true" />

          <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
            <ScrollReveal>
              <p className="text-cream/40 text-sm font-semibold uppercase tracking-[0.2em] mb-8 md:mb-10">
                Sound familiar?
              </p>
            </ScrollReveal>

            {/* Pain points as bold typographic statements */}
            <div className="space-y-10 md:space-y-14">
              <ScrollReveal delay={0}>
                <div className="group">
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream/90 leading-[1.15] mb-3">
                    You&apos;ve saved 200 Pinterest boards
                  </h3>
                  <p className="text-cream/40 text-lg md:text-xl max-w-lg">
                    and still don&apos;t know what to do Monday morning.
                  </p>
                </div>
              </ScrollReveal>

              {/* Divider */}
              <div className="w-16 h-px bg-cream/10" aria-hidden="true" />

              <ScrollReveal delay={100}>
                <div className="md:pl-16 lg:pl-24">
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream/90 leading-[1.15] mb-3">
                    The worksheets get done
                  </h3>
                  <p className="text-cream/40 text-lg md:text-xl max-w-lg">
                    but nobody&apos;s excited. Your kid sighs when you say &ldquo;time for school.&rdquo;
                  </p>
                </div>
              </ScrollReveal>

              <div className="w-16 h-px bg-cream/10 md:ml-16 lg:ml-24" aria-hidden="true" />

              <ScrollReveal delay={200}>
                <div className="md:pl-32 lg:pl-48">
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream/90 leading-[1.15] mb-3">
                    Sunday night lesson prep
                  </h3>
                  <p className="text-cream/40 text-lg md:text-xl max-w-lg">
                    became a second job. You chose homeschooling for freedom &mdash; not this.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Transition */}
            <ScrollReveal delay={300}>
              <div className="mt-16 md:mt-20 pt-10 border-t border-cream/10">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl text-gold leading-snug max-w-xl">
                  What if the learning was already happening &mdash; and you just needed a way to see it?
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PERMISSION SHIFT — The emotional turn
        ═══════════════════════════════════════════ */}
        <section id="about" className="bg-cream py-20 md:py-28 overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Big typography statement */}
              <ScrollReveal direction="left">
                <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-forest leading-[1.1] text-balance">
                  The learning is already happening.
                  <span className="block text-gold mt-2">You just can&apos;t see it yet.</span>
                </h2>
              </ScrollReveal>

              {/* Right: Body text */}
              <ScrollReveal direction="right" delay={200}>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl leading-relaxed text-gray-500">
                    Cooking dinner? That&apos;s maths. A puddle walk? Science.
                    Planning a road trip? Geography, budgeting, decision-making.
                    The world is the curriculum &mdash; you just need activities
                    that make it click.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed text-gray-600 font-medium">
                    You don&apos;t need another subscription box or a 36-week plan.
                    You need something that works with{' '}
                    <span className="font-display text-2xl md:text-3xl text-forest">
                      your life, not against it
                    </span>.
                  </p>
                  {/* Methodology pills */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {['Charlotte Mason', 'Montessori', 'Worldschool', 'Unschool', 'Eclectic'].map((style) => (
                      <span key={style} className="inline-flex items-center gap-2 text-sm font-medium text-forest/70 bg-forest/[0.06] px-4 py-2 rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PEEK INSIDE — Show, don't tell
        ═══════════════════════════════════════════ */}
        <section className="bg-warm-gradient py-20 md:py-28">
          <ScrollReveal>
            <div className="text-center mb-14 px-5">
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
                Peek Inside a Pack
              </p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-forest mb-4 text-balance">
                See what your kids will actually be doing.
              </h2>
              <p className="mx-auto max-w-xl text-gray-500 text-lg">
                Not worksheets. Not lectures. Real activities they&apos;ll beg to do again.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <PeekInsidePack />
          </ScrollReveal>
        </section>

        {/* ═══════════════════════════════════════════
            ANIMATED STATS — Dopamine numbers
        ═══════════════════════════════════════════ */}
        <AnimatedCounter items={counterStats} />

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
                  Grab a Pack. Open. Go.
                </h2>
                <p className="mx-auto max-w-xl text-gray-500 text-lg">
                  Each pack is a step-by-step guide you follow on any device. No prep. No extra materials. Just open and start.
                </p>
              </div>
            </ScrollReveal>

            <BundleCarousel products={featuredProducts} />

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
            TESTIMONIALS — Editorial magazine layout
        ═══════════════════════════════════════════ */}
        <section className="bg-warm-gradient py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ScrollReveal>
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] text-center mb-4">
                Don&apos;t take our word for it
              </p>
              <h2 className="text-center font-display text-3xl md:text-5xl lg:text-6xl text-forest mb-16 text-balance">
                Hear It From Families
                <br className="hidden sm:block" /> Who Made the Leap
              </h2>
            </ScrollReveal>

            {/* Featured large testimonial */}
            <ScrollReveal>
              <blockquote className="relative bg-forest-section rounded-3xl p-10 md:p-14 mb-8 shadow-2xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-cream/15 mb-6">
                  <path d="M11 7.5C11 9.433 9.433 11 7.5 11C6.571 11 4 11 4 14.5C4 18 6.5 19 7.5 19C9.433 19 11 17.433 11 15.5V7.5Z" fill="currentColor"/>
                  <path d="M20 7.5C20 9.433 18.433 11 16.5 11C15.571 11 13 11 13 14.5C13 18 15.5 19 16.5 19C18.433 19 20 17.433 20 15.5V7.5Z" fill="currentColor"/>
                </svg>
                <p className="font-display text-2xl sm:text-3xl md:text-4xl text-cream leading-snug mb-8">
                  {testimonials[2].quote}
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/30 flex items-center justify-center text-cream font-semibold text-sm">
                    {testimonials[2].name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-cream font-medium block text-sm">{testimonials[2].name}</span>
                    <span className="text-cream/50 text-sm">{testimonials[2].location}</span>
                  </div>
                </footer>
              </blockquote>
            </ScrollReveal>

            {/* Two smaller testimonials */}
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.slice(0, 2).map((t, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                  <blockquote className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} width="18" height="18" viewBox="0 0 24 24" fill="#d4a373">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed italic mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 text-sm block">{t.name}</span>
                        <span className="text-gray-400 text-sm">{t.location}</span>
                      </div>
                    </footer>
                  </blockquote>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS — Dead simple
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-28">
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
                    Pick a pack that matches your family. Or just grab them all &mdash; most families do.
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
              <FAQSection items={faqItems} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            EMAIL CAPTURE — Lead magnet pitch
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <ScrollReveal>
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
                Free Resource
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-forest mb-4 text-balance">
                10 Life Skills Your Kids Can Learn This Week
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                A free guide with 10 real-world life skills and activities your kids
                can try this week — no curriculum, no prep, no screen time.
              </p>
              <EmailForm variant="light" />
              <p className="mt-5 text-sm text-gray-400 flex items-center justify-center gap-2">
                <span className="flex -space-x-1.5">
                  {['#8faa8b', '#d4a373', '#c4836a'].map((c, i) => (
                    <span key={i} className="w-5 h-5 rounded-full border-2 border-cream inline-block" style={{ backgroundColor: c }} />
                  ))}
                </span>
                Join 500+ families learning differently
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MEET THE MAKER — Personal brand
        ═══════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
              {/* Photo placeholder — replace with real headshot */}
              <ScrollReveal direction="left">
                <div className="relative mx-auto md:mx-0 w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                  {/* TIP: Replace this with <Image src="/amelie.jpg" ... /> */}
                  <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#e8d5bc] via-[#d4b896] to-[#c4a07a] flex items-center justify-center shadow-xl overflow-hidden">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
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
                      I&apos;m a worldschooling mom who got tired of choosing between
                      a rigid curriculum that killed curiosity and &ldquo;free play&rdquo;
                      days where I secretly worried they weren&apos;t learning anything.
                    </p>
                    <p>
                      So I made the activity cards I wished existed &mdash; things that
                      feel like play but build real skills. Cooking, exploring, creating,
                      questioning. No prep. No guilt. Just connection.
                    </p>
                    <p className="text-forest font-semibold">
                      These packs are what I wish I&apos;d had from day one. Now your family can have them too.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FINAL CTA — Bold, urgent
        ═══════════════════════════════════════════ */}
        <section className="relative bg-forest-texture py-20 md:py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.04]" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.03]" aria-hidden="true" />

          <div className="relative mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-6xl text-cream mb-5">
                Your kids are ready.<br />Are you?
              </h2>
              <p className="text-lg text-cream/60 mb-10 leading-relaxed max-w-lg mx-auto">
                Every day without intentional activities is a day of untapped potential.
                Pick a pack. Open the guide. Start this week.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/shop"
                  className="bg-gold hover:bg-gold-light text-gray-900 font-semibold py-4 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-lg shadow-lg hover:shadow-xl animate-pulse-glow"
                >
                  Get the Activity Packs
                </Link>
                <Link
                  href="/free-guide"
                  className="border-2 border-cream/20 hover:border-cream/50 hover:bg-cream/[0.08] text-cream font-semibold py-4 px-10 rounded-2xl transition-all duration-300 text-lg"
                >
                  Or Grab the Free Guide
                </Link>
              </div>
              <p className="mt-8 text-cream/40 text-sm">
                14-day money-back guarantee &middot; Instant download &middot; Use year after year
              </p>
              <p className="mt-3 text-cream/25 text-xs">
                Most popular this month: Master Bundle
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
