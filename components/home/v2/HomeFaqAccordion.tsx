'use client';

import { useState } from 'react';
import { HOME_FAQS } from '@/lib/home-showcase';

/**
 * Homepage FAQ. Single-open accordion, first item open on load so the section
 * never reads as a wall of closed bars. Same array feeds the FAQPage JSON-LD
 * on the server, so the markup and the structured data can't drift.
 */
export default function HomeFaqAccordion() {
  // -1 = all closed. Opening one by default makes the list look half-broken
  // and pushes the second question off a phone screen.
  const [open, setOpen] = useState(-1);

  // Two real columns rather than one nine-item stack, which read as a wall.
  // Split into separate flex columns (not a grid) so opening an answer pushes
  // only the items below it in that column, leaving the other side still.
  const half = Math.ceil(HOME_FAQS.length / 2);
  const columns = [HOME_FAQS.slice(0, half), HOME_FAQS.slice(half)];

  return (
    <div className="grid grid-cols-1 items-start gap-x-5 md:grid-cols-2">
      {columns.map((col, ci) => (
        <div key={ci}>
          {col.map((f, ri) => {
            const i = ci * half + ri;
            return renderItem(f, i);
          })}
        </div>
      ))}
    </div>
  );

  function renderItem(f: (typeof HOME_FAQS)[number], i: number) {
    const on = open === i;
    return (
      <div
        key={f.q}
        className="mb-3 rounded-2xl border border-gray-200/60 bg-white transition-all duration-300"
        style={{
          borderLeft: `3px solid ${on ? '#d4a373' : 'rgba(229,231,235,0.9)'}`,
          boxShadow: on ? '0 12px 28px -8px rgba(60,50,30,0.12)' : 'none',
        }}
      >
        <h3>
          <button
            type="button"
            onClick={() => setOpen(on ? -1 : i)}
            aria-expanded={on}
            aria-controls={`home-faq-panel-${i}`}
            className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left"
          >
            <span className="text-[16.5px] font-semibold text-gray-900">{f.q}</span>
            <span
              className={`inline-flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[19px] leading-none transition-all duration-300 ${
                on ? 'rotate-45 bg-gold text-gray-900' : 'bg-gold/[0.16] text-gold-dark'
              }`}
              aria-hidden="true"
            >
              +
            </span>
          </button>
        </h3>
        <div
          id={`home-faq-panel-${i}`}
          hidden={!on}
          className="px-5 pb-5 text-[15.5px] leading-[1.65] text-gray-600"
        >
          {f.a}
        </div>
      </div>
    );
  }
}
