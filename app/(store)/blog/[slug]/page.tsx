import type { Metadata } from 'next';
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getSeoDescription,
  getArticleBodyText,
  blogCategories,
  blogProductDefaults,
  formatDate,
  type BlogContentBlock,
  type BlogCategory,
  type BlogPost,
} from '@/lib/blog';
import { renderBlock, getTableOfContents, getHowToSteps } from '@/lib/content-blocks';
import { getResourceBySlug } from '@/lib/resources';
import { applyLeadMagnetCta, getLeadMagnetForPost, INLINE_CAPTURE_POSTS, inlineCaptureIndex } from '@/lib/lead-magnets';
import BlogInlineEmailCapture from '@/components/blog/BlogInlineEmailCapture';
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ScrollReveal from '@/components/shared/ScrollReveal';
import PinterestSaveButton from '@/components/blog/PinterestSaveButton';
import BlogQuizCTA from '@/components/blog/BlogQuizCTA';
import TryItThisWeek from '@/components/blog/TryItThisWeek';
import IndexCard from '@/components/blog/IndexCard';
import { PAPER_SHADOW } from '@/components/shared/Paper';
import { BLOG_TO_PRODUCT_CATEGORY } from '@/lib/cross-links';

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
  const seoTitle = post.seoTitle ?? post.title;

  return {
    // The " | Anywhere Learning" suffix (21 chars) is added only when the whole
    // title still fits Google's ~60-character cutoff; otherwise the
    // keyword-led title stands alone. The brand is in the URL and breadcrumb.
    title: seoTitle.length + 21 <= 60 ? seoTitle : { absolute: seoTitle },
    description: getSeoDescription(post),
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
            : 'https://anywherelearning.co/og-default.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}


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

/**
 * A "card-like" block visually competes with a product/bundle callout if
 * placed immediately adjacent to one. We use this set to avoid sandwiching
 * callouts between two cards.
 */
const CARD_LIKE_BLOCK_TYPES = new Set<BlogContentBlock['type']>([
  'tip',
  'summary',
  'pull-quote',
  'faq',
  'image',
  'cta',
  'product-callout',
]);

function isCardLike(b: BlogContentBlock | undefined): boolean {
  return !!b && CARD_LIKE_BLOCK_TYPES.has(b.type);
}

/**
 * Picks a safe injection slot — preferring the END OF A SECTION
 * (the slot immediately before the next H2). Returns the final insertion
 * index (callout will be pushed at position `returnedIdx`, between
 * blocks[returnedIdx-1] and blocks[returnedIdx]).
 *
 * Algorithm:
 *   1. From `afterIdx`, walk FORWARD looking for the next H2.
 *   2. The slot right before that H2 is end-of-section. Use it.
 *   3. If no H2 is found before end-of-doc, place at the very end.
 *   4. Fall back to a safe paragraph→paragraph boundary if either of
 *      those is taken or unsafe (rare).
 */
function findSafeInjectionSlot(
  blocks: BlogContentBlock[],
  afterIdx: number,
  takenSlots: Set<number>,
): number {
  // Walk forward from afterIdx looking for the next H2 → slot is right before it.
  for (let i = afterIdx + 1; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'heading' && b.level === 2) {
      if (!takenSlots.has(i)) return i;
      // Slot is taken; keep walking to the H2 after that
    }
  }

  // No more H2s ahead — try end of document if the trailing block is non-card.
  const endSlot = blocks.length;
  if (!takenSlots.has(endSlot)) {
    const tail = blocks[endSlot - 1];
    if (!isCardLike(tail) || tail.type === 'heading') return endSlot;
  }

  // Fallback: original "safe paragraph→paragraph boundary" walk
  const initial = afterIdx + 1;
  for (let probe = initial; probe < blocks.length; probe++) {
    if (takenSlots.has(probe)) continue;
    const before = blocks[probe - 1];
    const after = blocks[probe];
    const beforeOk = !isCardLike(before) || before.type === 'heading';
    const afterOk = !isCardLike(after) || after.type === 'heading';
    if (beforeOk && afterOk) return probe;
  }
  return initial;
}


