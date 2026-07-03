import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllResources,
  getResourceBySlug,
  resourceTopics,
  resourceProductDefaults,
  type ResourceTopic,
} from '@/lib/resources';
import { formatDate } from '@/lib/blog';
import { renderBlock, getTableOfContents, getArticleBodyText } from '@/lib/content-blocks';
import type { ContentBlock } from '@/lib/content-blocks';
import { getCategoryBySlug } from '@/lib/ideas';
import RelatedBlogPosts from '@/components/resources/RelatedBlogPosts';
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ScrollReveal from '@/components/shared/ScrollReveal';
import EmailForm from '@/components/EmailForm';

const BlogExitIntentPopup = dynamic(() => import('@/components/blog/BlogExitIntentPopup'));

const imgBgByTopic: Record<ResourceTopic, string> = {
  'real-world-learning': '#DDE5D2',
  'nature-stem': '#CFDCC4',
  'worldschooling': '#E8C8AE',
  'creativity-maker': '#F2DECF',
  'ai-digital-literacy': '#F5E7BC',
  'homeschool-journey': '#DAD7CD',
  'future-ready-skills': '#DDE5D2',
  'stem-for-kids': '#CFDCC4',
};

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllResources().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};

  return {
    title: resource.title,
    description: resource.excerpt,
    keywords: resource.keywords,
    alternates: {
      canonical: `https://anywherelearning.co/guides/${resource.slug}`,
    },
    openGraph: {
      title: resource.title,
      description: resource.excerpt,
      type: 'article',
      publishedTime: resource.publishedAt,
      modifiedTime: resource.dateModified || resource.publishedAt,
      authors: [resource.author.name],
      url: `https://anywherelearning.co/guides/${resource.slug}`,
      images: [
        {
          url: resource.heroImage
            ? `https://anywherelearning.co${resource.heroImage}`
            : 'https://anywherelearning.co/og-default.jpg',
          width: 1200,
          height: 630,
          alt: resource.title,
        },
      ],
    },
  };
}

/**
 * Maps each guide pillar to the most relevant /ideas category hub. Linking to
 * the category (rather than a single list) lets authority flow to every list
 * inside it. Broad guides point at the main /ideas hub.
 */
const GUIDE_TO_IDEAS: Record<string, { href: string; label: string; text: string }> = {
  'ai-digital-literacy': {
    href: '/ideas/ai-digital',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable AI and digital literacy checklists for kids.',
  },
  'creativity-maker-activities': {
    href: '/ideas/creative',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable creative and maker checklists for kids.',
  },
  'worldschooling-guide': {
    href: '/ideas/travel',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable travel and worldschool checklists for kids.',
  },
  'life-skills-for-kids': {
    href: '/ideas/life-skills',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable life skills and chores checklists for kids.',
  },
  'nature-based-learning': {
    href: '/ideas/nature',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable nature and outdoor checklists for kids.',
  },
  'stem-for-kids': {
    href: '/ideas/stem',
    label: 'Browse the checklists',
    text: 'Want ready-to-use activities? Browse our free printable STEM and engineering checklists for kids.',
  },
  'real-world-learning': {
    href: '/ideas',
    label: 'Browse all checklists',
    text: 'Want ready-to-use activities? Browse our free printable activity checklists across every category.',
  },
  'homeschool-journey': {
    href: '/ideas',
    label: 'Browse all checklists',
    text: 'Want ready-to-use activities? Browse our free printable activity checklists across every category.',
  },
}

/**
 * Inject a CTA card linking the guide to its matching free idea-list category.
 * Cross-links pillars to the printable checklists. Skips if already present.
 */
function injectIdeaListLink(guideSlug: string, content: ContentBlock[]): ContentBlock[] {
  const target = GUIDE_TO_IDEAS[guideSlug];
  if (!target) return content;

  // Validate category exists when it's a category link (not the /ideas hub).
  const catSlug = target.href.split('/ideas/')[1];
  if (catSlug && !getCategoryBySlug(catSlug)) return content;

  const alreadyLinks = content.some(
    (b) => b.type === 'cta' && b.href.includes('/ideas'),
  );
  if (alreadyLinks) return content;

  const ctaBlock: ContentBlock = {
    type: 'cta',
    text: target.text,
    href: target.href,
    label: target.label,
  };

  const lastParagraphIdx = content.map((b) => b.type).lastIndexOf('paragraph');
  if (lastParagraphIdx === -1) return [...content, ctaBlock];
  const result = [...content];
  result.splice(lastParagraphIdx + 1, 0, ctaBlock);
  return result;
}

