import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getAllResources } from '@/lib/resources';
import ResourceCard from '@/components/resources/ResourceCard';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import ScrollReveal from '@/components/shared/ScrollReveal';

const BlogExitIntentPopup = dynamic(() => import('@/components/blog/BlogExitIntentPopup'));

export const metadata: Metadata = {
  title: 'Homeschool Guides: Deschooling, Worldschool, Nature Learning',
  description:
    'In-depth homeschool guides on deschooling, worldschooling, and nature-based learning — written by a former teacher for homeschool and worldschool families.',
  alternates: {
    canonical: 'https://anywherelearning.co/guides',
  },
  openGraph: {
    title: 'Homeschool Guides: Deschooling, Worldschool, Nature Learning | Anywhere Learning',
    description:
      'In-depth homeschool guides on deschooling, worldschooling, and nature-based learning — written by a former teacher for homeschool and worldschool families.',
    url: 'https://anywherelearning.co/guides',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning Homeschool Guides',
      },
    ],
  },
};

export default function ResourcesPage() {
  const resources = getAllResources();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anywhere Learning Resource Guides',
    description: 'In-depth guides on real-world learning, nature-based education, worldschooling, creativity, and digital literacy for homeschool families.',
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
                Resource Guides
              </p>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-forest leading-[0.95] mb-6 text-balance max-w-4xl">
              Everything You Need to Know
            </h1>
            <p className="text-lg md:text-xl text-[#8b7355] max-w-2xl leading-relaxed">
              In-depth guides on the topics that matter most to homeschool and
              worldschool families, backed by experience and research.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Resource cards grid */}
      <section className="bg-forest-light-gradient pb-16 md:pb-24 pt-10 md:pt-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, i) => (
              <ScrollReveal key={resource.slug} delay={i * 80}>
                <ResourceCard
                  slug={resource.slug}
                  title={resource.title}
                  hook={resource.hook}
                  topic={resource.topic}
                  heroImage={resource.heroImage}
                  heroImageAlt={resource.heroImageAlt}
                  heroImagePosition={resource.heroImagePosition}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <ScrollReveal>
            <BlogNewsletterCTA />
          </ScrollReveal>
        </div>
      </section>

      <BlogExitIntentPopup />
    </main>
  );
}
