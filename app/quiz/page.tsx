import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import LifeSkillQuiz from '@/components/quiz/LifeSkillQuiz';

export const metadata: Metadata = {
  title: "What's Your Kid's Missing Life Skill? Free 2-Minute Quiz",
  description:
    "Take the free 2-minute quiz to find your kid's type and the one life skill to focus on next, plus real, low-prep activities to start with. For all parents.",
  alternates: {
    canonical: 'https://anywherelearning.co/quiz',
  },
  openGraph: {
    title: "What's Your Kid's Missing Life Skill? | Free Quiz",
    description:
      "Find your kid's type and the one life skill to focus on next, plus real activities to start with. A free 2-minute quiz from Anywhere Learning.",
    url: 'https://anywherelearning.co/quiz',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/images/free-guide-og.jpg',
        width: 1200,
        height: 630,
        alt: "What's Your Kid's Missing Life Skill Quiz | Anywhere Learning",
      },
    ],
  },
};

const quizLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: "What's Your Kid's Missing Life Skill?",
  description:
    "A free 2-minute quiz that identifies a child's type and the life skill to focus on next, with real-world activity recommendations for parents.",
  url: 'https://anywherelearning.co/quiz',
  educationalLevel: 'Parent',
  about: {
    '@type': 'Thing',
    name: 'Life skills for children',
  },
  provider: {
    '@type': 'Organization',
    name: 'Anywhere Learning',
    url: 'https://anywherelearning.co',
  },
};

export default function QuizPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizLd) }}
      />
      <SiteHeader />
      <main className="bg-[#F2EFE4] min-h-[70vh]">
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <LifeSkillQuiz />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
