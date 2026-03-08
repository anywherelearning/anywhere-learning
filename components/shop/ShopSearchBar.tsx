'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useCallback, useEffect, useState } from 'react';

const ageOptions = [
  { value: '', label: 'All Ages' },
  { value: '4', label: 'Ages 4+' },
  { value: '6', label: 'Ages 6+' },
  { value: '9', label: 'Ages 9+' },
];

export default function ShopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeAge = searchParams.get('age') || '';
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input with URL when navigating back/forward
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function handleSearch(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pushParams({ q: value });
    }, 300);
  }

  function handleAge(age: string) {
    pushParams({ age });
  }

  function clearSearch() {
    setQuery('');
    pushParams({ q: '' });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search packs..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Age filter pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {ageOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAge(opt.value)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeAge === opt.value
                ? 'bg-forest text-cream shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
