import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProductCard from '@/components/shop/ProductCard';
import FAQSection from '@/components/shared/FAQSection';
import EmailForm from '@/components/EmailForm';

export const metadata: Metadata = {
  title: 'Anywhere Learning — Meaningful Learning, Wherever You Are',
  description:
    'Printable, no-prep activity packs for homeschool and worldschool families. Real-world learning that meets your kids where they are.',
};

const featuredProducts = [
  {
    name: 'Master Bundle (Everything)',
    slug: 'master-bundle',
    shortDescription:
      'Every activity pack we make — 220+ activities in one download.',
    priceCents: 8999,
    compareAtPriceCents: 19883,
    imageUrl: null,
    category: 'bundle',
    isBundle: true,
    activityCount: 220,
    ageRange: 'Ages 4–14',
  },
  {
    name: 'Full Seasonal Bundle',
    slug: 'seasonal-bundle',
    shortDescription:
      'All 4 seasonal packs — 80 outdoor activities for every time of year.',
    priceCents: 4999,
    compareAtPriceCents: 5996,
    imageUrl: null,
    category: 'bundle',
    isBundle: true,
    activityCount: 80,
    ageRange: 'Ages 4–14',
  },
  {
    name: 'Nature Journal & Walk Cards',
    slug: 'nature-journal-walks',
    shortDescription:
      '25 nature walk prompts and journaling activities that turn any outdoor walk into a rich observation and science experience.',
    priceCents: 999,
    compareAtPriceCents: null,
    imageUrl: null,
    category: 'nature',
    isBundle: false,
    activityCount: 25,
    ageRange: 'Ages 4–14',
  },
  {
    name: 'Spring Outdoor Learning Pack',
    slug: 'spring-outdoor-pack',
    shortDescription:
      "20 outdoor activities that use spring’s energy to build real-world skills.",
    priceCents: 1499,
    compareAtPriceCents: null,
    imageUrl: null,
    category: 'seasonal',
    isBundle: false,
    activityCount: 20,
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
      'Every activity pack includes adaptation notes for ages 4–14. Younger kids work alongside a parent; older kids can tackle activities independently.',
  },
  {
    question: 'Do I need to follow a specific schedule or curriculum?',
    answer:
      "Nope. These are standalone activity cards. Pick one when you have 15 minutes or spend a whole afternoon. There's no sequence, no lesson plan, no curriculum to follow.",
  },
  {
    question: "What if my kids don't like it?",
    answer:
      "We're confident they will, but if not, email us within 14 days for a full refund. No questions asked.",
  },
  {
    question: 'How is this different from free printables I can find online?',
    answer:
      "These aren't worksheets. They're real-world activity cards that get kids doing things — cooking, budgeting, building, exploring outside. No fill-in-the-blanks, no busywork.",
  },
  {
    question: 'Can I use these with multiple kids at different ages?',
    answer:
      'Absolutely. Every activity includes adaptation notes so siblings can do the same activity at their own level. Families with kids ages 4–14 use these together.',
  },
];

