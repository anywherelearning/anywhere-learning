import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllPosts, getFeaturedPost, getPostsByCategory, type BlogCategory } from '@/lib/blog';
import BlogHero from '@/components/blog/BlogHero';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogCard from '@/components/blog/BlogCard';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import BlogPagination from '@/components/blog/BlogPagination';
import ScrollReveal from '@/components/shared/ScrollReveal';

const POSTS_PER_PAGE = 9;

export const metadata: Metadata = {
  title: 'Homeschool Ideas & Real-World Learning Tips',
  description:
    'Practical ideas, real-world inspiration, and honest encouragement for homeschool and worldschool families. No fluff, no guilt — just what works.',
  alternates: {
    canonical: 'https://anywherelearning.co/blog',
  },
  openGraph: {
    title: 'Blog — Anywhere Learning',
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
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, page } = await searchParams;
  const featured = getFeaturedPost();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

  const validCategories: BlogCategory[] = [
    'homeschool-life',
    'nature-learning',
    'real-world-skills',
    'travel-worldschool',
    'getting-started',
  ];

  const activeCategory = validCategories.includes(category as BlogCategory)
    ? (category as BlogCategory)
    : undefined;

  const posts = activeCategory
    ? getPostsByCategory(activeCategory)
    : getAllPosts();

  // Exclude featured post from grid when showing all posts
  const allGridPosts = activeCategory
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

      {/* Hero intro */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold mb-3">
              The Blog
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mb-4">
              Ideas for the Everyday Explorer
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              Practical inspiration, honest encouragement, and real-world
              learning ideas — from one homeschool family to another.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured post */}
      {!activeCategory && (
        <section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal delay={100}>
              <BlogHero post={featured} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Category filter + grid */}
      <section id="posts" className="pb-16 md:pb-24 scroll-mt-4">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10">
            <Suspense>
              <BlogCategoryFilter />
            </Suspense>
          </div>

          {gridPosts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post, i) => (
                  <ScrollReveal key={post.slug} delay={i * 80}>
                    <BlogCard
                      slug={post.slug}
                      title={post.title}
                      excerpt={post.excerpt}
                      category={post.category}
                      publishedAt={post.publishedAt}
                      readTimeMinutes={post.readTimeMinutes}
                      author={post.author}
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
      </section>

      {/* Newsletter CTA */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
