import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllPosts,
  getFeaturedPost,
  getPostsByCategory,
  blogCategories,
  type BlogCategory,
  type BlogPost,
  formatDate,
} from '@/lib/blog';
import { PAPER_SHADOW } from '@/components/shared/Paper';
import EmailForm from '@/components/EmailForm';
import BlogQuizCTA from '@/components/blog/BlogQuizCTA';
import { MEMBERSHIP_PRICE_YEAR, MONTHLY_PLAN_PRICE } from '@/lib/membership';
import PageDropdown from './PageDropdown';
import AllPostsIndex from '@/components/blog/AllPostsIndex';

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
    title,
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

function Photo({ post, sizes, priority = false }: { post: BlogPost; sizes: string; priority?: boolean }) {
  if (!post.heroImage) return null;
  return (
    <Image
      src={post.heroImage}
      alt={post.heroImageAlt || post.title}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
    />
  );
}

function Kicker({ post, extra }: { post: BlogPost; extra?: string }) {
  const cat = blogCategories[post.category];
  return (
    <span className="block text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: cat.color }}>
      {extra ? `${extra} · ` : ''}
      {cat.label}
    </span>
  );
}

/** The front-page lead story. */
function LeadStory({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block text-inherit no-underline">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E6EBDF]">
        <Photo post={post} sizes="(max-width: 1024px) 100vw, 660px" priority />
      </div>
      <p className="mt-4">
        <Kicker post={post} extra="Lead story" />
      </p>
      <h2 className="mt-1 font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08] tracking-tight text-[#2b2a26] group-hover:text-forest-dark">
        {post.title}
      </h2>
      <p className="mt-2 font-display text-[17px] italic leading-[1.5] text-gray-600">{post.hook || post.excerpt}</p>
      <p className="mt-3 text-[12.5px] text-gray-500">
        {formatDate(post.publishedAt)} {'·'} {post.readTimeMinutes} min read
      </p>
    </Link>
  );
}

/** A short story in the side column: headline beside a small square photo. */
function SideStory({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid grid-cols-[1fr_84px] gap-4 text-inherit no-underline">
      <span>
        <Kicker post={post} />
        <span className="mt-1 block font-display text-[17px] leading-tight text-[#2b2a26] group-hover:text-forest-dark">
          {post.title}
        </span>
        <span className="mt-1 block text-[12px] text-gray-500">{formatDate(post.publishedAt)}</span>
      </span>
      <span className="relative block aspect-square overflow-hidden bg-[#E6EBDF]">
        <Photo post={post} sizes="84px" />
      </span>
    </Link>
  );
}

/** A story in the columns below the fold. */
function ColumnStory({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col text-inherit no-underline">
      <span className="relative block aspect-[16/10] overflow-hidden bg-[#E6EBDF]">
        <Photo post={post} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px" />
      </span>
      <span className="mt-3">
        <Kicker post={post} />
      </span>
      <h3 className="mt-1 font-display text-[20px] leading-tight tracking-tight text-[#2b2a26] group-hover:text-forest-dark">
        {post.title}
      </h3>
      <p className="mt-1.5 font-display text-[14.5px] italic leading-[1.5] text-gray-600">{post.hook || post.excerpt}</p>
      <p className="mt-auto pt-3 text-[12px] text-gray-500">
        {formatDate(post.publishedAt)} {'·'} {post.readTimeMinutes} min read
      </p>
    </Link>
  );
}

const pagerLink =
  'inline-flex items-center gap-2 border border-[#2b2a26]/70 bg-transparent px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#2b2a26] no-underline transition-colors hover:bg-[#2b2a26] hover:text-[#FBF8EF]';
