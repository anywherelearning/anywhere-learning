import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IDEAS_DATA,
  getCategoryBySlug,
  getListBySlug,
  getTotalIdeas,
  getListCount,
  type IdeaCategory,
  type IdeaList,
} from '@/lib/ideas';
import { getIdeaListPdfUrls } from '@/lib/idea-list-pdfs';
import { getIdeaListSeo } from '@/lib/idea-list-seo';
import { IDEA_ICONS } from '@/components/ideas/IdeasIcons';
import ScrollReveal from '@/components/shared/ScrollReveal';
import IdeasChecklist from './IdeasChecklist';

/* ──────────────────────────────────────────────────────────────────
   Static generation. return slugs for BOTH categories AND lists
   ────────────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  const categorySlugs = IDEAS_DATA.map((cat) => ({ slug: cat.slug }));
  const listSlugs = IDEAS_DATA.flatMap((cat) =>
    cat.lists.map((list) => ({ slug: list.slug })),
  );
  return [...categorySlugs, ...listSlugs];
}

/* ──────────────────────────────────────────────────────────────────
   Metadata. different for categories vs lists
   ────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a category
  const category = getCategoryBySlug(slug);
  if (category) {
    const listCount = getListCount(category);
    const ideaCount = getTotalIdeas(category);
    const title = `${category.name} Ideas for Kids`;
    const description = `${category.blurb} Browse ${listCount} free idea lists with ${ideaCount} activities.`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://anywherelearning.co/ideas/${category.slug}`,
      },
      openGraph: {
        title: `${title} | Anywhere Learning`,
        description,
        url: `https://anywherelearning.co/ideas/${category.slug}`,
        type: 'website',
      },
    };
  }

  // Check if it's a list
  const result = getListBySlug(slug);
  if (!result) return {};

  const { list } = result;
  const seo = getIdeaListSeo(list.slug);

  // Prefer hand-written, keyword-rich SEO copy; fall back to the raw intro.
  const titleTag = seo?.seoTitle ?? list.title;
  const description =
    seo?.metaDescription ?? list.intro.slice(0, 155).replace(/\.$/, '') + '.';

  // Per-list social share image (generated 1200x630). Falls back to the
  // site default if the list-specific image hasn't been generated yet.
  const ogImage = `https://anywherelearning.co/ideas/og/${list.slug}.png`;

  return {
    // Absolute title so the keyword-led tag isn't pushed past the SERP cutoff
    // by the "| Anywhere Learning" template suffix.
    title: { absolute: titleTag },
    description,
    alternates: {
      canonical: `https://anywherelearning.co/ideas/${list.slug}`,
    },
    openGraph: {
      title: titleTag,
      description,
      url: `https://anywherelearning.co/ideas/${list.slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: list.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleTag,
      description,
      images: [ogImage],
    },
  };
}

/* ──────────────────────────────────────────────────────────────────
   Icon helper (for detail page breadcrumbs / badges)
   ────────────────────────────────────────────────────────────────── */

const ICON_PATHS: Record<string, string> = {
  Leaf: 'M17 8C8 10 5.9 16.09 3.82 21.18M12.72 2.58C12.72 2.58 22 3.07 22 12.72c0 3.4-1.93 6.35-4.76 7.83A10.72 10.72 0 0 1 12.72 22C7.23 22 2 17.5 2 12c0-5.5 5.23-9.42 10.72-9.42Z',
  ChefHat:
    'M6 13.87A4 4 0 0 1 7.41 6.6a5.11 5.11 0 0 1 9.18 0A4 4 0 0 1 18 13.87V21H6zM6 17h12',
  Lightbulb:
    'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4',
  Cog: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
  Palette:
    'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.77 1.5-1.5 0-.35-.12-.69-.36-.97-.22-.26-.34-.54-.34-.86 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9.17-10-9.17ZM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z',
  Globe:
    'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10ZM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2Z',
  Sparkle:
    'M12 3l1.59 4.41L18 9l-4.41 1.59L12 15l-1.59-4.41L6 9l4.41-1.59L12 3ZM5 19l.9-2.6L8.5 15.5l-2.6-.9L5 12l-.9 2.6L1.5 15.5l2.6.9L5 19ZM19 19l.9-2.6 2.6-.9-2.6-.9L19 12l-.9 2.6-2.6.9 2.6.9L19 19Z',
  Heart:
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
};

