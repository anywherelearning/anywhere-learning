import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HandwritingTool from '@/components/tools/HandwritingTool';
import ToolVariationLayout from '@/components/tools/ToolVariationLayout';
import { HANDWRITING } from '@/lib/tools/tool-seo';

/**
 * Long-tail variation pages for the handwriting generator:
 * /tools/handwriting/cursive, /tools/handwriting/copywork.
 */

export function generateStaticParams() {
  return HANDWRITING.variations.map((v) => ({ variation: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variation: string }>;
}): Promise<Metadata> {
  const { variation } = await params;
  const config = HANDWRITING.variations.find((v) => v.slug === variation);
  if (!config) return {};
  const url = `https://anywherelearning.co/tools/handwriting/${config.slug}`;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: { title: config.title, description: config.description, url, type: 'website' },
  };
}

export default async function HandwritingVariationPage({
  params,
}: {
  params: Promise<{ variation: string }>;
}) {
  const { variation } = await params;
  const config = HANDWRITING.variations.find((v) => v.slug === variation);
  if (!config) notFound();

  return (
    <ToolVariationLayout tool={HANDWRITING} variation={config}>
      <HandwritingTool defaultOptions={config.defaultOptions} defaultText={config.defaultText} />
    </ToolVariationLayout>
  );
}
