import type { Metadata } from 'next';
import ScrollReveal from '@/components/shared/ScrollReveal';
import {
  familyFaqItems,
  membershipFaqItems,
  usingFaqItems,
  buyingFaqItems,
  allFaqItems,
} from '@/lib/faq-data';
import FaqInteractive from './FaqInteractive';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Common questions about Anywhere Learning activity guides: ages, refunds, homeschool approaches, and how our real-world learning guides work.',
  alternates: { canonical: 'https://anywherelearning.co/faq' },
};

const groups = [
  {
    id: 'section-family',
    eyebrow: 'Is this for my family?',
    title: 'Is this for',
    titleAccent: 'my family?',
    items: familyFaqItems,
  },
  {
    id: 'section-membership',
    eyebrow: 'The membership',
    title: 'About the',
    titleAccent: 'membership.',
    items: membershipFaqItems,
  },
  {
    id: 'section-using',
    eyebrow: 'Using the activities',
    title: 'Using the',
    titleAccent: 'activities.',
    items: usingFaqItems,
  },
  {
    id: 'section-buying',
    eyebrow: 'Buying & refunds',
    title: 'Buying &',
    titleAccent: 'refunds.',
    items: buyingFaqItems,
  },
];

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
      <main>
        {/* PAGE HEADER */}
        <header className="bg-cream pt-16 md:pt-24 pb-12 md:pb-14 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                Frequently asked
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight mt-4 text-balance">
                Questions you might be{' '}
                <span className="italic text-forest">asking.</span>
              </h1>
              <p className="mt-5 text-[17px] md:text-[18.5px] leading-[1.55] text-gray-600 max-w-[600px] mx-auto">
                The things parents ask before they sign up, and a few they ask after. If yours
                isn&apos;t here, we&apos;d{' '}
                <span className="font-display italic text-forest-dark">love to hear it.</span>
              </p>
            </ScrollReveal>
          </div>
        </header>

        <FaqInteractive groups={groups} />
      </main>
    </>
  );
}
