'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  SparklesIcon,
  LeafIcon,
  PaletteIcon,
  LightbulbIcon,
  CompassIcon,
  CpuIcon,
  LayersIcon,
} from './icons';

const categories = [
  { value: '', label: 'All Packs', Icon: SparklesIcon },
  { value: 'ai-literacy', label: 'AI & Digital', Icon: CpuIcon },
  { value: 'creativity', label: 'Creativity', Icon: PaletteIcon },
  { value: 'life-skills', label: 'Life Skills', Icon: CompassIcon },
  { value: 'nature', label: 'Nature', Icon: LeafIcon },
  { value: 'real-world', label: 'Real-World', Icon: LightbulbIcon },
  { value: 'bundle', label: 'Bundles', Icon: LayersIcon },
];

const categoryActiveColors: Record<string, string> = {
  '': 'bg-forest text-cream shadow-sm',
  'ai-literacy': 'bg-[#7b88a8] text-white shadow-sm',
  creativity: 'bg-[#c47a8f] text-white shadow-sm',
  'life-skills': 'bg-[#6b8e8b] text-white shadow-sm',
  nature: 'bg-forest text-cream shadow-sm',
  'real-world': 'bg-[#8b7355] text-white shadow-sm',
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

  const visibleCategories = hideBundles
    ? categories.filter((c) => c.value !== 'bundle')
    : categories;

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
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide" role="tablist">
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
            {count != null && (
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
