import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllPosts, getFeaturedPost, getPostsByCategory, type BlogCategory } from '@/lib/blog';
import BlogHero from '@/components/blog/BlogHero';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogCard from '@/components/blog/BlogCard';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import BlogPagination from '@/components/blog/BlogPagination';
import ScrollReveal from '@/components/shared/ScrollReveal';

const POSTS_PER_PAGE = 6;

export const metadata: Metadata = {
  title: 'Homeschool Ideas & Real-World Learning Tips',
  description:
    'Practical ideas, real-world inspiration, and honest encouragement for homeschool and worldschool families. No fluff, no guilt. Just what works.',
  alternates: {
    canonical: 'https://anywherelearning.co/blog',
  },
  openGraph: {
    title: 'Blog | Anywhere Learning',
    description:
      'Practical ideas, real-world inspiration, and honest encouragement for homeschool and worldschool families.',
    url: 'https://anywherelearning.co/blog',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning Blog',
      },
    ],
  },
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, page, q } = await searchParams;
  const featured = getFeaturedPost();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);
  const searchQuery = (q || '').toLowerCase().trim();

  const validCategories: BlogCategory[] = [
    'ai-digital-literacy',
    'creativity-maker',
    'homeschool-journey',
    'nature-learning',
    'real-world-skills',
    'travel-worldschool',
  ];

  // Compute post counts per category for filter badges
  const postCounts: Record<string, number> = {};
  for (const cat of validCategories) {
    postCounts[cat] = getPostsByCategory(cat).length;
  }

  const activeCategory = validCategories.includes(category as BlogCategory)
    ? (category as BlogCategory)
    : undefined;

  let posts = activeCategory
    ? getPostsByCategory(activeCategory)
    : getAllPosts();

  // Apply search filter
  if (searchQuery) {
    posts = posts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery) ||
      p.excerpt.toLowerCase().includes(searchQuery) ||
      (p.keywords && p.keywords.some((k) => k.toLowerCase().includes(searchQuery)))
    );
  }

  // Exclude featured post from grid when showing all posts (not when searching)
  const allGridPosts = activeCategory || searchQuery
    ? posts
    : posts.filter((p) => p.slug !== featured.slug);

  // Pagination
  const totalPages = Math.ceil(allGridPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const gridPosts = allGridPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const allPosts = getAllPosts();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anywhere Learning Blog',
    description: 'Practical ideas, real-world inspiration, and honest encouragement for homeschool and worldschool families.',
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

  return (
    <main className="bg-cream min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Hero masthead - editorial, text-led */}
      <section className="relative pt-10 pb-10 sm:pt-12 sm:pb-12 md:pt-16 md:pb-14 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,163,115,0.1),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gold" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                The Blog
              </p>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-forest leading-[0.95] mb-6 text-balance max-w-4xl">
              Ideas for the Everyday Explorer
            </h1>
            <p className="text-lg md:text-xl text-[#8b7355] max-w-2xl leading-relaxed">
              Practical inspiration, honest encouragement, and real-world
              learning ideas, from one homeschool family to another.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured post */}
      {!activeCategory && (
        <section className="pb-14 md:pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal delay={100}>
              {/* Minimal editorial accent */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-12 bg-gold" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  Featured Story
                </p>
              </div>
              <BlogHero post={featured} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Category filter + grid */}
      <section id="posts" className="bg-forest-light-gradient pt-14 md:pt-20 pb-16 md:pb-24 scroll-mt-4">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 xl:gap-12">
            {/* Sidebar: category filter */}
            <aside className="mb-10 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
              <Suspense>
                <BlogCategoryFilter postCounts={postCounts} />
              </Suspense>
            </aside>

            {/* Main: posts grid */}
            <div>
              {gridPosts.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {gridPosts.map((post, i) => (
                      <ScrollReveal key={post.slug} delay={i * 80}>
                        <BlogCard
                          slug={post.slug}
                          title={post.title}
                          excerpt={post.excerpt}
                          hook={post.hook}
                          category={post.category}
                          heroImage={post.heroImage}
                          heroImageAlt={post.heroImageAlt}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                  <Suspense>
                    <BlogPagination
                      currentPage={safePage}
                      totalPages={totalPages}
                    />
                  </Suspense>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">
                    No posts in this category yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
