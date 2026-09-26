import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getListCount } from '@/lib/ideas';
import PageEyebrow from '@/components/shared/PageEyebrow';

export const metadata: Metadata = {
  // Absolute so the keyword-led tag isn't pushed past the SERP cutoff
  title: { absolute: 'Activity Ideas for Kids: 15 Free Printable Checklists' },
  description:
    '320+ activity ideas for kids in 15 free printable checklists: nature, STEM, life skills, cooking, travel, and more. Free to read in full, PDFs sent by email.',
  alternates: { canonical: 'https://anywherelearning.co/ideas' },
  openGraph: {
    title: 'Activity Ideas for Kids: 15 Free Printable Checklists',
    description:
      '320+ activity ideas for kids in 15 free printable checklists. Browse by category: nature, kitchen, life skills, STEM, creative, travel, AI, and mindset.',
    url: 'https://anywherelearning.co/ideas',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning activity idea checklists',
      },
    ],
  },
};

// Each checklist hangs at a slight angle, held by a coloured magnet.
const TILT = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5];
const MAGNETS = ['#C97B5C', '#588157', '#d4a373', '#6b8e9e', '#c47a8f', '#3A5A40'];

export default function IdeasPage() {
  const categories = getAllCategories();
  const totalLists = categories.reduce((sum, c) => sum + getListCount(c), 0);
  const lists = categories.flatMap((category) => category.lists.map((l) => ({ ...l, category })));

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': 'https://anywherelearning.co/ideas#breadcrumb',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://anywherelearning.co',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Activity Ideas',
        item: 'https://anywherelearning.co/ideas',
      },
    ],
  };

  /* CollectionPage anchors the page entity and links it to the sitewide
     Organization/WebSite graph declared in app/layout.tsx */
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://anywherelearning.co/ideas#webpage',
    url: 'https://anywherelearning.co/ideas',
    name: 'Activity Ideas for Kids: 15 Free Printable Checklists',
    description:
      'Free activity idea checklists for kids across eight categories. Free to read in full, printable PDFs sent by email.',
    inLanguage: 'en',
    isAccessibleForFree: true,
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
    isPartOf: { '@id': 'https://anywherelearning.co/#website' },
    publisher: { '@id': 'https://anywherelearning.co/#organization' },
    breadcrumb: { '@id': 'https://anywherelearning.co/ideas#breadcrumb' },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Activity Ideas',
      numberOfItems: categories.length,
      itemListElement: categories.map((cat, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: cat.name,
        url: `https://anywherelearning.co/ideas/${cat.slug}`,
        description: cat.blurb,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <main className="bg-[#E9EEE6]">
        {/* ── Hero: the answer block, then a chip per category ── */}
        <section className="pb-8 pt-12 md:pt-14">
          <div className="mx-auto max-w-[820px] px-6 text-center">
            <PageEyebrow>Free printables</PageEyebrow>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight text-balance">
              Activity <span className="italic text-forest">ideas for kids.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-[17.5px] leading-[1.55] text-[#5c5a54] md:text-[18.5px]">
              {totalLists} free printable checklists with 320+ activity ideas for kids,
              across nature, kitchen, life skills, STEM, creative, travel, AI, and mindset. Grab a
              list, pin it to the fridge, and check things off together. Every list is free to read
              in full, and we email you the printable.
            </p>
            <nav aria-label="Idea categories" className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/ideas/${cat.slug}`}
                  className="rounded-full border bg-white px-3.5 py-1.5 text-[13px] font-semibold no-underline transition-colors hover:bg-cream"
                  style={{ color: cat.accent, borderColor: `${cat.accent}55` }}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* ── The fridge: every list as a checklist held up by a magnet ── */}
        <section className="pb-14 md:pb-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <h2 className="text-center font-display text-[clamp(1.4rem,2.6vw,1.75rem)] italic text-forest-dark">
              Pick a list. Pin it up. Check things off.
            </h2>
            <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-x-6 gap-y-9 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {lists.map((list, i) => {
                const items = list.sections.flatMap((sec) => sec.items);
                return (
                  <li key={list.slug} style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                    <Link
                      href={`/ideas/${list.slug}`}
                      className="relative block h-full bg-white p-5 pt-7 text-inherit no-underline shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)] transition-transform duration-200 hover:-translate-y-1"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-[-10px] h-6 w-6 -translate-x-1/2 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
                        style={{ background: MAGNETS[i % MAGNETS.length] }}
                      />
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: list.category.accent }}>
                        {list.category.name}
                      </p>
                      <h3 className="mt-1 font-display text-[19px] leading-tight text-[#2b2a26]">{list.title}</h3>
                      <ul className="m-0 mt-3 list-none space-y-1.5 border-t border-dashed border-[#E2DCC8] p-0 pt-3">
                        {items.slice(0, 3).map((item, k) => (
                          <li key={item} className={`flex gap-2 text-[13px] leading-snug text-gray-600 ${k === 2 ? 'max-sm:hidden' : ''}`}>
                            <span aria-hidden="true" className="mt-[2px] h-3.5 w-3.5 shrink-0 rounded-[3px] border-[1.5px] border-[#CFC9B6]" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[12.5px] font-semibold text-forest-dark">
                        {`See all ${items.length} ideas \u2192`}
                      </p>
                    </Link>
                  </li>
                );
              })}

              {/* A blank note at the end: ask for the next list */}
              <li style={{ transform: 'rotate(1.5deg)' }}>
                <div className="relative flex h-full flex-col border-2 border-dashed border-[#d4a373] bg-[#FBF7EE] p-5 pt-7">
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-[-10px] h-6 w-6 -translate-x-1/2 rounded-full bg-[#d4a373] shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
                  />
                  <h3 className="font-display text-[19px] leading-tight text-[#b5803e]">More on the way</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-[1.55] text-gray-600">
                    We add new lists all the time. Got a request? Tell us what your family wants to
                    explore next.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-3 text-[13px] font-semibold text-[#b5803e] no-underline hover:underline"
                  >
                    Suggest a list &rarr;
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Bottom CTA: a note pinned to the fridge ── */}
        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-[620px] px-6">
            <div className="relative -rotate-1 bg-forest-dark p-8 pt-10 text-center text-cream shadow-[0_24px_44px_-24px_rgba(45,58,46,0.7)] md:p-10 md:pt-12">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[-12px] h-7 w-7 -translate-x-1/2 rounded-full bg-[#C97B5C] shadow-[0_4px_8px_rgba(0,0,0,0.3),inset_0_-3px_0_rgba(0,0,0,0.15)]"
              />
              <p className="font-display text-[16px] italic text-gold-light">Want more than ideas?</p>
              <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.1] tracking-tight text-balance">
                Want the step-by-step guides?
              </h2>
              <p className="mx-auto mt-3 max-w-[460px] text-[15.5px] leading-[1.6] text-cream/80">
                The library has 120+ hands-on activities with everything planned out. Instructions,
                skill levels, and no prep required.
              </p>
              {/* Goes to /#membership, not /library: the library is auth-gated
                  and noindex, so a logged-out visitor cannot see inside it. */}
              <Link
                href="/#membership"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-[15.5px] font-semibold text-forest-dark no-underline transition-colors hover:bg-white"
              >
                See what&rsquo;s inside <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
