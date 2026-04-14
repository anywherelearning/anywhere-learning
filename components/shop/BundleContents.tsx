import Link from 'next/link';
import Image from 'next/image';
import { BUNDLE_CONTENTS } from '@/lib/cart';
import { getFallbackProductBySlug, type FallbackProduct } from '@/lib/fallback-products';
import { CategoryIcon } from './icons';

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

/**
 * TpT-style compact list of products inside a bundle.
 * Each row: thumbnail (left) + title/short description/category (middle) + PDF badge (right).
 */
export default function BundleContents({ bundleSlug, bundlePriceCents }: BundleContentsProps) {
  const slugs = BUNDLE_CONTENTS[bundleSlug];
  if (!slugs || slugs.length === 0) return null;

  const products = slugs
    .map((slug) => getFallbackProductBySlug(slug))
    .filter((p): p is FallbackProduct => p !== null);

  if (products.length === 0) return null;

  const individualTotal = products.reduce((sum, p) => sum + p.priceCents, 0);
  const savings = individualTotal - bundlePriceCents;

  return (
    <section aria-labelledby="bundle-contents-heading">
      <div className="flex items-baseline justify-between mb-3">
        <h2
          id="bundle-contents-heading"
          className="text-base font-semibold text-gray-900"
        >
          Products in this Bundle
        </h2>
        <span className="text-xs text-gray-400">
          {products.length} {products.length === 1 ? 'guide' : 'guides'}
        </span>
      </div>

      {/* Savings callout */}
      {savings > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-forest/5 rounded-lg px-3 py-2 border border-forest/10">
          <svg
            className="w-4 h-4 text-forest flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs sm:text-sm text-forest font-medium">
            Save ${(savings / 100).toFixed(2)} vs buying individually
            <span className="text-forest/60 font-normal ml-1">
              (${(individualTotal / 100).toFixed(2)} value)
            </span>
          </p>
        </div>
      )}

      {/* Product list */}
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={`/shop/${product.slug}`}
              className="flex items-start gap-3 p-3 hover:bg-gray-50/70 transition-colors group"
            >
              {/* Thumbnail */}
              <div
                className={`relative w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 ${
                  product.imageUrl
                    ? ''
                    : `${categoryBgClasses[product.category] || 'card-bg-nature'} flex items-center justify-center`
                }`}
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <CategoryIcon
                    category={product.category}
                    className="w-6 h-6 opacity-30"
                  />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-sm font-semibold text-forest group-hover:text-forest-dark transition-colors leading-snug line-clamp-2">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {product.shortDescription}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <CategoryIcon
                      category={product.category}
                      className="w-3 h-3"
                    />
                    {categoryLabels[product.category] || product.category}
                  </span>
                </div>
              </div>

              {/* PDF badge */}
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 mt-1">
                PDF
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
