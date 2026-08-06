'use client';

import { useState } from 'react';
import { TRAIL_STEPS } from '@/lib/home-showcase';

/**
 * "It's a trail, not a to-do list" — three steps on the left, a screenshot of
 * that step on the right. Picking a step expands its body copy and swaps the
 * panel image.
 *
 * The panel is a CSS background rather than <Image> so a screenshot that hasn't
 * been dropped into /public/product-shots yet degrades to a soft cream panel
 * instead of breaking the build.
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
            <button
              key={st.n}
              type="button"
              onClick={() => setStep(i)}
              aria-expanded={on}
              className={`flex gap-4 rounded-[20px] border p-6 text-left transition-all duration-300 ${
                on
                  ? 'border-forest/35 bg-white shadow-[0_12px_28px_-8px_rgba(88,129,87,0.18)]'
                  : 'border-gray-200/70 bg-white/45 hover:bg-white/70'
              }`}
            >
              <span
                className={`inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[14.5px] font-semibold transition-all duration-300 ${
                  on ? 'bg-forest text-cream' : 'bg-forest/[0.14] text-forest'
                }`}
              >
                {st.n}
              </span>
              <span className="block">
                <span className="mb-1.5 block text-xl font-semibold text-gray-900">
                  {st.title}
                </span>
                <span
                  className={`block overflow-hidden text-[15.5px] leading-[1.6] transition-all duration-300 ${
                    on ? 'max-h-[160px] text-gray-600' : 'max-h-0 text-gray-400'
                  }`}
                >
                  {st.body}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {/* `contain`, not `cover`: these are real member-zone screenshots, and
            cover was slicing ~45px off each side, cutting into the trail title
            and the activity card. The 5/3 box matches the captures closely
            enough that there is almost no letterbox. */}
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
