'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SHOWCASE_ACTIVITIES, SHOP_CATEGORIES } from '@/lib/home-showcase';

/**
 * "120+ activities. Every topic." — one chip per shop category, each showing
 * that category's banner and three real activities from it.
 *
 * All nine are listed rather than a subset behind an "All" chip, so the section
 * itself is the proof that every topic is covered. Every card links out to the
 * real activity page.
 */
export default function ActivityExplorer() {
  const [topic, setTopic] = useState<string>(SHOP_CATEGORIES[0]);

  const shown = SHOWCASE_ACTIVITIES.filter((a) => a.category === topic).slice(0, 3);

  return (
    <>
      {/* Two even columns on phones: all nine stay visible and nothing scrolls
          sideways. Free-wrapping pills stacked into seven ragged rows (360px);
          a fixed 2-up grid packs the same nine into five tidy ones. From sm up
          there is room to wrap them inline as normal. */}
      <div className="mb-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-[9px]">
        {SHOP_CATEGORIES.map((t) => {
          const on = topic === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-2.5 text-center text-[13px] leading-tight transition-all duration-200 sm:shrink-0 sm:whitespace-nowrap sm:px-[18px] sm:text-[14.5px] ${
                on
                  ? 'border-forest bg-forest font-semibold text-cream'
                  : 'border-gray-200/90 bg-white font-medium text-gray-600 hover:border-forest/40'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <Link
            key={a.slug}
            href={`/shop/${a.slug}`}
            className="group flex flex-col rounded-[20px] border p-6 shadow-[0_1px_3px_0_rgba(60,50,30,0.08)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_28px_60px_-14px_rgba(88,129,87,0.2)] motion-safe:animate-[alFade_400ms_cubic-bezier(0.22,1,0.36,1)]"
            /* Tinted from the category's own accent, so the whole row changes
               colour with the chip instead of sitting flat and white. */
            style={{
              backgroundColor: `color-mix(in srgb, ${a.color} 8%, #ffffff)`,
              borderColor: `color-mix(in srgb, ${a.color} 24%, #ffffff)`,
              borderLeft: `3px solid ${a.color}`,
            }}
          >
            <div className="mb-2.5 flex items-center justify-between gap-2.5">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: a.colorText }}
              >
                {a.category}
              </span>
              <span className="whitespace-nowrap text-xs text-gray-400">{a.time}</span>
            </div>
            <div className="mb-2 font-display text-[20px] leading-[1.2] text-forest-dark">
              {a.title}
            </div>
            <div className="text-[15px] leading-[1.55] text-gray-500">{a.blurb}</div>
            <span className="mt-4 text-[14px] font-semibold text-forest transition-colors group-hover:text-forest-dark">
              Open the guide &rarr;
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
