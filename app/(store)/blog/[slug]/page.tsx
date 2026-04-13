import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getArticleBodyText,
  blogCategories,
  blogProductDefaults,
  formatDate,
  type BlogContentBlock,
  type BlogCategory,
} from '@/lib/blog';
import { renderBlock, getTableOfContents, getHowToSteps } from '@/lib/content-blocks';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AuthorBio from '@/components/blog/AuthorBio';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import RelatedPosts from '@/components/blog/RelatedPosts';
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ScrollReveal from '@/components/shared/ScrollReveal';
import PinterestSaveButton from '@/components/blog/PinterestSaveButton';

const BlogExitIntentPopup = dynamic(() => import('@/components/blog/BlogExitIntentPopup'));

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
    alternates: {
      canonical: `https://anywherelearning.co/blog/${post.slug}`,
    },
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
          url: post.heroImage
            ? `https://anywherelearning.co${post.heroImage}`
            : 'https://anywherelearning.co/og-default.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

/* slugify, getTableOfContents, parseInlineLinks, and renderBlock
   are now imported from @/lib/content-blocks */

/* ─── Auto-inject product/bundle callouts ─── */

function injectCallouts(post: { content: BlogContentBlock[]; category: BlogCategory; recommendedProduct?: string; recommendedBundle?: string }): BlogContentBlock[] {
  const defaults = blogProductDefaults[post.category];

  // If neither recommendedProduct nor recommendedBundle is set and no inline callouts exist, skip auto-injection
  const hasAnyCallout = post.content.some((b) => b.type === 'product-callout' || b.type === 'bundle-callout');
  if (!post.recommendedProduct && !post.recommendedBundle && !hasAnyCallout) return post.content;

  // Step 1: Strip out non-pinned callouts so we can reposition them (pinned callouts stay in place)
  const productBlock = post.content.find((b) => b.type === 'product-callout');
  const bundleBlock = post.content.find((b) => b.type === 'bundle-callout');
  const stripped = post.content.filter((b) =>
    !((b.type === 'product-callout' && !('pinned' in b && b.pinned))
    || (b.type === 'bundle-callout' && !('pinned' in b && b.pinned)))
  );

  // Determine which callouts to place (skip pinned ones - they're already in the content)
  const productPinned = productBlock && 'pinned' in productBlock && productBlock.pinned;
  const bundlePinned = bundleBlock && 'pinned' in bundleBlock && bundleBlock.pinned;

  const product = productPinned ? null : (productBlock
    || (defaults ? { type: 'product-callout' as const, slug: post.recommendedProduct || defaults.product } : null));
  const bundle = bundlePinned ? null : (bundleBlock
    || (defaults ? { type: 'bundle-callout' as const, slug: post.recommendedBundle || defaults.bundle } : null));

  if (!product && !bundle) return post.content;

  // Find h2 heading indices for placement
  const h2Indices = stripped
    .map((b, i) => (b.type === 'heading' && b.level === 2 ? i : -1))
    .filter((i) => i >= 0);

  if (h2Indices.length < 2) return post.content;

  const total = stripped.length;
  const targetMiddle = Math.floor(total * 0.5);
  const targetEnd = Math.floor(total * 0.85);

  // Product goes near the middle (50%)
  const productIdx = product
    ? h2Indices.reduce((best, idx) => (Math.abs(idx - targetMiddle) < Math.abs(best - targetMiddle) ? idx : best), h2Indices[0])
    : -1;

  // Bundle goes near the end (85%), must be after product
  const bundleIdx = bundle
    ? h2Indices.reduce((best, idx) => {
        if (productIdx >= 0 && idx <= productIdx) return best;
        return Math.abs(idx - targetEnd) < Math.abs(best - targetEnd) ? idx : best;
      }, h2Indices[h2Indices.length - 1])
    : -1;

  // Build new content array with callouts at optimal positions
  const result: BlogContentBlock[] = [];
  for (let i = 0; i < stripped.length; i++) {
    if (i === productIdx && product) {
      result.push(product);
    }
    if (i === bundleIdx && bundle && i !== productIdx) {
      result.push(bundle);
    }
    result.push(stripped[i]);
  }

  return result;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = blogCategories[post.category];
  const related = getRelatedPosts(post);
  // Auto-inject product callouts if not manually placed
  const contentWithCallouts = injectCallouts(post);
  const toc = getTableOfContents(contentWithCallouts);

  const articleBody = getArticleBodyText(post);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.dateModified || post.publishedAt,
    image: post.heroImage
      ? `https://anywherelearning.co${post.heroImage}`
      : 'https://anywherelearning.co/og-default.png',
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

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://anywherelearning.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://anywherelearning.co/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://anywherelearning.co/blog/${post.slug}` },
    ],
  };

  // Collect FAQ items from all faq content blocks
  const faqItems = post.content
    .filter((b): b is { type: 'faq'; items: { question: string; answer: string }[] } => b.type === 'faq')
    .flatMap((b) => b.items);

  const faqLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  // HowTo schema: only emit for posts whose title begins with "How to"
  // and where the H2-structure yields at least 3 extractable steps.
  const isHowToPost = /^how to\b/i.test(post.title);
  const howToSteps = isHowToPost ? getHowToSteps(contentWithCallouts) : [];
  const pageUrl = `https://anywherelearning.co/blog/${post.slug}`;
  const howToLd = howToSteps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.excerpt,
    totalTime: `PT${post.readTimeMinutes}M`,
    image: post.heroImage
      ? `https://anywherelearning.co${post.heroImage}`
      : 'https://anywherelearning.co/og-default.png',
    step: howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${pageUrl}#${s.anchor}`,
    })),
  } : null;

  return (
    <div className="bg-cream min-h-screen">
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
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
      )}
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
            {/* Category label */}
            <div className="mb-6">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-white px-3 py-1 rounded-full"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
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
              {post.author.avatarImage ? (
                <Image
                  src={post.author.avatarImage}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-cream text-sm font-semibold shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: post.author.avatarColor }}
                >
                  {post.author.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {post.author.name}
                  {post.author.credentials && (
                    <span className="text-gray-400 font-normal"> · {post.author.credentials}</span>
                  )}
                </span>
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
            className="group relative aspect-[2.2/1] rounded-[1.25rem] overflow-hidden flex items-center justify-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
            style={{
              background: post.heroImage ? undefined : `linear-gradient(160deg, ${cat.color}12, ${cat.color}30, ${cat.color}08)`,
            }}
          >
            <PinterestSaveButton
              url={`https://anywherelearning.co/blog/${post.slug}`}
              description={`${post.title}: ${post.excerpt}`}
            />
            {post.heroImage ? (
              <Image
                src={post.heroImage}
                alt={post.heroImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
                style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
              />
            ) : (
              <>
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
              </>
            )}
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
              return contentWithCallouts.map((block, i) => {
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

      {/* Newsletter CTA - wider */}
      <section className="pb-14 md:pb-18">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>

      {/* Related posts - full width */}
      <section className="pb-10 md:pb-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <RelatedPosts posts={related} />
        </div>
      </section>

      {/* Exit-intent lead magnet popup */}
      <BlogExitIntentPopup />
    </div>
  );
}
