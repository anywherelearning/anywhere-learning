import Link from 'next/link';
import Image from 'next/image';
import { getFallbackProductBySlug } from '@/lib/fallback-products';

interface BlogBundleCalloutProps {
  slug: string;
  context?: string;
}

export default function BlogBundleCallout({ slug, context }: BlogBundleCalloutProps) {
  const bundle = getFallbackProductBySlug(slug);
  if (!bundle) return null;

  const price = (bundle.priceCents / 100).toFixed(2);
  const savings =
    bundle.compareAtPriceCents && bundle.compareAtPriceCents > bundle.priceCents
      ? Math.round(((bundle.compareAtPriceCents - bundle.priceCents) / bundle.compareAtPriceCents) * 100)
      : 0;

  return (
    <div className="my-12 md:my-16 rounded-2xl border border-gold/20 bg-gradient-to-br from-[#fefbf6] via-[#fdf6ec] to-[#faf9f6] shadow-[0_2px_24px_-4px_rgba(212,163,115,0.12)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Bundle image */}
        <div className="relative sm:w-40 md:w-48 shrink-0 aspect-[4/3] sm:aspect-auto bg-[#fdf6ec]">
          {bundle.imageUrl ? (
            <Image
              src={bundle.imageUrl}
              alt={bundle.name}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-300 text-sm">{bundle.name}</span>
            </div>
          )}
          {/* Savings badge */}
          {savings > 0 && (
            <div className="absolute top-3 left-3 bg-gold text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Save {savings}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
              Bundle &amp; Save
            </p>
          </div>
          <h4 className="font-semibold text-gray-900 text-lg leading-snug mb-1.5">
            {bundle.name}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {context || bundle.shortDescription}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/shop/${bundle.slug}`}
              className="inline-flex items-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#c4956a] hover:shadow-md hover:-translate-y-0.5"
            >
              Get the Bundle
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">${price}</span>
              {bundle.compareAtPriceCents && (
                <span className="text-xs text-gray-400 line-through">
                  ${(bundle.compareAtPriceCents / 100).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
