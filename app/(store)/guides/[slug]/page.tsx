import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllResources,
  getResourceBySlug,
  resourceTopics,
  resourceProductDefaults,
  type ResourceTopic,
} from '@/lib/resources';
import { formatDate, type BlogContentBlock } from '@/lib/blog';
import { renderBlock, getTableOfContents, getArticleBodyText } from '@/lib/content-blocks';
import type { ContentBlock } from '@/lib/content-blocks';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AuthorBio from '@/components/blog/AuthorBio';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import RelatedBlogPosts from '@/components/resources/RelatedBlogPosts';
import StickyTOC from '@/components/blog/StickyTOC';
import MobileTOC from '@/components/blog/MobileTOC';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ScrollReveal from '@/components/shared/ScrollReveal';

const BlogExitIntentPopup = dynamic(() => import('@/components/blog/BlogExitIntentPopup'));

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

/* ─── Auto-inject product/bundle callouts ─── */

function injectCallouts(resource: { content: ContentBlock[]; topic: ResourceTopic; recommendedProduct?: string; recommendedBundle?: string }): ContentBlock[] {
  const hasProduct = resource.content.some((b) => b.type === 'product-callout');
  const hasBundle = resource.content.some((b) => b.type === 'bundle-callout');
  if (hasProduct && hasBundle) return resource.content;

  const defaults = resourceProductDefaults[resource.topic];
  if (!defaults) return resource.content;

  // If neither recommendedProduct nor recommendedBundle is set, skip auto-injection
  if (!resource.recommendedProduct && !resource.recommendedBundle) return resource.content;

  const productSlug = resource.recommendedProduct || defaults.product;
  const bundleSlug = resource.recommendedBundle || defaults.bundle;

  const h2Indices = resource.content
    .map((b, i) => (b.type === 'heading' && b.level === 2 ? i : -1))
    .filter((i) => i >= 0);

  if (h2Indices.length < 2) return resource.content;

  const total = resource.content.length;
  const target35 = Math.floor(total * 0.35);
  const target65 = Math.floor(total * 0.65);

  const productIdx = !hasProduct
    ? h2Indices.reduce((best, idx) => (Math.abs(idx - target35) < Math.abs(best - target35) ? idx : best), h2Indices[0])
    : -1;
  const bundleIdx = !hasBundle
    ? h2Indices.reduce((best, idx) => {
        if (productIdx >= 0 && idx <= productIdx) return best;
        return Math.abs(idx - target65) < Math.abs(best - target65) ? idx : best;
      }, h2Indices[h2Indices.length - 1])
    : -1;

  const result: ContentBlock[] = [];
  for (let i = 0; i < resource.content.length; i++) {
    if (i === productIdx && !hasProduct) {
      result.push({ type: 'product-callout', slug: productSlug });
    }
    if (i === bundleIdx && !hasBundle && i !== productIdx) {
      result.push({ type: 'bundle-callout', slug: bundleSlug });
    }
    result.push(resource.content[i]);
  }

  return result;
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  const topicMeta = resourceTopics[resource.topic];
  const contentWithCallouts = injectCallouts(resource);
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
        url: 'https://anywherelearning.co/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://anywherelearning.co/guides/${resource.slug}`,
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
      <ReadingProgress />

      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${topicMeta.color}, transparent 70%), radial-gradient(ellipse at 70% 80%, ${topicMeta.color}, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 pt-8 md:pt-12 pb-10 md:pb-14">
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: 'Guides', href: '/guides' },
                { label: resource.title },
              ]}
            />
          </div>

          <ScrollReveal>
            <div className="mb-6">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-white px-3 py-1 rounded-full"
                style={{ backgroundColor: topicMeta.color }}
              >
                {topicMeta.label}
              </span>
            </div>

            <h1 className="font-display text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.4rem] text-forest leading-[1.06] mb-7 max-w-3xl text-balance tracking-[-0.02em]">
              {resource.title}
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
              {resource.excerpt}
            </p>

            <div className="flex items-center gap-4">
              {resource.author.avatarImage ? (
                <Image
                  src={resource.author.avatarImage}
                  alt={resource.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-cream text-sm font-semibold shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: resource.author.avatarColor }}
                >
                  {resource.author.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{resource.author.name}</span>
                <span className="text-[13px] text-gray-400">{formatDate(resource.publishedAt)}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* ─── Hero image placeholder ─── */}
      <div className="mx-auto max-w-5xl px-5 sm:px-8 mb-12 md:mb-16">
        <ScrollReveal delay={100}>
          <div
            className="relative aspect-[16/9] rounded-[1.25rem] overflow-hidden flex items-center justify-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
            style={{
              background: resource.heroImage ? undefined : `linear-gradient(160deg, ${topicMeta.color}12, ${topicMeta.color}30, ${topicMeta.color}08)`,
            }}
          >
            {resource.heroImage ? (
              <Image
                src={resource.heroImage}
                alt={resource.heroImageAlt || resource.title}
                fill
                className="object-cover"
                style={{ objectPosition: resource.heroImagePosition || 'center' }}
                sizes="(max-width: 768px) 100vw, 960px"
                priority
              />
            ) : (
              <>
                <div
                  className="absolute top-[10%] right-[15%] w-40 h-40 rounded-full opacity-15 blur-3xl"
                  style={{ backgroundColor: topicMeta.color }}
                />
                <div
                  className="absolute bottom-[15%] left-[8%] w-52 h-52 rounded-full opacity-10 blur-[80px]"
                  style={{ backgroundColor: topicMeta.color }}
                />
                <span className="text-gray-400/40 text-sm relative z-10 font-medium">{resource.heroImageAlt}</span>
              </>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* ─── Article + Sidebar Grid ─── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8" data-article>
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16 xl:grid-cols-[1fr_240px] xl:gap-20">
          <article className="min-w-0 pb-16 md:pb-20 mx-auto max-w-[680px] lg:max-w-none">
            <MobileTOC items={toc} />

            {(() => {
              let firstParagraphRendered = false;
              return contentWithCallouts.map((block, i) => {
                const isFirst = block.type === 'paragraph' && !firstParagraphRendered;
                if (isFirst) firstParagraphRendered = true;
                return renderBlock(block, i, isFirst);
              });
            })()}
          </article>

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
        <div className="py-12 md:py-16">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-gold/30" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gold/40">
              <path d="M12 22V8M5 12c0-5 7-10 7-10s7 5 7 10c0 3-2 5-7 5s-7-2-7-5z" strokeLinecap="round" />
            </svg>
            <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-gold/30" />
          </div>
        </div>

        <section className="pb-14 md:pb-18">
          <ScrollReveal>
            <AuthorBio author={resource.author} />
          </ScrollReveal>
        </section>
      </div>

      {/* Newsletter CTA */}
      <section className="pb-14 md:pb-18">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>

      {/* Related blog posts */}
      <RelatedBlogPosts slugs={resource.relatedBlogSlugs} />

      {/* Exit-intent popup */}
      <BlogExitIntentPopup />
    </div>
  );
}
