'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

const categories = [
  { value: '', label: 'All Posts' },
  { value: 'ai-digital-literacy', label: 'AI & Digital Literacy' },
  { value: 'creativity-maker', label: 'Creativity & Maker' },
  { value: 'homeschool-journey', label: 'Homeschool Journey' },
  { value: 'nature-learning', label: 'Nature Learning' },
  { value: 'real-world-skills', label: 'Real-World Skills' },
  { value: 'travel-worldschool', label: 'Travel & Worldschool' },
];

export default function BlogCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`, { scroll: false });
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat.value}
            role="tab"
            aria-selected={active === cat.value}
            onClick={() => handleFilter(cat.value)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              active === cat.value
                ? 'bg-forest text-cream shadow-sm'
                : 'bg-white text-gray-600 hover:bg-forest/5 hover:text-forest border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
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