function injectCallouts(post: { content: BlogContentBlock[]; category: BlogCategory; recommendedProduct?: string }): BlogContentBlock[] {
  const defaults = blogProductDefaults[post.category];

  const hasAnyCallout = post.content.some((b) => b.type === 'product-callout');
  if (!post.recommendedProduct && !hasAnyCallout) return post.content;

  const productBlock = post.content.find((b) => b.type === 'product-callout');
  const stripped = post.content.filter((b) =>
    !(b.type === 'product-callout' && !('pinned' in b && b.pinned))
  );

  const productPinned = productBlock && 'pinned' in productBlock && productBlock.pinned;

  const product = productPinned ? null : (productBlock
    || (defaults ? { type: 'product-callout' as const, slug: post.recommendedProduct || defaults.product } : null));

  if (!product) return post.content;

  // Find paragraph indices we can land *after*. We aim for a paragraph
  // inside a section (i.e. after the section's H2 + first paragraph) so
  // the callout sits inside flowing text, not at a section boundary
  // where it tends to collide with tips/summaries above the next H2.
  const paragraphIndices = stripped
    .map((b, i) => (b.type === 'paragraph' ? i : -1))
    .filter((i) => i >= 0);

  if (paragraphIndices.length < 3) return post.content;

  // Target position: ~50% through the article.
  const targetMid = Math.floor(stripped.length * 0.5);

  const productAfter = paragraphIndices.reduce((best, idx) =>
    Math.abs(idx - targetMid) < Math.abs(best - targetMid) ? idx : best,
    paragraphIndices[0]);

  // Resolve the real injection slot, avoiding card-like neighbours.
  const taken = new Set<number>();
  const productSlot = findSafeInjectionSlot(stripped, productAfter, taken);
  if (productSlot >= 0) taken.add(productSlot);

  const result: BlogContentBlock[] = [];
  for (let i = 0; i <= stripped.length; i++) {
    if (i === productSlot && product) result.push(product);
    if (i < stripped.length) result.push(stripped[i]);
  }
  return result;
}


