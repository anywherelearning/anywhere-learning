import type { Metadata } from 'next';
import { getAllResources } from '@/lib/resources';
import ResourceCard from '@/components/resources/ResourceCard';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'Homeschool Resource Guides',
  description:
    'In-depth guides on real-world learning, nature-based education, worldschooling, creativity, and digital literacy for homeschool families.',
  alternates: {
    canonical: 'https://anywherelearning.co/guides',
  },
  openGraph: {
    title: 'Resource Guides — Anywhere Learning',
    description:
      'In-depth guides on real-world learning, nature-based education, worldschooling, creativity, and digital literacy for homeschool families.',
    url: 'https://anywherelearning.co/guides',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Anywhere Learning Resource Guides',
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

      {/* Hero intro */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold mb-3">
              Resource Guides
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mb-4">
              Everything You Need to Know
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              In-depth guides on the topics that matter most to homeschool and
              worldschool families — backed by experience and research.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Resource cards grid */}
      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, i) => (
              <ScrollReveal key={resource.slug} delay={i * 80}>
                <ResourceCard
                  slug={resource.slug}
                  title={resource.title}
                  excerpt={resource.excerpt}
                  topic={resource.topic}
                  readTimeMinutes={resource.readTimeMinutes}
                  relatedCount={resource.relatedBlogSlugs.length}
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