export default function HomePage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">
        {/* ─── Section 1: Hero ─── */}
        <section className="hero-dots relative overflow-hidden bg-cream pt-6 pb-12 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              {/* Left column: copy */}
              <div className="text-center md:text-left">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gold">
                  For Homeschool &amp; Worldschool Families
                </p>
                <h1 className="font-display text-5xl leading-tight text-forest md:text-7xl">
                  <span className="heading-accent">Meaningful Learning</span>,{' '}
                  <span className="block">Wherever You Are</span>
                </h1>
                <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-gray-600 md:mx-0 md:text-xl">
                  Printable, no-prep activity packs that turn everyday moments
                  into real learning. No curriculum. No worksheets. Just your
                  family and the world around you.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
                  <Link
                    href="/shop"
                    className="rounded-xl bg-forest px-8 py-4 text-lg font-semibold text-cream shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark hover:shadow-md"
                  >
                    Browse Activity Packs
                  </Link>
                  <Link
                    href="/free-guide"
                    className="rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-gray-900 transition-all duration-200 hover:bg-gold/90"
                  >
                    Get the Free Guide
                  </Link>
                </div>
                {/* Trust badges */}
                <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-500 md:justify-start">
                  <span className="flex items-center gap-1.5">
                    <span className="text-forest">✓</span> Instant PDF download
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-forest">✓</span> Ages 4–14
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-forest">✓</span> No prep required
                  </span>
                </div>
              </div>

              {/* Right column: stacked product mockups */}
              <div className="relative mx-auto hidden h-[420px] w-full max-w-md md:block">
                {/* Back card */}
                <div className="absolute left-8 top-6 h-[340px] w-[240px] rotate-[-4deg] rounded-2xl border border-forest/10 bg-white p-6 shadow-lg">
                  <div className="mx-auto mb-3 h-6 w-6 rounded-full bg-forest/20" />
                  <p className="text-center text-xs font-semibold leading-snug text-forest">
                    Spring Outdoor Pack
                  </p>
                  <div className="mt-3 space-y-1.5 px-2">
                    <div className="h-1 w-full rounded-full bg-gray-200" />
                    <div className="h-1 w-4/5 rounded-full bg-gray-200" />
                    <div className="h-1 w-3/5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* Middle card */}
                <div className="absolute left-20 top-3 h-[340px] w-[240px] rotate-[-1deg] rounded-2xl border border-forest/10 bg-white p-6 shadow-xl">
                  <div className="mx-auto mb-3 h-6 w-6 rounded-full bg-forest/20" />
                  <p className="text-center text-xs font-semibold leading-snug text-forest">
                    Nature Journal &amp; Walk Cards
                  </p>
                  <div className="mt-3 space-y-1.5 px-2">
                    <div className="h-1 w-full rounded-full bg-gray-200" />
                    <div className="h-1 w-4/5 rounded-full bg-gray-200" />
                    <div className="h-1 w-3/5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* Front card — floating */}
                <div className="animate-gentle-float absolute right-4 top-0 h-[340px] w-[240px] rotate-[2deg] rounded-2xl border-2 border-forest/15 bg-white p-6 shadow-2xl">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-forest">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="text-center font-display text-sm leading-snug text-forest">
                    Master Bundle
                  </p>
                  <p className="mt-1 text-center text-[10px] text-gray-400">
                    220+ activities
                  </p>
                  <div className="mt-4 space-y-1.5 px-2">
                    <div className="h-1 w-full rounded-full bg-gray-200" />
                    <div className="h-1 w-4/5 rounded-full bg-gray-200" />
                    <div className="h-1 w-3/5 rounded-full bg-gray-200" />
                    <div className="mt-3 h-1 w-4/5 rounded-full bg-gray-200" />
                    <div className="h-1 w-2/3 rounded-full bg-gray-200" />
                  </div>
                  {/* Gold badge */}
                  <div className="absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-md">
                    <span className="text-center text-[9px] font-bold leading-tight text-white">
                      BEST
                      <br />
                      VALUE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 2: The Problem ─── */}
        <section className="bg-gold-light/20 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="mb-4 text-center font-display text-3xl text-forest md:text-5xl">
              Does this sound familiar?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-center text-gray-500">
              You want your kids to be capable and confident — but structured
              lessons feel impossible with everything on your plate.
            </p>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  The Pinterest spiral
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You&apos;ve saved 200 boards and still don&apos;t know what to
                  do Monday morning.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  The worksheet groan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  The worksheets get done but nothing sticks — and nobody&apos;s
                  excited about learning.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-forest/0 via-forest/30 to-forest/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  The planning fatigue
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You spend more time planning than actually doing things
                  together as a family.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Permission Shift ─── */}
        <section id="about" className="relative bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="rounded-3xl border border-forest/10 bg-white p-8 shadow-sm md:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl text-forest md:text-5xl">
                  What if learning was already happening?
                </h2>
                <div className="mx-auto my-6 h-px w-16 bg-gold/50" />
                <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                  Cooking dinner is maths. A nature walk is science. Planning a
                  road trip is geography. The learning is already there — you just
                  need activities that make it intentional.
                </p>
                <p className="mt-6 rounded-xl bg-forest/5 px-6 py-4 text-lg font-medium text-forest md:text-xl">
                  You don&apos;t need more curriculum. You need activities that
                  turn what you&apos;re already doing into meaningful learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Product Showcase ─── */}
        <section className="bg-gold-light/20 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-12 text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gold">
                Our Activity Packs
              </p>
              <h2 className="font-display text-3xl text-forest md:text-5xl">
                <span className="heading-accent">Activity Packs</span> Your
                Family Will Actually Use
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-600">
                Printable cards. Real-world challenges. No prep required — just
                print, pick one, and start.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-8 py-4 text-lg font-semibold text-cream shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark hover:shadow-md"
              >
                View All Activity Packs
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Social Proof ─── */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="mb-3 text-center font-display text-3xl text-forest md:text-5xl">
              Families Are Already Learning Differently
            </h2>
            <p className="mx-auto mb-12 max-w-md text-center text-sm text-gray-500">
              Built by homeschoolers, for homeschoolers. Works beautifully with
              Charlotte Mason, Montessori, unschool, worldschool, and eclectic
              approaches.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Decorative quote mark */}
                  <span className="absolute -right-2 -top-2 font-display text-7xl text-forest/5" aria-hidden="true">
                    &ldquo;
                  </span>
                  <div className="mb-4 flex gap-0.5 text-gold" aria-hidden="true">
                    {'★★★★★'.split('').map((star, j) => (
                      <span key={j} className="text-sm">{star}</span>
                    ))}
                  </div>
                  <p className="relative text-base leading-relaxed text-gray-700 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 text-sm font-semibold text-forest">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.location}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 6: How It Works ─── */}
        <section className="bg-gold-light/20 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
            <h2 className="mb-4 font-display text-3xl text-forest md:text-5xl">
              Three Steps. That&apos;s It.
            </h2>
            <p className="mx-auto mb-12 max-w-md text-gray-500">
              No curriculum to learn. No schedule to follow. Just start.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Choose',
                  desc: 'Pick a pack that fits your family. Seasonal, creative, nature, real-world — or grab them all.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Print',
                  desc: 'Download the PDF. Print the activity cards. No prep, no planning, no extra materials needed.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Use',
                  desc: 'Pick a card. Do it together or let them loose. Watch real learning happen naturally.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest/10 transition-colors duration-300 group-hover:bg-forest/15">
                      {item.icon}
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-white shadow-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-forest">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 7: FAQ ─── */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="mb-3 text-center font-display text-3xl text-forest md:text-5xl">
              Questions? We&apos;ve Got Answers.
            </h2>
            <p className="mx-auto mb-10 max-w-md text-center text-sm text-gray-500">
              Everything you need to know before getting started.
            </p>
            <FAQSection items={faqItems} />
          </div>
        </section>

        {/* ─── Section 8: Final CTA ─── */}
        <section className="relative overflow-hidden bg-forest py-16 md:py-24">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage:
              'radial-gradient(circle, #faf9f6 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div className="relative mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl text-cream md:text-5xl">
              Ready to Start?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-cream/80">
              Pick a pack. Print the cards. Start this week. No curriculum. No
              prep. Just real learning, wherever you are.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-gray-900 transition-all duration-200 hover:scale-[1.02] hover:bg-gold/90"
              >
                Browse Activity Packs
              </Link>
              <Link
                href="/free-guide"
                className="rounded-xl border-2 border-cream/40 px-8 py-4 text-lg font-semibold text-cream transition-all duration-200 hover:border-cream hover:bg-cream/10"
              >
                Or Grab the Free Guide
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section 9: Email capture ─── */}
        <section className="bg-cream py-12 md:py-16">
          <div className="mx-auto max-w-xl px-5 sm:px-8 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gold">
              Free Resource
            </p>
            <h2 className="font-display text-2xl text-forest md:text-3xl">
              Not sure where to start?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              Grab our free guide — 10 real-world life skills your kids can try
              this week. No email overload, we promise.
            </p>
            <div className="mt-6">
              <EmailForm variant="light" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
