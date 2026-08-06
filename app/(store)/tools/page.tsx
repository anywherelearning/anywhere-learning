import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Learning Tools for Parents',
  description:
    'Free printable generators for parents and homeschoolers: name tracing, handwriting practice, sight words, and spelling lists. Made by a former teacher. No signup.',
  alternates: { canonical: 'https://anywherelearning.co/tools' },
  openGraph: {
    title: 'Free Learning Tools | Anywhere Learning',
    description:
      'Free printable generators: name tracing, handwriting practice, sight words, and spelling lists. No signup.',
    url: 'https://anywherelearning.co/tools',
    type: 'website',
  },
};

const TOOLS = [
  {
    slug: 'name-tracing',
    name: 'Name Tracing Generator',
    description:
      "Type any name and print a tracing worksheet with school guide lines. The classic first step into writing.",
    live: true,
  },
  {
    slug: 'handwriting',
    name: 'Handwriting Practice Maker',
    description:
      'Turn any text into handwriting practice sheets: favorite quotes, copywork, silly sentences.',
    live: true,
  },
  {
    slug: 'sight-words',
    name: 'Sight Words Generator',
    description:
      'Built-in Dolch and Fry lists by grade, or your own words, as ready-to-print practice pages.',
    live: true,
  },
  {
    slug: 'spelling',
    name: 'Spelling List Maker',
    description:
      "Enter this week's spelling words and get trace, write, and test formats in one PDF.",
    live: true,
  },
];

export default function ToolsHubPage() {
  return (
    <main className="bg-cream">
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-[1180px] px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
            Free tools
          </p>
          <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
            Free learning tools for parents
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Simple generators that make useful printables in seconds. Free to use, free to
            print, no signup. Made by a former teacher who believes practice pages should be
            the small supporting act, not the main event.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {TOOLS.map((tool) =>
              tool.live ? (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-2xl border border-forest/10 bg-white p-6 transition hover:border-forest/40 hover:shadow-md focus:outline-2 focus:outline-offset-2 focus:outline-forest"
                >
                  <h2 className="font-display text-2xl text-forest-dark group-hover:text-forest">
                    {tool.name}
                  </h2>
                  <p className="mt-2 text-gray-600">{tool.description}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-forest">
                    Open the tool &rarr;
                  </span>
                </Link>
              ) : (
                <div
                  key={tool.slug}
                  className="rounded-2xl border border-dashed border-forest/20 bg-white/60 p-6"
                >
                  <h2 className="font-display text-2xl text-forest-dark/70">{tool.name}</h2>
                  <p className="mt-2 text-gray-500">{tool.description}</p>
                  <span className="mt-4 inline-block rounded-full bg-warm-gray px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Coming soon
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
