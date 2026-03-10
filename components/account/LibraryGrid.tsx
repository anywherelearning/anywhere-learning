'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LibraryProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  ageRange: string | null;
  activityCount: number | null;
}

interface LibraryGridProps {
  products: LibraryProduct[];
  /** Product IDs the user has also purchased (shows download badge) */
  purchasedIds: Set<string>;
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-literacy': 'AI Literacy',
  creativity: 'Creativity',
  'critical-thinking': 'Critical Thinking',
  'life-skills': 'Life Skills',
  literacy: 'Literacy',
  nature: 'Nature',
  'real-world-math': 'Math & Money',
  'self-management': 'Self-Management',
  bundle: 'Bundles',
};

export default function LibraryGrid({ products, purchasedIds }: LibraryGridProps) {
  const [filter, setFilter] = useState('all');

  // Build category list from available products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              filter === cat
                ? 'bg-forest text-cream'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-forest/30 hover:text-forest'
            }`}
          >
            {cat === 'all' ? 'All Packs' : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/account/library/${product.id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-forest/20 transition-all"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl">
                  {product.isBundle ? '\uD83D\uDCE6' : '\uD83C\uDF3F'}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {purchasedIds.has(product.id) && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-forest text-cream px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Downloadable
                  </span>
                )}
                {product.isBundle && (
                  <span className="text-xs font-medium bg-gold text-white px-2.5 py-1 rounded-full">
                    Bundle
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 group-hover:text-forest transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {product.shortDescription}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                {product.ageRange && (
                  <span>Ages {product.ageRange}</span>
                )}
                {product.activityCount && (
                  <span>{product.activityCount} activities</span>
                )}
                <span className="ml-auto text-forest font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                  Open &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No packs in this category.</p>
        </div>
      )}
    </div>
  );
}
