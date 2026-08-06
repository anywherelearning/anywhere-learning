import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  faqPageLd,
  softwareApplicationLd,
  type ToolSeoConfig,
  type ToolVariation,
} from '@/lib/tools/tool-seo';

/**
 * Shared shell for every tool's long-tail variation pages. The route file
 * resolves the variation and renders the right tool; this handles the
 * structured data, heading, intro copy, and the link back to the full tool.
 */
export default function ToolVariationLayout({
  tool,
  variation,
  children,
}: {
  tool: ToolSeoConfig;
  variation: ToolVariation;
  /** The tool component, preloaded with the variation's defaults. */
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(tool)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(tool.faqs)) }}
      />

      <main className="bg-cream">
        <section className="pb-14 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Free tool</p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {variation.h1}
            </h1>
            <div className="mt-4 max-w-2xl space-y-4">
              {variation.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">{children}</div>
            <p className="mt-6 text-sm text-gray-500">
              Want different settings or the full teaching notes?{' '}
              <Link
                href={`/tools/${tool.slug}`}
                className="font-semibold text-forest underline-offset-2 hover:underline"
              >
                Open the full {tool.name.toLowerCase()}
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
