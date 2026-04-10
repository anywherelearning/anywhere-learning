import Link from 'next/link';
import Image from 'next/image';
import { getFallbackProductBySlug } from '@/lib/fallback-products';

interface BlogProductCalloutProps {
  slug: string;
  context?: string;
}

export default function BlogProductCallout({ slug, context }: BlogProductCalloutProps) {
  const product = getFallbackProductBySlug(slug);
  if (!product) return null;

  const price = (product.priceCents / 100).toFixed(2);
  // Short CTA label - split on punctuation, then truncate to keep button compact
  const parts = product.name.split(/[:\u2014\u2013\u2013\u2014–&]/);
  const shortName = parts[0].trim().length <= 25 ? parts[0].trim() : 'This Guide';

  return (
    <div className="my-12 md:my-16 rounded-2xl bg-white border border-gray-100/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Product image */}
        <div className="relative sm:w-40 md:w-48 shrink-0 aspect-[4/3] sm:aspect-auto bg-[#f7f5f0]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-300 text-sm">{product.name}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-forest/50 mb-2">
            Recommended for you
          </p>
          <h4 className="font-semibold text-gray-900 text-lg leading-snug mb-1.5">
            {product.name}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {context || product.shortDescription}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex items-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md hover:-translate-y-0.5"
            >
              Get {shortName}
            </Link>
            <span className="text-sm font-medium text-gray-400">
              ${price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
