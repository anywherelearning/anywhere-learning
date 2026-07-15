import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getTotalIdeas, getListCount } from '@/lib/ideas';
import { IDEA_ICONS } from '@/components/ideas/IdeasIcons';

export const metadata: Metadata = {
  // Absolute so the keyword-led tag isn't pushed past the SERP cutoff
  title: { absolute: 'Activity Ideas for Kids: 15 Free Printable Checklists' },
  description:
    '320 activity ideas for kids in 15 free printable checklists: nature, STEM, life skills, cooking, travel, and more. No signup, no email, just print.',
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

export default function IdeasPage() {
  const categories = getAllCategories();
  const totalLists = categories.reduce((sum, c) => sum + getListCount(c), 0);

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
      'Free activity idea checklists for kids across nine categories. No signup required.',
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
      <main className="bg-[#faf9f6]">
        {/* ---------------------------------------------------------------- */}
        {/* HERO                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-12 md:pt-16 pb-8 md:pb-10">
          <div className="mx-auto max-w-[820px] px-6 text-center">
            {/* Title */}
            <h1 className="font-display text-[clamp(2.5rem,5.8vw,4.25rem)] leading-[1.04] tracking-tight text-balance">
              <span
                className="relative inline-block pb-2"
                style={{
                  borderBottom: '3px solid #e8c99a',
                  borderRadius: '0 0 4px 4px',
                }}
              >
                Activity Ideas for Kids
              </span>
            </h1>

            {/* Subtitle: definitional answer block, then the warm line */}
            <p className="mt-5 max-w-[640px] mx-auto text-[17.5px] md:text-[18.5px] leading-[1.55] text-[#5c5a54]">
              15 free printable checklists with 320 activity ideas for kids,
              across nature, kitchen, life skills, STEM, creative, travel,
              AI, and mindset. Grab a list, pin it to the fridge, and check
              things off together. No signup, ever.
            </p>

            {/* Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                `${categories.length} categories`,
                `${totalLists} idea lists`,
                'Always free',
              ].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 bg-[#f0e9d8] text-[#6b5d3e] font-medium text-[13px] px-3.5 py-1.5 rounded-full whitespace-nowrap"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#d4a373]"
                    aria-hidden="true"
                  />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CATEGORY CARDS                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-[1120px] px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const listCount = getListCount(cat);
                const ideaCount = getTotalIdeas(cat);

                return (
                  <Link
                    key={cat.slug}
                    href={`/ideas/${cat.slug}`}
                    className="group relative bg-white border border-[#e8e5de] rounded-xl flex flex-col h-full no-underline text-inherit hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                  >
                    {/* Accent top band */}
                    <div
                      className="h-[6px] w-full shrink-0"
                      style={{ backgroundColor: cat.accent }}
                    />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Icon */}
                      <div
                        className="w-14 h-14 rounded-full grid place-items-center mb-4"
                        style={{
                          background: `${cat.accent}1a`,
                          color: cat.accent,
                        }}
                      >
                        {IDEA_ICONS[cat.icon]}
                      </div>

                      {/* Name */}
                      <h2
                        className="font-display text-[22px] leading-[1.15] mb-2"
                        style={{ color: cat.accent }}
                      >
                        {cat.name}
                      </h2>

                      {/* Blurb */}
                      <p className="text-[14.5px] leading-[1.55] text-gray-600 mb-4 flex-1">
                        {cat.blurb}
                      </p>

                      {/* Stats */}
                      <span className="text-[12.5px] font-medium text-gray-500 mb-3">
                        {listCount} {listCount === 1 ? 'list' : 'lists'} &middot; {ideaCount} ideas
                      </span>

                      {/* Browse link */}
                      <span
                        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold group-hover:gap-2 transition-all duration-200"
                        style={{ color: cat.accent }}
                      >
                        Browse lists
                        <span className="font-display italic text-base">
                          &rarr;
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}

              {/* --- "More on the way" card --- */}
              <div className="relative border-2 border-dashed border-[#d4a373] rounded-xl p-6 flex flex-col h-full bg-[#faf9f6]">
                <h2 className="font-display text-[22px] leading-[1.15] text-[#d4a373] mb-2">
                  More on the way
                </h2>
                <p className="text-[14.5px] leading-[1.55] text-gray-600 mb-5 flex-1">
                  We add new lists all the time. Got a request? Tell us what
                  your family wants to explore next.
                </p>
                <a
                  href="mailto:info@anywherelearning.co?subject=Idea%20list%20suggestion"
                  className="inline-flex items-center gap-1.5 font-semibold text-[13.5px] text-[#d4a373] hover:gap-2.5 transition-all duration-200"
                >
                  Suggest a list
                  <span className="font-display italic text-base">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM CTA                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-[640px] px-6 text-center">
            <div className="bg-[#588157] rounded-[18px] p-8 md:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70 inline-flex items-center gap-2.5 mb-3">
                <span className="w-[22px] h-px bg-white/40 inline-block" />
                Want more than ideas?
              </p>
              <h2 className="font-display text-[clamp(1.4rem,2.8vw,2rem)] leading-[1.1] tracking-tight text-balance mb-3 text-white">
                Want the step-by-step guides?
              </h2>
              <p className="text-[15.5px] leading-[1.6] text-white/80 mb-6">
                The library has 120+ hands-on activities with everything
                planned out. Instructions, skill levels, and no prep
                required.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center gap-2.5 bg-white text-[#3d5c3b] font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-[#faf9f6] hover:-translate-y-px transition-all duration-200"
              >
                See inside the library
                <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-[#588157]/15">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
