'use client';

import { useState } from 'react';
import { joinFaqs } from '@/lib/join-faqs';

export default function JoinFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[760px] border-t border-gray-200">
      {joinFaqs.map((faq, i) => (
        <div key={i} className="border-b border-gray-200">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-start justify-between gap-6 py-5 px-1 text-left"
            aria-expanded={openIndex === i}
          >
            <span className="font-display text-[22px] leading-[1.3] tracking-tight text-gray-900">
              {faq.q}
            </span>
            <span
              className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                openIndex === i
                  ? 'rotate-45 border-forest bg-forest text-cream'
                  : 'border-[#d4c4a8] text-gray-500'
              }`}
            >
              +
            </span>
          </button>
          {openIndex === i && (
            <div className="px-1 pb-6 text-[16.5px] leading-relaxed text-gray-500 max-w-[660px]">
              <p>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
