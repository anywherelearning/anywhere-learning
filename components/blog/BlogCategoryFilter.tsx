'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SparklesIcon,
  LeafIcon,
  PaletteIcon,
  CpuIcon,
  BookOpenIcon,
} from '@/components/shop/icons';

/* ─── Blog-specific icons ─── */

function HomeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GlobeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function WrenchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

const categories = [
  { value: '', label: 'All Posts', Icon: SparklesIcon },
  { value: 'ai-digital-literacy', label: 'AI & Digital', Icon: CpuIcon },
  { value: 'creativity-maker', label: 'Creativity & Maker', Icon: PaletteIcon },
  { value: 'homeschool-journey', label: 'Homeschool Journey', Icon: HomeIcon },
  { value: 'nature-learning', label: 'Nature Learning', Icon: LeafIcon },
  { value: 'real-world-skills', label: 'Real-World Skills', Icon: WrenchIcon },
  { value: 'travel-worldschool', label: 'Travel & Worldschool', Icon: GlobeIcon },
];

const categoryActiveColors: Record<string, string> = {
  '': 'bg-forest text-cream shadow-sm',
  'ai-digital-literacy': 'bg-[#7b88a8] text-white shadow-sm',
  'creativity-maker': 'bg-[#c47a8f] text-white shadow-sm',
  'homeschool-journey': 'bg-[#8b7355] text-white shadow-sm',
  'nature-learning': 'bg-forest text-cream shadow-sm',
  'real-world-skills': 'bg-[#c4836a] text-white shadow-sm',
  'travel-worldschool': 'bg-[#5b8fa8] text-white shadow-sm',
};

interface BlogCategoryFilterProps {
  postCounts?: Record<string, number>;
}

export default function BlogCategoryFilter({ postCounts }: BlogCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCat = categories.find((c) => c.value === active) || categories[0];

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
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
      router.push(`/blog?${params.toString()}`, { scroll: false });
    }, 300);
  }

  const pillClasses = (isActive: boolean, value: string) =>
    `whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
      isActive
        ? categoryActiveColors[value]
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
    }`;

  const verticalPillClasses = (isActive: boolean, value: string) =>
    `w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2.5 ${
      isActive
        ? categoryActiveColors[value]
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="space-y-4">
      {/* Desktop (lg+): vertical stacked sidebar */}
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
          Browse by Topic
        </p>
        <div className="space-y-2" role="tablist">
          {categories.map((cat) => {
            const count = cat.value && postCounts ? postCounts[cat.value] : null;
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
      </div>

      {/* Tablet (sm-md): horizontal flex-wrap pills */}
      <div className="hidden sm:flex lg:hidden flex-wrap gap-2" role="tablist">
        {categories.map((cat) => {
          const count = cat.value && postCounts ? postCounts[cat.value] : null;
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
            {categories.map((cat) => {
              const count = cat.value && postCounts ? postCounts[cat.value] : null;
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

      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search posts..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
          aria-label="Search blog posts"
        />
      </div>
    </div>
  );
}
