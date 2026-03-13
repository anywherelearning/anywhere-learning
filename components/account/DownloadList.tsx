'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DownloadCard from './DownloadCard';

export interface Purchase {
  order: {
    id: string;
    purchasedAt: Date;
    amountCents: number;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    imageUrl: string | null;
    category: string;
    ageRange: string | null;
    activityCount: number | null;
    isBundle: boolean;
  };
}

interface DownloadListProps {
  purchases: Purchase[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  creativity: 'Creativity',
  'critical-thinking': 'Critical Thinking',
  'life-skills': 'Life Skills',
  literacy: 'Literacy',
  nature: 'Nature',
  'real-world-math': 'Math & Money',
  'self-management': 'Self-Management',
  bundle: 'Bundles',
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function DownloadList({ purchases }: DownloadListProps) {
  const [filter, setFilter] = useState('all');

  // Build category list from user's purchases
  const categories = useMemo(() => {
    const cats = new Set(purchases.map((p) => p.product.category));
    return ['all', ...Array.from(cats).sort()];
  }, [purchases]);

  const filtered = useMemo(() => {
    if (filter === 'all') return purchases;
    return purchases.filter((p) => p.product.category === filter);
  }, [purchases, filter]);

  const showFilters = purchases.length >= 8 && categories.length > 2;

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-forest/8 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-forest/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-forest mb-2">Your first adventure starts here</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Once you pick an activity pack, it will be waiting here — ready to open on any device, anytime.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-cream font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Browse Activity Packs
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Category filter pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
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
              {cat === 'all'
                ? `All (${purchases.length})`
                : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Download cards */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const daysSincePurchase = Date.now() - new Date(p.order.purchasedAt).getTime();
          return (
            <DownloadCard
              key={`${p.order.id}-${p.product.id}`}
              productId={p.product.id}
              productName={p.product.name}
              slug={p.product.slug}
              shortDescription={p.product.shortDescription}
              imageUrl={p.product.imageUrl}
              purchasedAt={p.order.purchasedAt}
              productCategory={p.product.category}
              ageRange={p.product.ageRange}
              activityCount={p.product.activityCount}
              isBundle={p.product.isBundle}
              showReviewPrompt={daysSincePurchase > SEVEN_DAYS_MS}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No packs in this category.</p>
        </div>
      )}
    </div>
  );
}
