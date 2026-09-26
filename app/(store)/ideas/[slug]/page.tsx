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
import { getIdeaListDownloadPaths } from '@/lib/idea-list-pdfs';
import { getIdeaListSeo } from '@/lib/idea-list-seo';
import { getPostBySlug } from '@/lib/blog';
import { IDEA_ICONS } from '@/components/ideas/IdeasIcons';
import IdeaListEmailCapture from '@/components/ideas/IdeaListEmailCapture';
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
        // Explicit image: page-level openGraph replaces the layout default
        // entirely (shallow merge), so omitting this shipped no og:image.
        images: [
          {
            url: 'https://anywherelearning.co/og-default.jpg',
            width: 1200,
            height: 630,
            alt: `${category.name} activity idea checklists`,
          },
        ],
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

/** '2026-06-10' -> 'June 2026' (string split, no timezone surprises) */
function formatMonthYear(iso: string): string {
  const [year, month] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[(month ?? 1) - 1]} ${year}`;
}

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

// Category pages hang each list on the fridge like /ideas does.
const LIST_TILT = [-1.2, 1, -0.8, 1.4, -1.4, 0.8];
const LIST_MAGNETS = ['#C97B5C', '#588157', '#d4a373', '#6b8e9e', '#c47a8f', '#3A5A40'];

function CategoryView({ category }: { category: IdeaCategory }) {
  const listCount = getListCount(category);
  const ideaCount = getTotalIdeas(category);
  const otherCategories = IDEAS_DATA.filter((c) => c.slug !== category.slug);

  const categoryUrl = `https://anywherelearning.co/ideas/${category.slug}`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${categoryUrl}#breadcrumb`,
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
        item: categoryUrl,
      },
    ],
  };

  /* CollectionPage anchors the page entity and links to the sitewide graph */
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${categoryUrl}#webpage`,
    url: categoryUrl,
    name: `${category.name} Ideas for Kids`,
    description: category.blurb,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: { '@id': 'https://anywherelearning.co/#website' },
    publisher: { '@id': 'https://anywherelearning.co/#organization' },
    breadcrumb: { '@id': `${categoryUrl}#breadcrumb` },
    mainEntity: {
      '@type': 'ItemList',
      name: `${category.name} Ideas for Kids`,
      numberOfItems: listCount,
      itemListElement: category.lists.map((list, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: list.title,
        url: `https://anywherelearning.co/ideas/${list.slug}`,
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

      <main className="min-h-screen bg-[#E9EEE6]">
        {/* ── Header on the fridge: breadcrumb, name, blurb, counts ── */}
        <header className="pb-8 pt-6 md:pb-10">
          <div className="mx-auto max-w-[1080px] px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-[13px] text-gray-500">
              <Link href="/ideas" className="text-gray-600 no-underline transition-colors hover:text-[#3d5c3b]">
                All idea lists
              </Link>
              <span className="text-[#B9B5A7]" aria-hidden="true">&rsaquo;</span>
              <span aria-current="page" className="max-w-[300px] truncate">{category.name}</span>
            </nav>
            <div className="mx-auto mt-8 max-w-[760px] text-center">
              <div
                className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_6px_14px_-6px_rgba(45,58,46,0.35)]"
                style={{ color: category.accent }}
              >
                {IDEA_ICONS[category.icon]}
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,3.6rem)] leading-[1.06] tracking-tight text-balance">
                {category.name}
              </h1>
              <p className="mx-auto mt-4 max-w-[680px] text-[17px] leading-[1.6] text-gray-600 text-balance">
                {category.blurb}
              </p>
              <p className="mt-4 text-[13.5px] font-semibold" style={{ color: category.accent }}>
                {`${listCount} ${listCount === 1 ? 'list' : 'lists'} \u00b7 ${ideaCount} ideas \u00b7 Free to print & keep`}
              </p>
            </div>
          </div>
        </header>

        {/* ── The lists, each pinned up with its printable cover ── */}
        <section className="pb-14 md:pb-16">
          <div className={`mx-auto px-6 ${listCount === 1 ? 'max-w-[820px]' : 'max-w-[1080px]'}`}>
            <ul className={`m-0 grid list-none gap-x-8 gap-y-10 p-0 ${listCount === 1 ? '' : 'md:grid-cols-2'}`}>
              {category.lists.map((list, i) => {
                const items = list.sections.flatMap((sec) => sec.items);
                const preview = items.slice(0, listCount === 1 ? 6 : 4);
                return (
                  <li key={list.slug} style={{ transform: `rotate(${LIST_TILT[i % LIST_TILT.length]}deg)` }}>
                    <Link
                      href={`/ideas/${list.slug}`}
                      className="group relative grid h-full grid-cols-[96px_1fr] gap-5 bg-white p-5 pt-7 text-inherit no-underline shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)] transition-transform duration-200 hover:-translate-y-1 sm:grid-cols-[130px_1fr]"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-[-10px] h-6 w-6 -translate-x-1/2 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
                        style={{ background: LIST_MAGNETS[i % LIST_MAGNETS.length] }}
                      />
                      <div className="relative aspect-[8.5/11] w-full self-start overflow-hidden rounded-[4px] border border-[#E6E0CD] bg-[#f0ede6]">
                        <Image
                          src={`/ideas/${list.slug}.jpg`}
                          alt={`${list.title} printable`}
                          fill
                          className="object-cover object-top"
                          sizes="130px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-[20px] leading-tight tracking-tight text-[#2b2a26] group-hover:text-forest-dark">
                          {list.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {list.sections.map((sec) => (
                            <span
                              key={sec.name}
                              className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
                              style={{ color: category.accent, background: `${category.accent}14` }}
                            >
                              {sec.name}
                            </span>
                          ))}
                        </div>
                        <ul className="m-0 mt-3 list-none space-y-1.5 border-t border-dashed border-[#E2DCC8] p-0 pt-3">
                          {preview.map((item, k) => (
                            <li
                              key={item}
                              className={`flex gap-2 text-[13.5px] leading-snug text-gray-600 ${k >= 3 ? 'max-sm:hidden' : ''}`}
                            >
                              <span aria-hidden="true" className="mt-[2px] h-3.5 w-3.5 shrink-0 rounded-[3px] border-[1.5px] border-[#CFC9B6]" />
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-[13px] font-semibold text-forest-dark">
                          {`See all ${items.length} ideas →`}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── Other categories, as magnets ── */}
        <section className="pb-12">
          <div className="mx-auto max-w-[1080px] px-6 text-center">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight">
              Explore another <span className="italic text-forest">category.</span>
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/ideas/${cat.slug}`}
                  className="inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-[14px] font-semibold text-white no-underline shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35),inset_0_-3px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5"
                  style={{ background: `color-mix(in srgb, ${cat.accent} 82%, #1f2a1e)` }}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 [&_svg]:h-4 [&_svg]:w-4">
                    {IDEA_ICONS[cat.icon]}
                  </span>
                  {cat.name}
                  <span className="text-[12px] font-medium text-white/75">{getTotalIdeas(cat)}</span>
                </Link>
              ))}
            </div>
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
                The library has 120+ hands-on activities with everything planned out: instructions,
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

  const totalListCount = IDEAS_DATA.reduce((n, c) => n + c.lists.length, 0);

  // Related lists: same category first (most relevant next click), then a few
  // from elsewhere. Capped, because the full index is one link away.
  const relatedLists = [
    ...category.lists
      .filter((l) => l.slug !== list.slug)
      .map((l) => ({ list: l, category })),
    ...IDEAS_DATA.filter((c) => c.slug !== category.slug).flatMap((c) =>
      c.lists.map((l) => ({ list: l, category: c })),
    ),
  ].slice(0, 8);

  // SEO copy: how-to paragraph + FAQs (crawlable body + rich results)
  const seo = getIdeaListSeo(list.slug);
  // Gated route paths, not Blob URLs: the file is served only to a browser
  // holding the signed unlock cookie, so nothing here leaks the real link.
  const pdfUrls = getIdeaListDownloadPaths(list.slug);

  // The in-depth guide this checklist was distilled from. A visible,
  // crawlable link both ways tells search engines "guide + tool cluster",
  // not two pages competing for the same query.
  const blogPost = list.blogSlug ? getPostBySlug(list.blogSlug) : undefined;

  /* JSON-LD: CollectionPage wraps the checklist ItemList, anchors the page
     entity, and links it to the sitewide Organization/WebSite graph. The
     free PDFs are modeled as DigitalDocuments so the no-signup printable
     offer is machine-visible. */
  const allItems = list.sections.flatMap((section) => section.items);
  const pageUrl = `https://anywherelearning.co/ideas/${list.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: seo?.seoTitle ?? list.title,
    description: seo?.metaDescription ?? list.intro,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: { '@id': 'https://anywherelearning.co/#website' },
    publisher: { '@id': 'https://anywherelearning.co/#organization' },
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    author: {
      '@type': 'Person',
      // Same @id as the full Person node on /about, so AI engines see one
      // Amelie entity carrying the credentials, not a bare stub.
      '@id': 'https://anywherelearning.co/about#amelie',
      name: 'Amelie',
      url: 'https://anywherelearning.co/about',
      jobTitle: 'Former classroom teacher (B.Ed, M.Ed)',
    },
    datePublished: list.published ?? '2026-06-10',
    dateModified: list.updated ?? list.published ?? '2026-06-10',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `https://anywherelearning.co/ideas/og/${list.slug}.png`,
      width: 1200,
      height: 630,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#list-intro', '#how-to-use'],
    },
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${pageUrl}#list`,
      name: seo?.seoTitle ?? list.title,
      numberOfItems: totalItems,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: allItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item,
      })),
    },
    /* The printables now sit behind an email. They stay listed so the
       downloads are still machine-visible, but the direct Blob URLs are gone
       and isAccessibleForFree is false: publishing the real file URL next to
       a form asking for an email would hand out the thing being gated. The
       ItemList above is untouched, so the ideas themselves remain free and
       fully crawlable, which is what actually ranks this page. */
    ...(pdfUrls
      ? {
          hasPart: [
            {
              '@type': 'DigitalDocument',
              name: `${list.title} (printable PDF, full color)`,
              encodingFormat: 'application/pdf',
              isAccessibleForFree: false,
              potentialAction: { '@type': 'DownloadAction', target: pageUrl },
            },
            {
              '@type': 'DigitalDocument',
              name: `${list.title} (printable PDF, black and white)`,
              encodingFormat: 'application/pdf',
              isAccessibleForFree: false,
              potentialAction: { '@type': 'DownloadAction', target: pageUrl },
            },
          ],
        }
      : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
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

  // FAQPage schema: drives "People Also Ask" eligibility and rich results.
  const faqLd =
    seo && seo.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
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

      <main className="min-h-screen bg-[#E9EEE6] print:bg-white">
        {/* 3-level breadcrumb */}
        <div className="print:hidden">
          <div className="mx-auto max-w-[980px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="pt-6 flex items-center gap-2.5 text-[13px] text-gray-500"
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
          className="pt-8 md:pt-10 pb-8 md:pb-10 print:hidden"
          style={{ '--accent': category.accent } as React.CSSProperties}
        >
          <div className="mx-auto max-w-[920px] px-6 text-center">
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

            {/* Intro (speakable target) */}
            <p
              id="list-intro"
              className="mt-5 max-w-[720px] mx-auto text-[17px] leading-[1.6] text-gray-600 text-balance"
            >
              {list.intro}
            </p>

            {/* Byline + freshness */}
            <p className="mt-4 text-[13px] text-gray-500">
              Put together by{' '}
              <Link
                href="/about"
                className="font-medium text-[#3d5c3b] hover:underline"
              >
                Amelie
              </Link>
              , B.Ed, M.Ed, former classroom teacher &middot; Updated{' '}
              {formatMonthYear(list.updated ?? list.published ?? '2026-06-10')}
            </p>

            {/* Counts */}
            <p className="mt-4 text-[13.5px] font-semibold" style={{ color: category.accent }}>
              {`${totalItems} ideas \u00b7 ${themeCount} themes \u00b7 Free to print & keep`}
            </p>
          </div>
        </header>

        {/* Age x chore table: the "chart" search intent wants a real table,
            and tables are the most-extracted snippet format */}
        {list.slug === 'chores-by-age-ideas' && (
          <section className="pb-8 print:hidden">
            <div className="mx-auto max-w-[980px] px-4 sm:px-6 overflow-x-auto">
              <table className="w-full border-collapse bg-white border border-[#e8e5de] rounded-xl overflow-hidden text-[15px]">
                <caption className="text-left font-display text-[20px] tracking-tight pb-3">
                  Chore chart by age: what kids can own at each stage
                </caption>
                <thead>
                  <tr className="bg-[#F2EFE4] text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-[#3d5c3b] border-b border-[#e8e5de] whitespace-nowrap">
                      Age
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-[#3d5c3b] border-b border-[#e8e5de]">
                      Chores kids can own
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.sections.map((section) => (
                    <tr key={section.name} className="align-top">
                      <th
                        scope="row"
                        className="px-4 py-3 font-semibold text-left whitespace-nowrap border-b border-[#f0ede6]"
                        style={{ color: category.accent }}
                      >
                        {section.name}
                      </th>
                      <td className="px-4 py-3 leading-[1.6] text-[#4a4843] border-b border-[#f0ede6]">
                        {section.items.join(' · ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

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

          {/* Title (p, not h1: the hero already owns the page's single H1) */}
          <div className="text-center" style={{ marginBottom: 'var(--p-title-mb)' }}>
            <p
              className="font-display text-gray-800 mb-0"
              style={{ color: category.accent, fontSize: 'var(--p-title-fs)' }}
            >
              {list.title}
            </p>
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
        <div className="mx-auto max-w-[980px] px-4 sm:px-6 print:hidden">
          <div className="relative bg-white pt-8 shadow-[0_24px_44px_-28px_rgba(45,58,46,0.55)]">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[-12px] z-40 h-7 w-7 -translate-x-1/2 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
              style={{ background: category.accent }}
            />
          <IdeasChecklist
            list={list}
            accent={category.accent}
            pdfUrls={pdfUrls}
            categorySlug={category.slug}
          />
          </div>
        </div>

        {/* How to use this list. Sits between the list and the offer: it is
            the context for what they just read, and it earns the offer that
            follows. The FAQ stays below the offer so the ask stays high. */}
        {seo && (
          <section className="pt-12 pb-2 print:hidden">
            <div className="mx-auto max-w-[820px] px-6">
              <div id="how-to-use" className="relative -rotate-[0.6deg] bg-[#FBF3DC] p-6 pt-8 shadow-[0_18px_30px_-22px_rgba(45,58,46,0.5)] md:p-8 md:pt-9">
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[-10px] h-6 w-6 -translate-x-1/2 rounded-full bg-[#d4a373] shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
                />
                <h2 className="font-display text-[clamp(1.45rem,2.4vw,1.85rem)] leading-[1.12] tracking-tight text-balance">
                  How to use this list
                </h2>
                <p className="mt-3 max-w-[68ch] text-[16px] leading-[1.65] text-[#4a4843]">
                  {seo.howToUse}
                </p>

                {/* Crawlable link back to the source guide */}
                {blogPost && (
                  <p className="mt-3.5 max-w-[68ch] text-[15.5px] leading-[1.65] text-[#4a4843]">
                    This checklist is the quick version. For the why behind each
                    idea, parent tips, and the full walkthrough, read{' '}
                    <Link
                      href={`/blog/${list.blogSlug}`}
                      className="font-semibold underline decoration-[1.5px] underline-offset-2"
                      style={{ color: category.accent }}
                    >
                      {blogPost.title}
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Content upgrade: the printable version of this list, for an email. */}
        {pdfUrls && (
          <IdeaListEmailCapture
            listSlug={list.slug}
            categorySlug={category.slug}
            accent={category.accent}
            pdfUrls={pdfUrls}
          />
        )}

        {/* FAQ (crawlable SEO content + rich results) */}
        {seo && (
          <section className="py-10 md:py-12 print:hidden">
            <div className="mx-auto max-w-[820px] px-6">
              {seo.faqs.length > 0 && (
                <div className="bg-white p-6 shadow-[0_18px_30px_-22px_rgba(45,58,46,0.45)] md:p-8">
                  <h2 className="font-display text-[clamp(1.45rem,2.4vw,1.85rem)] leading-[1.12] tracking-tight text-balance mb-4">
                    Frequently asked questions
                  </h2>
                  <div className="border-t border-[#E2DED2]">
                    {seo.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group border-b border-[#E2DED2]"
                      >
                        <summary className="flex items-center justify-between gap-4 py-3.5 cursor-pointer list-none font-body font-medium text-[15.5px] leading-[1.4] text-ink hover:text-[#588157] transition-colors">
                          {faq.question}
                          <span
                            className="flex-shrink-0 grid place-items-center w-5 h-5 rounded-full transition-transform duration-200 group-open:rotate-45"
                            style={{ background: `${category.accent}14`, color: category.accent }}
                            aria-hidden="true"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </span>
                        </summary>
                        <div className="pb-4 -mt-0.5 pr-8 max-w-[72ch] text-[15px] leading-[1.6] text-[#5c5a54]">
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

        {/* Membership, deliberately quiet.
            The email capture above is this page's one real conversion action.
            A second competing button would just split the ask, and cold search
            traffic is not ready for a yearly plan on first visit anyway. */}
        <section className="pb-12 print:hidden">
          <div className="mx-auto max-w-[820px] px-6">
            <p className="text-[15px] leading-[1.6] text-[#6e6b64] text-center m-0">
              Already know you want the whole library?{' '}
              <Link
                href="/#membership"
                className="font-semibold text-[#588157] underline decoration-[1.5px] underline-offset-[3px] hover:text-[#3d5c3b] transition-colors"
              >
                See what&rsquo;s inside the membership
              </Link>
            </p>
          </div>
        </section>

        {/* More idea lists.
            Was two full card grids (ten cards, roughly a screen and a half).
            Same destinations, same crawlable anchor text, as a dense index. */}
        {relatedLists.length > 0 && (
          <section className="pb-16 print:hidden">
            <div className="mx-auto max-w-[1080px] px-6">
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="m-0 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] tracking-tight">
                  More free idea lists
                </h2>
                <Link
                  href="/ideas"
                  className="text-[14px] font-semibold text-[#588157] no-underline transition-colors hover:text-[#3d5c3b]"
                >
                  {`See all ${totalListCount} \u2192`}
                </Link>
              </div>
              <ul className="m-0 grid list-none grid-cols-1 gap-x-5 gap-y-7 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {relatedLists.map(({ list: l, category: c }, i) => {
                  const count = l.sections.reduce((n, s) => n + s.items.length, 0);
                  return (
                    <li key={l.slug} style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
                      <Link
                        href={`/ideas/${l.slug}`}
                        className="relative block h-full bg-white p-4 pt-6 text-inherit no-underline shadow-[0_14px_26px_-18px_rgba(45,58,46,0.5)] transition-transform duration-200 hover:-translate-y-1"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-1/2 top-[-9px] h-5 w-5 -translate-x-1/2 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.25),inset_0_-2px_0_rgba(0,0,0,0.15)]"
                          style={{ background: c.accent }}
                        />
                        <span className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: c.accent }}>
                          {c.name}
                        </span>
                        <span className="mt-1 block text-[15px] font-medium leading-[1.35] text-[#3f3d38]">
                          {l.title}
                        </span>
                        <span className="mt-2 block text-[12.5px] font-semibold text-forest-dark">
                          {`${count} ideas \u2192`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
