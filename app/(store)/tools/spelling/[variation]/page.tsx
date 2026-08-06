import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SpellingTool from '@/components/tools/SpellingTool';
import ToolVariationLayout from '@/components/tools/ToolVariationLayout';
import { SPELLING } from '@/lib/tools/tool-seo';

/**
 * Long-tail variation pages for the spelling generator:
 * /tools/spelling/test (the blank numbered test format).
 */

export function generateStaticParams() {
  return SPELLING.variations.map((v) => ({ variation: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variation: string }>;
}): Promise<Metadata> {
  const { variation } = await params;
  const config = SPELLING.variations.find((v) => v.slug === variation);
  if (!config) return {};
  const url = `https://anywherelearning.co/tools/spelling/${config.slug}`;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: { title: config.title, description: config.description, url, type: 'website' },
  };
}

export default async function SpellingVariationPage({
  params,
}: {
  params: Promise<{ variation: string }>;
}) {
  const { variation } = await params;
  const config = SPELLING.variations.find((v) => v.slug === variation);
  if (!config) notFound();

  return (
    <ToolVariationLayout tool={SPELLING} variation={config}>
      <SpellingTool defaultOptions={config.defaultOptions} />
    </ToolVariationLayout>
  );
}
