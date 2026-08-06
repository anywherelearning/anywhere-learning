import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NameTracingTool from '@/components/tools/NameTracingTool';
import { NAME_TRACING, faqPageLd, softwareApplicationLd } from '@/lib/tools/tool-seo';

/**
 * Long-tail variation pages for the name tracing generator:
 * /tools/name-tracing/preschool, /tools/name-tracing/kindergarten.
 * Each pre-loads age-appropriate settings and carries its own unique
 * title, description, h1, and intro copy.
 */

export function generateStaticParams() {
  return NAME_TRACING.variations.map((v) => ({ variation: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variation: string }>;
}): Promise<Metadata> {
  const { variation } = await params;
  const config = NAME_TRACING.variations.find((v) => v.slug === variation);
  if (!config) return {};
  const url = `https://anywherelearning.co/tools/name-tracing/${config.slug}`;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: { title: config.title, description: config.description, url, type: 'website' },
  };
}

export default async function NameTracingVariationPage({
  params,
}: {
  params: Promise<{ variation: string }>;
}) {
  const { variation } = await params;
  const config = NAME_TRACING.variations.find((v) => v.slug === variation);
  if (!config) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(NAME_TRACING)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(NAME_TRACING.faqs)) }}
      />

      <main className="bg-cream">
        <section className="pb-14 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Free tool
            </p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {config.h1}
            </h1>
            <div className="mt-4 max-w-2xl space-y-4">
              {config.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <NameTracingTool defaultOptions={config.defaultOptions} />
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Want different settings or the full teaching notes?{' '}
              <Link
                href="/tools/name-tracing"
                className="font-semibold text-forest underline-offset-2 hover:underline"
              >
                Open the full name tracing generator
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
