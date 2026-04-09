'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DownloadCard from './DownloadCard';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ACTIVE_COLORS } from '@/lib/categories';
import {
  SparklesIcon,
  LeafIcon,
  PaletteIcon,
  CpuIcon,
  LayersIcon,
  CalculatorIcon,
  BookOpenIcon,
  RocketIcon,
  PuzzleIcon,
  StarIcon,
} from '@/components/shop/icons';
import type { ComponentType, SVGProps } from 'react';

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
    blobUrl: string;
  };
}

interface DownloadListProps {
  purchases: Purchase[];
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Icon per category — matches the shop page. */
const CATEGORY_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'all': SparklesIcon,
  'start-here': StarIcon,
  'ai-literacy': CpuIcon,
  'communication-writing': BookOpenIcon,
  'creativity-anywhere': PaletteIcon,
  'entrepreneurship': RocketIcon,
  'outdoor-learning': LeafIcon,
  'planning-problem-solving': PuzzleIcon,
  'real-world-math': CalculatorIcon,
  'bundle': LayersIcon,
};

export default function DownloadList({ purchases }: DownloadListProps) {
  const [filter, setFilter] = useState('all');

  // Build category list: All → Start Here → Bundles → rest alphabetical by label
  const categories = useMemo(() => {
    const ownedCats = new Set(purchases.map((p) => p.product.category));
    const rest = CATEGORIES
      .filter((c) => ownedCats.has(c.value) && c.value !== 'start-here')
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((c) => c.value);
    const result: string[] = ['all'];
    if (ownedCats.has('start-here')) result.push('start-here');
    if (ownedCats.has('bundle')) result.push('bundle');
    result.push(...rest);
    return result;
  }, [purchases]);

  // Count per category
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of purchases) {
      const cat = p.product.category;
      map[cat] = (map[cat] || 0) + 1;
    }
    return map;
  }, [purchases]);

  const filtered = useMemo(() => {
    if (filter === 'all') return purchases;
    return purchases.filter((p) => p.product.category === filter);
  }, [purchases, filter]);

  const showFilters = purchases.length >= 3 && categories.length > 2;

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
          Once you pick an activity guide, it will be waiting here, ready to open on any device, anytime.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-cream font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Browse Activity Guides
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Category filter pills — matches shop page style */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6" role="tablist">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || SparklesIcon;
            const count = cat === 'all' ? purchases.length : (counts[cat] || 0);
            const isActive = filter === cat;
            const activeColor = CATEGORY_ACTIVE_COLORS[cat] || CATEGORY_ACTIVE_COLORS['all'];

            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? activeColor
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat === 'all' ? 'All Packs' : (CATEGORY_LABELS[cat] || cat)}
                <span className={`text-xs ${isActive ? 'opacity-75' : 'text-gray-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
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
              blobUrl={p.product.blobUrl}
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
