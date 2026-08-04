'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { IdeaList } from '@/lib/ideas';
import type { IdeaFreeActivity } from '@/lib/ideas-free-activity';
import IdeaListOfferInline from '@/components/ideas/IdeaListOfferInline';

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
  categorySlug,
  freeActivity,
}: {
  list: IdeaList;
  accent: string;
  pdfUrls: { color: string; bw: string } | null;
  categorySlug: string;
  /** Null when the category has no activity mapped, which hides the offer. */
  freeActivity: IdeaFreeActivity | null;
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
      <div className="mx-auto max-w-[920px] px-6 -mt-2 mb-5">
        <div className="flex flex-row items-stretch gap-4 sm:gap-5">
          {/* Cover thumbnail. Stays a thumbnail on mobile: a full-width
              portrait cover pushed the actual list down almost two screens. */}
          <div className="relative w-[104px] h-[135px] sm:w-[180px] sm:h-[240px] flex-shrink-0 rounded-xl overflow-hidden border border-[#e8e5de] shadow-[0_8px_24px_-12px_rgba(45,58,46,0.2)]">
            <Image
              src={`/ideas/${list.slug}.jpg`}
              alt={list.title}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 640px) 104px, 180px"
            />
          </div>

          {/* Download + info card */}
          <div
            className="flex-1 min-w-0 rounded-xl border p-4 sm:p-6 flex flex-col justify-center"
            style={{
              borderColor: `${accent}25`,
              background: `${accent}08`,
            }}
          >
            <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.14em] mb-1.5 sm:mb-2" style={{ color: accent }}>
              Free printable checklist
            </p>
            <p className="text-[14px] sm:text-[15px] leading-[1.5] text-gray-600 mb-3.5">
              <span className="hidden sm:inline">
                Print it for the fridge, your bag, or the counter. Pick whichever
                version suits your printer.{' '}
              </span>
              <strong className="font-semibold text-gray-700">
                Instant download. No email required.
              </strong>
            </p>
            {pdfUrls ? (
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={pdfUrls.color}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-white px-3.5 sm:px-4 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
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
                  className="inline-flex items-center gap-2 text-[13px] font-semibold px-3.5 sm:px-4 py-2.5 rounded-lg border-2 transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
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

        {/* The full offer sits below the list, about five screens down on a
            phone. Most visitors take the PDF here and leave, so the same ask
            also runs at the point they're already accepting something. Both
            share state, so claiming in one settles the other. */}
        {freeActivity && (
          <IdeaListOfferInline
            categorySlug={categorySlug}
            accent={accent}
            activity={freeActivity}
          />
        )}
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

      {/* ── The list ──
          Deliberately not cards. Each theme is a labelled rule over a dense
          two-column run of rows, so all 50 ideas stay visible (they are this
          page's crawlable content) without four screens of container chrome. */}
      <div className="mx-auto max-w-[920px] px-6 pt-7 pb-10 flex flex-col gap-7">
        {list.sections.map((section, si) => {
          const sectionChecked = section.items.filter(
            (_, ii) => checked[itemKey(si, ii)],
          ).length;
          const sectionDone = sectionChecked === section.items.length;

          return (
            <section key={section.name}>
              {/* Theme rule */}
              <div
                className="flex items-baseline gap-3 pb-2 mb-1 border-b"
                style={{ borderColor: `${accent}33` }}
              >
                <h2
                  className="text-[13px] font-semibold uppercase tracking-[0.14em] m-0"
                  style={{ color: accent }}
                >
                  {section.name}
                </h2>
                <span
                  className="ml-auto text-[12px] font-medium tabular-nums whitespace-nowrap transition-colors"
                  style={{ color: sectionDone ? accent : '#6b6860' }}
                >
                  {sectionDone
                    ? 'all done'
                    : `${sectionChecked}/${section.items.length}`}
                </span>
              </div>

              {/* Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                {section.items.map((item, ii) => {
                  const key = itemKey(si, ii);
                  const isChecked = !!checked[key];
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-2.5 py-[7px] px-2 -mx-2 rounded-md cursor-pointer select-none hover:bg-[#f2efe6] transition-colors"
                    >
                      <span
                        className="flex-shrink-0 w-[18px] h-[18px] rounded border-[1.5px] mt-[2px] grid place-items-center transition-colors duration-150"
                        style={{
                          borderColor: isChecked ? accent : '#C1BCAC',
                          background: isChecked ? accent : 'transparent',
                        }}
                      >
                        {isChecked && (
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="white"
                              strokeWidth="2.2"
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
                        className="text-[14.5px] leading-[1.45] transition-colors duration-150"
                        style={{
                          // Completed items read as done via the strike, not by
                          // fading below the 4.5:1 contrast floor.
                          color: isChecked ? '#706d66' : '#3f3d38',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          textDecorationColor: isChecked ? '#b3ae9e' : undefined,
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

        {/* Reset, only once something is ticked */}
        {checkedCount > 0 && (
          <button
            onClick={reset}
            className="self-start text-[13px] font-medium text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors"
          >
            Clear {checkedCount} ticked
          </button>
        )}
      </div>
    </div>
  );
}
