import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProductCard from '@/components/shop/ProductCard';
import TestimonialBlock from '@/components/shared/TestimonialBlock';
import FAQSection from '@/components/shared/FAQSection';
import EmailForm from '@/components/EmailForm';

export const metadata: Metadata = {
  title: 'Anywhere Learning \u2014 Meaningful Learning, Wherever You Are',
  description:
    'Printable, no-prep activity packs for homeschool and worldschool families. Real-world learning that meets your kids where they are.',
};

const featuredProducts = [
  {
    name: 'Master Bundle (Everything)',
    slug: 'master-bundle',
    shortDescription:
      'Every activity pack we make \u2014 220+ activities in one download.',
    priceCents: 8999,
    compareAtPriceCents: 19883,
    imageUrl: null,
    category: 'bundle',
    isBundle: true,
    activityCount: 220,
    ageRange: 'Ages 4\u201314',
  },
  {
    name: 'Full Seasonal Bundle',
    slug: 'seasonal-bundle',
    shortDescription:
      'All 4 seasonal packs \u2014 80 outdoor activities for every time of year.',
    priceCents: 4999,
    compareAtPriceCents: 5996,
    imageUrl: null,
    category: 'bundle',
    isBundle: true,
    activityCount: 80,
    ageRange: 'Ages 4\u201314',
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
    ageRange: 'Ages 4\u201314',
  },
  {
    name: 'Spring Outdoor Learning Pack',
    slug: 'spring-outdoor-pack',
    shortDescription:
      '20 outdoor activities that use spring\u2019s energy to build real-world skills.',
    priceCents: 1499,
    compareAtPriceCents: null,
    imageUrl: null,
    category: 'seasonal',
    isBundle: false,
    activityCount: 20,
    ageRange: 'Ages 4\u201314',
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
      <main id="main-content" className="pt-16">
        {/* ─── Section 1: Hero ─── */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
            <p className="text-sm font-medium text-gold uppercase tracking-widest mb-4">
              For Homeschool &amp; Worldschool Families
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-tight text-forest mb-6">
              <span className="heading-accent">Meaningful Learning</span> Happens
              Everywhere
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
              Printable, no-prep activity packs that turn everyday moments into real learning.
              No curriculum. No worksheets. Just your family, the world around you, and
              activities that actually stick.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md text-lg"
              >
                Browse Activity Packs
              </Link>
              <Link
                href="/free-guide"
                className="bg-gold hover:bg-gold/90 text-gray-900 font-semibold py-4 px-8 rounded-xl transition-all duration-200 text-lg"
              >
                Get the Free Guide
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Leaf divider ─── */}
        <div className="flex justify-center py-4 bg-gold-light/20">
          <svg width="120" height="16" viewBox="0 0 120 16" fill="none" className="text-forest/10">
            <path d="M10 8c4-4 8 0 12-4s8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M34 8c4-4 8 0 12-4s8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M58 8c4-4 8 0 12-4s8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M82 8c4-4 8 0 12-4s8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* ─── Section 2: The Problem ─── */}
        <section className="bg-gold-light/20 py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl md:text-5xl text-forest mb-10">
              Does this sound familiar?
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                <span className="mb-3 block text-2xl" aria-hidden="true">&#x1F4CC;</span>
                <h3 className="font-semibold text-gray-800">The Pinterest spiral</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You&apos;ve saved 200 boards and still don&apos;t know what
                  to do Monday morning.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                <span className="mb-3 block text-2xl" aria-hidden="true">&#x1F4CB;</span>
                <h3 className="font-semibold text-gray-800">The worksheet groan</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  The worksheets get done but nothing sticks &mdash; and
                  nobody&apos;s excited.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                <span className="mb-3 block text-2xl" aria-hidden="true">&#x1F629;</span>
                <h3 className="font-semibold text-gray-800">The planning fatigue</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You spend more time planning than actually doing things
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Permission Shift ─── */}
        <section id="about" className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl text-forest mb-6">
              What if learning was already happening?
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 mb-4">
              Cooking dinner is maths. A nature walk is science. Planning a
              road trip is geography. The learning is already there &mdash;
              you just need activities that make it intentional.
            </p>
            <p className="text-lg md:text-xl font-medium text-forest">
              You don&apos;t need more curriculum. You need activities that
              turn what you&apos;re already doing into meaningful learning.
            </p>
          </div>
        </section>

        {/* ─── Section 4: Product Showcase ─── */}
        <section className="bg-gold-light/20 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-gold uppercase tracking-widest mb-4">
                Our Activity Packs
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-forest mb-3">
                Activity Packs Your Family Will Actually Use
              </h2>
              <p className="mx-auto max-w-xl text-gray-600">
                Printable cards. Real-world challenges. No prep required.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="text-forest hover:text-forest-dark font-medium underline underline-offset-4 decoration-gold/50 hover:decoration-gold transition-colors text-lg"
              >
                View all activity packs &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Social Proof ─── */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl md:text-5xl text-forest mb-3">
              Families Are Already Learning Differently
            </h2>
            <p className="mx-auto max-w-md text-center text-sm text-gray-500 mb-10">
              Built by homeschoolers, for homeschoolers. Works for Charlotte
              Mason, Montessori, unschool, worldschool, and eclectic families.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <p className="text-base leading-relaxed text-gray-700 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 text-sm text-gray-500">
                    &mdash; {t.name}, {t.location}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 6: How It Works ─── */}
        <section className="bg-gold-light/20 py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl text-forest mb-12">
              Three Steps. That&apos;s It.
            </h2>
            <div className="grid gap-10 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-forest">Choose</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Pick a pack that fits your family. Seasonal, creative, nature, real-world &mdash; or grab them all.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                    <path d="M6 9V2h12v7" />
                    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-forest">Print</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Download the PDF. Print the activity cards. No prep, no planning, no extra materials.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-forest">Use</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Pick a card. Do it together (or let them loose). Watch real learning happen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 7: FAQ ─── */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="text-center font-display text-3xl md:text-5xl text-forest mb-10">
              Questions? We&apos;ve Got Answers.
            </h2>
            <FAQSection items={faqItems} />
          </div>
        </section>

        {/* ─── Section 8: Final CTA ─── */}
        <section className="bg-forest py-20 md:py-28">
          <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl text-cream mb-4">
              Ready to Start?
            </h2>
            <p className="text-lg text-cream/80 mb-8 leading-relaxed">
              Pick a pack. Print the cards. Start this week. No curriculum. No
              prep. Just real learning.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="bg-gold hover:bg-gold/90 text-gray-900 font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] text-lg"
              >
                Browse Activity Packs
              </Link>
              <Link
                href="/free-guide"
                className="border-2 border-cream/40 hover:border-cream hover:bg-cream/10 text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 text-lg"
              >
                Or Grab the Free Guide
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
