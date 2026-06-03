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
} from '@/lib/blog';
import ScrollReveal from '@/components/shared/ScrollReveal';
import EmailForm from '@/components/EmailForm';
import BlogSidebar from './BlogSidebar';
import PageDropdown from './PageDropdown';

const POSTS_PER_PAGE = 6;


export const metadata: Metadata = {
  title: 'Homeschool & Worldschool Blog: Real-World Learning Ideas',
  description:
    'Homeschool ideas, worldschool inspiration, low-prep activities, and deschooling tips for families raising future-ready kids. Real-world learning, no fluff.',
  alternates: {
    canonical: 'https://anywherelearning.co/blog',
  },
  openGraph: {
    title: 'Homeschool & Worldschool Blog: Real-World Learning Ideas | Anywhere Learning',
    description:
      'Practical homeschool ideas, worldschool inspiration, low-prep activities, and deschooling tips for families raising future-ready kids.',
    url: 'https://anywherelearning.co/blog',
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

const motifByCategory: Record<BlogCategory, string> = {
  'ai-digital-literacy': '⌘',
  'creativity-maker': '✂',
  'future-ready-skills': '⊞',
  'homeschool-journey': '☘',
  'nature-learning': '✿',
  'real-world-skills': '$',
  'stem-for-kids': '⚙',
  'travel-worldschool': '✈',
};

const imgBgByCategory: Record<BlogCategory, string> = {
  'ai-digital-literacy': '#F5E7BC',
  'creativity-maker': '#F2DECF',
  'future-ready-skills': '#DDE5D2',
  'homeschool-journey': '#DAD7CD',
  'nature-learning': '#CFDCC4',
  'real-world-skills': '#DDE5D2',
  'stem-for-kids': '#CFDCC4',
  'travel-worldschool': '#E8C8AE',
};

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function PostCard({ post }: { post: BlogPost }) {
  const cat = blogCategories[post.category];
  const motif = motifByCategory[post.category] || '◆';
  const bg = imgBgByCategory[post.category] || '#E6EBDF';
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full bg-cream border rounded-[12px] overflow-hidden text-ink no-underline shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)]"
      style={{ borderColor: `${cat.color}55` }}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden border-b border-[#D8D4C5]"
        style={{ background: bg }}
      >
        {post.heroImage && (
          <Image
            src={post.heroImage}
            alt={post.heroImageAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
            className="object-cover"
            style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
          />
        )}
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 w-[40px] h-[40px] rounded-[12px] bg-cream/95 border border-[#D8D4C5] grid place-items-center text-[20px] shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)]"
          style={{ color: cat.color }}
        >
          {motif}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-6">
        <span
          className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: cat.color }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: cat.color }}
            aria-hidden="true"
          />
          {cat.label}
        </span>
        <span className="mt-1.5 inline-flex flex-wrap items-center gap-2 text-[12.5px] text-gray-500 font-medium tracking-wide">
          <span>{formatDate(post.publishedAt)}</span>
        </span>
        <h3 className="font-display text-[22px] leading-[1.18] tracking-tight text-balance mt-2 text-ink">
          {post.title}
        </h3>
        <p className="mt-2.5 font-display italic text-[15.5px] leading-[1.45] text-gray-600">
          {post.hook || post.excerpt}
        </p>
        <span className="mt-auto pt-5 border-t border-dashed border-[#C9C5B7] inline-flex items-center gap-2 text-[14.5px] font-semibold text-forest-dark">
          Read article
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  const cat = blogCategories[post.category];
  const motif = motifByCategory[post.category] || '◆';
  const bg = imgBgByCategory[post.category] || '#E6EBDF';
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 md:grid-cols-[1.36fr_1fr] bg-cream border rounded-[14px] overflow-hidden text-ink no-underline shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_22px_40px_-28px_rgba(45,58,46,0.28)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_32px_48px_-28px_rgba(45,58,46,0.35)]"
      style={{ borderColor: `${cat.color}55` }}
    >
      <div
        className="relative aspect-[16/10] md:aspect-auto md:min-h-full overflow-hidden md:border-r border-b md:border-b-0 border-[#D8D4C5]"
        style={{ background: bg }}
      >
        {post.heroImage && (
          <Image
            src={post.heroImage}
            alt={post.heroImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            quality={80}
            priority
            className="object-cover"
            style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
          />
        )}
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 bg-[#C97B5C] text-cream font-semibold text-[10.5px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full shadow-[0_8px_16px_-10px_rgba(201,123,92,0.6)] z-[2]"
        >
          Featured
        </span>
        <span
          aria-hidden="true"
          className="absolute right-[18px] bottom-[18px] w-[48px] h-[48px] rounded-[14px] bg-cream/95 border border-[#D8D4C5] grid place-items-center text-[24px] shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)]"
          style={{ color: cat.color }}
        >
          {motif}
        </span>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <span
          className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: cat.color }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: cat.color }}
            aria-hidden="true"
          />
          {cat.label}
        </span>
        <span className="mt-2 inline-flex flex-wrap items-center gap-2 text-[12.5px] text-gray-500 font-medium tracking-wide">
          <span>Amelie</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
          <span>{formatDate(post.publishedAt)}</span>
        </span>
        <h2 className="font-display text-[clamp(1.875rem,3.4vw,2.75rem)] leading-[1.12] tracking-tight mt-2.5 text-balance">
          {post.title}
        </h2>
        <p className="mt-4 font-display italic text-[19px] leading-[1.45] text-gray-600">
          {post.excerpt}
        </p>
        <span className="mt-6 self-start inline-flex items-center gap-2.5 text-[15.5px] font-semibold text-forest-dark">
          Read article
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

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
      <main className="bg-cream">
        {/* 01 PAGE HEADER */}
        <header className="bg-cream pt-12 md:pt-16 pb-10 md:pb-14 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                The blog
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.04] tracking-tight mt-4 text-balance md:whitespace-nowrap">
                Ideas for the everyday <span className="italic text-forest">explorer.</span>
              </h1>
              <p className="mt-5 text-[17px] md:text-[18.5px] leading-[1.55] text-gray-600 max-w-[620px] mx-auto">
                Practical inspiration, honest encouragement, and real-world learning ideas, from
                one family to another. Whether you homeschool or just want{' '}
                <span className="font-display italic text-forest-dark">meaningful</span> time
                together.
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12.5px] text-gray-500 tracking-wide">
                <span>New posts weekly</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Free to read</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Written by Amelie</span>
              </div>
            </ScrollReveal>
          </div>
        </header>
        <div className="mx-auto max-w-[1180px] border-b border-[#D8D4C5]" />

        {/* 02 FEATURED */}
        {!activeCategory && safePage === 1 && (
          <section className="bg-cream pt-14 md:pt-20 pb-12 md:pb-14">
            <div className="mx-auto max-w-[1180px] px-6">
              <ScrollReveal>
                <FeaturedPostCard post={featured} />
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* 03 LAYOUT: SIDEBAR + GRID */}
        <section
          id="blog-grid"
          className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-14 md:py-20 scroll-mt-[80px] md:scroll-mt-[88px]"
        >
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
              <aside>
                <BlogSidebar
                  categories={categoryOptions}
                  activeValue={activeCategory || ''}
                />
              </aside>

              <div>
                {gridPosts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                      {gridPosts.map((post, i) => (
                        <ScrollReveal key={post.slug} className="h-full" delay={(i % 3) * 60}>
                          <PostCard post={post} />
                        </ScrollReveal>
                      ))}
                    </div>

                    {/* PAGINATION — Prev · 1 2 [3] 4 5 · Next */}
                    {totalPages > 1 && (
                      <nav
                        className="mt-14 flex items-center justify-center gap-1.5 flex-wrap"
                        aria-label="Pagination"
                      >
                        {safePage > 1 ? (
                          <Link
                            href={buildPageHref(safePage - 1)}
                            className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all no-underline"
                          >
                            <span aria-hidden="true">&larr;</span>
                            Prev
                          </Link>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-gray-400 font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] opacity-40"
                          >
                            <span>&larr;</span>
                            Prev
                          </span>
                        )}
                        <PageDropdown
                          currentPage={safePage}
                          hrefs={Array.from({ length: totalPages }, (_, i) =>
                            buildPageHref(i + 1),
                          )}
                        />
                        {safePage < totalPages ? (
                          <Link
                            href={buildPageHref(safePage + 1)}
                            className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all no-underline"
                          >
                            Next
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-gray-400 font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] opacity-40"
                          >
                            Next
                            <span>&rarr;</span>
                          </span>
                        )}
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 px-6 font-display italic text-[20px] text-gray-500">
                    No posts in this category yet. Check back soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 04 EMAIL CAPTURE */}
        <section className="bg-cream py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[720px] mx-auto bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-10 md:p-12 text-center shadow-[0_24px_44px_-34px_rgba(58,90,64,0.4)]">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Get inspiration delivered
                </p>
                <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.4rem)] leading-[1.14] tracking-tight mt-3.5 text-balance">
                  New posts, fresh ideas, delivered when we have{' '}
                  <span className="italic text-forest-dark">something worth sharing.</span>
                </h2>
                <p className="mt-4 text-gray-600 text-[16px] leading-[1.6] max-w-[480px] mx-auto">
                  Practical ideas, encouragement, and real-world learning tips. No spam. No fluff.
                </p>
                <div className="mt-6 max-w-[480px] mx-auto">
                  <EmailForm variant="light" buttonText="Subscribe" />
                </div>
                <p className="mt-3.5 text-[13px] text-gray-500">
                  Unsubscribe in one click. We hate inbox clutter as much as you do.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 05 MEMBERSHIP POINTER */}
        <section className="bg-cream pb-20 md:pb-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[680px] mx-auto bg-[#F2EFE4] border border-[#D8D4C5] border-l-[3px] border-l-[#C97B5C] rounded-[14px] p-7 md:p-8 flex flex-wrap items-center gap-y-5 gap-x-8">
                <div className="flex-1 min-w-[240px]">
                  <span className="block font-display italic text-[18px] text-[#C97B5C] mb-1.5">
                    Want more than reading?
                  </span>
                  <p className="text-[15px] text-gray-600 leading-[1.6] m-0">
                    The Anywhere Learning{' '}
                    <span className="font-display italic text-ink text-[16.5px]">membership</span>{' '}
                    unlocks 100+ guided activities you can actually do with your kids. Cooking,
                    budgeting, building, planning. Founding members pay $99/year, locked in for life.
                  </p>
                </div>
                <Link
                  href="/join"
                  className="shrink-0 inline-flex items-center gap-2 text-forest-dark font-semibold text-[15px] border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                >
                  See what&apos;s in the membership
                  <span className="font-display italic text-lg leading-none">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
