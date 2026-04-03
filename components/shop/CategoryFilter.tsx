'use client';

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

const categories = [
  { value: '', label: 'All Packs', Icon: SparklesIcon },
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

const categoryActiveColors: Record<string, string> = {
  '': 'bg-forest text-cream shadow-sm',
  'ai-literacy': 'bg-[#7b88a8] text-white shadow-sm',
  'creativity-anywhere': 'bg-[#c47a8f] text-white shadow-sm',
  'communication-writing': 'bg-[#5b8fa8] text-white shadow-sm',
  'outdoor-learning': 'bg-forest text-cream shadow-sm',
  'real-world-math': 'bg-[#8b7355] text-white shadow-sm',
  'entrepreneurship': 'bg-[#c4836a] text-white shadow-sm',
  'planning-problem-solving': 'bg-[#7a6da8] text-white shadow-sm',
  'start-here': 'bg-[#d4a373] text-white shadow-sm',
  bundle: 'bg-gold text-white shadow-sm',
};

interface CategoryFilterProps {
  hideBundles?: boolean;
  productCounts?: Record<string, number>;
}

export default function CategoryFilter({ hideBundles, productCounts }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';

  // Filter out categories with no products (when counts are available)
  // Always keep "All Packs" (empty value) and "Bundles" (if not hidden)
  const visibleCategories = categories.filter((cat) => {
    if (cat.value === '') return true; // Always show "All Packs"
    if (cat.value === 'bundle') return !hideBundles;
    if (productCounts && !productCounts[cat.value]) return false; // Hide empty categories
    return true;
  });

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    // Clear search/age when switching categories
    params.delete('q');
    params.delete('age');
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {visibleCategories.map((cat) => {
        const count = cat.value && productCounts ? productCounts[cat.value] : null;
        return (
          <button
            key={cat.value}
            role="tab"
            aria-selected={active === cat.value}
            onClick={() => handleFilter(cat.value)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              active === cat.value
                ? categoryActiveColors[cat.value]
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
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
  );
}
