'use client';

import { useEffect, useState } from 'react';

/**
 * The moving picture beside "It's a trail, not a to-do list".
 *
 * Three beats matching the three steps, and each beat plays twice over: the
 * cursor lands on a control (`aim`), then the panel shows what that click did
 * (`result`). Showing only the click was the earlier version's mistake — a
 * highlight on a button nobody has used doesn't tell you what the product does.
 *
 * Built in the page rather than embedded as a video or a third-party demo, for
 * four reasons that all matter here:
 *
 *   - The site CSP allows frames only from Stripe, Clerk, Cloudflare and
 *     Google, so any embed needs a policy change and loads a player.
 *   - It stays sharp at any size, being the same vector the hero uses.
 *   - The captions are real text, so they're readable by crawlers and screen
 *     readers instead of baked into pixels.
 *   - Changing a word is an edit, not a re-record.
 *
 * The backdrop is /product-shots/app-trail.svg, generated from the Highland
 * Peaks scene in components/account/AdventureMapHome.tsx. Same caveat as the
 * hero: it's a copy, so a redesign of that scene means regenerating the SVG.
 * The controls on top are recreated here, not screenshotted, so they can move,
 * highlight and open.
 *
 * Positions are percentages inside an 8:5 box, matching the SVG's own
 * 1600x1000, so nothing drifts as the panel resizes.
 */

/** Cursor travel, then the pause on the result. Sums to the parent's beat. */
const AIM_MS = 1500;

const STOPS = {
  before: { title: 'Party Planner Math', meta: 'Real-World Math · Multi-day' },
  after: { title: 'Outdoor STEM Challenge', meta: 'Science & Nature · One afternoon' },
} as const;

/** Where the cursor sits while aiming, as a % of the 8:5 box. */
const CURSOR = [
  { x: 13, y: 12 },
  { x: 76, y: 78 },
  { x: 76, y: 65 },
] as const;

const LABELS = [
  'An explorer opened, showing what you can change for that child',
  'The next stop swapped for a different activity',
  'An activity marked as reached, earning a new find for the backpack',
];

