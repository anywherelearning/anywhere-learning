import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';

interface ProductCardProps {
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  category: string;
  isBundle: boolean;
}

const categoryLabels: Record<string, string> = {
  seasonal: 'Seasonal',
  creativity: 'Creativity',
  nature: 'Nature',
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
  imageUrl,
  category,
  isBundle,
}: ProductCardProps) {
  return (
    <Link
      href={`/shop/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-forest/10 to-gold-light/30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl text-forest/30">
              {name}
            </span>
          </div>
        )}
        {isBundle && (
          <span className="absolute top-3 right-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gray-900">
            Best Value
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category pill */}
        <span className="mb-2 inline-block w-fit rounded-full bg-forest px-2.5 py-0.5 text-xs font-medium text-cream">
          {categoryLabels[category] || category}
        </span>

        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-forest">
          {name}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {shortDescription}
        </p>

        <div className="mt-auto pt-4">
          <PriceDisplay
            priceCents={priceCents}
            compareAtPriceCents={compareAtPriceCents}
          />

          <span className="mt-3 block w-full rounded-lg bg-forest py-2.5 text-center text-sm font-semibold text-cream transition-colors group-hover:bg-forest-dark">
            Get This Pack &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
