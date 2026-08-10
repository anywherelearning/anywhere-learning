'use client';

import { useEffect, useRef, useState } from 'react';
import { TRAIL_STEPS } from '@/lib/home-showcase';
import TrailDemo from './TrailDemo';

/**
 * How long each beat holds before the demo moves itself on. Each beat spends
 * its first 1.5s aiming the cursor (see TrailDemo), so this leaves ~3.5s on the
 * result, which is the part worth reading.
 */
const BEAT_MS = 5000;

/**
 * "It's a trail, not a to-do list" — three steps on the left, the matching beat
 * of the product playing on the right.
 *
 * The panel advances itself, so a visitor who never clicks still sees all three
 * steps. Clicking a step takes over: the timer stops for good, because an
 * auto-advance that fights the person reading is worse than no motion at all.
 * Hovering pauses without taking over, for anyone mid-sentence.
 *
 * Two layouts, because the desktop one breaks down on a phone: there the side
 * panel ends up hundreds of pixels below the picker, so tapping a step changes
 * an image you cannot see. On small screens the picture moves inside the open
 * step instead, directly under its body copy. Phones keep the still
 * screenshots: three of them stacked in the open step is the wrong place for a
 * looping animation, and it saves the work on a battery.
 */
export default function TrailSteps() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const takenOver = useRef(false);

  useEffect(() => {
    if (paused || takenOver.current) return;
    // Motion is decoration here, so anyone who asked for less doesn't get a
    // panel cycling on its own. The step buttons still work.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % TRAIL_STEPS.length), BEAT_MS);
    return () => clearTimeout(t);
  }, [step, paused]);

  function pick(i: number) {
    takenOver.current = true;
    setStep(i);
  }

  return (
    <div className="grid grid-cols-1 items-center gap-11 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="flex flex-col gap-3.5">
        {TRAIL_STEPS.map((st, i) => {
          const on = step === i;
          return (
            <div
              key={st.n}
              className={`rounded-[20px] border transition-all duration-300 ${
                on
                  ? 'border-forest/35 bg-white shadow-[0_12px_28px_-8px_rgba(88,129,87,0.18)]'
                  : 'border-gray-200/70 bg-white/45'
              }`}
            >
              <button
                type="button"
                onClick={() => pick(i)}
                aria-expanded={on}
                aria-controls={`trail-step-${i}`}
                className="flex w-full gap-4 p-6 text-left"
              >
                <span
                  className={`inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[14.5px] font-semibold transition-all duration-300 ${
                    on ? 'bg-forest text-cream' : 'bg-forest/[0.14] text-forest'
                  }`}
                >
                  {st.n}
                </span>
                <span className="block text-xl font-semibold text-gray-900">{st.title}</span>
              </button>

              <div id={`trail-step-${i}`} hidden={!on} className="px-6 pb-6">
                <p className="text-[15.5px] leading-[1.6] text-gray-600">{st.body}</p>
                {/* Phones only: the picture belongs with the step it describes,
                    since the side panel is off-screen at this width. */}
                <div
                  role="img"
                  aria-label={st.alt}
                  className="mt-4 aspect-[5/3] w-full rounded-2xl border border-gray-200/70 bg-[#f7f5f0] bg-contain bg-center bg-no-repeat lg:hidden"
                  style={{ backgroundImage: `url('${st.img}')` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop side panel: the demo, playing itself. */}
      <div
        className="hidden lg:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <TrailDemo step={step} />
        <p className="mt-3.5 text-center text-[13.5px] text-gray-500">
          Playing. Pick a step to steer it.
        </p>
      </div>
    </div>
  );
}
