import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface BundleHighlightProps {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  activityCount: number | null;
}

export default function BundleHighlight({
  name,
  slug,
  priceCents,
  compareAtPriceCents,
  activityCount,
}: BundleHighlightProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
      {/* Left: Stack of 4 product mockups, slightly overlapping and rotated */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
        {/* Back cards peeking out */}
        <div className="absolute inset-4 bg-cream rounded-xl shadow-sm border border-forest/10 transform -rotate-[4deg]" />
        <div className="absolute inset-3 bg-cream rounded-xl shadow-sm border border-forest/10 transform -rotate-[2deg]" />
        <div className="absolute inset-2 bg-cream rounded-xl shadow border border-forest/10 transform rotate-[1deg]" />
        {/* Front card */}
        <div className="absolute inset-1 bg-white rounded-xl shadow-lg border border-forest/10 p-4 transform rotate-[3deg] flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-forest/20 mb-3" />
          <p className="text-forest font-semibold text-xs text-center leading-snug mb-2">
            {name}
          </p>
          <div className="space-y-1.5 w-full px-3">
            <div className="h-1 bg-gray-200 rounded-full w-full" />
            <div className="h-1 bg-gray-200 rounded-full w-4/5" />
            <div className="h-1 bg-gray-200 rounded-full w-3/5" />
          </div>
        </div>
      </div>

      {/* Right: Copy + CTA */}
      <div className="text-center md:text-left">
        <p className="text-sm font-medium text-gold uppercase tracking-widest mb-2">
          Best Value
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-forest mb-3">
          The Master Bundle
        </h2>
        <p className="text-gray-600 mb-2 text-lg">
          Every single activity pack we make.{' '}
          {activityCount ? `${activityCount}+` : '220+'} activities across all categories.
        </p>
        <p className="text-gray-500 mb-6">
          Seasonal &middot; Nature &middot; Creativity &middot; Real-World Skills &middot; Life Skills &middot; AI Literacy
        </p>

        {/* Price block */}
        <div className="flex items-baseline gap-3 justify-center md:justify-start mb-6">
          <span className="text-3xl font-bold text-forest">
            {formatPrice(priceCents)}
          </span>
          {compareAtPriceCents && savings > 0 && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(compareAtPriceCents)}
              </span>
              <span className="bg-gold/20 text-gold text-sm font-semibold px-3 py-1 rounded-full">
                Save {formatPrice(savings)}
              </span>
            </>
          )}
        </div>

        <Link
          href={`/shop/${slug}`}
          className="inline-block bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md text-lg"
        >
          Get the Master Bundle &rarr;
        </Link>
      </div>
    </div>
  );
}
