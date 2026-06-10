'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { IdeaList } from '@/lib/ideas';

/* ──────────────────────────────────────────────────────────────────
   IdeasChecklist
   Interactive, localStorage-persisted checklist for a single
   idea list.  Renders section cards with two-column checkbox
   grids, a sticky progress bar, and print/save buttons.
   ────────────────────────────────────────────────────────────────── */

export default function IdeasChecklist({
  list,
  accent,
  pdfUrls,
}: {
  list: IdeaList;
  accent: string;
  pdfUrls: { color: string; bw: string } | null;
}) {
  const storageKey = `al-ideas:${list.slug}`;
  const totalItems = list.sections.reduce((n, s) => n + s.items.length, 0);

  /* ── State ── */
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setChecked(JSON.parse(stored));
      }
    } catch {
      /* localStorage unavailable */
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist to localStorage on change (skip initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      /* localStorage unavailable */
    }
  }, [checked, hydrated, storageKey]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    setChecked({});
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPct = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  const allDone = checkedCount === totalItems && totalItems > 0;

  // Build a stable key for each item: sectionIndex-itemIndex
  const itemKey = (si: number, ii: number) => `${si}-${ii}`;

  return (
    <div style={{ '--accent': accent } as React.CSSProperties}>
      {/* ── Cover image + download strip ── */}
      <div className="mx-auto max-w-[920px] px-6 -mt-2 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch gap-5">
          {/* Cover thumbnail */}
          <div className="relative w-full sm:w-[180px] flex-shrink-0 aspect-[8.5/11] sm:aspect-auto sm:h-[240px] rounded-xl overflow-hidden border border-[#e8e5de] shadow-[0_8px_24px_-12px_rgba(45,58,46,0.2)]">
            <Image
              src={`/ideas/${list.slug}.jpg`}
              alt={list.title}
              fill
              className="object-cover object-top"
              sizes="180px"
            />
          </div>

          {/* Download + info card */}
          <div
            className="flex-1 rounded-xl border p-6 flex flex-col justify-center"
            style={{
              borderColor: `${accent}25`,
              background: `${accent}08`,
            }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: accent }}>
              Free printable checklist
            </p>
            <p className="text-[15px] leading-[1.55] text-gray-600 mb-4">
              Download and print this list to pin on the fridge, toss in your bag, or keep on the counter. Pick whichever version works best for your printer.
            </p>
            {pdfUrls ? (
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={pdfUrls.color}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-white px-4 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md no-underline"
                  style={{ background: accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Full Color PDF
                </a>
                <a
                  href={pdfUrls.bw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-lg border-2 transition-all hover:-translate-y-px hover:shadow-md no-underline"
                  style={{
                    color: accent,
                    borderColor: accent,
                    background: 'transparent',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  B&amp;W PDF
                </a>
              </div>
            ) : (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-white px-4 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md"
                style={{ background: accent }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print this page
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky progress bar ── */}
      <div className="sticky top-0 z-30 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#D8D4C5] shadow-[0_4px_16px_-8px_rgba(45,58,46,0.1)]">
        <div className="mx-auto max-w-[920px] px-6 py-3 flex items-center gap-4">
          {/* Count */}
          <span className="text-[14px] font-medium text-gray-700 whitespace-nowrap">
            {allDone ? (
              <span style={{ color: accent }}>All done!</span>
            ) : (
              <>
                <span className="font-semibold" style={{ color: accent }}>
                  {checkedCount}
                </span>{' '}
                / {totalItems}
              </>
            )}
          </span>

          {/* Bar */}
          <div className="flex-1 min-w-[100px] h-2.5 bg-[#E8E5DC] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: allDone
                  ? `linear-gradient(90deg, ${accent}, ${accent}cc)`
                  : accent,
              }}
            />
          </div>

          {/* Percentage */}
          <span className="text-[13px] font-medium text-gray-500 whitespace-nowrap">
            {Math.round(progressPct)}%
          </span>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="mx-auto max-w-[920px] px-6 py-10 flex flex-col gap-6">
        {list.sections.map((section, si) => {
          const sectionChecked = section.items.filter(
            (_, ii) => checked[itemKey(si, ii)],
          ).length;
          const sectionDone = sectionChecked === section.items.length;

          return (
            <section
              key={section.name}
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{
                borderColor: sectionDone ? `${accent}40` : '#D8D4C5',
                background: sectionDone ? `${accent}06` : 'white',
                boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 14px 26px -22px rgba(45,58,46,0.15)',
              }}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-4 px-6 py-4"
                style={{
                  borderBottom: `1px solid ${sectionDone ? `${accent}20` : '#E8E5DC'}`,
                  background: `${accent}06`,
                }}
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-lg grid place-items-center text-[13px] font-bold text-white shadow-sm"
                  style={{ background: accent }}
                >
                  {String(si + 1).padStart(2, '0')}
                </span>
                <h2 className="flex-1 min-w-0 text-[15px] font-semibold tracking-tight m-0" style={{ color: accent }}>
                  {section.name}
                </h2>
                <span
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    color: sectionDone ? 'white' : accent,
                    background: sectionDone ? accent : `${accent}12`,
                  }}
                >
                  {sectionDone ? 'Done!' : `${sectionChecked}/${section.items.length}`}
                </span>
              </div>

              {/* Checkbox grid */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
                {section.items.map((item, ii) => {
                  const key = itemKey(si, ii);
                  const isChecked = !!checked[key];
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-3 py-2.5 cursor-pointer group select-none rounded-lg px-2 -mx-2 hover:bg-[#f5f3ee] transition-colors"
                    >
                      <span
                        className="flex-shrink-0 w-[22px] h-[22px] rounded-md border-2 mt-0.5 grid place-items-center transition-all duration-200"
                        style={{
                          borderColor: isChecked ? accent : '#C9C5B7',
                          background: isChecked ? accent : 'transparent',
                          transform: isChecked ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {isChecked && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key)}
                        className="sr-only"
                        aria-label={item}
                      />
                      <span
                        className="text-[15px] leading-[1.55] transition-all duration-200"
                        style={{
                          color: isChecked ? '#9CA3AF' : '#374151',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          textDecorationColor: isChecked ? '#d1d5db' : undefined,
                        }}
                      >
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
