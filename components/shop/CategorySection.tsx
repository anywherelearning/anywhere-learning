import Link from 'next/link';
import ProductCard from './ProductCard';
import { CategoryIcon } from './icons';

interface Product {
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stripePriceId?: string;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  activityCount?: number | null;
  ageRange?: string | null;
}

const categoryAccentColors: Record<string, string> = {
  'ai-literacy': 'text-[#7b88a8]',
  'creativity-anywhere': 'text-[#c47a8f]',
  'communication-writing': 'text-[#5b8fa8]',
  'outdoor-learning': 'text-[#588157]',
  'real-world-math': 'text-[#8b7355]',
  'entrepreneurship': 'text-[#c4836a]',
  'planning-problem-solving': 'text-[#7a6da8]',
  'start-here': 'text-[#d4a373]',
};

interface CategorySectionProps {
  category: string;
  label: string;
  description: string;
  products: Product[];
  totalCount: number;
}

export default function CategorySection({
  category,
  label,
  description,
  products,
  totalCount,
}: CategorySectionProps) {
  const shown = products.slice(0, 3);
  const hasMore = totalCount > 3;

  return (
    <section>
      {/* Section heading */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <CategoryIcon
              category={category}
              className={`w-5 h-5 ${categoryAccentColors[category] || 'text-forest'}`}
            />
            <h3 className="font-semibold text-gray-900 text-xl">{label}</h3>
            <span className="text-sm text-gray-400">({totalCount})</span>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {hasMore && (
          <Link
            href={`/shop?category=${category}`}
            className="hidden sm:inline-flex shrink-0 items-center gap-1 text-sm font-medium text-forest hover:text-forest-dark transition-colors"
          >
            See all {totalCount} packs
            <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>

      {/* Product grid — 3 cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((product) => (
          <div key={product.slug} className="h-full">
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Mobile "see all" link */}
      {hasMore && (
        <div className="mt-4 sm:hidden text-center">
          <Link
            href={`/shop?category=${category}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:text-forest-dark transition-colors"
          >
            See all {totalCount} packs &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
