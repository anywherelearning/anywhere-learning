'use client';

import { useState } from 'react';

interface TOCItem {
  text: string;
  id: string;
}

interface MobileTOCProps {
  items: TOCItem[];
}

export default function MobileTOC({ items }: MobileTOCProps) {
  const [open, setOpen] = useState(false);

  if (items.length < 3) return null;

  return (
    <div className="lg:hidden mb-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-gray-100/80 bg-white/60 backdrop-blur-sm px-5 py-4 text-left transition-all hover:border-forest/10"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest/[0.06] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-forest/60">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </span>
          <span className="text-sm font-medium text-gray-600">
            In this article
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-out ${
          open ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <ol className="space-y-1 list-none pl-0 rounded-2xl border border-gray-100/60 bg-white/40 backdrop-blur-sm p-4">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 py-2 px-2 text-sm text-gray-500 hover:text-forest transition-colors rounded-lg hover:bg-forest/[0.03]"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-forest/[0.07] text-forest/60 text-[10px] font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{item.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
