'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path for pagination links (e.g. "/blog") */
  basePath?: string;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  basePath = '/blog',
}: BlogPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    const path = qs ? `${basePath}?${qs}` : basePath;
    return `${path}#posts`;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Build page numbers array
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Blog pagination"
      className="flex items-center justify-center gap-2 mt-12"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-forest bg-white border border-gray-200 rounded-xl hover:border-forest/30 hover:bg-forest/5 transition-colors"
          aria-label="Previous page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-xl cursor-not-allowed">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </span>
      )}

      {/* Page selector dropdown */}
      <div className="relative">
        <select
          value={currentPage}
          onChange={(e) => {
            const page = Number(e.target.value);
            const href = buildHref(page);
            router.push(href);
            // Scroll to posts section after navigation
            setTimeout(() => {
              document.getElementById('posts')?.scrollIntoView({ behavior: 'instant' });
            }, 100);
          }}
          className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-forest/30 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none cursor-pointer transition-colors"
          aria-label="Select page"
        >
          {pages.map((page) => (
            <option key={page} value={page}>
              Page {page} of {totalPages}
            </option>
          ))}
        </select>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-forest bg-white border border-gray-200 rounded-xl hover:border-forest/30 hover:bg-forest/5 transition-colors"
          aria-label="Next page"
        >
          Next
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-xl cursor-not-allowed">
          Next
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      )}
    </nav>
  );
}
