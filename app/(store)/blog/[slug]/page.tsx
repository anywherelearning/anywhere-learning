import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getArticleBodyText,
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
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
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
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.dateModified || post.publishedAt,
      authors: [post.author.name],
      url: `https://anywherelearning.co/blog/${post.slug}`,
      images: [
        {
          url: 'https://anywherelearning.co/og-default.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getTableOfContents(content: BlogContentBlock[]) {
  return content
    .filter((b): b is { type: 'heading'; level: 2; text: string } => b.type === 'heading' && b.level === 2)
    .map((b) => ({ text: b.text, id: slugify(b.text) }));
}

/* ─── Content Block Renderer ─── */

function renderBlock(block: BlogContentBlock, index: number, isFirstParagraph: boolean) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className={`text-[1.075rem] leading-[1.85] text-gray-600 mb-8 ${
            isFirstParagraph
              ? 'first-letter:text-[3.4rem] first-letter:font-display first-letter:text-forest first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.75]'
              : ''
          }`}
        >
          {block.text}
        </p>
      );
    case 'heading':
      if (block.level === 2)
        return (
          <h2
            key={index}
            id={slugify(block.text)}
            className="mt-16 mb-6 scroll-mt-24 group"
          >
            <span className="block font-semibold text-[1.55rem] md:text-[1.7rem] text-forest leading-[1.25] tracking-[-0.01em]">
              {block.text}
            </span>
            <span className="block w-10 h-[2px] bg-gold/50 mt-3 rounded-full" />
          </h2>
        );
      return (
        <h3 key={index} className="font-semibold text-lg text-gray-800 mt-10 mb-4 leading-snug tracking-[-0.01em]">
          {block.text}
        </h3>
      );
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
          <ol key={index} className="mb-8 space-y-3.5 pl-0 list-none">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3.5 text-[1.075rem] leading-[1.85] text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest/8 text-forest text-xs font-semibold flex items-center justify-center mt-[5px] ring-1 ring-forest/[0.08]">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={index} className="mb-8 space-y-3.5 pl-0 list-none">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3.5 text-[1.075rem] leading-[1.85] text-gray-600">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-forest/40 mt-[11px]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'image':
      return (
        <figure key={index} className="my-12 md:my-16">
          <div className="aspect-[16/9] rounded-2xl bg-warm-gradient border border-gray-100/50 flex items-center justify-center">
            <span className="text-gray-300 text-sm">{block.alt}</span>
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-[13px] text-gray-400 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'cta':
      return (
        <div
          key={index}
          className="my-12 md:my-16 rounded-2xl border border-gold/15 bg-gradient-to-br from-[#fefbf6] via-[#fdf6ec] to-[#faf9f6] p-7 md:p-9 shadow-[0_2px_24px_-4px_rgba(212,163,115,0.12)]"
        >
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-7">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gold/12 flex items-center justify-center rotate-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold -rotate-3">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-gray-600 leading-relaxed text-[15px]">{block.text}</p>
            </div>
            <Link
              href={block.href}
              className="inline-block rounded-full bg-forest px-7 py-3 text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
            >
              {block.label}
            </Link>
          </div>
        </div>
      );
    case 'tip':
      return (
        <div
          key={index}
          className="my-12 md:my-16 relative bg-white rounded-2xl p-6 md:p-8 border border-forest/[0.08] shadow-[0_1px_12px_-2px_rgba(88,129,87,0.06)]"
        >
          <div className="absolute -top-3 left-6 bg-cream px-3">
            <span className="text-[10px] font-bold text-forest uppercase tracking-[0.18em]">
              {block.title}
            </span>
          </div>
          <div className="flex items-start gap-4 pt-1">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/[0.06] flex items-center justify-center mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-forest">
                <path d="M9 18h6M12 2a7 7 0 00-2 13.7V17a1 1 0 001 1h2a1 1 0 001-1v-1.3A7 7 0 0012 2z" />
              </svg>
            </span>
            <p className="text-gray-600 leading-[1.7] text-[1.05rem] flex-1">{block.text}</p>
          </div>
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
  const toc = getTableOfContents(post.content);

  const articleBody = getArticleBodyText(post);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.dateModified || post.publishedAt,
    image: 'https://anywherelearning.co/og-default.png',
    keywords: post.keywords?.join(', '),
    articleBody,
    wordCount: articleBody.split(/\s+/).length,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anywherelearning.co/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://anywherelearning.co/blog/${post.slug}`,
    },
  };

  return (
    <div className="bg-cream min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden">
        {/* Subtle background wash */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${cat.color}, transparent 70%), radial-gradient(ellipse at 70% 80%, ${cat.color}, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 pt-8 md:pt-12 pb-10 md:pb-14">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: 'Blog', href: '/blog' },
                { label: post.title },
              ]}
            />
          </div>

          <ScrollReveal>
            {/* Category + read time row */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-white px-3 py-1 rounded-full"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </span>
              <span className="text-[13px] text-gray-400">
                {formatReadTime(post.readTimeMinutes)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.4rem] text-forest leading-[1.06] mb-7 max-w-3xl text-balance tracking-[-0.02em]">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
              {post.excerpt}
            </p>

            {/* Author + date */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-cream text-sm font-semibold shadow-sm ring-2 ring-white"
                style={{ backgroundColor: post.author.avatarColor }}
              >
                {post.author.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
                <span className="text-[13px] text-gray-400">{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* ─── Hero image ─── */}
      <div className="mx-auto max-w-5xl px-5 sm:px-8 mb-12 md:mb-16">
        <ScrollReveal delay={100}>
          <div
            className="relative aspect-[2.2/1] rounded-[1.25rem] overflow-hidden flex items-center justify-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
            style={{
              background: `linear-gradient(160deg, ${cat.color}12, ${cat.color}30, ${cat.color}08)`,
            }}
          >
            {/* Organic shapes */}
            <div
              className="absolute top-[10%] right-[15%] w-40 h-40 rounded-full opacity-15 blur-3xl"
              style={{ backgroundColor: cat.color }}
            />
            <div
              className="absolute bottom-[15%] left-[8%] w-52 h-52 rounded-full opacity-10 blur-[80px]"
              style={{ backgroundColor: cat.color }}
            />
            <div
              className="absolute top-[40%] left-[45%] w-24 h-24 rounded-full opacity-8 blur-2xl"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-gray-400/40 text-sm relative z-10 font-medium">{post.heroImageAlt}</span>
          </div>
        </ScrollReveal>
      </div>

      {/* ─── Article + Sidebar Grid ─── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8" data-article>
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16 xl:grid-cols-[1fr_240px] xl:gap-20">

          {/* Main article column */}
          <article className="min-w-0 pb-16 md:pb-20 mx-auto max-w-[680px] lg:max-w-none">
            {/* Mobile TOC */}
            <MobileTOC items={toc} />

            {/* Article content */}
            {(() => {
              let firstParagraphRendered = false;
              return post.content.map((block, i) => {
                const isFirst = block.type === 'paragraph' && !firstParagraphRendered;
                if (isFirst) firstParagraphRendered = true;
                return renderBlock(block, i, isFirst);
              });
            })()}
          </article>

          {/* Desktop sidebar TOC */}
          {toc.length >= 3 && (
            <aside className="hidden lg:block relative">
              <div className="sticky top-24 pb-8">
                <StickyTOC items={toc} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ─── Post-article sections ─── */}
      <div className="mx-auto max-w-[680px] px-5 sm:px-8">
        {/* Decorative divider */}
        <div className="py-12 md:py-16">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-gold/30" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gold/40">
              <path d="M12 22V8M5 12c0-5 7-10 7-10s7 5 7 10c0 3-2 5-7 5s-7-2-7-5z" strokeLinecap="round" />
            </svg>
            <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-gold/30" />
          </div>
        </div>

        {/* Author bio */}
        <section className="pb-14 md:pb-18">
          <ScrollReveal>
            <AuthorBio author={post.author} />
          </ScrollReveal>
        </section>
      </div>

      {/* Newsletter CTA — wider */}
      <section className="pb-14 md:pb-18">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>

      {/* Related posts — full width */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <RelatedPosts posts={related} />
        </div>
      </section>
    </div>
  );
}
