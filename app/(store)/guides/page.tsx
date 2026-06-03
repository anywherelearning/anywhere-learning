import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { getAllResources, resourceTopics, type ResourcePage } from '@/lib/resources';

export const metadata: Metadata = {
  title: 'Learning Guides for Families: Life Skills, Nature, Creativity & More',
  description:
    'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling. Written by a former teacher for families who want learning to fit their life.',
  alternates: {
    canonical: 'https://anywherelearning.co/guides',
  },
  openGraph: {
    title: 'Learning Guides for Families: Life Skills, Nature, Creativity & More | Anywhere Learning',
    description:
      'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling. Written by a former teacher for families who want learning to fit their life.',
    url: 'https://anywherelearning.co/guides',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning Resource Guides',
      },
    ],
  },
};

const motifByTopic: Record<string, string> = {
  'real-world-learning': '$',
  'nature-stem': '✿',
  'worldschooling': '✈',
  'creativity-maker': '✂',
  'ai-digital-literacy': '⌘',
  'homeschool-journey': '☘',
  'future-ready-skills': '⊞',
};

const imgBgByTopic: Record<string, string> = {
  'real-world-learning': '#DDE5D2',
  'nature-stem': '#CFDCC4',
  'worldschooling': '#E8C8AE',
  'creativity-maker': '#F2DECF',
  'ai-digital-literacy': '#F5E7BC',
  'homeschool-journey': '#DAD7CD',
  'future-ready-skills': '#DDE5D2',
};

