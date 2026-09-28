import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getAllPosts,
  getFeaturedPost,
  getPostsByCategory,
  blogCategories,
  type BlogCategory,
} from '@/lib/blog';
import { PAPER_SHADOW } from '@/components/shared/Paper';
import EmailForm from '@/components/EmailForm';
import BlogQuizCTA from '@/components/blog/BlogQuizCTA';
import { MEMBERSHIP_PRICE_YEAR, MONTHLY_PLAN_PRICE } from '@/lib/membership';
import PageDropdown from './PageDropdown';
import AllPostsIndex from '@/components/blog/AllPostsIndex';
import IndexCard from '@/components/blog/IndexCard';

const POSTS_PER_PAGE = 6;

interface BlogPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}


const BLOG_TITLE = 'Homeschool & Worldschool Blog: Real-World Learning Ideas';
const BLOG_DESCRIPTION =
  'Homeschool ideas, worldschool inspiration, low-prep activities, and deschooling tips for families raising future-ready kids. Real-world learning, no fluff.';

/**
 * Paginated and filtered views are real, distinct pages, so each one
 * canonicalizes to itself with its own title. Pointing every page at /blog
 * (the old behaviour) told Google pages 2 to 15 were duplicates of page 1,
 * and it responded by choosing its own canonical and under-crawling the
 * posts that only those pages linked to.
 */
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { category, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
  const cat = category && category in blogCategories ? (category as BlogCategory) : undefined;

  const params = new URLSearchParams();
  if (cat) params.set('category', cat);
  if (pageNum > 1) params.set('page', String(pageNum));
  const qs = params.toString();
  const canonical = qs ? `https://anywherelearning.co/blog?${qs}` : 'https://anywherelearning.co/blog';

  const title = cat
    ? `${blogCategories[cat].label} Posts${pageNum > 1 ? `, Page ${pageNum}` : ''} | Blog`
    : pageNum > 1
      ? `Blog, Page ${pageNum}: Real-World Learning Ideas`
      : BLOG_TITLE;

  return {
    // The main blog title is absolute so the site suffix doesn't push it
    // past the SERP cutoff; category and page titles keep the suffix.
    title: title === BLOG_TITLE ? { absolute: BLOG_TITLE } : title,
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Anywhere Learning`,
      description:
        'Practical homeschool ideas, worldschool inspiration, low-prep activities, and deschooling tips for families raising future-ready kids.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: 'https://anywherelearning.co/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'Anywhere Learning Homeschool & Worldschool Blog',
        },
      ],
    },
  };
}

const TILT = [-1.2, 0.9, -0.7, 1.3, -1, 0.8];

const pagerLink =
  'inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#2b2a26] no-underline shadow-[0_8px_16px_-10px_rgba(45,58,46,0.45)] transition-transform hover:-translate-y-px';
const pagerDead =
  'inline-flex items-center gap-2 rounded-[10px] bg-white/50 px-4 py-2.5 text-[13.5px] font-semibold text-gray-400';

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, page } = await searchParams;
  const featured = getFeaturedPost();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

  const validCategories: BlogCategory[] = [
    'ai-digital-literacy',
    'creativity-maker',
    'future-ready-skills',
    'homeschool-journey',
    'nature-learning',
    'real-world-skills',
    'stem-for-kids',
    'travel-worldschool',
  ];

  const allPosts = getAllPosts();

  const categoryOptions = [
    { value: '', label: 'All Posts', count: allPosts.length },
    ...validCategories.map((cat) => ({
      value: cat,
      label: blogCategories[cat].label,
      count: getPostsByCategory(cat).length,
    })),
  ];

  const activeCategory = validCategories.includes(category as BlogCategory)
    ? (category as BlogCategory)
    : undefined;

  const posts = activeCategory ? getPostsByCategory(activeCategory) : allPosts;
  const allGridPosts = activeCategory ? posts : posts.filter((p) => p.slug !== featured.slug);

  const totalPages = Math.max(1, Math.ceil(allGridPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const gridPosts = allGridPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anywhere Learning Blog',
    description:
      'Practical ideas, real-world inspiration, and honest encouragement for homeschool and worldschool families.',
    url: 'https://anywherelearning.co/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: allPosts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://anywherelearning.co/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  const categoryHref = (value: string) => (value ? `/blog?category=${value}#blog-grid` : '/blog#blog-grid');

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    // Anchor jumps to the top of the post grid (just above the sidebar +
    // grid section) so the visitor lands at the start of page N instead of
    // scrolling all the way back up past the hero.
    const base = qs ? `/blog?${qs}` : '/blog';
    return `${base}#blog-grid`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <main className="bg-[#E9EEE6]">
        {/* ── Header ── */}
        <header className="px-6 pb-2 pt-12 text-center md:pt-14">
          <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-forest-dark">
            <span className="inline-block h-px w-[22px] bg-forest" />
            The blog
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.04] tracking-tight text-balance">
            Ideas for the everyday <span className="italic text-forest">explorer.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[600px] text-[17px] leading-[1.55] text-gray-600">
            Practical inspiration, honest encouragement, and real-world learning ideas, from one
            family to another. Whether you homeschool or just want{' '}
            <span className="font-display italic text-forest-dark">meaningful</span> time together.
          </p>
          <p className="mt-3 text-[12.5px] tracking-wide text-gray-500">
            {'New posts weekly · Free to read · Written by Amelie'}
          </p>
        </header>

        {/* ── The recipe box: divider tabs, then the cards ── */}
        <section id="blog-grid" className="scroll-mt-[80px] px-3 pb-14 pt-8 sm:px-6 md:scroll-mt-[88px]">
          <div className="mx-auto max-w-[1160px]">
            {/* Phones: one dropdown. A <details> of real links, so every
                category stays a crawlable link and it works without JS. */}
            <details className={`group relative mx-auto mb-4 max-w-[420px] bg-white sm:hidden ${PAPER_SHADOW}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500">Topic</span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: activeCategory ? blogCategories[activeCategory].color : '#588157' }}
                  />
                  <span className="truncate text-[15px] font-semibold text-[#2b2a26]">
                    {activeCategory ? blogCategories[activeCategory].label : 'All posts'}
                  </span>
                </span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" className="shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180">
                  <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <ul className="m-0 list-none border-t border-[#E6E0CD] p-1.5">
                {categoryOptions.map((c) => {
                  const active = (activeCategory || '') === c.value;
                  const color = c.value ? blogCategories[c.value as BlogCategory].color : '#588157';
                  return (
                    <li key={c.value || 'all'}>
                      <Link
                        href={categoryHref(c.value)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-[6px] px-3 py-2.5 text-[15px] no-underline ${
                          active ? 'bg-[#F2EFE4] font-semibold text-[#2b2a26]' : 'text-gray-700'
                        }`}
                      >
                        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                        <span className="flex-1">{c.label}</span>
                        <span className="text-[13px] text-gray-400">{c.count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>

            {/* From sm up: divider tabs on the box. Real links, so each
                category page is one crawlable hop away. */}
            <nav aria-label="Blog categories" className="hidden sm:block">
              <ul className="m-0 flex list-none flex-wrap items-end justify-center gap-1 p-0">
                {categoryOptions.map((c) => {
                  const active = (activeCategory || '') === c.value;
                  const color = c.value ? blogCategories[c.value as BlogCategory].color : '#588157';
                  return (
                    <li key={c.value || 'all'} className="shrink-0">
                      <Link
                        href={categoryHref(c.value)}
                        aria-current={active ? 'page' : undefined}
                        className={`block whitespace-nowrap rounded-t-[10px] px-4 text-[13px] font-semibold text-white no-underline transition-all ${
                          active ? 'pb-3 pt-3' : 'pb-2 pt-2 opacity-80 hover:opacity-100'
                        }`}
                        style={{ background: color }}
                      >
                        {c.label} <span className="font-medium text-white/75">{c.count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              className="rounded-b-[16px] rounded-t-[4px] border-t-4 bg-[#DCE4D5] p-4 sm:p-6 md:p-8"
              style={{ borderColor: activeCategory ? blogCategories[activeCategory].color : '#588157' }}
            >
              {activeCategory && (
                <h2 className="mb-6 text-center font-display text-[24px] leading-tight">
                  {blogCategories[activeCategory].label}
                  {safePage > 1 ? `, page ${safePage}` : ''}
                </h2>
              )}

              {/* Page 1: the latest post as a wide card, beside the newsletter card */}
              {!activeCategory && safePage === 1 && (
                <div className="mb-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div className="-rotate-[0.6deg]">
                    <IndexCard post={featured} wide priority as="h2" />
                  </div>
                  <div className={`relative rotate-[1.2deg] bg-[#FBF3DC] p-6 ${PAPER_SHADOW}`}>
                    <p className="font-display text-[22px] leading-tight">
                      Get my monthly <span className="italic text-forest">newsletter.</span>
                    </p>
                    <p className="mb-4 mt-1.5 text-[14px] leading-[1.5] text-gray-600">
                      One email a month, straight from me.
                    </p>
                    <EmailForm
                      variant="light"
                      buttonText="Subscribe"
                      stacked
                      newsletter
                      successHeading="You're on the list!"
                      successBody="Your first newsletter arrives with the next monthly send."
                    />
                  </div>
                </div>
              )}

              {gridPosts.length > 0 ? (
                <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post, i) => (
                    <li key={post.slug} style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                      <IndexCard post={post} priority={!activeCategory && safePage === 1 ? false : i < 3} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-12 text-center font-display text-[20px] italic text-gray-500">
                  No posts in this category yet. Check back soon.
                </p>
              )}

              {totalPages > 1 && (
                <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                  {safePage > 1 ? (
                    <Link href={buildPageHref(safePage - 1)} className={pagerLink}>
                      <span aria-hidden="true">&larr;</span> Prev
                    </Link>
                  ) : (
                    <span aria-hidden="true" className={pagerDead}>
                      <span>&larr;</span> Prev
                    </span>
                  )}
                  <PageDropdown
                    currentPage={safePage}
                    hrefs={Array.from({ length: totalPages }, (_, i) => buildPageHref(i + 1))}
                  />
                  {safePage < totalPages ? (
                    <Link href={buildPageHref(safePage + 1)} className={pagerLink}>
                      Next <span aria-hidden="true">&rarr;</span>
                    </Link>
                  ) : (
                    <span aria-hidden="true" className={pagerDead}>
                      Next <span>&rarr;</span>
                    </span>
                  )}
                </nav>
              )}
            </div>
          </div>
        </section>

        {/* Every post as a plain link, one hop from the hub */}
        <div className="mx-auto max-w-[1160px] px-3 sm:px-6">
          <AllPostsIndex />
        </div>

        {/* Quiz */}
        <div className="pt-10">
          <BlogQuizCTA paper />
        </div>

        {/* Membership, one quiet line */}
        <p className="mx-auto max-w-[620px] px-6 pb-14 text-center text-[15px] leading-[1.6] text-gray-600">
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
      </main>
    </>
  );
}
