'use client';

import { useState } from 'react';
import { TRAIL_STEPS } from '@/lib/home-showcase';

/**
 * "It's a trail, not a to-do list" — three steps on the left, a screenshot of
 * that step on the right.
 *
 * Two layouts, because the desktop one breaks down on a phone: there the side
 * panel ends up hundreds of pixels below the picker, so tapping a step changes
 * an image you cannot see. On small screens the picture moves inside the open
 * step instead, directly under its body copy.
 *
 * Pictures are CSS backgrounds with `contain`, so a screenshot that hasn't been
 * dropped into /public/product-shots yet degrades to a soft cream panel rather
 * than breaking the build.
 */
export default function TrailSteps() {
  const [step, setStep] = useState(0);
  const active = TRAIL_STEPS[step];

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
                onClick={() => setStep(i)}
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

      {/* Desktop side panel. `contain`, not `cover`: these are real member-zone
          screenshots and cover was slicing ~45px off each side. */}
      <div className="hidden lg:block">
        <div
          role="img"
          aria-label={active.alt}
          className="aspect-[5/3] w-full rounded-[24px] border border-gray-200/70 bg-[#f7f5f0] bg-contain bg-no-repeat shadow-[0_28px_60px_-14px_rgba(88,129,87,0.24)] transition-all duration-300"
          style={{
            backgroundImage: `url('${active.img}')`,
            backgroundPosition: active.pos,
          }}
        />
        <p className="mt-3.5 text-center text-[13.5px] text-gray-500">Pick a step to see it.</p>
      </div>
    </div>
  );
}
