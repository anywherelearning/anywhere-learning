'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { IdeaList } from '@/lib/ideas';
import type { IdeaFreeActivity } from '@/lib/ideas-free-activity';
import IdeaListOfferInline from '@/components/ideas/IdeaListOfferInline';

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

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
      {/* ── Two parallel cards: take the printable, or take the guided one ──
          Same skeleton in both (thumb, eyebrow, one line, action row pinned to
          the bottom) so the pair reads as one row rather than two components
          that happened to land next to each other. */}
      <div className="mx-auto max-w-[920px] px-6 -mt-2 mb-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:items-stretch">
          {/* Card 1 — the printable they came for */}
          <div
            className="h-full rounded-xl border p-4 sm:p-5 flex gap-4"
            style={{ borderColor: `${accent}25`, background: `${accent}08` }}
          >
            {/* contain, not cover: the checklists are 0.773 and the product
                covers run 0.707 to 0.750, so one fixed ratio cropped the edges
                off a cover. Nothing here is croppable art. */}
            <div className="relative w-[84px] sm:w-[92px] aspect-[3/4] flex-shrink-0">
              <Image
                src={`/ideas/${list.slug}.jpg`}
                alt={list.title}
                fill
                priority
                className="object-contain drop-shadow-[0_5px_12px_rgba(45,58,46,0.3)]"
                sizes="92px"
              />
            </div>

            <div className="min-w-0 flex-1 flex flex-col">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: accent }}
              >
                Free printable checklist
              </p>
              <p className="text-[14px] leading-[1.5] text-[#4a4843] m-0">
                Print it for the fridge or your bag.{' '}
                <strong className="font-semibold text-[#3f3d38]">
                  No email needed.
                </strong>
              </p>

              <div className="mt-auto pt-3.5">
                {pdfUrls ? (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={pdfUrls.color}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white px-3 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
                      style={{ background: accent }}
                    >
                      <DownloadIcon />
                      Full colour
                    </a>
                    <a
                      href={pdfUrls.bw}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2.5 rounded-lg border-2 transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
                      style={{ color: accent, borderColor: accent, background: 'transparent' }}
                    >
                      <DownloadIcon />
                      Black &amp; white
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white px-3 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md"
                    style={{ background: accent }}
                  >
                    <DownloadIcon />
                    Print this page
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 — the same ask that runs below the list, at the moment they
              are already accepting something. Both share state. */}
          {freeActivity && (
            <IdeaListOfferInline
              categorySlug={categorySlug}
              accent={accent}
              activity={freeActivity}
            />
          )}
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
