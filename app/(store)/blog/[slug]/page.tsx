import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  blogCategories,
  formatDate,
  formatReadTime,
  type BlogContentBlock,
} from '@/lib/blog';
import Breadcrumb from '@/components/blog/Breadcrumb';
import PullQuote from '@/components/blog/PullQuote';
import AuthorBio from '@/components/blog/AuthorBio';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import RelatedPosts from '@/components/blog/RelatedPosts';
import ScrollReveal from '@/components/shared/ScrollReveal';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

function renderBlock(block: BlogContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return <p key={index}>{block.text}</p>;
    case 'heading':
      if (block.level === 2)
        return <h2 key={index}>{block.text}</h2>;
      return <h3 key={index}>{block.text}</h3>;
    case 'pull-quote':
      return (
        <PullQuote
          key={index}
          text={block.text}
          attribution={block.attribution}
        />
      );
    case 'list':
      if (block.ordered) {
        return (
          <ol key={index}>
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'image':
      return (
        <figure key={index} className="my-10 md:my-14">
          <div className="aspect-[16/9] rounded-2xl bg-warm-gradient border border-gray-100/50 flex items-center justify-center">
            <span className="text-gray-300 text-sm">{block.alt}</span>
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-gray-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'cta':
      return (
        <div
          key={index}
          className="my-10 md:my-14 bg-warm-gradient rounded-2xl p-8 border border-gold/20 text-center"
        >
          <p className="text-gray-600 mb-4">{block.text}</p>
          <Link
            href={block.href}
            className="inline-block rounded-2xl bg-forest px-6 py-3 text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md"
          >
            {block.label}
          </Link>
        </div>
      );
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = blogCategories[post.category];
  const related = getRelatedPosts(post);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
  };

  return (
    <main className="bg-cream min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="pt-6 md:pt-8">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Breadcrumb
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal>
            <span
              className="inline-block text-xs font-semibold text-white px-3 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: cat.color }}
            >
              {cat.label}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest leading-[1.1] mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-cream text-xs font-semibold"
                  style={{ backgroundColor: post.author.avatarColor }}
                >
                  {post.author.name.charAt(0)}
                </div>
                <span>{post.author.name}</span>
              </div>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{formatReadTime(post.readTimeMinutes)}</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Full-width hero image placeholder */}
        <div className="mx-auto max-w-4xl px-5 sm:px-8 mt-10">
          <div
            className="aspect-[2/1] rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(145deg, ${cat.color}20, ${cat.color}40)`,
            }}
          >
            <span className="text-gray-300 text-sm">{post.heroImageAlt}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="pb-16 md:pb-20">
        <div className="mx-auto max-w-prose px-5 sm:px-8">
          <div className="blog-prose">
            {post.content.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      </article>

      {/* Author bio */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-prose px-5 sm:px-8">
          <ScrollReveal>
            <AuthorBio author={post.author} />
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>

      {/* Related posts */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <RelatedPosts posts={related} />
        </div>
      </section>
    </main>
  );
}
