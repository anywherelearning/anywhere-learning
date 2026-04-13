'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePurchased } from './PurchasedContext';
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
} from './icons';
import { CATEGORY_ACTIVE_COLORS as categoryActiveColors } from '@/lib/categories';

const categories = [
  { value: '', label: 'All Guides', Icon: SparklesIcon },
  { value: 'start-here', label: 'Start Here', Icon: StarIcon },
  { value: 'bundle', label: 'Bundles', Icon: LayersIcon },
  { value: 'ai-literacy', label: 'AI & Digital', Icon: CpuIcon },
  { value: 'communication-writing', label: 'Communication & Writing', Icon: BookOpenIcon },
  { value: 'creativity-anywhere', label: 'Creativity Anywhere', Icon: PaletteIcon },
  { value: 'entrepreneurship', label: 'Entrepreneurship', Icon: RocketIcon },
  { value: 'outdoor-learning', label: 'Outdoor Learning', Icon: LeafIcon },
  { value: 'planning-problem-solving', label: 'Planning & Problem-Solving', Icon: PuzzleIcon },
  { value: 'real-world-math', label: 'Real-World Math', Icon: CalculatorIcon },
];

interface ShopSidebarProps {
  productCounts?: Record<string, number>;
}

export default function ShopSidebar({ productCounts }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const purchased = usePurchased();
  const [hidePurchased, setHidePurchased] = useState(false);

  const activeCat = categories.find((c) => c.value === active) || categories[0];

  const visibleCategories = categories.filter((cat) => {
    if (cat.value === '') return true;
    if (productCounts && cat.value !== 'bundle' && !productCounts[cat.value]) return false;
    return true;
  });

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('q');
    params.delete('age');
    params.delete('page');
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setMobileOpen(false);

    // Scroll to top of products section after DOM updates
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`/shop?${params.toString()}`, { scroll: false });
    }, 300);
  }

  function handleHidePurchased(checked: boolean) {
    setHidePurchased(checked);
    // Dispatch a custom event so the page can filter products
    window.dispatchEvent(new CustomEvent('shop:hide-purchased', { detail: { hide: checked } }));
  }

  const verticalPillClasses = (isActive: boolean, value: string) =>
    `w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2.5 ${
      isActive
        ? categoryActiveColors[value]
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
    }`;

  const pillClasses = (isActive: boolean, value: string) =>
    `whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
      isActive
        ? categoryActiveColors[value]
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="space-y-4">
      {/* Desktop (lg+): vertical stacked sidebar */}
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
          Browse by Category
        </p>
        <div className="space-y-2" role="tablist">
          {visibleCategories.map((cat) => {
            const count = cat.value && productCounts ? productCounts[cat.value] : null;
            return (
              <button
                key={cat.value}
                role="tab"
                aria-selected={active === cat.value}
                onClick={() => handleFilter(cat.value)}
                className={verticalPillClasses(active === cat.value, cat.value)}
              >
                <cat.Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{cat.label}</span>
                {count != null && count > 0 && (
                  <span className={`text-xs ${active === cat.value ? 'opacity-75' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hide purchased toggle */}
        {purchased.size > 0 && (
          <label className="flex items-center gap-2.5 mt-5 pt-4 border-t border-gray-200 cursor-pointer group">
            <input
              type="checkbox"
              checked={hidePurchased}
              onChange={(e) => handleHidePurchased(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest/30 cursor-pointer"
            />
            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
              Hide purchased
            </span>
          </label>
        )}
      </div>

      {/* Tablet (sm-md): horizontal flex-wrap pills */}
      <div className="hidden sm:flex lg:hidden flex-wrap gap-2" role="tablist">
        {visibleCategories.map((cat) => {
          const count = cat.value && productCounts ? productCounts[cat.value] : null;
          return (
            <button
              key={cat.value}
              role="tab"
              aria-selected={active === cat.value}
              onClick={() => handleFilter(cat.value)}
              className={pillClasses(active === cat.value, cat.value)}
            >
              <cat.Icon className="w-4 h-4" />
              {cat.label}
              {count != null && count > 0 && (
                <span className={`text-xs ${active === cat.value ? 'opacity-75' : 'text-gray-400'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: collapsible */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-medium ${categoryActiveColors[active] || categoryActiveColors['']}`}
        >
          <span className="flex items-center gap-2">
            <activeCat.Icon className="w-4 h-4" />
            {activeCat.label}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="mt-2 grid grid-cols-2 gap-2" role="tablist">
            {visibleCategories.map((cat) => {
              const count = cat.value && productCounts ? productCounts[cat.value] : null;
              return (
                <button
                  key={cat.value}
                  role="tab"
                  aria-selected={active === cat.value}
                  onClick={() => handleFilter(cat.value)}
                  className={`${pillClasses(active === cat.value, cat.value)} justify-center text-center text-xs px-3 py-2`}
                >
                  <cat.Icon className="w-3.5 h-3.5" />
                  {cat.label}
                  {count != null && count > 0 && (
                    <span className={`text-[10px] ${active === cat.value ? 'opacity-75' : 'text-gray-400'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search guides..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
          aria-label="Search guides"
        />
      </div>

      {/* Hide purchased toggle (tablet + mobile) */}
      {purchased.size > 0 && (
        <label className="flex items-center gap-2.5 lg:hidden cursor-pointer group">
          <input
            type="checkbox"
            checked={hidePurchased}
            onChange={(e) => handleHidePurchased(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest/30 cursor-pointer"
          />
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            Hide purchased
          </span>
        </label>
      )}
    </div>
  );
}