function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const d = ICON_PATHS[icon];
  if (!d) return null;
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Page component. routes to CategoryView or ListDetailView
   ────────────────────────────────────────────────────────────────── */

export default async function IdeaSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try category first
  const category = getCategoryBySlug(slug);
  if (category) {
    return <CategoryView category={category} />;
  }

  // Try list
  const result = getListBySlug(slug);
  if (result) {
    return <ListDetailView category={result.category} list={result.list} />;
  }

  notFound();
}

/* ══════════════════════════════════════════════════════════════════
   LEVEL 2: Category page
   ══════════════════════════════════════════════════════════════════ */

function CategoryView({ category }: { category: IdeaCategory }) {
  const listCount = getListCount(category);
  const ideaCount = getTotalIdeas(category);
  const otherCategories = IDEAS_DATA.filter((c) => c.slug !== category.slug);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ideas',
        item: 'https://anywherelearning.co/ideas',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `https://anywherelearning.co/ideas/${category.slug}`,
      },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Ideas for Kids`,
    description: category.blurb,
    url: `https://anywherelearning.co/ideas/${category.slug}`,
    numberOfItems: listCount,
    itemListElement: category.lists.map((list, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: list.title,
      url: `https://anywherelearning.co/ideas/${list.slug}`,
    })),
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

      <main className="bg-[#faf9f6] min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
          <div className="mx-auto max-w-[1180px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="py-3.5 flex items-center gap-2.5 text-[13px] text-gray-500"
            >
              <Link
                href="/ideas"
                className="hover:text-[#3d5c3b] transition-colors no-underline text-gray-600"
              >
                All idea lists
              </Link>
              <span className="text-[#C9C5B7]" aria-hidden="true">
                &rsaquo;
              </span>
              <span aria-current="page" className="text-gray-500 truncate max-w-[300px]">
                {category.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Category header */}
        <header
          className="pt-14 md:pt-20 pb-10 md:pb-14"
          style={{
            background: `linear-gradient(180deg, ${category.accent}11 0%, #faf9f6 100%)`,
          }}
        >
          <div className="mx-auto max-w-[820px] px-6 text-center">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-5"
                style={{
                  background: `${category.accent}16`,
                  color: category.accent,
                }}
              >
                {IDEA_ICONS[category.icon]}
              </div>

              {/* Name */}
              <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.06] tracking-tight text-balance">
                {category.name}
              </h1>

              {/* Blurb */}
              <p className="mt-4 max-w-[600px] mx-auto text-[17px] leading-[1.6] text-gray-600 text-balance">
                {category.blurb}
              </p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                  style={{
                    color: category.accent,
                    borderColor: `${category.accent}40`,
                    background: `${category.accent}10`,
                  }}
                >
                  {listCount} {listCount === 1 ? 'list' : 'lists'}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                  style={{
                    color: category.accent,
                    borderColor: `${category.accent}40`,
                    background: `${category.accent}10`,
                  }}
                >
                  {ideaCount} ideas
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                  style={{
                    color: category.accent,
                    borderColor: `${category.accent}40`,
                    background: `${category.accent}10`,
                  }}
                >
                  Free to print &amp; keep
                </span>
              </div>
          </div>
        </header>

        {/* List cards grid */}
        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.lists.map((list) => {
                const itemCount = list.sections.reduce(
                  (sum, s) => sum + s.items.length,
                  0,
                );
                const sectionCount = list.sections.length;

                return (
                    <Link
                      key={list.slug}
                      href={`/ideas/${list.slug}`}
                      className="group bg-white border border-[#e8e5de] rounded-xl overflow-hidden flex flex-col h-full no-underline text-inherit hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                      {/* Cover image */}
                      <div className="relative aspect-[8.5/11] w-full bg-[#f0ede6] overflow-hidden">
                        <Image
                          src={`/ideas/${list.slug}.jpg`}
                          alt={list.title}
                          fill
                          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>

                      <div className="p-3.5 flex flex-col flex-1">
                        {/* Title */}
                        <h2
                          className="font-display text-[16px] leading-[1.15] tracking-tight mb-2 group-hover:opacity-80 transition-opacity"
                          style={{ color: category.accent }}
                        >
                          {list.title}
                        </h2>

                        {/* Link */}
                        <div className="pt-2.5 mt-auto border-t border-[#e8e5de]">
                          <span
                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold group-hover:gap-2 transition-all duration-200"
                            style={{ color: category.accent }}
                          >
                            See list
                            <span className="font-display italic text-sm">
                              &rarr;
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* More categories */}
        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-16 md:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="mb-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3d5c3b] inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-[#588157] inline-block" />
                More categories
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance">
                Explore another <span className="italic text-[#588157]">category.</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherCategories.map((cat) => {
                const catListCount = getListCount(cat);
                const catIdeaCount = getTotalIdeas(cat);
                return (
                  <Link
                    key={cat.slug}
                    href={`/ideas/${cat.slug}`}
                    className="group bg-[#faf9f6] border border-[#D8D4C5] rounded-xl p-5 no-underline text-inherit hover:shadow-md hover:border-[#C9C5B7] transition-all duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-full grid place-items-center mb-3"
                      style={{
                        background: `${cat.accent}14`,
                        color: cat.accent,
                      }}
                    >
                      {IDEA_ICONS[cat.icon]}
                    </div>
                    <h3
                      className="font-display text-[17px] leading-[1.15] mb-1.5"
                      style={{ color: cat.accent }}
                    >
                      {cat.name}
                    </h3>
                    <span className="text-[11.5px] font-medium text-gray-500">
                      {catListCount} {catListCount === 1 ? 'list' : 'lists'} &middot; {catIdeaCount} ideas
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[640px] px-6 text-center">
            <ScrollReveal>
              <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-8 md:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3d5c3b] inline-flex items-center gap-2.5 mb-3">
                  <span className="w-[22px] h-px bg-[#588157] inline-block" />
                  Want more than ideas?
                </p>
                <h2 className="font-display text-[clamp(1.4rem,2.8vw,2rem)] leading-[1.1] tracking-tight text-balance mb-3">
                  Want the step-by-step guides?
                </h2>
                <p className="text-[15.5px] leading-[1.6] text-gray-600 mb-6">
                  The library has 100+ hands-on activities with everything
                  planned out , instructions, skill levels, and no prep
                  required.
                </p>
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2.5 bg-[#588157] text-[#faf9f6] font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-[#3d5c3b] hover:-translate-y-px transition-all duration-200"
                >
                  See inside the library
                  <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                    &rarr;
                  </span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEVEL 3: List detail page (existing behavior, updated breadcrumb)
   ══════════════════════════════════════════════════════════════════ */

function ListDetailView({
  category,
  list,
}: {
  category: IdeaCategory;
  list: IdeaList;
}) {
  const totalItems = list.sections.reduce((n, s) => n + s.items.length, 0);
  const themeCount = list.sections.length;

  // Other lists in the same category (excluding current)
  const siblingLists = category.lists.filter((l) => l.slug !== list.slug);

  // Lists from other categories (grab a handful)
  const otherCategoryLists = IDEAS_DATA.filter(
    (c) => c.slug !== category.slug,
  )
    .flatMap((c) => c.lists.map((l) => ({ list: l, category: c })))
    .slice(0, 6);

  // SEO copy: how-to paragraph + FAQs (crawlable body + rich results)
  const seo = getIdeaListSeo(list.slug);
  const pdfUrls = getIdeaListPdfUrls(list.slug);

  /* JSON-LD */
  const allItems = list.sections.flatMap((section) => section.items);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seo?.seoTitle ?? list.title,
    description: seo?.metaDescription ?? list.intro,
    url: `https://anywherelearning.co/ideas/${list.slug}`,
    numberOfItems: totalItems,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    isAccessibleForFree: true,
    inLanguage: 'en',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item,
    })),
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ideas',
        item: 'https://anywherelearning.co/ideas',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `https://anywherelearning.co/ideas/${category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: list.title,
        item: `https://anywherelearning.co/ideas/${list.slug}`,
      },
    ],
  };

  // FAQPage schema — drives "People Also Ask" eligibility and rich results.
  const faqLd =
    seo && seo.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: seo.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <main className="bg-[#faf9f6] min-h-screen">
        {/* 3-level breadcrumb */}
        <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
          <div className="mx-auto max-w-[1180px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="py-3.5 flex items-center gap-2.5 text-[13px] text-gray-500"
            >
              <Link
                href="/ideas"
                className="hover:text-[#3d5c3b] transition-colors no-underline text-gray-600"
              >
                All idea lists
              </Link>
              <span className="text-[#C9C5B7]" aria-hidden="true">
                &rsaquo;
              </span>
              <Link
                href={`/ideas/${category.slug}`}
                className="hover:text-[#3d5c3b] transition-colors no-underline text-gray-600 truncate max-w-[160px]"
              >
                {category.name}
              </Link>
              <span className="text-[#C9C5B7]" aria-hidden="true">
                &rsaquo;
              </span>
              <span
                aria-current="page"
                className="text-gray-500 truncate max-w-[300px]"
              >
                {list.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero header */}
        <header
          className="pt-14 md:pt-20 pb-10 md:pb-14 print:hidden"
          style={
            {
              '--accent': category.accent,
              background: `linear-gradient(180deg, ${category.accent}11 0%, #faf9f6 100%)`,
            } as React.CSSProperties
          }
        >
          <div className="mx-auto max-w-[820px] px-6 text-center">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] mb-5"
              style={{ color: category.accent }}
            >
              <CategoryIcon icon={category.icon} />
              {category.name}
            </span>

            {/* Title */}
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.06] tracking-tight text-balance">
              {list.title}
            </h1>

            {/* Intro */}
            <p className="mt-5 max-w-[600px] mx-auto text-[17px] leading-[1.6] text-gray-600 text-balance">
              {list.intro}
            </p>

            {/* Stat pills */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                style={{
                  color: category.accent,
                  borderColor: `${category.accent}40`,
                  background: `${category.accent}10`,
                }}
              >
                {totalItems} ideas
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                style={{
                  color: category.accent,
                  borderColor: `${category.accent}40`,
                  background: `${category.accent}10`,
                }}
              >
                {themeCount} themes
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full border"
                style={{
                  color: category.accent,
                  borderColor: `${category.accent}40`,
                  background: `${category.accent}10`,
                }}
              >
                Free to print &amp; keep
              </span>
            </div>
          </div>
        </header>

        {/* Print-only branded layout -- scales to fit one page */}
        <div
          className="hidden print:block"
          style={{
            '--p-item-fs': totalItems > 35 ? '8px' : totalItems > 20 ? '8.5px' : '9.5px',
            '--p-item-lh': totalItems > 35 ? '1.3' : totalItems > 20 ? '1.35' : '1.45',
            '--p-item-gap': totalItems > 35 ? '1px' : totalItems > 20 ? '2px' : '3px',
            '--p-section-mb': totalItems > 35 ? '2px' : totalItems > 20 ? '4px' : '12px',
            '--p-check': totalItems > 35 ? '9px' : totalItems > 20 ? '10px' : '11px',
            '--p-title-fs': totalItems > 35 ? '20px' : totalItems > 20 ? '22px' : '26px',
            '--p-header-mb': totalItems > 35 ? '3px' : totalItems > 20 ? '4px' : '14px',
            '--p-title-mb': totalItems > 35 ? '4px' : totalItems > 20 ? '6px' : '14px',
          } as React.CSSProperties}
        >
          {/* Header bar with accent stripe */}
          <div
            className="h-[5px] rounded-full"
            style={{ background: category.accent, marginBottom: 'var(--p-header-mb)' }}
          />
          <div className="flex items-center justify-between pb-2 border-b border-gray-200" style={{ marginBottom: 'var(--p-header-mb)' }}>
            <div>
              <p className="font-display text-[18px] tracking-tight text-gray-800 m-0">
                Anywhere Learning
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mt-0.5 m-0">
                anywherelearning.co
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[8px] font-semibold uppercase tracking-[0.18em] m-0"
                style={{ color: category.accent }}
              >
                {category.name}
              </p>
              <p className="text-[8px] text-gray-400 mt-0.5 m-0">
                {totalItems} ideas &middot; {list.sections.length} themes
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center" style={{ marginBottom: 'var(--p-title-mb)' }}>
            <h1
              className="font-display text-gray-800 mb-0"
              style={{ color: category.accent, fontSize: 'var(--p-title-fs)' }}
            >
              {list.title}
            </h1>
            <div
              className="mx-auto w-16 h-[2px] rounded-full mt-1"
              style={{ background: `${category.accent}60` }}
            />
          </div>

          {/* Checklist sections */}
          {list.sections.map((section, si) => (
            <div key={section.name} style={{ marginBottom: 'var(--p-section-mb)' }}>
              <div className="flex items-center gap-1.5 mb-1 pb-0.5 border-b border-gray-200">
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[7px] font-bold text-white"
                  style={{ background: category.accent }}
                >
                  {String(si + 1).padStart(2, '0')}
                </span>
                <h2
                  className="text-[9px] font-bold uppercase tracking-[0.14em] m-0"
                  style={{ color: category.accent }}
                >
                  {section.name}
                </h2>
                <span className="text-[7px] text-gray-400 ml-auto">
                  {section.items.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-5" style={{ rowGap: 'var(--p-item-gap)' }}>
                {section.items.map((item) => (
                  <label
                    key={item}
                    className="flex items-start gap-1.5 text-gray-700"
                    style={{ fontSize: 'var(--p-item-fs)', lineHeight: 'var(--p-item-lh)' }}
                  >
                    <span
                      className="inline-block border-[1.5px] rounded-sm flex-shrink-0 mt-[1px]"
                      style={{
                        width: 'var(--p-check)',
                        height: 'var(--p-check)',
                        borderColor: `${category.accent}80`,
                      }}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Blog CTA */}
          {list.blogSlug && (
            <div
              className="mt-2 py-1.5 px-3 rounded text-center border"
              style={{
                borderColor: `${category.accent}30`,
                background: `${category.accent}08`,
              }}
            >
              <p
                className="text-[8.5px] font-medium m-0"
                style={{ color: category.accent }}
              >
                Want the full guide? anywherelearning.co/blog/{list.blogSlug}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-[8px] text-gray-400 m-0 italic">
              Meaningful Learning, Wherever You Are
            </p>
            <p className="text-[8px] text-gray-400 m-0">
              anywherelearning.co/ideas
            </p>
          </div>
        </div>

        {/* Interactive checklist */}
        <div className="print:hidden">
          <IdeasChecklist list={list} accent={category.accent} pdfUrls={pdfUrls} />
        </div>

        {/* How to use this list + FAQ (crawlable SEO content) */}
        {seo && (
          <section className="py-12 md:py-16 print:hidden border-t border-[#E8E5DC]">
            <div className="mx-auto max-w-[760px] px-6">
              {/* How to use */}
              <div className="mb-12">
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.12] tracking-tight text-balance">
                  How to use this list
                </h2>
                <p className="mt-4 text-[16.5px] leading-[1.7] text-[#4a4843]">
                  {seo.howToUse}
                </p>
              </div>

              {/* FAQ */}
              {seo.faqs.length > 0 && (
                <div>
                  <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.12] tracking-tight text-balance mb-6">
                    Frequently asked questions
                  </h2>
                  <div className="flex flex-col gap-3">
                    {seo.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group bg-white border border-[#E8E5DC] rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-body font-semibold text-[16px] text-ink hover:bg-[#f7f5f0] transition-colors">
                          {faq.question}
                          <span
                            className="flex-shrink-0 grid place-items-center w-6 h-6 rounded-full transition-transform duration-200 group-open:rotate-45"
                            style={{ background: `${category.accent}14`, color: category.accent }}
                            aria-hidden="true"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </span>
                        </summary>
                        <div className="px-5 pb-4 -mt-1 text-[15.5px] leading-[1.65] text-[#5c5a54]">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 print:hidden">
          <div className="mx-auto max-w-[680px] px-6 text-center">
            <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
              Want the step-by-step guides?
            </h2>
            <p className="mt-4 text-[16.5px] leading-[1.6] text-gray-600 max-w-[520px] mx-auto">
              These ideas are a great starting point. The membership gives you
              fully guided activities with step-by-step instructions, three skill
              levels, and parent tips for every single one.
            </p>
            <Link
              href="/join"
              className="mt-7 inline-flex items-center gap-2.5 bg-[#588157] text-[#faf9f6] font-semibold py-3.5 px-7 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-[#3d5c3b] hover:-translate-y-px transition-all duration-200 no-underline"
            >
              See inside the library
              <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                &rarr;
              </span>
            </Link>
          </div>
        </section>

        {/* More idea lists */}
        {(siblingLists.length > 0 || otherCategoryLists.length > 0) && (
          <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-16 md:py-20 print:hidden">
            <div className="mx-auto max-w-[1180px] px-6">
              {/* Sibling lists in the same category */}
              {siblingLists.length > 0 && (
                <div className="mb-14">
                  <div className="mb-10">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3d5c3b] inline-flex items-center gap-2.5">
                      <span className="w-[22px] h-px bg-[#588157] inline-block" />
                      More in {category.name}
                    </p>
                    <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance">
                      Keep exploring{' '}
                      <span className="italic text-[#588157]">
                        {category.name.toLowerCase()}.
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {siblingLists.map((l) => {
                      const count = l.sections.reduce(
                        (n, s) => n + s.items.length,
                        0,
                      );
                      return (
                        <Link
                          key={l.slug}
                          href={`/ideas/${l.slug}`}
                          className="group bg-[#faf9f6] border border-[#D8D4C5] rounded-[14px] p-6 no-underline text-inherit flex flex-col shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] hover:-translate-y-[3px] hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)] hover:border-[#C9C5B7] transition-all duration-200"
                        >
                          <span
                            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: category.accent }}
                          >
                            <CategoryIcon icon={category.icon} />
                            {category.name}
                          </span>
                          <h3 className="font-display text-[20px] leading-[1.15] tracking-tight mt-2.5 mb-2">
                            {l.title}
                          </h3>
                          <p className="text-[14px] leading-[1.55] text-gray-600 m-0 flex-1">
                            {l.intro.length > 120
                              ? l.intro.slice(0, 117) + '...'
                              : l.intro}
                          </p>
                          <div className="mt-4 pt-4 border-t border-dashed border-[#C9C5B7] flex items-center justify-between text-[13px]">
                            <span className="text-gray-500">
                              {count} ideas
                            </span>
                            <span
                              className="font-semibold transition-colors"
                              style={{ color: category.accent }}
                            >
                              View list &rarr;
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lists from other categories */}
              {otherCategoryLists.length > 0 && (
                <div>
                  <div className="mb-10">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3d5c3b] inline-flex items-center gap-2.5">
                      <span className="w-[22px] h-px bg-[#588157] inline-block" />
                      More idea lists
                    </p>
                    <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance">
                      Explore another{' '}
                      <span className="italic text-[#588157]">category.</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {otherCategoryLists.map(({ list: l, category: c }) => {
                      const count = l.sections.reduce(
                        (n, s) => n + s.items.length,
                        0,
                      );
                      return (
                        <Link
                          key={l.slug}
                          href={`/ideas/${l.slug}`}
                          className="group bg-[#faf9f6] border border-[#D8D4C5] rounded-[14px] p-6 no-underline text-inherit flex flex-col shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] hover:-translate-y-[3px] hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)] hover:border-[#C9C5B7] transition-all duration-200"
                        >
                          <span
                            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: c.accent }}
                          >
                            <CategoryIcon icon={c.icon} />
                            {c.name}
                          </span>
                          <h3 className="font-display text-[20px] leading-[1.15] tracking-tight mt-2.5 mb-2">
                            {l.title}
                          </h3>
                          <p className="text-[14px] leading-[1.55] text-gray-600 m-0 flex-1">
                            {l.intro.length > 120
                              ? l.intro.slice(0, 117) + '...'
                              : l.intro}
                          </p>
                          <div className="mt-4 pt-4 border-t border-dashed border-[#C9C5B7] flex items-center justify-between text-[13px]">
                            <span className="text-gray-500">
                              {count} ideas
                            </span>
                            <span
                              className="font-semibold transition-colors"
                              style={{ color: c.accent }}
                            >
                              View list &rarr;
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
