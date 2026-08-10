'use client';

import { useEffect, useState } from 'react';
import { TRAIL_STEPS } from '@/lib/home-showcase';

/**
 * The moving picture beside "It's a trail, not a to-do list".
 *
 * Each beat plays a click: the trail sits there, the cursor travels to a
 * control, then the frame that click produces cross-fades in. Both frames are
 * real member-zone captures from /public/product-shots. An earlier pass
 * recreated the interface in HTML so it could animate freely; it read as the
 * product at a glance and fell apart on a second look, which is worse than a
 * still when the panel's whole job is showing what someone is buying.
 *
 * Frames and cursor targets live in TRAIL_STEPS (lib/home-showcase.ts), so
 * adding a beat or dropping in a new capture never touches this file. A step
 * with no `after` holds on its before frame, which is what a missing capture
 * should look like rather than an invented screen.
 *
 * Not embedded as a video or a hosted demo, for three reasons: the site CSP
 * allows frames only from Stripe, Clerk, Cloudflare and Google, so any embed
 * needs a policy change and loads a player; the captions stay real text that
 * crawlers and screen readers can reach; and changing one is a file swap
 * rather than a re-record.
 */

/** Cursor travel before the click lands. The parent holds each beat longer. */
const AIM_MS = 1600;

export default function TrailDemo({ step }: { step: number }) {
  const beat = Math.max(0, Math.min(TRAIL_STEPS.length - 1, step));
  const st = TRAIL_STEPS[beat];
  const [clicked, setClicked] = useState(false);

  // Every beat restarts from the before frame, including one the visitor
  // picked, so choosing a step replays the click rather than dropping them at
  // the end of it.
  useEffect(() => {
    setClicked(false);
    const t = setTimeout(() => setClicked(true), AIM_MS);
    return () => clearTimeout(t);
  }, [beat]);

  const showAfter = clicked && !!st.after;

  return (
    <div className="relative aspect-[5/3] w-full overflow-hidden rounded-[24px] border border-gray-200/70 bg-[#f7f5f0] shadow-[0_28px_60px_-14px_rgba(88,129,87,0.24)]">
      {/* The trail, always underneath. Every beat starts here. */}
      <div
        role="img"
        aria-label={showAfter ? (st.afterAlt ?? st.alt) : st.alt}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${st.img}')` }}
      />

      {/* Every after-frame stays mounted and cross-fades over the top. Swapping
          a single src would flash the cream panel on each beat while the next
          file decodes. */}
      {TRAIL_STEPS.map((s, i) =>
        s.after ? (
          <div
            key={s.after}
            aria-hidden="true"
            className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-500 ease-out ${
              i === beat && showAfter ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${s.after}')` }}
          />
        ) : null,
      )}

      {/* The pointer. Drawn as an arrow rather than a dot, which at this size
          reads as a stray bullet. White fill with a dark stroke so it holds up
          over sky, hillside and the cream cards alike. It presses in on the
          click, then gets out of the way so the result is what you look at. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute z-10 w-[3%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden ${
          clicked ? 'scale-[0.82] opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ left: `${st.cursor.x}%`, top: `${st.cursor.y}%` }}
      >
        <path
          d="M5 2.5 L5 19 L9.2 15.1 L11.9 21.3 L14.9 20 L12.2 13.9 L18 13.6 Z"
          fill="#fffdf9"
          stroke="#2f3a2e"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      {/* A ring pulsing out from where the cursor landed, so the click reads as
          a click even when the frame behind it barely changes. */}
      {clicked && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-[9] block h-[6%] w-[3.7%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c4674a] motion-safe:animate-[alPing_700ms_cubic-bezier(0,0,0.2,1)] motion-reduce:hidden"
          style={{ left: `${st.cursor.x}%`, top: `${st.cursor.y}%`, opacity: 0 }}
        />
      )}
    </div>
  );
}
