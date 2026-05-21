'use client';

/**
 * Tiny client component for the blog paginator's page-jump dropdown.
 *
 * The blog uses real URL navigation (`?page=N`) so it can be statically
 * generated and SEO-crawled. The Prev/Next links handle that fine, but the
 * "Page X of Y" widget needs interactivity — a <select> that pushes the
 * chosen page URL into the router. Keeping it as a dedicated client island
 * lets the rest of the blog page stay a server component.
 */

import { useRouter } from 'next/navigation';

interface Props {
  currentPage: number;
  /** Pre-computed hrefs, one per page (index 0 = page 1). */
  hrefs: string[];
}

export default function PageDropdown({ currentPage, hrefs }: Props) {
  const router = useRouter();
  const totalPages = hrefs.length;
  return (
    <label className="inline-flex items-center gap-2 font-display italic text-[14px] text-gray-500 px-1">
      <span>Page</span>
      <select
        value={currentPage}
        onChange={(e) => router.push(hrefs[parseInt(e.target.value, 10) - 1])}
        aria-label="Jump to page"
        className="bg-cream border border-[#D8D4C5] rounded-[10px] px-2.5 py-2 pr-7 font-body not-italic font-semibold text-[13.5px] text-forest-dark cursor-pointer focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
      >
        {hrefs.map((_, i) => {
          const p = i + 1;
          return (
            <option key={p} value={p}>
              {p}
            </option>
          );
        })}
      </select>
      <span>of {totalPages}</span>
    </label>
  );
}
