'use client';

import Link from 'next/link';
import Image from 'next/image';
import { coverSrc } from '@/lib/cover';
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
      {/* Phones: one dropdown instead of nine buttons (they took half a screen). */}
      <label className="mb-6 flex items-center gap-3 rounded-full border border-gray-200/90 bg-white py-1 pl-5 pr-2 shadow-[0_6px_14px_-10px_rgba(45,58,46,0.4)] sm:hidden">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500">Topic</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-w-0 flex-1 appearance-none bg-transparent py-2.5 pr-8 text-[15px] font-semibold text-forest-dark outline-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%23588157' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {SHOP_CATEGORIES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-7 hidden sm:flex sm:flex-wrap sm:gap-[9px]">
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
            <div className="flex gap-4">
            <div className="min-w-0 flex-1">
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
            </div>
            {/* The guide's full cover, so parents see the real thing */}
            <span className="relative mt-1 block w-[84px] shrink-0 rotate-[3deg] self-start bg-white p-1 shadow-[0_8px_16px_-8px_rgba(45,58,46,0.55)]">
              <span className="relative block aspect-[8.5/11] overflow-hidden">
                <Image
                  src={coverSrc(`/products/${a.slug}.jpg`)!}
                  alt={`${a.title} guide cover`}
                  fill
                  sizes="84px"
                  className="object-cover object-top"
                />
              </span>
            </span>
            </div>
            <span className="mt-auto pt-4 text-[14px] font-semibold text-forest transition-colors group-hover:text-forest-dark">
              Open the guide &rarr;
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