function injectCallouts(resource: { content: ContentBlock[]; topic: ResourceTopic; recommendedProduct?: string }): ContentBlock[] {
  const hasProduct = resource.content.some((b) => b.type === 'product-callout');
  if (hasProduct) return resource.content;

  const defaults = resourceProductDefaults[resource.topic];
  if (!defaults) return resource.content;

  if (!resource.recommendedProduct) return resource.content;

  const productSlug = resource.recommendedProduct || defaults.product;

  const h2Indices = resource.content
    .map((b, i) => (b.type === 'heading' && b.level === 2 ? i : -1))
    .filter((i) => i >= 0);

  if (h2Indices.length < 2) return resource.content;

  const total = resource.content.length;
  const target35 = Math.floor(total * 0.35);

  const productIdx = h2Indices.reduce(
    (best, idx) => (Math.abs(idx - target35) < Math.abs(best - target35) ? idx : best),
    h2Indices[0],
  );

  const result: ContentBlock[] = [];
  for (let i = 0; i < resource.content.length; i++) {
    if (i === productIdx) result.push({ type: 'product-callout', slug: productSlug });
    result.push(resource.content[i]);
  }
  return result;
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  const topicMeta = resourceTopics[resource.topic];
  const contentWithCallouts = injectIdeaListLink(slug, injectCallouts(resource));
  const toc = getTableOfContents(contentWithCallouts);

  const articleBody = getArticleBodyText(resource.content);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: resource.title,
    description: resource.excerpt,
    datePublished: resource.publishedAt,
    dateModified: resource.dateModified || resource.publishedAt,
    image: resource.heroImage
      ? `https://anywherelearning.co${resource.heroImage}`
      : 'https://anywherelearning.co/og-default.jpg',
    keywords: resource.keywords?.join(', '),
    articleBody,
    wordCount: articleBody.split(/\s+/).length,
    articleSection: topicMeta.label,
    author: {
      '@type': 'Person',
      '@id': 'https://anywherelearning.co/about#amelie',
      name: resource.author.name,
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
      '@id': `https://anywherelearning.co/guides/${resource.slug}`,
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
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://anywherelearning.co/guides' },
      { '@type': 'ListItem', position: 3, name: resource.title, item: `https://anywherelearning.co/guides/${resource.slug}` },
    ],
  };

  const faqItems = resource.content
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <ReadingProgress />

      <main className="bg-cream">
        {/* 01 BREADCRUMB */}
        <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
          <div className="mx-auto max-w-[1180px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="py-3.5 flex flex-wrap items-center gap-2.5 text-[13px] text-gray-500"
            >
              <Link href="/guides" className="text-gray-600 hover:text-forest-dark transition-colors no-underline">
                Guides
              </Link>
              <span aria-hidden="true" className="text-[#C9C5B7]">&rsaquo;</span>
              <span className="text-gray-500 truncate max-w-[280px] sm:max-w-none">{resource.title}</span>
            </nav>
          </div>
        </div>

        {/* 02 ARTICLE HEADER */}
        <header className="text-center pt-16 md:pt-20 pb-8 md:pb-10">
          <div className="mx-auto max-w-[880px] px-6">
            <ScrollReveal>
              <span
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: topicMeta.color }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: topicMeta.color }}
                  aria-hidden="true"
                />
                {topicMeta.label}
              </span>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.04] tracking-tight mt-4 max-w-[880px] mx-auto text-balance">
                {resource.title}
              </h1>
              <p className="mt-5 max-w-[680px] mx-auto font-display italic text-[clamp(1.25rem,2.1vw,1.5rem)] leading-[1.45] text-gray-600">
                {resource.excerpt}
              </p>
              <div className="mt-8 inline-flex items-center gap-3.5 text-left">
                {resource.author.avatarImage ? (
                  <Image
                    src={resource.author.avatarImage}
                    alt={resource.author.name}
                    width={42}
                    height={42}
                    className="w-[42px] h-[42px] rounded-full object-cover border border-[#D8D4C5]"
                  />
                ) : (
                  <div
                    className="w-[42px] h-[42px] rounded-full border border-[#D8D4C5] grid place-items-center font-display italic text-[18px] leading-none pb-0.5 text-forest-dark"
                    style={{ background: 'linear-gradient(135deg, #DAD7CD, #C9C5B7)' }}
                  >
                    {resource.author.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col leading-[1.3]">
                  <span className="font-semibold text-[15px] text-ink">
                    {resource.author.name}
                    {resource.author.credentials && (
                      <span className="font-normal text-gray-500"> &middot; {resource.author.credentials}</span>
                    )}
                  </span>
                  <span className="text-[12.5px] text-gray-500 tracking-wide">
                    {formatDate(resource.publishedAt)}
                    {resource.dateModified && resource.dateModified !== resource.publishedAt && (
                      <> &middot; Updated {formatDate(resource.dateModified)}</>
                    )}
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
              className="relative aspect-[16/9] max-w-[1100px] mx-auto rounded-[14px] overflow-hidden border border-[#D8D4C5] shadow-[0_28px_50px_-30px_rgba(45,58,46,0.32)]"
              style={{ background: imgBgByTopic[resource.topic] || '#E6EBDF' }}
            >
              {resource.heroImage ? (
                <Image
                  src={resource.heroImage}
                  alt={resource.heroImageAlt || resource.title}
                  fill
                  sizes="(max-width: 1100px) 100vw, 1100px"
                  className="object-cover"
                  style={resource.heroImagePosition ? { objectPosition: resource.heroImagePosition } : undefined}
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
          <div className={toc.length >= 3 ? 'lg:grid lg:grid-cols-[260px_1fr] lg:gap-16' : ''}>
            {toc.length >= 3 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 pb-8 pt-2">
                  <StickyTOC items={toc} />
                </div>
              </aside>
            )}

            <article className="min-w-0 pb-12 md:pb-16 mx-auto max-w-[760px] lg:max-w-none">
              <MobileTOC items={toc} />
              {(() => {
                let firstParagraphRendered = false;
                return contentWithCallouts.map((block, i) => {
                  const isFirst = block.type === 'paragraph' && !firstParagraphRendered;
                  if (isFirst) firstParagraphRendered = true;
                  return renderBlock(block, i, isFirst);
                });
              })()}

              {/* Tag row */}
              {resource.keywords && resource.keywords.length > 0 && (
                <div className="mt-10 pt-6 border-t border-[#D8D4C5] flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mr-1.5">
                    Tagged
                  </span>
                  {resource.keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="inline-block bg-[#F2EFE4] text-gray-600 text-[13px] font-medium px-3 py-1.5 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Author bio */}
              <aside className="mt-12 bg-[#F2EFE4] border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 grid grid-cols-1 sm:grid-cols-[72px_1fr] gap-5 items-start">
                {resource.author.avatarImage ? (
                  <Image
                    src={resource.author.avatarImage}
                    alt={resource.author.name}
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-full object-cover border border-[#D8D4C5]"
                  />
                ) : (
                  <div
                    className="w-[72px] h-[72px] rounded-full border border-[#D8D4C5] grid place-items-center font-display italic text-[32px] leading-none pb-1 text-forest-dark"
                    style={{ background: 'linear-gradient(135deg, #DAD7CD, #C9C5B7)' }}
                  >
                    {resource.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">
                    Written by
                  </div>
                  <h4 className="font-display text-[26px] leading-[1.1] tracking-tight text-ink mb-2">
                    {resource.author.name}
                  </h4>
                  <p className="m-0 text-[15.5px] leading-[1.6] text-gray-600">
                    {resource.author.bio}
                  </p>
                </div>
              </aside>
            </article>
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
                  New guides, fresh ideas, delivered when we have{' '}
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

        {/* 07 RELATED BLOG POSTS */}
        <RelatedBlogPosts slugs={resource.relatedBlogSlugs} />
      </main>

      <BlogExitIntentPopup />
    </>
  );
}