const pagerDead =
  'inline-flex items-center gap-2 border border-[#2b2a26]/25 px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-400';

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
  // Unfiltered, the lead story and the three next-newest sit on the front
  // page, so the columns (and every numbered page) start after them.
  const sidePosts = activeCategory ? [] : posts.filter((p) => p.slug !== featured.slug).slice(0, 3);
  const onFront = new Set([featured.slug, ...sidePosts.map((p) => p.slug)]);
  const allGridPosts = activeCategory ? posts : posts.filter((p) => !onFront.has(p.slug));

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
      <main className="bg-[#F2EFE4] px-3 pb-4 pt-8 sm:px-6 md:pt-10">
        {/* The whole index is one sheet of newsprint: masthead, sections,
            the front page, then the columns and the page turner. */}
        <div className={`mx-auto max-w-[1180px] bg-[#FBF8EF] px-5 py-8 sm:px-8 md:px-12 md:py-10 ${PAPER_SHADOW}`}>
          {/* Masthead */}
          <header className="border-b-4 border-double border-[#2b2a26] pb-5 text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              {'New posts weekly · Free to read · Written by Amelie'}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-tight text-balance">
              Ideas for the everyday <span className="italic text-forest">explorer.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-[620px] text-[16.5px] leading-[1.55] text-gray-600">
              Practical inspiration, honest encouragement, and real-world learning ideas, from one
              family to another. Whether you homeschool or just want{' '}
              <span className="font-display italic text-forest-dark">meaningful</span> time together.
            </p>
          </header>

          {/* Sections: real links, so every category page is one crawlable hop away */}
          <nav aria-label="Blog categories" className="-mx-5 border-b border-[#2b2a26] py-2.5 sm:mx-0">
            {/* One swipeable row on phones, wrapped and centred from sm up */}
            <ul className="m-0 flex list-none gap-x-5 gap-y-1.5 overflow-x-auto whitespace-nowrap px-5 py-0.5 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:whitespace-normal sm:px-0">
              {categoryOptions.map((c) => {
                const active = (activeCategory || '') === c.value;
                const color = c.value ? blogCategories[c.value as BlogCategory].color : '#2b2a26';
                return (
                  <li key={c.value || 'all'}>
                    <Link
                      href={categoryHref(c.value)}
                      aria-current={active ? 'page' : undefined}
                      className={`text-[12.5px] font-semibold uppercase tracking-[0.12em] no-underline underline-offset-4 hover:underline ${active ? 'underline decoration-2' : ''}`}
                      style={{ color }}
                    >
                      {c.label} <span className="font-medium text-gray-400">{c.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Front page: lead story, the next three, and the subscribe box */}
          {!activeCategory && safePage === 1 && (
            <section className="grid gap-8 border-b border-[#DCD6C4] py-8 lg:grid-cols-[1.65fr_1fr] lg:gap-0 lg:divide-x lg:divide-[#DCD6C4]">
              <div className="lg:pr-8">
                <LeadStory post={featured} />
              </div>
              <div className="lg:pl-8">
                <ul className="m-0 list-none divide-y divide-[#DCD6C4] p-0">
                  {sidePosts.map((p) => (
                    <li key={p.slug} className="py-4 first:pt-0">
                      <SideStory post={p} />
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-2 border-[#2b2a26] p-5">
                  <p className="font-display text-[20px] leading-tight">
                    Get my monthly <span className="italic text-forest">newsletter.</span>
                  </p>
                  <p className="mb-3 mt-1 text-[13px] leading-[1.5] text-gray-600">
                    It starts with my free 7-day guide, then one email a month.
                  </p>
                  <EmailForm variant="light" buttonText="Subscribe" stacked />
                </div>
              </div>
            </section>
          )}

          {/* The columns */}
          <section id="blog-grid" className="scroll-mt-[80px] pt-8 md:scroll-mt-[88px]">
            <h2 className="mb-6 flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span className="h-px flex-1 bg-[#DCD6C4]" aria-hidden="true" />
              {activeCategory ? blogCategories[activeCategory].label : 'More stories'}
              {safePage > 1 ? ` · Page ${safePage}` : ''}
              <span className="h-px flex-1 bg-[#DCD6C4]" aria-hidden="true" />
            </h2>
            {gridPosts.length > 0 ? (
              <ul className="m-0 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <li key={post.slug}>
                    <ColumnStory post={post} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-12 text-center font-display text-[20px] italic text-gray-500">
                No posts in this category yet. Check back soon.
              </p>
            )}

            {totalPages > 1 && (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-[#DCD6C4] pt-6" aria-label="Pagination">
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
          </section>
        </div>

        {/* Every post as a plain link, one hop from the hub */}
        <div className="mx-auto mt-10 max-w-[1180px]">
          <AllPostsIndex />
        </div>

        {/* Quiz */}
        <div className="pt-6">
          <BlogQuizCTA paper />
        </div>

        {/* Membership, one quiet line */}
        <p className="mx-auto max-w-[620px] px-6 pb-12 text-center text-[15px] leading-[1.6] text-gray-600">
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
