'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SHOWCASE_ACTIVITIES } from '@/lib/home-showcase';

/**
 * The hero's "Next stop" card: a faithful copy of the real card members see on
 * their trail map, sitting on top of the faded trail illustration behind it.
 *
 * Deliberately matches the member UI rather than inventing a marketing card, so
 * the homepage shows the actual product. That means the member world's fonts
 * (Bricolage for the title, JetBrains Mono for the caps labels), the frosted
 * panel, and the same three actions.
 *
 *   Open the guide  → the real activity page
 *   We reached it   → the New Finds celebration, matching the real one
 *   Different one   → next activity
 *   Skip this area  → next activity in a different category
 */
export default function HeroNextStop() {
  const [act, setAct] = useState(0);
  const [reached, setReached] = useState(false);
  const [reachedTitle, setReachedTitle] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const a = SHOWCASE_ACTIVITIES[act];

  function differentOne() {
    setReached(false);
    setAct((i) => (i + 1) % SHOWCASE_ACTIVITIES.length);
  }

  /** Jump forward to the first activity outside the current category. */
  function skipArea() {
    setReached(false);
    setAct((i) => {
      const current = SHOWCASE_ACTIVITIES[i].category;
      for (let step = 1; step <= SHOWCASE_ACTIVITIES.length; step++) {
        const next = (i + step) % SHOWCASE_ACTIVITIES.length;
        if (SHOWCASE_ACTIVITIES[next].category !== current) return next;
      }
      return i;
    });
  }

  function markReached() {
    if (reached) return;
    setReachedTitle(a.title);
    setReached(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setReached(false);
      setAct((i) => (i + 1) % SHOWCASE_ACTIVITIES.length);
    }, 2800);
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="motion-safe:animate-[alGentleFloat_6s_ease-in-out_infinite]">
        <div className="relative overflow-hidden rounded-[22px] border border-white/50 bg-[rgba(247,245,238,0.86)] p-7 shadow-[0_28px_60px_-14px_rgba(45,58,46,0.32)] backdrop-blur-md max-md:p-6">
          {/* NEXT STOP · TOGETHER, with the live dot on the right */}
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-[11.5px] uppercase tracking-[0.16em] text-gold-dark"
              style={{ fontFamily: 'var(--font-catalog)' }}
            >
              Next stop &middot; Together
            </span>
            <span className="h-2 w-2 rounded-full bg-[#c4674a]" aria-hidden="true" />
          </div>

          <h2
            className="mb-3 text-[30px] font-bold leading-[1.12] tracking-[-0.01em] text-[#2b2a26] max-md:text-[26px]"
            style={{ fontFamily: 'var(--font-plate)' }}
          >
            {a.title}
          </h2>

          <p
            className="mb-2.5 text-[11.5px] uppercase tracking-[0.14em] text-gold-dark"
            style={{ fontFamily: 'var(--font-catalog)' }}
          >
            {a.category} &middot; {a.time}
          </p>

          <p className="mb-6 text-[15.5px] leading-[1.6] text-[#6b675e]">{a.blurb}</p>

          <Link
            href={`/shop/${a.slug}`}
            className="mb-2.5 flex w-full items-center justify-center rounded-[14px] bg-[#c4674a] px-6 py-4 text-[16.5px] font-semibold text-white shadow-[0_10px_22px_-10px_rgba(196,103,74,0.7)] transition-all duration-200 hover:bg-[#b25a3f] active:scale-[0.985]"
          >
            Open the guide &rarr;
          </Link>

          <button
            type="button"
            onClick={markReached}
            className="mb-5 flex w-full items-center justify-center rounded-[14px] border border-white/60 bg-white/55 px-6 py-4 text-[16.5px] font-semibold text-[#2b2a26] transition-all duration-200 hover:bg-white/80 active:scale-[0.985]"
          >
            &#10003; We reached it
          </button>

          <div
            className="flex items-center justify-center gap-3 text-[13px] text-[#6b675e]"
            style={{ fontFamily: 'var(--font-catalog)' }}
          >
            <button
              type="button"
              onClick={differentOne}
              className="underline underline-offset-4 transition-colors hover:text-[#2b2a26]"
            >
              Different one
            </button>
            <span aria-hidden="true">&middot;</span>
            <button
              type="button"
              onClick={skipArea}
              className="underline underline-offset-4 transition-colors hover:text-[#2b2a26]"
            >
              Skip this area
            </button>
          </div>

          {/* New Finds celebration, mirroring the real post-activity modal. */}
          {reached && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(247,245,238,0.97)] p-8 text-center motion-safe:animate-[alFade_300ms_cubic-bezier(0.22,1,0.36,1)]"
              role="status"
            >
              <span
                className="rounded-full bg-[#c4674a] px-[18px] py-2 text-[11.5px] uppercase tracking-[0.16em] text-white"
                style={{ fontFamily: 'var(--font-catalog)' }}
              >
                &#10022; New finds!
              </span>
              <p className="text-[15.5px] text-[#6b675e]">
                Earned doing <strong className="font-semibold text-[#2b2a26]">{reachedTitle}</strong>
              </p>
              <div className="flex w-full max-w-[300px] flex-col gap-2.5">
                {[
                  { who: 'Liam', find: 'Hammock' },
                  { who: 'Elena', find: 'Headlamp' },
                ].map((g) => (
                  <div
                    key={g.who}
                    className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 text-left shadow-[0_4px_12px_-2px_rgba(45,58,46,0.1)]"
                  >
                    <span>
                      <span
                        className="block text-[10.5px] uppercase tracking-[0.14em] text-gold-dark"
                        style={{ fontFamily: 'var(--font-catalog)' }}
                      >
                        {g.who}
                      </span>
                      <span className="block text-[15px] font-semibold text-[#2b2a26]">
                        {g.find}
                      </span>
                    </span>
                    <span
                      className="text-[10.5px] uppercase tracking-[0.1em] text-[#c4674a]"
                      style={{ fontFamily: 'var(--font-catalog)' }}
                    >
                      Big gear
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-[13.5px] text-gray-500">
        Try it. Pick a different one, or mark it reached.
      </p>
    </div>
  );
}
