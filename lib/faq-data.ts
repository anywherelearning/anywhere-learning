/**
 * Shared FAQ data used by both the homepage and the standalone /faq page.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

// ─── Core FAQs (shown on homepage + FAQ page) ───────────────────────

export const coreFaqItems: FAQItem[] = [
  {
    question: 'What ages are these for?',
    answer:
      'My guides are designed for ages 6\u201314, but they\u2019re flexible. Every activity includes three levels, Explore, Develop, and Extend, so you can adjust to your child\u2019s ability. The idea is that you do them together, with you as the coach. Siblings at different ages can do the same activity side by side.',
  },
  {
    question: 'Do I need to follow a specific schedule or curriculum?',
    answer:
      'Nope. These are standalone activities. Pick one whenever you\u2019re ready and go at your own pace. There\u2019s no sequence, no lesson plan, no curriculum to follow.',
  },
  {
    question: 'What if my kids don\u2019t like it?',
    answer:
      'We\u2019re confident they will, but if not, email us at info@anywherelearning.co within 48 hours of purchase for a full refund. No questions asked.',
  },
  {
    question: 'How is this different from free printables I can find online?',
    answer:
      'These aren\u2019t worksheets. They\u2019re real-world activity guides that get kids doing things, cooking, budgeting, building, exploring outside. No fill-in-the-blanks, no busywork. You download them, open on any device, and follow along step by step.',
  },
  {
    question: 'Can I use these with multiple kids at different ages?',
    answer:
      'Absolutely. Every activity includes three levels (Explore, Develop, Extend) so siblings can do the same activity at their own level. Families with kids ages 6\u201314 use these together.',
  },
];

// ─── About the Activities ────────────────────────────────────────────

export const aboutFaqItems: FAQItem[] = [
  {
    question: 'How do I use the activity packs?',
    answer:
      'Download the PDF, open it on any device \u2014 phone, tablet, or laptop \u2014 and follow the step-by-step instructions. Each activity includes everything you need to know: the learning focus, materials (minimal or none), parent guidance, and three flexible levels so you can adjust to your child. Printing is optional, never required.',
  },
  {
    question: 'Do I need special materials or supplies?',
    answer:
      'Most activities use everyday household items or no materials at all. Each activity lists exactly what you need upfront so there are no surprises. You won\u2019t need to make a special trip to the store.',
  },
  {
    question: 'Can I reuse these activities?',
    answer:
      'Yes! Every activity is designed to be a completely different experience each time. As your kids grow, they\u2019ll engage at a deeper level. One purchase gives you years of meaningful learning.',
  },
  {
    question: 'How long does each activity take?',
    answer:
      'That\u2019s entirely up to your family. Some activities take an afternoon, others can stretch over days or weeks. There\u2019s no timer and no pressure, go at whatever pace feels right for your kids.',
  },
];

// ─── Homeschooling & Worldschooling ──────────────────────────────────

export const homeschoolFaqItems: FAQItem[] = [
  {
    question: 'I\u2019m new to homeschooling. Is this a good place to start?',
    answer:
      'It\u2019s a great place to start. You don\u2019t need curriculum knowledge or teaching experience. Just open an activity and follow along with your kids. The guides walk you through everything, and the three flexible levels mean you can meet your child exactly where they are.',
  },
  {
    question: 'Will these work if we\u2019re travelling or worldschooling?',
    answer:
      'They\u2019re designed for exactly that. Many activities use whatever environment you\u2019re in \u2014 a kitchen, a park, a hotel room, a new city. Open on any device, no printing needed, no bulky materials. Learning happens wherever you are.',
  },
  {
    question: 'Do these count as \u201Creal\u201D learning?',
    answer:
      'Every activity weaves in real skills \u2014 math, literacy, critical thinking, science, creativity \u2014 through hands-on experiences. Kids learn by doing, not by filling in blanks. The skills are real, the learning sticks, and your kids won\u2019t even realize they\u2019re \u201Cstudying.\u201D',
  },
  {
    question: 'Do these work with Charlotte Mason, Montessori, or unschooling approaches?',
    answer:
      'Beautifully. These activities are child-led, curiosity-driven, and rooted in real-world experiences \u2014 which fits naturally alongside Charlotte Mason, Montessori, unschooling, eclectic, and worldschool philosophies. No curriculum alignment needed.',
  },
];

// ─── Purchasing & Account ────────────────────────────────────────────

export const purchasingFaqItems: FAQItem[] = [
  {
    question: 'What happens after I purchase?',
    answer:
      'You\u2019ll get an instant download link right after checkout, plus a confirmation email with access to your files. Your purchases are always available in your account under My Downloads \u2014 download them anytime, on any device.',
  },
  {
    question: 'What\u2019s your refund policy?',
    answer:
      'Since our products are digital downloads delivered instantly, we offer a 48-hour refund window from the time of purchase. If you\u2019re not happy, email info@anywherelearning.co within 48 hours for a full refund \u2014 no questions asked.',
  },
  {
    question: 'Do you offer bundle discounts?',
    answer:
      'Yes! Our bundles save you 30\u201350% compared to buying individual packs. They\u2019re the best value if you want a full collection for a category or season.',
  },
];

// ─── Combined exports ────────────────────────────────────────────────

export const allFaqItems: FAQItem[] = [
  ...coreFaqItems,
  ...aboutFaqItems,
  ...homeschoolFaqItems,
  ...purchasingFaqItems,
];
