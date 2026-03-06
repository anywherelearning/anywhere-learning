'use client';

import { useEffect, useRef, useState } from 'react';

interface TOCItem {
  text: string;
  id: string;
}

interface StickyTOCProps {
  items: TOCItem[];
}

export default function StickyTOC({ items }: StickyTOCProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    // Track which headings are visible and pick the topmost
    const visibleIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        // Pick the first visible heading in document order
        const firstVisible = items.find((item) => visibleIds.has(item.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        } else {
          // If no heading is visible, find the last heading above viewport
          const scrollY = window.scrollY + 120;
          let lastAbove = '';
          for (const h of headings) {
            if (h.offsetTop <= scrollY) lastAbove = h.id;
          }
          if (lastAbove) setActiveId(lastAbove);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    headings.forEach((h) => observerRef.current!.observe(h));

    // Reading progress
    function onScroll() {
      const article = document.querySelector('[data-article]');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [items]);

  if (items.length < 3) return null;

  const activeIndex = items.findIndex((item) => item.id === activeId);

  return (
    <nav aria-label="Table of contents" className="relative">
      {/* Progress line */}
      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-forest/[0.06] rounded-full" />
      <div
        className="absolute left-[7px] top-0 w-[2px] bg-forest/40 rounded-full transition-all duration-500 ease-out"
        style={{ height: `${progress * 100}%` }}
      />

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold mb-5 pl-6">
        Contents
      </p>

      <ol className="space-y-1 list-none pl-0 relative">
        {items.map((item, i) => {
          const isActive = item.id === activeId;
          const isPast = activeIndex >= 0 && i < activeIndex;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className={`group flex items-start gap-3 py-1.5 pl-3 text-[13px] leading-snug transition-all duration-300 rounded-r-lg ${
                  isActive
                    ? 'text-forest font-medium bg-forest/[0.04] border-l-2 border-forest/40 -ml-[1px]'
                    : isPast
                      ? 'text-gray-400 hover:text-forest/70'
                      : 'text-gray-400 hover:text-forest/70'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-forest text-cream scale-110'
                      : isPast
                        ? 'bg-forest/15 text-forest/50'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-forest/10 group-hover:text-forest/60'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="leading-snug">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ol>

      {/* Reading progress percentage */}
      <div className="mt-6 pl-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] bg-forest/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest/30 to-forest/60 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-gray-400 font-medium w-7 text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </nav>
  );
}
