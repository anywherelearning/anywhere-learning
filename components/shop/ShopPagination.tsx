'use client';

import { useRouter } from 'next/navigation';

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  sort: string;
}

export default function ShopPagination({ currentPage, totalPages, sort }: ShopPaginationProps) {
  const router = useRouter();

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (p > 1) params.set('page', String(p));
    return `/shop?${params.toString()}`;
  }

  function goToPage(p: number) {
    router.push(pageUrl(p), { scroll: false });
  }

  return (
    <nav aria-label="Shop pagination" className="flex items-center justify-center gap-3 mt-10">
      {/* Previous */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2.5 text-sm font-medium text-forest bg-white border border-gray-200 rounded-xl hover:bg-forest/5 hover:border-forest/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        &larr; Previous
      </button>

      {/* Page dropdown */}
      <div className="relative">
        <select
          value={currentPage}
          onChange={(e) => goToPage(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all cursor-pointer"
          aria-label="Select page"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              Page {p} of {totalPages}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2.5 text-sm font-medium text-forest bg-white border border-gray-200 rounded-xl hover:bg-forest/5 hover:border-forest/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        Next &rarr;
      </button>
    </nav>
  );
}
