'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface CategoryFilterProps {
  hideBundles?: boolean;
  productCounts?: Record<string, number>;
}

export default function CategoryFilter({ hideBundles, productCounts }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleCategories = categories.filter((cat) => {
    if (cat.value === '') return true;
    if (cat.value === 'bundle') return !hideBundles;
    if (productCounts && !productCounts[cat.value]) return false;
    return true;
  });

  const activeCat = visibleCategories.find((c) => c.value === active) || visibleCategories[0];

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('q');
    params.delete('age');
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  }

  const pillClasses = (isActive: boolean, value: string) =>
    `whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
      isActive
        ? categoryActiveColors[value]
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
    }`;

  return (
    <>
      {/* Desktop: wrap pills */}
      <div className="hidden sm:flex flex-wrap gap-2" role="tablist">
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
    </>
  );
}