export default function TrailDemo({ step }: { step: number }) {
  const beat = Math.max(0, Math.min(2, step));
  const [phase, setPhase] = useState<'aim' | 'result'>('aim');

  // Every beat restarts at the click, including one the visitor picked, so
  // choosing a step replays it rather than dropping them at the end.
  useEffect(() => {
    setPhase('aim');
    const t = setTimeout(() => setPhase('result'), AIM_MS);
    return () => clearTimeout(t);
  }, [beat]);

  const done = phase === 'result';
  const stop = beat === 1 && done ? STOPS.after : beat === 2 ? STOPS.after : STOPS.before;

  return (
    <div
      className="relative aspect-[8/5] w-full overflow-hidden rounded-[24px] border border-gray-200/70 bg-[#f7f5f0] bg-contain bg-center bg-no-repeat shadow-[0_28px_60px_-14px_rgba(88,129,87,0.24)]"
      style={{ backgroundImage: "url('/product-shots/app-trail.svg')" }}
      role="img"
      aria-label={LABELS[beat]}
    >
      {/* Explorer chips, top left. Sized in em off a % font size so the row
          keeps its proportions at any column width; nowrap because
          "+ Explorer" wrapping shunts the row onto two lines over the sky. */}
      <div className="absolute left-[3.5%] top-[5.5%] flex gap-[1.2%]">
        {['Liam', 'Elena', '+ Explorer'].map((name, i) => {
          const on = i === 0;
          return (
            <span
              key={name}
              className={`whitespace-nowrap rounded-full px-[0.9em] py-[0.34em] text-[max(7px,0.62vw)] font-semibold uppercase tracking-[0.07em] transition-all duration-500 ${
                on
                  ? 'bg-[#c4674a] text-cream shadow-[0_3px_9px_-3px_rgba(196,103,74,0.7)]'
                  : 'bg-white/85 text-[#6b675e]'
              } ${beat === 0 && !done && i === 0 ? 'scale-[1.14] shadow-[0_0_0_4px_rgba(196,103,74,0.25)]' : ''}`}
            >
              {name}
            </span>
          );
        })}
      </div>

      {/* BEAT 1 result: the explorer opens. This is the answer to "what can I
          change about my kid?" — the three things, named. */}
      {beat === 0 && done && (
        <div className="absolute left-[6%] top-[20%] w-[41%] rounded-[10px] bg-[#faf7f0]/97 p-[2.4%] shadow-[0_14px_32px_-12px_rgba(60,50,30,0.5)] motion-safe:animate-[alFade_420ms_cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex items-center gap-[4%]">
            <span className="grid h-[max(20px,2.6vw)] w-[max(20px,2.6vw)] flex-none place-items-center rounded-full bg-[#e8eee4] text-[max(9px,1vw)]">
              🥾
            </span>
            <span className="text-[max(9px,0.95vw)] font-bold text-[#2f3a2e]">Liam, 9</span>
          </div>
          {['Look inside the backpack', 'Change the explorer', 'Doing on their own'].map((o) => (
            <div
              key={o}
              className="mt-[3.5%] rounded-[6px] bg-white/90 px-[4%] py-[3%] text-[max(7px,0.7vw)] font-semibold text-[#4a4740]"
            >
              {o}
            </div>
          ))}
        </div>
      )}

      {/* BEAT 3 result: the find you earn for finishing. */}
      {beat === 2 && done && (
        <div className="absolute left-[6%] top-[22%] w-[36%] rounded-[10px] bg-[#faf7f0]/97 p-[2.6%] text-center shadow-[0_14px_32px_-12px_rgba(60,50,30,0.5)] motion-safe:animate-[alFade_420ms_cubic-bezier(0.22,1,0.36,1)]">
          <div className="text-[max(6px,0.62vw)] font-semibold uppercase tracking-[0.14em] text-[#b5803e]">
            New find
          </div>
          <div className="mt-[3%] text-[max(16px,2.2vw)] leading-none">🧭</div>
          <div className="mt-[3%] text-[max(8px,0.85vw)] font-bold text-[#2f3a2e]">
            Added to the backpack
          </div>
          <div className="mt-[2%] text-[max(6px,0.62vw)] text-[#6b675e]">23 of 72 found</div>
          <div className="mt-[5%] rounded-[6px] bg-[#c4674a] py-[4%] text-[max(7px,0.72vw)] font-bold text-cream">
            Nice!
          </div>
        </div>
      )}

      {/* Next-stop card, bottom right. */}
      <div className="absolute bottom-[6%] right-[3.5%] w-[38%] rounded-[10px] bg-[#faf7f0]/95 p-[2.2%] shadow-[0_10px_26px_-10px_rgba(60,50,30,0.45)] backdrop-blur-[2px]">
        <div className="text-[max(6px,0.62vw)] font-semibold uppercase tracking-[0.14em] text-[#b5803e]">
          Next stop · Together
        </div>
        <div
          key={stop.title}
          className="mt-[3%] text-[max(10px,1.05vw)] font-bold leading-tight text-[#2f3a2e] motion-safe:animate-[alFade_500ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          {stop.title}
        </div>
        <div className="mt-[2%] text-[max(6px,0.6vw)] font-semibold uppercase tracking-[0.1em] text-[#b5803e]">
          {stop.meta}
        </div>

        <div className="mt-[6%] rounded-[6px] bg-[#c4674a] py-[3.5%] text-center text-[max(7px,0.72vw)] font-bold text-cream">
          Open the guide →
        </div>

        <div
          className={`mt-[3.5%] rounded-[6px] py-[3.5%] text-center text-[max(7px,0.72vw)] font-bold transition-all duration-500 ${
            beat === 2
              ? 'bg-[#588157] text-cream' + (done ? '' : ' shadow-[0_0_0_4px_rgba(88,129,87,0.25)]')
              : 'bg-white text-[#3d5c3b]'
          }`}
        >
          {beat === 2 && done ? '✓ Reached it' : '✓ We reached it'}
        </div>

        <div className="mt-[4%] flex justify-center gap-[6%] text-[max(6px,0.62vw)] text-[#6b675e] underline">
          <span
            className={`transition-all duration-500 ${
              beat === 1 && !done
                ? 'rounded-[3px] bg-[#588157]/20 px-1 font-semibold text-[#3d5c3b] no-underline shadow-[0_0_0_3px_rgba(88,129,87,0.25)]'
                : ''
            }`}
          >
            Different one
          </span>
          <span>Skip this area</span>
        </div>
      </div>

      {/* The pointer. Drawn as a real arrow rather than a dot: at this size a
          dot reads as a stray bullet, and the point is that someone clicked.
          White fill with a dark stroke so it holds up over sky, hill and card.
          It fades once the click has landed, so the result is what you look at. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute z-10 w-[3.2%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden ${
          done ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
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
