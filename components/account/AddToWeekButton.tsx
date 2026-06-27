'use client';

import { useEffect, useRef, useState } from 'react';
import { childAge, loadProfile, type Child } from '@/lib/member-profile';
import { addToWeek, weekSlugs } from '@/lib/week';

function childLabel(c: Child, i: number) {
  return c.name.trim() || `Child ${i + 1}`;
}

/**
 * Adds a library activity straight onto a kid's week. One kid: adds directly.
 * Two or more: opens a small "whose plan?" menu. Only rendered for real
 * individual activities (the caller gates on the effort tag).
 */
export default function AddToWeekButton({ slug, title }: { slug: string; title: string }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChildren(loadProfile()?.children ?? []);
    setAdded(weekSlugs().has(slug));
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const allIds = children.map((c, i) => c.id ?? childLabel(c, i));

  function addFor(target: string[]) {
    addToWeek(slug, target.length ? target : ['unassigned']);
    setAdded(true);
    setOpen(false);
  }

  function handleClick() {
    if (children.length <= 1) addFor(allIds);
    else setOpen((v) => !v);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label={added ? `${title} is on your plan` : `Add ${title} to your plan`}
        title={added ? 'On your plan' : 'Add to your plan'}
        className={`w-8 h-8 rounded-lg grid place-items-center cursor-pointer transition-colors border ${
          added
            ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest'
            : 'bg-cream border-[#D8D4C5] text-gray-500 hover:border-forest hover:text-forest-dark'
        }`}
      >
        {added ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4M9.5 15l2 2 4-4" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4M12 13v4M10 15h4" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-48 bg-cream border border-[#D8D4C5] rounded-xl shadow-[0_18px_40px_-16px_rgba(45,58,46,0.3)] py-1.5">
          <p className="px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Add to whose plan?
          </p>
          {children.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addFor([c.id ?? childLabel(c, i)])}
              className="w-full text-left px-3 py-2 font-body text-[13.5px] text-gray-700 hover:bg-[#EDE9DC] cursor-pointer"
            >
              {childLabel(c, i)}
              {childAge(c) != null ? ` (${childAge(c)})` : ''}
            </button>
          ))}
          <button
            type="button"
            onClick={() => addFor(allIds)}
            className="w-full text-left px-3 py-2 font-body text-[13.5px] font-semibold text-forest hover:bg-[#EDE9DC] cursor-pointer"
          >
            Everyone
          </button>
        </div>
      )}
    </div>
  );
}
