'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import DownloadCard from './DownloadCard';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ACTIVE_COLORS } from '@/lib/categories';
import { BUNDLE_CONTENTS } from '@/lib/bundles';
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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
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

const PER_PAGE = 10;

export default function DownloadList({ purchases }: DownloadListProps) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Focus management for the mobile filter disclosure.
  // On open: move focus into the panel so screen reader users land on the
  // pills. On close: return focus to the trigger so keyboard users don't
  // lose their place.
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const wasMobileOpen = useRef(false);
  useEffect(() => {
    if (mobileOpen && !wasMobileOpen.current) {
      const firstPill = mobilePanelRef.current?.querySelector<HTMLButtonElement>('button');
      firstPill?.focus();
    } else if (!mobileOpen && wasMobileOpen.current) {
      mobileTriggerRef.current?.focus();
    }
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

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
    if (filter === 'all') return purchases.filter((p) => !p.product.isBundle);
    return purchases.filter((p) => p.product.category === filter);
  }, [purchases, filter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Build slug → purchase lookup for bundle children
  const purchaseBySlug = useMemo(() => {
    const map: Record<string, Purchase> = {};
    for (const p of purchases) {
      map[p.product.slug] = p;
    }
    return map;
  }, [purchases]);

  // Only show category filters when there's enough to filter: at least 3
  // purchases AND more than one category to choose from (the `all` tab plus
  // at least two real categories). Below that, pills just add noise.
  const showFilters = purchases.length >= 3 && categories.length > 2;

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-forest/8 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-forest/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-forest mb-2">Your first adventure starts here</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Once you pick an activity guide, it will be waiting here, ready to open on any device, anytime.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-cream font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Browse Activity Guides
          <ArrowRightIcon />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Category filter pills */}
      {showFilters && (() => {
        const ActiveIcon = CATEGORY_ICONS[filter] || SparklesIcon;
        const activeLabel = filter === 'all' ? 'All Guides' : (CATEGORY_LABELS[filter] || filter);

        const pillClasses = (isActive: boolean, cat: string) =>
          `whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            isActive
              ? (CATEGORY_ACTIVE_COLORS[cat] || CATEGORY_ACTIVE_COLORS['all'])
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
          }`;

        return (
          <>
            {/* Desktop - plain filter buttons, not a tablist. aria-pressed
                signals the active filter to screen readers without the
                full ARIA tablist contract (which would also require
                tabpanel/aria-controls + arrow-key navigation). */}
            <div
              className="hidden sm:flex flex-wrap gap-2 mb-6"
              role="group"
              aria-label="Filter guides by category"
            >
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || SparklesIcon;
                const count = cat === 'all' ? purchases.filter((p) => !p.product.isBundle).length : (counts[cat] || 0);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={filter === cat}
                    onClick={() => { setFilter(cat); setPage(1); }}
                    className={pillClasses(filter === cat, cat)}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {cat === 'all' ? 'All Guides' : (CATEGORY_LABELS[cat] || cat)}
                    <span className={`text-xs ${filter === cat ? 'opacity-90' : 'text-gray-600'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile: collapsible disclosure */}
            <div className="sm:hidden mb-6">
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-category-filter-panel"
                className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-medium bg-white border border-gray-200 text-gray-700"
              >
                <span className="flex items-center gap-2">
                  <ActiveIcon className="w-4 h-4" aria-hidden="true" />
                  {activeLabel}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileOpen && (
                <div
                  id="mobile-category-filter-panel"
                  ref={mobilePanelRef}
                  className="mt-2 grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Filter guides by category"
                >
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat] || SparklesIcon;
                    const count = cat === 'all' ? purchases.filter((p) => !p.product.isBundle).length : (counts[cat] || 0);
                    return (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={filter === cat}
                        onClick={() => { setFilter(cat); setPage(1); setMobileOpen(false); }}
                        className={`${pillClasses(filter === cat, cat)} justify-center text-center text-xs px-3 py-2`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {cat === 'all' ? 'All Guides' : (CATEGORY_LABELS[cat] || cat)}
                        <span className={`text-[10px] ${filter === cat ? 'opacity-90' : 'text-gray-600'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* Download cards */}
      <div className="space-y-3">
        {paginated.map((p) => {
          const daysSincePurchase = Date.now() - new Date(p.order.purchasedAt).getTime();
          // For bundles, resolve child products from purchases
          const bundleChildren = p.product.isBundle
            ? (BUNDLE_CONTENTS[p.product.slug] || [])
                .map((slug) => purchaseBySlug[slug])
                .filter(Boolean)
                .map((child) => ({
                  productId: child.product.id,
                  name: child.product.name,
                  slug: child.product.slug,
                  imageUrl: child.product.imageUrl,
                  category: child.product.category,
                }))
            : undefined;
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
              bundleChildren={bundleChildren}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          >
            <ChevronLeftIcon />
            Previous
          </button>
          <span className="text-sm text-gray-600" aria-live="polite">
            {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          >
            Next
            <ChevronRightIcon />
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No guides in this category.</p>
        </div>
      )}
    </div>
  );
}