function formatUpdated(r: ResourcePage): string {
  const date = r.dateModified || r.publishedAt;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function GuideCard({
  r,
  variant = 'standard',
}: {
  r: ResourcePage;
  variant?: 'featured' | 'tall' | 'standard' | 'wide';
}) {
  const topic = resourceTopics[r.topic];
  const color = topic.color;
  const bg = imgBgByTopic[r.topic] || '#E6EBDF';
  const motif = motifByTopic[r.topic] || '◆';

  const imageClass =
    variant === 'featured'
      ? 'flex-1 min-h-[420px]'
      : variant === 'wide'
      ? 'aspect-[16/10] md:aspect-auto md:h-full md:min-h-[320px]'
      : variant === 'tall'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';
  const bodyPadding =
    variant === 'featured' ? 'p-8 md:p-9' : variant === 'wide' ? 'p-7 md:p-9' : 'p-6 md:p-7';
  const titleSize =
    variant === 'featured' || variant === 'wide'
      ? 'text-[clamp(1.55rem,2.4vw,2rem)] leading-[1.1]'
      : 'text-[1.35rem] leading-[1.2]';

  const outerClass =
    variant === 'wide'
      ? 'grid grid-cols-1 md:grid-cols-[1.1fr_1fr]'
      : 'flex flex-col';
  const imageBorderClass =
    variant === 'wide'
      ? 'border-b border-[#D8D4C5] md:border-b-0 md:border-r'
      : 'border-b border-[#D8D4C5]';

  return (
    <Link
      href={`/guides/${r.slug}`}
      className={`group ${outerClass} h-full bg-cream border-[3px] rounded-[14px] overflow-hidden text-ink no-underline shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.32)]`}
      style={{ borderColor: `${color}80` }}
    >
      <div
        className={`relative ${imageClass} overflow-hidden ${imageBorderClass}`}
        style={{ background: bg, borderColor: `${color}33` }}
      >
        {r.heroImage && (
          <Image
            src={r.heroImage}
            alt={r.heroImageAlt || r.title}
            fill
            sizes={
              variant === 'featured'
                ? '(max-width: 980px) 100vw, 60vw'
                : variant === 'wide'
                ? '(max-width: 768px) 100vw, 55vw'
                : '(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw'
            }
            quality={75}
            className="object-cover"
            style={
              variant === 'wide'
                ? { objectPosition: 'center 88%' }
                : r.heroImagePosition
                ? { objectPosition: r.heroImagePosition }
                : undefined
            }
          />
        )}
        <span
          className="absolute top-3 right-3 w-[44px] h-[44px] rounded-[12px] bg-cream/95 border border-[#D8D4C5] grid place-items-center text-[20px] shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)]"
          style={{ color }}
          aria-hidden="true"
        >
          {motif}
        </span>
      </div>
      <div className={`flex flex-col ${variant === 'featured' ? '' : 'flex-1'} ${variant === 'wide' ? 'justify-center' : ''} ${bodyPadding}`}>
        <span
          className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: color }}
            aria-hidden="true"
          />
          {topic.label}
        </span>
        <span className="mt-1.5 inline-flex flex-wrap items-center gap-2 text-[12.5px] text-gray-500 font-medium tracking-wide">
          <span>Updated {formatUpdated(r)}</span>
        </span>
        <h3 className={`font-display ${titleSize} tracking-tight text-balance mt-3 text-ink`}>
          {r.title}
        </h3>
        <p
          className={`mt-2.5 font-display italic text-gray-600 leading-[1.5] ${
            variant === 'featured' ? 'text-[18px]' : 'text-[15.5px]'
          }`}
        >
          {r.hook}
        </p>
        <span className="mt-auto pt-5 border-t border-dashed border-[#C9C5B7] inline-flex items-center gap-2 text-[14.5px] font-semibold text-forest-dark">
          Read guide
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function ResourcesPage() {
  const resources = getAllResources();
  const bySlug = (slug: string) => resources.find((r) => r.slug === slug);

  // Two featured rows + wide card at the bottom:
  // Row 1: Life Skills (big) + AI Digital (stacked) + Creativity (stacked)
  // Row 2: Real-World Learning (big) + Nature (stacked) + Worldschooling (stacked)
  // Row 3: Homeschool Journey (wide)
  const featured1 = bySlug('life-skills-for-kids');
  const stack1Top = bySlug('ai-digital-literacy');
  const stack1Bottom = bySlug('creativity-maker-activities');
  const featured2 = bySlug('real-world-learning');
  const stack2Top = bySlug('nature-based-learning');
  const stack2Bottom = bySlug('worldschooling-guide');
  const wide = bySlug('homeschool-journey');
  const wide2 = bySlug('stem-for-kids');

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anywhere Learning Resource Guides',
    description:
      'In-depth guides on real-world learning, life skills, nature education, creativity, AI literacy, and worldschooling for families who learn through real life.',
    url: 'https://anywherelearning.co/guides',
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: resources.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://anywherelearning.co/guides/${r.slug}`,
        name: r.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <main>
        {/* ════════════════════════════════════════
            01 PAGE HEADER
        ════════════════════════════════════════ */}
        <header className="bg-cream pt-12 pb-10 md:pt-16 md:pb-12 text-center">
          <div className="mx-auto max-w-[940px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                Resource guides
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.04] tracking-tight mt-4 text-balance md:whitespace-nowrap">
                Everything you need to <span className="italic text-forest">know.</span>
              </h1>
              <p className="mt-4 text-[17px] md:text-[18px] leading-[1.55] text-gray-600 max-w-[620px] mx-auto">
                In-depth guides on the topics that matter most to families who learn through
                real life, at home, on the road, or after the school day ends. Written by{' '}
                <span className="font-display italic text-forest-dark">Amelie,</span> a teacher
                with 15 years in the classroom, now homeschooling her own.
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12.5px] text-gray-500 tracking-wide">
                <span>Updated regularly</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Free to read</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Built for sharing</span>
              </div>
            </ScrollReveal>
          </div>
        </header>
        <div className="mx-auto max-w-[1180px] border-b border-[#D8D4C5]" />

        {/* ════════════════════════════════════════
            02 GUIDES
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] pt-14 md:pt-20 pb-14 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            {/* Featured row 1: Life Skills + stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 mb-6 items-stretch">
              {featured1 && (
                <ScrollReveal className="h-full">
                  <GuideCard r={featured1} variant="featured" />
                </ScrollReveal>
              )}
              <div className="grid grid-rows-2 gap-6">
                {stack1Top && (
                  <ScrollReveal className="h-full" delay={80}>
                    <GuideCard r={stack1Top} variant="tall" />
                  </ScrollReveal>
                )}
                {stack1Bottom && (
                  <ScrollReveal className="h-full" delay={160}>
                    <GuideCard r={stack1Bottom} variant="tall" />
                  </ScrollReveal>
                )}
              </div>
            </div>

            {/* Featured row 2: Real-World Learning + stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-6 mb-6 items-stretch">
              <div className="grid grid-rows-2 gap-6 order-2 lg:order-1">
                {stack2Top && (
                  <ScrollReveal className="h-full" delay={80}>
                    <GuideCard r={stack2Top} variant="tall" />
                  </ScrollReveal>
                )}
                {stack2Bottom && (
                  <ScrollReveal className="h-full" delay={160}>
                    <GuideCard r={stack2Bottom} variant="tall" />
                  </ScrollReveal>
                )}
              </div>
              {featured2 && (
                <ScrollReveal className="h-full order-1 lg:order-2">
                  <GuideCard r={featured2} variant="featured" />
                </ScrollReveal>
              )}
            </div>

            {/* Row 3: Homeschool Journey + STEM side by side */}
            {(wide || wide2) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {wide && (
                  <ScrollReveal className="h-full">
                    <GuideCard r={wide} variant="featured" />
                  </ScrollReveal>
                )}
                {wide2 && (
                  <ScrollReveal className="h-full" delay={80}>
                    <GuideCard r={wide2} variant="featured" />
                  </ScrollReveal>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 EMAIL CAPTURE
        ════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-24">
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

        {/* ════════════════════════════════════════
            04 MEMBERSHIP POINTER
        ════════════════════════════════════════ */}
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
