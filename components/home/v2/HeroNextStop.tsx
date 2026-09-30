'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Shrink an element's font until its single line fits (keeps the card one size). */
function fitLine(el: HTMLElement | null, min: number) {
  if (!el) return;
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > el.clientWidth + 1 && size > min) {
    size -= 0.5;
    el.style.fontSize = `${size}px`;
  }
}
import { SHOWCASE_ACTIVITIES } from '@/lib/home-showcase';

/**
 * The hero's "Next stop" card: a faithful copy of the real card members see on
 * their trail map, sitting on top of the faded trail illustration behind it.
 *
 * Deliberately mirrors the member UI's layout and actions rather than inventing
 * a marketing card, so the homepage shows the actual product. Typography stays
 * on the marketing site's DM Sans though: the member world's Bricolage and
 * JetBrains Mono read as a foreign page element next to every other section.
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const blurbRef = useRef<HTMLParagraphElement>(null);
  // One line each for the title and the blurb, whatever the activity, so the
  // card never changes size (a longer one just sets a touch smaller).
  useLayoutEffect(() => {
    const fit = () => { fitLine(titleRef.current, 16); fitLine(blurbRef.current, 13); };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [act]);

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
    <div className="w-full max-w-[420px] lg:w-[340px]">
      <div className="relative motion-safe:animate-[alGentleFloat_6s_ease-in-out_infinite]">
        {/* Says what this card is before anyone clicks it */}
        <span className="absolute -top-3.5 left-6 z-10 -rotate-2 bg-[#FBF3DC] px-3 py-1 text-[12.5px] font-semibold text-forest-dark shadow-[0_6px_14px_-8px_rgba(45,58,46,0.6)]">
          Try it: this is what members see
        </span>
        <div className="relative overflow-hidden rounded-[22px] border border-white/50 bg-[rgba(247,245,238,0.86)] p-7 shadow-[0_28px_60px_-14px_rgba(45,58,46,0.32)] backdrop-blur-md max-md:p-6">
          {/* NEXT STOP · TOGETHER, with the live dot on the right */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-gold-dark">
              Next stop &middot; Together
            </span>
            <span className="h-2 w-2 rounded-full bg-[#c4674a]" aria-hidden="true" />
          </div>

          <h2
            ref={titleRef}
            className="mb-3 overflow-hidden whitespace-nowrap text-[30px] font-semibold leading-[34px] tracking-[-0.01em] text-[#2b2a26] max-md:text-[26px]"
          >
            {a.title}
          </h2>

          <p
            className="mb-2.5 truncate text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold-dark"
          >
            {a.category} &middot; {a.time}
          </p>

          <p ref={blurbRef} className="mb-6 overflow-hidden whitespace-nowrap text-[15.5px] leading-[25px] text-[#6b675e]">{a.blurb}</p>

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
          >
            <button
              type="button"
              onClick={differentOne}
              className="underline underline-offset-4 transition-colors hover:text-[#2b2a26] relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']"
            >
              Different one
            </button>
            <span aria-hidden="true">&middot;</span>
            <button
              type="button"
              onClick={skipArea}
              className="underline underline-offset-4 transition-colors hover:text-[#2b2a26] relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']"
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
                className="rounded-full bg-[#c4674a] px-[18px] py-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white"
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
                        className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold-dark"
                      >
                        {g.who}
                      </span>
                      <span className="block text-[15px] font-semibold text-[#2b2a26]">
                        {g.find}
                      </span>
                    </span>
                    <span
                      className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#c4674a]"
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
        Open it, pick a different one, or mark it reached.
      </p>
    </div>
  );
}
