import type { Metadata } from 'next';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import {
  coreFaqItems,
  aboutFaqItems,
  homeschoolFaqItems,
  purchasingFaqItems,
  allFaqItems,
} from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about Anywhere Learning activity packs \u2014 ages, refunds, homeschool approaches, and how our real-world learning guides work.',
  alternates: { canonical: 'https://anywherelearning.co/faq' },
};

export default function FAQPage() {
  const faqPageLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
      />

      <div className="bg-cream">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
                FAQ
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-forest leading-tight mb-4">
                Everything You Need to Know
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Quick answers to the most common questions about our activity packs,
                how they work, and what to expect.
              </p>
            </div>

            {/* Core Questions */}
            <div className="mb-12">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
                The Basics
              </h2>
              <FAQSection items={coreFaqItems} />
            </div>

            {/* About the Activities */}
            <div className="mb-12">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
                About the Activities
              </h2>
              <FAQSection items={aboutFaqItems} />
            </div>

            {/* Homeschooling & Worldschooling */}
            <div className="mb-12">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
                Homeschooling &amp; Worldschooling
              </h2>
              <FAQSection items={homeschoolFaqItems} />
            </div>

            {/* Purchasing & Account */}
            <div className="mb-12">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
                Purchasing &amp; Your Account
              </h2>
              <FAQSection items={purchasingFaqItems} />
            </div>

            {/* Contact CTA */}
            <div className="bg-gold-light/10 rounded-2xl p-8 border border-gold/10 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Still Have Questions?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                We&apos;re always happy to help. Reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark active:scale-[0.98] text-cream font-semibold py-3 px-6 rounded-xl transition-all text-sm"
              >
                Contact Us
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
