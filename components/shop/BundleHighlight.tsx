import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface BundleHighlightProps {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  activityCount: number | null;
  imageUrl?: string | null;
  shortDescription?: string | null;
}

export default function BundleHighlight({
  name,
  slug,
  priceCents,
  compareAtPriceCents,
  activityCount,
  imageUrl,
  shortDescription,
}: BundleHighlightProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gold/15">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-light/[0.08] via-transparent to-forest/[0.03] pointer-events-none" />

      <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        {/* Left: Bundle image or fallback mockup */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
          {imageUrl ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 256px"
              />
              {/* Best Value floating badge */}
              <div className="absolute -top-0 -right-0 bg-gold text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl shadow-lg z-10">
                BUNDLE
              </div>
            </div>
          ) : (
            <>
              {/* Fallback: stacked card mockup for Master Bundle */}
              <div className="absolute inset-5 bg-[#fce8ed] rounded-xl shadow-sm border border-[#c47a8f]/15 transform -rotate-[6deg]" />
              <div className="absolute inset-4 bg-[#eef5ee] rounded-xl shadow-sm border border-forest/10 transform -rotate-[3deg]" />
              <div className="absolute inset-3 bg-[#fdf4ec] rounded-xl shadow border border-gold/15 transform rotate-[1deg]" />
              <div className="absolute inset-1 bg-white rounded-xl shadow-lg border border-forest/10 p-4 transform rotate-[3deg] flex flex-col items-center justify-center">
                <p className="text-forest font-semibold text-xs text-center leading-snug mb-2">
                  {name}
                </p>
                <div className="space-y-1.5 w-full px-3">
                  <div className="h-1 bg-gray-200/80 rounded-full w-full" />
                  <div className="h-1 bg-gray-200/80 rounded-full w-4/5" />
                  <div className="h-1 bg-gray-200/80 rounded-full w-3/5" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse-glow z-10">
                BEST VALUE
              </div>
            </>
          )}
        </div>

        {/* Right: Copy + CTA */}
        <div className="relative text-center md:text-left flex-1">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-2">
            Save {savings > 0 ? Math.round((savings / (compareAtPriceCents || 1)) * 100) : 50}%
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-3">
            {name}
          </h2>
          <p className="text-gray-500 mb-6 text-lg leading-relaxed">
            {shortDescription ||
              `Every single activity guide we make. ${activityCount ? `${activityCount}+` : '220+'} activities across all categories.`}
          </p>

          {/* Price block */}
          <div className="flex items-baseline gap-3 justify-center md:justify-start mb-6">
            <span className="text-4xl font-bold text-forest">
              {formatPrice(priceCents)}
            </span>
            {compareAtPriceCents && savings > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(compareAtPriceCents)}
                </span>
                <span className="bg-gold/15 text-gold text-sm font-bold px-4 py-1.5 rounded-full">
                  Save {formatPrice(savings)}
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gold font-medium mb-4 flex items-center gap-1.5 justify-center md:justify-start">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5a3 3 0 015-3 3 3 0 015 3 3 3 0 01-2.83 3H13a1 1 0 011 1v1a1 1 0 01-1 1h-1v7a1 1 0 01-1 1H9a1 1 0 01-1-1v-7H7a1 1 0 01-1-1V9a1 1 0 011-1h.83A3 3 0 015 5zm4-1a1 1 0 10-2 0 1 1 0 002 0zm4 0a1 1 0 10-2 0 1 1 0 002 0z"/></svg>
            Includes the Future-Ready Skills Map free
          </p>

          <Link
            href={`/shop/${slug}`}
            className="inline-block bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-xl text-lg"
          >
            Get the {name} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
