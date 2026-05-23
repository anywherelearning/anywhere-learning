import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
  type BlogPost,
} from '@/lib/blog';
import { renderBlock, getTableOfContents, getHowToSteps } from '@/lib/content-blocks';
import { getResourceBySlug } from '@/lib/resources';
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ScrollReveal from '@/components/shared/ScrollReveal';
import PinterestSaveButton from '@/components/blog/PinterestSaveButton';
import EmailForm from '@/components/EmailForm';

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
            : 'https://anywherelearning.co/og-default.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

const motifByCategory: Record<BlogCategory, string> = {
  'ai-digital-literacy': '⌘',
  'creativity-maker': '✂',
  'future-ready-skills': '⊞',
  'homeschool-journey': '☘',
  'nature-learning': '✿',
  'real-world-skills': '$',
  'travel-worldschool': '✈',
};

const imgBgByCategory: Record<BlogCategory, string> = {
  'ai-digital-literacy': '#F5E7BC',
  'creativity-maker': '#F2DECF',
  'future-ready-skills': '#DDE5D2',
  'homeschool-journey': '#DAD7CD',
  'nature-learning': '#CFDCC4',
  'real-world-skills': '#DDE5D2',
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
  'bundle-callout',
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

function injectCallouts(post: { content: BlogContentBlock[]; category: BlogCategory; recommendedProduct?: string; recommendedBundle?: string }): BlogContentBlock[] {
  const defaults = blogProductDefaults[post.category];

  const hasAnyCallout = post.content.some((b) => b.type === 'product-callout' || b.type === 'bundle-callout');
  if (!post.recommendedProduct && !post.recommendedBundle && !hasAnyCallout) return post.content;

  const productBlock = post.content.find((b) => b.type === 'product-callout');
  const bundleBlock = post.content.find((b) => b.type === 'bundle-callout');
  const stripped = post.content.filter((b) =>
    !((b.type === 'product-callout' && !('pinned' in b && b.pinned))
    || (b.type === 'bundle-callout' && !('pinned' in b && b.pinned)))
  );

  const productPinned = productBlock && 'pinned' in productBlock && productBlock.pinned;
  const bundlePinned = bundleBlock && 'pinned' in bundleBlock && bundleBlock.pinned;

  const product = productPinned ? null : (productBlock
    || (defaults ? { type: 'product-callout' as const, slug: post.recommendedProduct || defaults.product } : null));
  const bundle = bundlePinned ? null : (bundleBlock
    || (defaults ? { type: 'bundle-callout' as const, slug: post.recommendedBundle || defaults.bundle } : null));

  if (!product && !bundle) return post.content;

  // Find paragraph indices we can land *after*. We aim for a paragraph
  // inside a section (i.e. after the section's H2 + first paragraph) so
  // the callout sits inside flowing text, not at a section boundary
  // where it tends to collide with tips/summaries above the next H2.
  const paragraphIndices = stripped
    .map((b, i) => (b.type === 'paragraph' ? i : -1))
    .filter((i) => i >= 0);

  if (paragraphIndices.length < 3) return post.content;

  // Target positions: ~50% through the article (product) and ~80% (bundle).
  const targetMid = Math.floor(stripped.length * 0.5);
  const targetEnd = Math.floor(stripped.length * 0.8);

  const productAfter = product
    ? paragraphIndices.reduce((best, idx) =>
        Math.abs(idx - targetMid) < Math.abs(best - targetMid) ? idx : best,
        paragraphIndices[0])
    : -1;

  const bundleAfter = bundle
    ? paragraphIndices.reduce((best, idx) => {
        if (productAfter >= 0 && idx <= productAfter + 1) return best;
        return Math.abs(idx - targetEnd) < Math.abs(best - targetEnd) ? idx : best;
      }, paragraphIndices[paragraphIndices.length - 1])
    : -1;

  // Resolve real injection slots, avoiding card-like neighbours.
  const taken = new Set<number>();
  const productSlot = product
    ? findSafeInjectionSlot(stripped, productAfter, taken)
    : -1;
  if (productSlot >= 0) taken.add(productSlot);
  const bundleSlot = bundle
    ? findSafeInjectionSlot(stripped, bundleAfter, taken)
    : -1;
  if (bundleSlot >= 0) taken.add(bundleSlot);

  const result: BlogContentBlock[] = [];
  for (let i = 0; i <= stripped.length; i++) {
    if (i === productSlot && product) result.push(product);
    if (i === bundleSlot && bundle && i !== productSlot) result.push(bundle);
    if (i < stripped.length) result.push(stripped[i]);
  }
  return result;
}

function RelatedCard({ post }: { post: BlogPost }) {
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
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
            quality={75}
            className={post.heroImageFit === 'contain' ? 'object-contain' : 'object-cover'}
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
        <h3 className="font-display text-[21px] leading-[1.18] tracking-tight text-balance mt-2.5 text-ink">
          {post.title}
        </h3>
        <p className="mt-2.5 font-display italic text-[15px] leading-[1.45] text-gray-600">
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = blogCategories[post.category];
  const pillar = post.pillarSlug ? getResourceBySlug(post.pillarSlug) : undefined;
  const related = getRelatedPosts(post);
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

  const isHowToPost = /^(?:how to\b|\d+\s)/i.test(post.title);
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
      : 'https://anywherelearning.co/og-default.jpg',
    step: howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${pageUrl}#${s.anchor}`,
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      {howToLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />}

      <ReadingProgress />

      <main className="bg-cream">
        {/* 01 BREADCRUMB */}
        <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
          <div className="mx-auto max-w-[1180px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="py-3.5 flex flex-wrap items-center gap-2.5 text-[13px] text-gray-500"
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
        <header className="text-center pt-16 md:pt-20 pb-8 md:pb-10">
          <div className="mx-auto max-w-[820px] px-6">
            <ScrollReveal>
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
        <div className="px-6 pb-12 md:pb-16">
          <ScrollReveal delay={80}>
            <div
              className="relative max-w-[980px] mx-auto rounded-[14px] overflow-hidden border border-[#D8D4C5] shadow-[0_28px_50px_-30px_rgba(45,58,46,0.32)]"
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
        <div className="mx-auto max-w-[1180px] px-6" data-article>
          <div className={toc.length >= 3 ? 'lg:grid lg:grid-cols-[1fr_220px] lg:gap-16' : ''}>
            <article className="min-w-0 pb-12 md:pb-16 mx-auto max-w-[720px] lg:max-w-none">
              <MobileTOC items={toc} />
              {(() => {
                let firstParagraphRendered = false;
                return contentWithCallouts.map((block, i) => {
                  const isFirst = block.type === 'paragraph' && !firstParagraphRendered;
                  if (isFirst) firstParagraphRendered = true;
                  return renderBlock(block, i, isFirst);
                });
              })()}

              {/* Author bio */}
              <aside className="mt-12 bg-[#F2EFE4] border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 grid grid-cols-1 sm:grid-cols-[72px_1fr] gap-5 items-start">
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
                  <StickyTOC items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* 05 EMAIL CAPTURE */}
        <section className="pt-2 pb-12">
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

        {/* 06 MEMBERSHIP POINTER */}
        <section className="pb-14">
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

        {/* 07 RELATED POSTS */}
        {related.length > 0 && (
          <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-16 md:py-20">
            <div className="mx-auto max-w-[1180px] px-6">
              <ScrollReveal>
                <div className="mb-10">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
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
                    <RelatedCard post={p} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <BlogExitIntentPopup />
    </>
  );
}
