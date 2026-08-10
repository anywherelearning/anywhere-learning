'use client';

import { useEffect, useState } from 'react';
import { TRAIL_STEPS } from '@/lib/home-showcase';

/**
 * The moving picture beside "It's a trail, not a to-do list".
 *
 * These are the real member-zone captures in /public/product-shots, the same
 * three the static version used, now cross-faded with a cursor that lands on
 * the control each frame is about. An earlier pass recreated the interface in
 * HTML so it could animate properly; it looked close but it wasn't the product,
 * and "close" is worse than a still. Real pixels, borrowed motion.
 *
 * Not embedded as a video or a hosted demo, for three reasons: the site CSP
 * allows frames only from Stripe, Clerk, Cloudflare and Google, so any embed
 * needs a policy change and loads a player; the captions stay real text that
 * crawlers and screen readers can reach; and changing one is a file swap rather
 * than a re-record.
 *
 * Adding or reordering a beat means editing TRAIL_STEPS in lib/home-showcase.ts
 * and adding a matching entry to CURSOR below. The cursor rests on whatever
 * that frame is about, as a percentage of the panel, so it holds position as
 * the panel resizes.
 */

/** How long the cursor takes to arrive before the frame settles. */
const AIM_MS = 900;

/** Per beat, where the cursor rests. Percentages of the panel box. */
const CURSOR = [
  { x: 60, y: 41 }, // "Change the explorer", in the open explorer card
  { x: 78, y: 62 }, // the next-stop card
  { x: 47, y: 63 }, // the "Nice!" button on the new-finds popup
] as const;

export default function TrailDemo({ step }: { step: number }) {
  const beat = Math.max(0, Math.min(TRAIL_STEPS.length - 1, step));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    const t = setTimeout(() => setSettled(true), AIM_MS);
    return () => clearTimeout(t);
  }, [beat]);

  return (
    <div className="relative aspect-[5/3] w-full overflow-hidden rounded-[24px] border border-gray-200/70 bg-[#f7f5f0] shadow-[0_28px_60px_-14px_rgba(88,129,87,0.24)]">
      {/* Every frame stays mounted and cross-fades. Swapping a single src would
          flash the cream panel on each beat while the next file decodes. */}
      {TRAIL_STEPS.map((st, i) => (
        <div
          key={st.img}
          role="img"
          aria-label={st.alt}
          aria-hidden={i !== beat}
          className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-700 ease-out ${
            i === beat ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${st.img}')` }}
        />
      ))}

      {/* The pointer. Drawn as an arrow rather than a dot, which at this size
          reads as a stray bullet. White fill with a dark stroke so it holds up
          over sky, hillside and the cream cards alike. It eases in as the frame
          settles, so the eye lands on the control rather than chasing it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute z-10 w-[3%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden ${
          settled ? 'scale-100 opacity-100' : 'scale-[1.35] opacity-0'
        }`}
        style={{ left: `${CURSOR[beat].x}%`, top: `${CURSOR[beat].y}%` }}
      >
        <path
          d="M5 2.5 L5 19 L9.2 15.1 L11.9 21.3 L14.9 20 L12.2 13.9 L18 13.6 Z"
          fill="#fffdf9"
          stroke="#2f3a2e"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
