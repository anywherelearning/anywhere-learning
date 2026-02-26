import Link from 'next/link';

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
  seasonal: 'Seasonal',
  creativity: 'Creativity',
  nature: 'Nature & Outdoor',
  'real-world': 'Real-World Skills',
  'life-skills': 'Life Skills',
  'ai-literacy': 'AI & Digital',
  bundle: 'Bundle',
};

export default function ProductCard({
  name,
  slug,
  shortDescription,
  priceCents,
  compareAtPriceCents,
  category,
  isBundle,
  activityCount,
  ageRange,
}: ProductCardProps) {
  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 border border-gray-100/50 overflow-hidden">
        {/* Product Image / Mockup Area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-cream to-gold-light/30 flex items-center justify-center p-6 overflow-hidden">
          {/* CSS Product Mockup — a "floating document" card */}
          <div className="w-3/4 aspect-[3/4] bg-white rounded-xl shadow-lg border border-forest/10 p-4 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
            {/* Small forest green circle at top (logo placeholder) */}
            <div className="w-6 h-6 rounded-full bg-forest/20 mx-auto mb-3" />
            {/* Product title on the mockup */}
            <p className="text-center text-forest font-semibold text-xs leading-snug mb-2">
              {name}
            </p>
            {/* Decorative lines representing content */}
            <div className="space-y-1.5 px-2">
              <div className="h-1 bg-gray-200 rounded-full w-full" />
              <div className="h-1 bg-gray-200 rounded-full w-4/5" />
              <div className="h-1 bg-gray-200 rounded-full w-3/5" />
            </div>
          </div>

          {/* Bundle badge (only on bundles) */}
          {isBundle && (
            <div className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              BEST VALUE
            </div>
          )}

          {/* Category pill */}
          <div className="absolute bottom-3 left-3 bg-forest/90 text-cream text-xs font-medium px-3 py-1 rounded-full">
            {categoryLabels[category] || category}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 md:p-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-1.5 group-hover:text-forest transition-colors leading-snug">
            {name}
          </h3>

          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>

          {/* Meta info row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            {activityCount && (
              <span>{activityCount} activities</span>
            )}
            {activityCount && ageRange && <span>&middot;</span>}
            {ageRange && <span>{ageRange}</span>}
            {(activityCount || ageRange) && <span>&middot;</span>}
            <span>PDF download</span>
          </div>

          {/* Price + CTA row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-forest">
                ${(priceCents / 100).toFixed(2)}
              </span>
              {compareAtPriceCents && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  ${(compareAtPriceCents / 100).toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-forest font-medium text-sm group-hover:translate-x-1 transition-transform">
              View pack &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
