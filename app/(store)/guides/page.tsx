import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import BlogQuizCTA from '@/components/blog/BlogQuizCTA';
import { PAPER_SHADOW } from '@/components/shared/Paper';
import { getAllResources, resourceTopics, type ResourcePage } from '@/lib/resources';
import { MEMBERSHIP_PRICE_YEAR, MONTHLY_PLAN_PRICE } from '@/lib/membership';

export const metadata: Metadata = {
  title: 'Learning Guides for Families: Life Skills, Nature, Creativity & More',
  description:
    'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling. Written by a former teacher for families who want learning to fit their life.',
  alternates: {
    canonical: 'https://anywherelearning.co/guides',
  },
  openGraph: {
    title: 'Learning Guides for Families: Life Skills, Nature, Creativity & More | Anywhere Learning',
    description:
      'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling. Written by a former teacher for families who want learning to fit their life.',
    url: 'https://anywherelearning.co/guides',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning Resource Guides',
      },
    ],
  },
};

// Reading order on the shelf, and a slight tilt for each notebook.
const ORDER = [
  'life-skills-for-kids',
  'real-world-learning',
  'stem-for-kids',
  'nature-based-learning',
  'creativity-maker-activities',
  'ai-digital-literacy',
  'worldschooling-guide',
  'homeschool-journey',
];
const TILT = [-1.5, 1, -1, 1.5, -1.2, 0.8, -0.8, 1.2];

function formatUpdated(r: ResourcePage): string {
  const date = r.dateModified || r.publishedAt;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** A guide as a notebook: topic-coloured spine, its photo taped on the cover. */
function GuideNotebook({ r, priority = false }: { r: ResourcePage; priority?: boolean }) {
  const topic = resourceTopics[r.topic];
  return (
    <Link
      href={`/guides/${r.slug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-l-[4px] rounded-r-[10px] bg-[#FFFDF8] pl-5 text-inherit no-underline transition-transform duration-200 hover:-translate-y-1 ${PAPER_SHADOW}`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-5" style={{ background: topic.color }} />
      <span aria-hidden="true" className="absolute inset-y-0 left-5 w-px bg-black/10" />
      <div className="flex flex-1 flex-col p-4 pb-5">
        <div className="relative -rotate-[1.5deg] bg-white p-1.5 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.4)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#E6EBDF]">
            {r.heroImage && (
              <Image
                src={r.heroImage}
                alt={r.heroImageAlt || r.title}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 270px"
                priority={priority}
                className="object-cover"
                style={r.heroImagePosition ? { objectPosition: r.heroImagePosition } : undefined}
              />
            )}
          </div>
        </div>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: topic.color }}>
          {topic.label}
        </p>
        <h2 className="mt-1 font-display text-[19px] leading-tight tracking-tight text-[#2b2a26] text-balance">
          {r.title}
        </h2>
        <p className="mt-2 font-display text-[14.5px] italic leading-snug text-gray-600">{r.hook}</p>
        <p className="mt-auto flex items-center justify-between gap-2 pt-4 text-[12.5px]">
          <span className="text-gray-500">Updated {formatUpdated(r)}</span>
          <span className="font-semibold text-forest-dark">
            Read <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function ResourcesPage() {
  const resources = getAllResources();
  const guides = [
    ...ORDER.map((slug) => resources.find((r) => r.slug === slug)).filter((r): r is ResourcePage => !!r),
    ...resources.filter((r) => !ORDER.includes(r.slug)),
  ];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anywhere Learning Resource Guides',
    description:
      'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling for families who learn through real life.',
    url: 'https://anywherelearning.co/guides',
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: resources.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://anywherelearning.co/guides/${r.slug}`,
        name: r.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <main className="bg-[#F2EFE4]">
        {/* ── Header ── */}
        <header className="pb-4 pt-12 text-center md:pt-14">
          <div className="mx-auto max-w-[900px] px-6">
            <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-forest-dark">
              <span className="inline-block h-px w-[22px] bg-forest" />
              Resource guides
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.9rem)] leading-[1.02] tracking-tight text-balance">
              Guides for learning, <span className="italic text-forest">wherever you are.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-[17px] leading-[1.55] text-gray-600 md:text-[18px]">
              In-depth guides on the topics that matter most to families who learn through real
              life, at home, on the road, or after the school day ends. Written by{' '}
              <span className="font-display italic text-forest-dark">Amelie,</span> a teacher with 15
              years in the classroom, now homeschooling her own.
            </p>
            <p className="mt-4 text-[12.5px] tracking-wide text-gray-500">
              {'Updated regularly \u00b7 Free to read \u00b7 Built for sharing'}
            </p>
          </div>
        </header>

        {/* ── The guides, as notebooks on the table ── */}
        <section className="pb-14 pt-10 md:pb-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <ul className="m-0 grid list-none gap-x-7 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((r, i) => (
                <li key={r.slug} style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                  <GuideNotebook r={r} priority={i < 4} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Quiz ── */}
        <BlogQuizCTA paper />

        {/* ── Membership, one quiet line ── */}
        <section className="pb-16">
          <p className="mx-auto max-w-[620px] px-6 text-center text-[15px] leading-[1.6] text-gray-600">
            Want more than reading? The{' '}
            <Link
              href="/#membership"
              className="border-b border-forest/25 font-semibold text-forest-dark no-underline transition-colors hover:border-forest-dark hover:text-forest"
            >
              membership
            </Link>{' '}
            has 120+ guided activities you can do with your kids. Founding members pay{' '}
            {MEMBERSHIP_PRICE_YEAR}, locked in for life, or go monthly for {MONTHLY_PLAN_PRICE}.
          </p>
        </section>
      </main>
    </>
  );
}
