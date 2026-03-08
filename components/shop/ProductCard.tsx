import Link from 'next/link';
import Image from 'next/image';
import { CategoryIcon } from './icons';

interface ProductCardProps {
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  category: string;
  isBundle: boolean;
  activityCount?: number | null;
  ageRange?: string | null;
}

const categoryLabels: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  creativity: 'Creativity',
  'life-skills': 'Life Skills',
  nature: 'Nature & Outdoor',
  'real-world': 'Real-World Skills',
  bundle: 'Bundle',
};

const categoryBgClasses: Record<string, string> = {
  'ai-literacy': 'card-bg-ai-literacy',
  creativity: 'card-bg-creativity',
  'life-skills': 'card-bg-life-skills',
  nature: 'card-bg-nature',
  'real-world': 'card-bg-real-world',
  bundle: 'card-bg-bundle',
};

const categoryAccentColors: Record<string, string> = {
  'ai-literacy': 'border-l-[#7b88a8]',
  creativity: 'border-l-[#c47a8f]',
  'life-skills': 'border-l-[#6b8e8b]',
  nature: 'border-l-[#588157]',
  'real-world': 'border-l-[#8b7355]',
  bundle: 'border-l-[#d4a373]',
};

export default function ProductCard({
  name,
  slug,
  shortDescription,
  priceCents,
  compareAtPriceCents,
  imageUrl,
  category,
  isBundle,
  activityCount,
  ageRange,
}: ProductCardProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <Link href={`/shop/${slug}`} className="group block h-full">
      <div className={`h-full flex flex-col bg-white rounded-2xl shadow-sm group-hover:shadow-xl group-hover:shadow-forest/[0.08] transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02] border border-gray-100/50 overflow-hidden border-l-[3px] ${categoryAccentColors[category] || 'border-l-[#588157]'}`}>
        {/* Product Image Area */}
        <div className={`relative aspect-[4/3] ${categoryBgClasses[category] || 'card-bg-nature'} flex items-center justify-center overflow-hidden ${imageUrl ? '' : 'p-6'}`}>
          {imageUrl ? (
            /* Real cover image */
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              {/* Category icon watermark */}
              <div className="absolute opacity-[0.07] select-none" aria-hidden="true">
                <CategoryIcon category={category} className="w-24 h-24" />
              </div>

              {/* Floating product mockup card */}
              <div className="relative w-3/4 aspect-[3/4] bg-white rounded-xl shadow-lg border border-gray-200/60 p-4 transform rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                <div className="w-6 h-6 rounded-full bg-forest/15 mx-auto mb-3" />
                <p className="text-center text-forest font-semibold text-xs leading-snug mb-2 line-clamp-2">
                  {name}
                </p>
                <div className="space-y-1.5 px-2">
                  <div className="h-1 bg-gray-200/80 rounded-full w-full" />
                  <div className="h-1 bg-gray-200/80 rounded-full w-4/5" />
                  <div className="h-1 bg-gray-200/80 rounded-full w-3/5" />
                </div>
              </div>
            </>
          )}

          {/* Bundle badge */}
          {isBundle && (
            <div className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse-glow z-10">
              BEST VALUE
            </div>
          )}

          {/* Savings badge */}
          {!isBundle && savings > 0 && (
            <div className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm shimmer-effect z-10">
              Save ${(savings / 100).toFixed(0)}
            </div>
          )}

          {/* Activity count badge */}
          {activityCount && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm z-10">
              {activityCount} activities
            </div>
          )}

          {/* Category pill */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
            <CategoryIcon category={category} className="w-3.5 h-3.5" />
            {categoryLabels[category] || category}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg mb-1.5 group-hover:text-forest transition-colors leading-snug">
            {name}
          </h3>

          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>

          {/* Meta info row */}
          {ageRange && (
            <p className="text-xs text-gray-400 mb-4">
              {ageRange} &middot; PDF download
            </p>
          )}

          {/* Price + CTA row */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-xl font-bold text-forest">
                ${(priceCents / 100).toFixed(2)}
              </span>
              {compareAtPriceCents && savings > 0 && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  ${(compareAtPriceCents / 100).toFixed(2)}
                </span>
              )}
            </div>
            <span className="bg-forest/5 text-forest font-medium text-sm px-4 py-2 rounded-full group-hover:bg-forest group-hover:text-cream transition-all duration-300">
              View pack &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
