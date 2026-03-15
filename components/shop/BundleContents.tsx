import Link from 'next/link';
import Image from 'next/image';
import { BUNDLE_CONTENTS } from '@/lib/cart';
import { getFallbackProductBySlug, type FallbackProduct } from '@/lib/fallback-products';
import { hasPreview } from '@/lib/preview-map';
import { CategoryIcon } from './icons';
import PreviewButton from './PreviewButton';

const categoryLabels: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  'creativity-anywhere': 'Creativity Anywhere',
  'communication-writing': 'Communication & Writing',
  'outdoor-learning': 'Outdoor Learning',
  'real-world-math': 'Real-World Math',
  'entrepreneurship': 'Entrepreneurship',
  'planning-problem-solving': 'Planning & Problem-Solving',
  'start-here': 'Start Here',
};

const categoryAccentColors: Record<string, string> = {
  'ai-literacy': 'border-t-[#7b88a8]',
  'creativity-anywhere': 'border-t-[#c47a8f]',
  'communication-writing': 'border-t-[#5b8fa8]',
  'outdoor-learning': 'border-t-[#588157]',
  'real-world-math': 'border-t-[#8b7355]',
  'entrepreneurship': 'border-t-[#c4836a]',
  'planning-problem-solving': 'border-t-[#7a6da8]',
  'start-here': 'border-t-[#d4a373]',
};

const categoryBgClasses: Record<string, string> = {
  'ai-literacy': 'card-bg-ai-literacy',
  'creativity-anywhere': 'card-bg-creativity-anywhere',
  'communication-writing': 'card-bg-communication-writing',
  'outdoor-learning': 'card-bg-outdoor-learning',
  'real-world-math': 'card-bg-real-world-math',
  'entrepreneurship': 'card-bg-entrepreneurship',
  'planning-problem-solving': 'card-bg-planning-problem-solving',
  'start-here': 'card-bg-start-here',
};

interface BundleContentsProps {
  bundleSlug: string;
  bundlePriceCents: number;
}

export default function BundleContents({ bundleSlug, bundlePriceCents }: BundleContentsProps) {
  const slugs = BUNDLE_CONTENTS[bundleSlug];
  if (!slugs || slugs.length === 0) return null;

  // Resolve each slug to its product data
  const products = slugs
    .map((slug) => getFallbackProductBySlug(slug))
    .filter((p): p is FallbackProduct => p !== null);

  if (products.length === 0) return null;

  // Calculate savings
  const individualTotal = products.reduce((sum, p) => sum + p.priceCents, 0);
  const savings = individualTotal - bundlePriceCents;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          What&apos;s Included
        </h2>
        <span className="text-sm text-gray-400">
          {products.length} activity {products.length === 1 ? 'pack' : 'packs'}
        </span>
      </div>

      {/* Savings callout */}
      {savings > 0 && (
        <div className="flex items-center gap-2 mb-5 bg-forest/5 rounded-xl px-4 py-3 border border-forest/10">
          <svg className="w-5 h-5 text-forest flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-forest font-medium">
            Save ${(savings / 100).toFixed(2)} vs buying individually
            <span className="text-forest/60 font-normal ml-1">
              (${(individualTotal / 100).toFixed(2)} value)
            </span>
          </p>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="group block"
          >
            <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden border-t-[3px] ${categoryAccentColors[product.category] || 'border-t-[#588157]'} hover:shadow-md transition-shadow`}>
              {/* Thumbnail */}
              <div className={`relative aspect-[4/3] ${product.imageUrl ? '' : `${categoryBgClasses[product.category] || 'card-bg-nature'} flex items-center justify-center p-3`}`}>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <CategoryIcon category={product.category} className="w-10 h-10 opacity-20" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-forest transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <CategoryIcon category={product.category} className="w-3 h-3" />
                    {categoryLabels[product.category] || product.category}
                  </span>
                </div>

                {/* Preview link */}
                {hasPreview(product.slug) && (
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <PreviewButton
                      slug={product.slug}
                      productName={product.name}
                      compact
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
