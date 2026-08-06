import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SightWordsTool from '@/components/tools/SightWordsTool';
import ToolVariationLayout from '@/components/tools/ToolVariationLayout';
import { SIGHT_WORDS } from '@/lib/tools/tool-seo';

/**
 * Grade-level variation pages for the sight words generator:
 * /tools/sight-words/pre-k through /tools/sight-words/grade-3. Each preloads
 * the matching Dolch list.
 */

export function generateStaticParams() {
  return SIGHT_WORDS.variations.map((v) => ({ variation: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variation: string }>;
}): Promise<Metadata> {
  const { variation } = await params;
  const config = SIGHT_WORDS.variations.find((v) => v.slug === variation);
  if (!config) return {};
  const url = `https://anywherelearning.co/tools/sight-words/${config.slug}`;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: { title: config.title, description: config.description, url, type: 'website' },
  };
}

export default async function SightWordsVariationPage({
  params,
}: {
  params: Promise<{ variation: string }>;
}) {
  const { variation } = await params;
  const config = SIGHT_WORDS.variations.find((v) => v.slug === variation);
  if (!config) notFound();

  return (
    <ToolVariationLayout tool={SIGHT_WORDS} variation={config}>
      <SightWordsTool defaultOptions={config.defaultOptions} defaultListId={config.defaultListId} />
    </ToolVariationLayout>
  );
}
