import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import LifeSkillQuiz from '@/components/quiz/LifeSkillQuiz';
import Link from 'next/link';
import { RESULTS } from '@/lib/quiz';

export const metadata: Metadata = {
  // Absolute so the site suffix doesn't push it past the SERP cutoff
  title: { absolute: "Kid's Missing Life Skill? Free 2-Minute Quiz" },
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
    // og:image is supplied by the generated opengraph-image.tsx in this folder.
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
        <section className="pt-12 md:pt-16 pb-14 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <LifeSkillQuiz />
          </div>
        </section>

        {/* Server-rendered context. The quiz itself is a client island, so
            without this the page is 200 words of chrome to a crawler and
            Search Console filed it under "discovered, not indexed". */}
        <section className="bg-cream border-t border-[#D8D4C5] py-14 md:py-16">
          <div className="mx-auto max-w-[760px] px-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
              <span className="w-[22px] h-px bg-forest inline-block" />
              How the quiz works
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance">
              Eight questions, one skill to <span className="italic text-forest">work on next.</span>
            </h2>
            <p className="mt-4 text-[16.5px] leading-[1.65] text-gray-600">
              The quiz asks how your kid handles a free afternoon, a problem that stumps them, a
              job that is theirs to finish, and a few other everyday moments. Nobody is scored.
              The answers point to one of five patterns most kids between 6 and 14 fall into, and
              each pattern comes with the single life skill that moves it, plus three real-world
              activities to start with this week.
            </p>

            <h2 className="font-display text-[clamp(1.5rem,2.8vw,2rem)] leading-[1.15] tracking-tight mt-12 mb-2 text-balance">
              The five results, and what each one means
            </h2>
            <p className="text-[15.5px] leading-[1.65] text-gray-600 mb-6">
              Every result is a pattern, not a label. Most kids show a bit of two, and the quiz
              tells you which one to start with.
            </p>
            <div className="space-y-4">
              {Object.values(RESULTS).map((r) => (
                <article
                  key={r.id}
                  className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[14px] px-6 py-6"
                  style={{ borderLeft: `4px solid ${r.accent}` }}
                >
                  <h3 className="font-display text-[22px] leading-[1.2] tracking-tight text-ink">{r.title}</h3>
                  <p className="mt-1 text-[14.5px] italic text-gray-600">{r.tagline}</p>
                  <p className="mt-4 text-[15.5px] leading-[1.7] text-gray-700">{r.description}</p>
                  <p className="mt-4 text-[15px] leading-[1.6] text-gray-700">
                    <span className="font-semibold text-ink">The skill to work on: </span>
                    {r.gapLabel.charAt(0).toLowerCase() + r.gapLabel.slice(1)}.
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.6] text-gray-700">
                    <span className="font-semibold text-ink">Try this weekend: </span>
                    {r.saturday.replace(/^This Saturday, /, '').replace(/^./, (c) => c.toUpperCase())}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.6] text-gray-700">
                    <span className="font-semibold text-ink">Activities to start with: </span>
                    {r.activities.map((a, i) => (
                      <span key={a.slug}>
                        {i > 0 && (i === r.activities.length - 1 ? ', and ' : ', ')}
                        <Link
                          href={`/shop/${a.slug}`}
                          className="text-forest-dark font-medium underline decoration-forest/30 underline-offset-2 hover:text-forest"
                        >
                          {a.name}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-8 text-[15px] leading-[1.6] text-gray-600">
              Not sure a quiz is what you need? The{' '}
              <Link href="/guides/life-skills-for-kids" className="text-forest-dark font-medium underline decoration-forest/30 underline-offset-2 hover:text-forest">
                life skills by age guide
              </Link>{' '}
              covers what to teach and when, and the{' '}
              <Link href="/ideas/life-skills-ideas" className="text-forest-dark font-medium underline decoration-forest/30 underline-offset-2 hover:text-forest">
                28-skill checklist
              </Link>{' '}
              is free to read in full.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
