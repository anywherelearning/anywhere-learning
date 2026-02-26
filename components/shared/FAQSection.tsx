'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

export default function FAQSection({ items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-forest"
            aria-expanded={openIndex === i}
          >
            <span className="pr-4 text-base font-semibold text-gray-900">
              {item.question}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`shrink-0 text-forest transition-transform ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            >
              <path d="M5 7.5L10 12.5L15 7.5" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="pb-5">
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