export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = blogCategories[post.category];
  const pillar = post.pillarSlug ? getResourceBySlug(post.pillarSlug) : undefined;
  const related = getRelatedPosts(post);
  const magnet = getLeadMagnetForPost(post);
  const contentWithCallouts = applyLeadMagnetCta(injectCallouts(post), magnet);
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
      : 'https://anywherelearning.co/og-default.jpg',
    keywords: post.keywords?.join(', '),
    articleBody,
    wordCount: articleBody.split(/\s+/).length,
    author: {
      '@type': 'Person',
      '@id': 'https://anywherelearning.co/about#amelie',
      name: post.author.name,
      url: 'https://anywherelearning.co/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anywherelearning.co/logo-icon-transparent.png',
        width: 1200,
        height: 867,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://anywherelearning.co/blog/${post.slug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article [data-summary]', 'article h1', 'article p:first-of-type'],
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

  // These posts are editorial listicles, not procedures. HowTo was removed here
  // because Google retired HowTo rich results in Sept 2023 and the markup
  // mislabelled the posts as instructions (with totalTime faked from read time).
  // ItemList keeps the list structure extractable without the false claim.
  const isListPost = /^(?:how to\b|\d+\s)/i.test(post.title);
  const listSteps = isListPost ? getHowToSteps(contentWithCallouts) : [];
  const pageUrl = `https://anywherelearning.co/blog/${post.slug}`;
  const itemListLd = listSteps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: post.title,
    description: post.excerpt,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: listSteps.length,
    itemListElement: listSteps.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      url: `${pageUrl}#${s.anchor}`,
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      {itemListLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />}

      <ReadingProgress />

      <main className="bg-[#E9EEE6] px-3 pt-8 sm:px-6 md:pt-10">
        {/* The post is one big card pulled from the blog's recipe box: the
            category tab on top, the category colour across the edge. */}
        <div className="mx-auto max-w-[1180px]">
          <Link
            href={`/blog?category=${post.category}#blog-grid`}
            className="ml-6 inline-block rounded-t-[10px] px-4 pb-2 pt-2.5 text-[13px] font-semibold text-white no-underline md:ml-12"
            style={{ background: cat.color }}
          >
            {cat.label}
          </Link>
        </div>
        <div className={`mx-auto max-w-[1180px] rounded-b-[6px] border-t-[6px] bg-white ${PAPER_SHADOW}`} style={{ borderColor: cat.color }}>
        {/* 01 BREADCRUMB */}
        <div className="px-5 pt-5 sm:px-8 md:px-12">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="py-1 flex flex-wrap items-center gap-2.5 text-[13px] text-gray-500"
            >
              <Link href="/blog" className="text-gray-600 hover:text-forest-dark transition-colors no-underline">
                Blog
              </Link>
              <span aria-hidden="true" className="text-[#C9C5B7]">&rsaquo;</span>
              <Link
                href={`/blog?category=${post.category}`}
                className="text-gray-600 hover:text-forest-dark transition-colors no-underline"
              >
                {cat.label}
              </Link>
              <span aria-hidden="true" className="text-[#C9C5B7]">&rsaquo;</span>
              <span className="text-gray-500 truncate max-w-[280px] sm:max-w-none">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* 02 ARTICLE HEADER */}
        <header className="text-center pt-10 md:pt-12 pb-8 md:pb-10">
          <div className="mx-auto max-w-[820px] px-6">
            <ScrollReveal immediate>
              <span
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: cat.color }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cat.color }}
                  aria-hidden="true"
                />
                {cat.label}
              </span>
              <h1 className="font-display text-[clamp(2.125rem,4.8vw,3.75rem)] leading-[1.06] tracking-tight mt-4 max-w-[820px] mx-auto text-balance">
                {post.title}
              </h1>
              <p className="mt-5 max-w-[640px] mx-auto font-display italic text-[clamp(1.1875rem,2vw,1.375rem)] leading-[1.45] text-gray-600">
                {post.excerpt}
              </p>
              {pillar && (
                <p className="mt-5 text-sm text-gray-500">
                  Part of{' '}
                  <Link
                    href={`/guides/${pillar.slug}`}
                    className="text-forest-dark font-semibold underline decoration-forest/30 underline-offset-[3px] hover:decoration-forest-dark"
                  >
                    {pillar.title}
                  </Link>
                </p>
              )}
              <div className="mt-8 inline-flex items-center gap-3.5 text-left">
                {post.author.avatarImage ? (
                  <Image
                    src={post.author.avatarImage}
                    alt={post.author.name}
                    width={42}
                    height={42}
                    className="w-[42px] h-[42px] rounded-full object-cover border border-[#D8D4C5]"
                  />
                ) : (
                  <div
                    className="w-[42px] h-[42px] rounded-full border border-[#D8D4C5] grid place-items-center font-display italic text-[18px] leading-none pb-0.5 text-forest-dark"
                    style={{ background: 'linear-gradient(135deg, #DAD7CD, #C9C5B7)' }}
                  >
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col leading-[1.3]">
                  <span className="font-semibold text-[15px] text-ink">
                    {post.author.name}
                    {post.author.credentials && (
                      <span className="font-normal text-gray-500"> &middot; {post.author.credentials}</span>
                    )}
                  </span>
                  <span className="text-[12.5px] text-gray-500 tracking-wide">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </header>

        {/* 03 HERO IMAGE */}
        <div className="px-5 pb-10 sm:px-8 md:px-12 md:pb-12">
          <ScrollReveal delay={80}>
            <div
              className="relative max-w-[980px] mx-auto overflow-hidden rounded-[4px]"
              style={{ background: imgBgByCategory[post.category] || '#E6EBDF', aspectRatio: post.heroImageAspect || '16 / 10' }}
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
                  sizes="(max-width: 980px) 100vw, 980px"
                  className={post.heroImageFit === 'contain' ? 'object-contain' : 'object-cover'}
                  style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
                  priority
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, rgba(120,90,40,0.06) 0 2px, transparent 2px 12px)`,
                  }}
                />
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* 04 ARTICLE BODY */}
        <div className="px-5 sm:px-8 md:px-12" data-article>
          <div className={toc.length >= 3 ? 'lg:grid lg:grid-cols-[1fr_230px] lg:gap-12' : ''}>
            <article className="min-w-0 pb-12 md:pb-16 mx-auto max-w-[720px] lg:max-w-none">
              <MobileTOC items={toc} />
              {(() => {
                let firstParagraphRendered = false;
                const captureAt = INLINE_CAPTURE_POSTS.has(post.slug)
                  ? inlineCaptureIndex(contentWithCallouts)
                  : -1;
                return contentWithCallouts.map((block, i) => {
                  const isFirst = block.type === 'paragraph' && !firstParagraphRendered;
                  if (isFirst) firstParagraphRendered = true;
                  if (i === captureAt) {
                    return (
                      <Fragment key={`capture-${i}`}>
                        <BlogInlineEmailCapture magnet={magnet} pageSlug={post.slug} />
                        {renderBlock(block, i, isFirst)}
                      </Fragment>
                    );
                  }
                  return renderBlock(block, i, isFirst);
                });
              })()}

              {/* Author bio */}
              <aside className={`mt-12 -rotate-[0.6deg] bg-[#FBF3DC] p-7 md:p-8 grid grid-cols-1 sm:grid-cols-[72px_1fr] gap-5 items-start ${PAPER_SHADOW}`}>
                {post.author.avatarImage ? (
                  <Image
                    src={post.author.avatarImage}
                    alt={post.author.name}
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-full object-cover border border-[#D8D4C5]"
                  />
                ) : (
                  <div
                    className="w-[72px] h-[72px] rounded-full border border-[#D8D4C5] grid place-items-center font-display italic text-[32px] leading-none pb-1 text-forest-dark"
                    style={{ background: 'linear-gradient(135deg, #DAD7CD, #C9C5B7)' }}
                  >
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">
                    Written by
                  </div>
                  <h4 className="font-display text-[26px] leading-[1.1] tracking-tight text-ink mb-2">
                    {post.author.name}
                  </h4>
                  <p className="m-0 text-[15.5px] leading-[1.6] text-gray-600">
                    {post.author.bio}
                  </p>
                </div>
              </aside>
            </article>

            {toc.length >= 3 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 pb-8">
                  <div className={`rotate-[1deg] border-t-4 bg-[#FFFDF8] p-4 ${PAPER_SHADOW}`} style={{ borderColor: cat.color }}>
                    <StickyTOC items={toc} />
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>

        </div>

        {/* 04b TRY IT: three matching activities from the library */}
        <TryItThisWeek
          productCategory={BLOG_TO_PRODUCT_CATEGORY[post.category]}
          prefer={post.recommendedProduct}
          seed={post.slug}
        />

        {/* 05 QUIZ CTA */}
        <div className="pt-8">
          <BlogQuizCTA paper />
        </div>

        {/* 06 RELATED POSTS
            (A membership pointer used to sit here; removed to avoid stacking it
            back-to-back with the quiz CTA above. Membership is still pitched by
            the mid-article product callout and the exit-intent popup.) */}
        {related.length > 0 && (
          <section className="pb-14">
            <div className="mx-auto max-w-[1180px] rounded-[16px] border-t-4 border-forest bg-[#DCE4D5] px-4 py-8 sm:px-8 md:px-10 md:py-10">
              <ScrollReveal>
                <div className="mb-8">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-forest-dark">
                    Keep reading
                  </p>
                  <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance">
                    More from <span className="italic text-forest">the blog.</span>
                  </h2>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {related.slice(0, 3).map((p, i) => (
                  <ScrollReveal key={p.slug} className="h-full" delay={i * 60}>
                    <IndexCard post={p} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <BlogExitIntentPopup magnet={magnet} />
    </>
  );
}
