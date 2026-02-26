import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProductCard from '@/components/shop/ProductCard';
import TestimonialBlock from '@/components/shared/TestimonialBlock';
import FAQSection from '@/components/shared/FAQSection';

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
  },
  {
    name: 'Nature Journal & Walk Cards',
    slug: 'nature-journal-walks',
    shortDescription:
      '25 guided nature walks with observation and journaling prompts.',
    priceCents: 999,
    compareAtPriceCents: null,
    imageUrl: null,
    category: 'nature',
    isBundle: false,
  },
  {
    name: 'Spring Outdoor Learning Pack',
    slug: 'spring-outdoor-pack',
    shortDescription:
      '20 real-world spring activities. Print, pick a card, go outside.',
    priceCents: 1499,
    compareAtPriceCents: null,
    imageUrl: null,
    category: 'seasonal',
    isBundle: false,
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
    question:
      'How is this different from free printables I can find online?',
    answer:
      'These aren\u2019t worksheets. They\u2019re real-world activity cards that get kids doing things \u2014 cooking, budgeting, building, exploring outside. No fill-in-the-blanks, no busywork.',
  },
  {
    question: 'Can I use these with multiple kids at different ages?',
    answer:
      'Absolutely. Every activity includes adaptation notes so siblings can do the same activity at their own level. Families with kids ages 4\u201314 use these together.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Choose',
    description:
      'Pick a pack that fits your family. Seasonal, creative, nature, real-world \u2014 or grab them all.',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-forest"
        aria-hidden="true"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Print',
    description:
      'Download the PDF. Print the activity cards. No prep, no planning, no extra materials.',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-forest"
        aria-hidden="true"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Use',
    description:
      'Pick a card. Do it together (or let them loose). Watch real learning happen.',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-forest"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
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
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl lg:text-6xl">
              Meaningful Learning Happens Everywhere &mdash; Here&apos;s How
              to Make It Stick
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Printable, no-prep activity packs for homeschool and worldschool
              families. Real-world learning that meets your kids where they
              are.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="rounded-lg bg-forest px-8 py-3.5 text-base font-semibold text-cream transition-all hover:scale-[1.02] hover:bg-forest-dark"
              >
                Browse Activity Packs
              </Link>
              <Link
                href="/free-guide"
                className="rounded-lg border-2 border-forest px-8 py-3.5 text-base font-semibold text-forest transition-all hover:bg-forest hover:text-cream"
              >
                Get the Free Guide
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section 2: The Problem ─── */}
        <section className="bg-gold-light/20 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl text-forest sm:text-4xl">
              Does this sound familiar?
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-cream p-6 shadow-sm">
                <span
                  className="mb-3 block text-2xl"
                  aria-hidden="true"
                >
                  📌
                </span>
                <h3 className="font-semibold text-gray-900">
                  The Pinterest spiral
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You&apos;ve saved 200 boards and still don&apos;t know what
                  to do Monday morning.
                </p>
              </div>
              <div className="rounded-xl bg-cream p-6 shadow-sm">
                <span
                  className="mb-3 block text-2xl"
                  aria-hidden="true"
                >
                  📋
                </span>
                <h3 className="font-semibold text-gray-900">
                  The worksheet groan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  The worksheets get done but nothing sticks &mdash; and
                  nobody&apos;s excited.
                </p>
              </div>
              <div className="rounded-xl bg-cream p-6 shadow-sm">
                <span
                  className="mb-3 block text-2xl"
                  aria-hidden="true"
                >
                  😩
                </span>
                <h3 className="font-semibold text-gray-900">
                  The planning fatigue
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You spend more time planning than actually doing things
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Permission Shift ─── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl text-forest sm:text-4xl">
              What if learning was already happening?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Cooking dinner is maths. A nature walk is science. Planning a
              road trip is geography. The learning is already there &mdash;
              you just need activities that make it intentional.
            </p>
            <p className="mt-4 text-lg font-medium text-forest">
              You don&apos;t need more curriculum. You need activities that
              turn what you&apos;re already doing into meaningful learning.
            </p>
          </div>
        </section>

        {/* ─── Section 4: Product Showcase ─── */}
        <section className="bg-gold-light/10 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl text-forest sm:text-4xl">
              Activity Packs Your Family Will Actually Use
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
              Printable cards. Real-world challenges. No prep required.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-block rounded-lg border-2 border-forest px-6 py-3 font-semibold text-forest transition-all hover:bg-forest hover:text-cream"
              >
                See All Packs &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Social Proof ─── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl text-forest sm:text-4xl">
              Families Are Already Learning Differently
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500">
              Built by homeschoolers, for homeschoolers. Works for Charlotte
              Mason, Montessori, unschool, worldschool, and eclectic families.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <p className="text-base leading-relaxed text-gray-700 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 text-sm font-semibold text-forest">
                    &mdash; {t.name}, {t.location}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 6: How It Works ─── */}
        <section className="bg-gold-light/20 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl text-forest sm:text-4xl">
              Three Steps. That&apos;s It.
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 7: FAQ ─── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl text-forest sm:text-4xl">
              Questions? We&apos;ve Got Answers.
            </h2>
            <div className="mt-10">
              <FAQSection items={faqItems} />
            </div>
          </div>
        </section>

        {/* ─── Section 8: Final CTA ─── */}
        <section className="bg-forest py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              Ready to Start?
            </h2>
            <p className="mt-4 text-lg text-cream/80">
              Pick a pack. Print the cards. Start this week. No curriculum. No
              prep. Just real learning.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="rounded-lg bg-gold px-8 py-3.5 text-base font-semibold text-forest-dark transition-all hover:scale-[1.02] hover:bg-gold-light"
              >
                Browse Activity Packs
              </Link>
              <Link
                href="/free-guide"
                className="rounded-lg border-2 border-cream/40 px-8 py-3.5 text-base font-semibold text-cream transition-all hover:border-cream hover:bg-cream/10"
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
