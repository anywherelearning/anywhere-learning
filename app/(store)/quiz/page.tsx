import type { Metadata } from 'next';
import Link from 'next/link';
import SkillsQuiz from '@/components/quiz/SkillsQuiz';
import FAQSection from '@/components/shared/FAQSection';
import { QUIZ_DIMENSIONS, QUIZ_QUESTIONS } from '@/lib/quiz-data';

export const metadata: Metadata = {
  title: 'Real-World Skills Scorecard for Kids, Free 2-Minute Quiz',
  description:
    'Free 2-minute quiz for parents: find out which real-world life skills your kid already owns, their strongest area, and the one to focus on next. Ages 5 to 14.',
  alternates: {
    canonical: 'https://anywherelearning.co/quiz',
  },
  openGraph: {
    title: 'The Real-World Skills Scorecard | Anywhere Learning',
    description:
      'A free 2-minute quiz for parents. Find out which real-world skills your kid already owns and which one needs a little adventure.',
    url: 'https://anywherelearning.co/quiz',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.jpg?v=2',
        width: 1200,
        height: 630,
        alt: 'The Real-World Skills Scorecard | Anywhere Learning',
      },
    ],
  },
};

const quizFaqItems = [
  {
    question: 'How long does the scorecard take?',
    answer:
      'About two minutes. It is 15 quick questions plus your kid’s age, each answered with one of three choices: not yet, with help, or on their own.',
  },
  {
    question: 'What ages is it for?',
    answer:
      'Roughly 5 to 14. You answer for what is reasonable at your kid’s age, so a 6-year-old and a 13-year-old can both get a fair score.',
  },
  {
    question: 'What do I get at the end?',
    answer:
      'A score out of 30, your kid’s strongest skill area, the area that could use attention first, and three matched activities from our library to start with.',
  },
  {
    question: 'Do I need to give my email?',
    answer:
      'No. You can skip straight to your results. If you do leave your email, we’ll also send you the free 7-day starter guide so you can act on your focus area this week.',
  },
  {
    question: 'Is this a test of my kid (or my parenting)?',
    answer:
      'Not at all. Kids are never behind on real-world skills, they just have not been exposed yet. The scorecard simply shows which skills have had practice and which ones have not had their turn.',
  },
];

const quizLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'The Real-World Skills Scorecard',
  description:
    'A free 2-minute quiz that scores a child’s real-world life skills across money, communication, independence, critical thinking, and curiosity, then recommends matched hands-on activities.',
  url: 'https://anywherelearning.co/quiz',
  numberOfQuestions: QUIZ_QUESTIONS.length,
  educationalUse: 'self assessment',
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents of kids ages 5 to 14',
  },
  provider: {
    '@type': 'Organization',
    name: 'Anywhere Learning',
    url: 'https://anywherelearning.co',
  },
};

const quizFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: quizFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function QuizPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizFaqLd) }}
      />

      {/* Hero + quiz */}
      <section className="bg-cream px-6 pb-16 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest">
            Free 2-minute scorecard
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-forest-dark sm:text-5xl">
            How many real-world skills does your kid actually have?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            15 quick questions. Find out which skills your kid already owns,
            which one needs a little adventure, and exactly where to start.
            For parents of kids 5 to 14.
          </p>
        </div>
        <div className="mt-10">
          <SkillsQuiz />
        </div>
      </section>

      {/* What it measures */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-bold text-forest-dark">
            What the scorecard measures
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-gray-500">
            Five skill areas that show up everywhere in real life, and almost
            nowhere on a report card.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_DIMENSIONS.map((dimension) => (
              <div
                key={dimension.slug}
                className="rounded-2xl border border-gray-100 bg-cream/50 p-6"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: dimension.color }}
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-lg font-semibold text-gray-800">
                  {dimension.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {dimension.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-3xl font-bold text-forest-dark">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Answer 15 quick questions',
                body: 'Real, concrete scenarios: paying at a checkout, packing a bag, ordering a meal. Not yet, with help, or on their own.',
              },
              {
                step: '2',
                title: 'Get your kid’s snapshot',
                body: 'A score out of 30, their strongest skill area, and the one area where a little focus would change the most.',
              },
              {
                step: '3',
                title: 'Start with matched activities',
                body: 'Three hands-on activities from our library, picked for your focus area. Download, open, and follow along together.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest font-display text-xl font-bold text-cream">
                  {item.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-forest-dark">
            Quick questions
          </h2>
          <div className="mt-8">
            <FAQSection items={quizFaqItems} />
          </div>
          <p className="mt-10 text-center text-sm leading-relaxed text-gray-500">
            Prefer to start with something in hand? Get the{' '}
            <Link
              href="/free-guide"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest-dark"
            >
              free 7-day starter guide
            </Link>
            , browse{' '}
            <Link
              href="/ideas"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest-dark"
            >
              free activity idea checklists
            </Link>
            , or see how{' '}
            <Link
              href="/join"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest-dark"
            >
              the membership
            </Link>{' '}
            works.
          </p>
        </div>
      </section>
    </main>
  );
}
