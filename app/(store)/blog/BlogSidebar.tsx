'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import EmailForm from '@/components/EmailForm';

interface CategoryOption {
  value: string;
  label: string;
  count: number;
}

interface Props {
  categories: CategoryOption[];
  activeValue: string;
}

export default function BlogSidebar({ categories, activeValue }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = categories.find((c) => c.value === activeValue)?.label || 'All Posts';

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setMobileOpen(false);
  }

  const renderList = (extraClass = '') => (
    <ul className={`list-none p-0 m-0 border-t border-[#D8D4C5] ${extraClass}`}>
      {categories.map((c) => {
        const isActive = c.value === activeValue;
        return (
          <li key={c.value || 'all'} className="border-b border-[#D8D4C5]">
            <button
              type="button"
              onClick={() => selectCategory(c.value)}
              className={`relative w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-[15px] leading-[1.3] rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#F2EFE4] text-forest-dark font-semibold'
                  : 'bg-transparent text-ink hover:bg-[#F2EFE4] hover:text-forest-dark'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-forest rounded-r"
                />
              )}
              <span>{c.label}</span>
              <span
                className={`text-[13px] tabular-nums ${
                  isActive ? 'text-forest font-medium' : 'text-gray-500'
                }`}
              >
                {c.count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block sticky top-[96px]">
        <h2 className="font-medium text-[11.5px] tracking-[0.18em] uppercase text-gray-500 m-0 mb-2 px-3 flex items-center gap-2.5">
          <span aria-hidden="true" className="w-3.5 h-px bg-[#C9C5B7]" />
          Browse by category
        </h2>
        {renderList()}
        <div className="mt-6 p-5 bg-[#E6EBDF] border border-[#C9D3BE] rounded-[12px]">
          <p className="font-display italic text-[17px] leading-[1.25] text-ink m-0 mb-1.5 text-balance">
            Get new posts in your inbox.
          </p>
          <p className="text-[13px] text-gray-600 leading-[1.5] m-0 mb-3">
            One email when there&apos;s something worth sending.
          </p>
          <EmailForm variant="light" buttonText="Subscribe" stacked />
        </div>
      </div>

      {/* MOBILE ACCORDION */}
      <div className="lg:hidden">
        <div className="border border-[#D8D4C5] rounded-[12px] bg-cream overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="text-[14px] font-semibold text-ink tracking-wide">
              Browse by category
            </span>
            <span className="font-display italic font-normal text-[16px] text-forest-dark mr-2.5">
              {activeLabel}
            </span>
            <span
              className={`w-6 h-6 rounded-full grid place-items-center text-sm transition-transform ${
                mobileOpen
                  ? 'bg-[#E6EBDF] text-forest-dark rotate-180'
                  : 'bg-[#F2EFE4] text-gray-600'
              }`}
              aria-hidden="true"
            >
              ⌄
            </span>
          </button>
          {mobileOpen && (
            <>
              {renderList()}
              <div className="p-5 bg-[#E6EBDF] border-t border-[#C9D3BE]">
                <p className="font-display italic text-[17px] leading-[1.25] text-ink m-0 mb-1.5">
                  Get new posts in your inbox.
                </p>
                <p className="text-[13px] text-gray-600 leading-[1.5] m-0 mb-3">
                  One email when there&apos;s something worth sending.
                </p>
                <EmailForm variant="light" buttonText="Subscribe" stacked />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
