import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import LifeSkillQuiz from '@/components/quiz/LifeSkillQuiz';
import Link from 'next/link';
import { RESULTS } from '@/lib/quiz';
import LeafMark from '@/components/quiz/LeafMark';

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

// The recognition line that opens each result ("You know the moment: ...").
// The page shows only this. The skill, the Saturday idea and the activities
// stay inside the quiz, which is the payoff for taking it.
function tellOf(description: string): string {
  const m = description.match(/^.*?[.?!][”"]?(?=\s+[A-Z])/);
  return m ? m[0] : description;
}

const FAQS = [
  {
    q: 'Who is the quiz for?',
    a: 'Parents of kids 6 to 14. You answer about your kid, from what you see at home on a normal week. It works whether your kid goes to school, learns at home, or something in between.',
  },
  {
    q: 'What do I get at the end?',
    a: "Your kid's type, the top two skills to build next, one thing to try together this Saturday, and three real-world activities to start with. We email you a copy of the plan so you can come back to it.",
  },
  {
    q: 'Can my kid be more than one type?',
    a: 'Yes, and most are. The quiz picks the pattern that leads, and when your answers point to a second one, your plan names that skill too.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. You pop in your email to see your plan, and a few short follow-up emails with ideas for your kid’s type come after. Unsubscribe any time.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

// Tilt and drop for the fanned hand of type cards, outermost cards lowest.
const HAND_ROT = [-6, -3, 0, 3, 6];
const HAND_LIFT = [18, 6, 0, 6, 18];

const linkClass =
  'text-forest-dark font-medium underline decoration-forest/30 underline-offset-2 hover:text-forest';

export default function QuizPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <SiteHeader />
      <main className="bg-[#F2EFE4] min-h-[70vh]">
        <section id="quiz" className="relative scroll-mt-24 pt-12 md:pt-16 pb-14 md:pb-20">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)',
            }}
          />
          <div className="relative mx-auto max-w-[1180px] px-6">
            <LifeSkillQuiz />
          </div>
        </section>

        {/* Server-rendered context. The quiz itself is a client island, so
            without this the page is 200 words of chrome to a crawler and
            Search Console filed it under "discovered, not indexed". It shows
            each type's recognition line only; the fix stays in the quiz. */}
        <section className="overflow-hidden bg-cream border-t border-[#D8D4C5] pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-[1240px] px-6">
            <header className="mx-auto max-w-[640px] text-center">
              <h2 className="font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] tracking-tight text-balance">
                Which one sounds like <span className="italic text-forest">your kid?</span>
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-gray-600 text-pretty">
                Most kids between 6 and 14 fall into one of five patterns. Here is how each one
                shows up at home. The quiz tells you which one is yours, and what moves it.
              </p>
            </header>

            {/* A hand of five cards, one per type, fanned on desktop and
                stacked as a slightly tilted pile on phones. Backgrounds are each type's accent
                darkened a little so white text stays readable. */}
            <ul className="mx-auto mt-12 flex max-w-[440px] list-none flex-col gap-4 p-0 pb-8 pt-2 md:mt-14 lg:max-w-none lg:flex-row lg:justify-center lg:gap-0 lg:pt-6">
              {Object.values(RESULTS).map((r, i) => (
                <li
                  key={r.id}
                  className="relative flex flex-col rounded-[22px] p-6 text-white shadow-[0_30px_50px_-30px_rgba(0,0,0,0.55)] transition-transform duration-300 [transform:rotate(var(--mr))] lg:-mx-2 lg:h-[380px] lg:w-[250px] lg:shrink-0 lg:[transform:rotate(var(--r))_translateY(var(--y))] lg:hover:z-10 lg:hover:[transform:rotate(0deg)_translateY(-14px)]"
                  style={{
                    background: `color-mix(in srgb, ${r.accent} 74%, #1f2a1e)`,
                    ['--r' as string]: `${HAND_ROT[i]}deg`,
                    ['--y' as string]: `${HAND_LIFT[i]}px`,
                    ['--mr' as string]: `${i % 2 ? 1.2 : -1.2}deg`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/80">
                      0{i + 1}
                    </span>
                    <LeafMark className="h-6 w-6" color="rgba(255,255,255,0.85)" />
                  </div>
                  <h3 className="mt-5 font-display text-[26px] font-semibold leading-[1.05] tracking-tight">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-white/85">{r.tagline}</p>
                  <p className="mt-5 border-t border-white/25 pt-4 font-display text-[16.5px] italic leading-[1.5] lg:mt-auto">
                    {tellOf(r.description)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-8 flex max-w-[640px] flex-col items-center gap-6 text-center">
              <p className="text-[17px] leading-[1.6] text-gray-700 text-pretty">
                <span className="font-semibold text-ink">Recognize one? Or two?</span> Eight
                questions sort out which one leads, and give you the skill to build next, one
                thing to try on Saturday, and three activities to start with.
              </p>
              <a
                href="#start-quiz"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-forest px-7 py-4 text-base font-semibold text-cream transition-colors hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Find out which one leads
                <span aria-hidden="true" className="text-[19px] leading-none">&uarr;</span>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-16 md:py-20">
          <div className="mx-auto max-w-[720px] px-6">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.1] tracking-tight">
              About the quiz
            </h2>
            <div className="mt-8 border-b border-[#D8D4C5]">
              {FAQS.map((f) => (
                <details key={f.q} className="group border-t border-[#D8D4C5]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#CFC9B6] text-[18px] leading-none text-forest-dark transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="-mt-1 pb-6 pr-12 text-[16px] leading-[1.7] text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>

            <p className="mt-10 text-[15px] leading-[1.65] text-gray-600">
              Not sure a quiz is what you need? The{' '}
              <Link href="/guides/life-skills-for-kids" className={linkClass}>
                life skills by age guide
              </Link>{' '}
              covers what to teach and when, and the{' '}
              <Link href="/ideas/life-skills-ideas" className={linkClass}>
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
