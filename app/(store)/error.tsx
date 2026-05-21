'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Store error:', error.digest);
  }, [error]);

  return (
    <main className="bg-cream min-h-[70vh]">
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 text-center">
        <div className="max-w-[680px] mx-auto px-6">
          <h1 className="font-display italic text-[clamp(3.5rem,7.4vw,4.5rem)] leading-[1.04] tracking-tight text-balance text-[#C97B5C]">
            Something broke.
          </h1>
          <svg
            className="block mx-auto mt-5 text-[#C97B5C]"
            width="80"
            height="10"
            viewBox="0 0 80 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2 6 Q 14 1, 26 5 T 50 5 T 78 6" />
          </svg>
          <p className="mt-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Error reference{error.digest ? ` · ${error.digest}` : ' · 500'}
          </p>
          <p className="mt-8 max-w-[540px] mx-auto text-[18px] leading-[1.6] text-gray-600 text-pretty">
            Something on our end isn&apos;t working as it should. This is rare, and it&apos;s not
            your fault. Try refreshing the page — that fixes it most of the time. If not, head
            home and we&apos;ll dig into what happened.
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="px-6 pb-2 flex flex-col sm:flex-row sm:justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-forest text-cream font-semibold text-[15.5px] px-7 py-3.5 rounded-full shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 4 21 10 15 10" />
          </svg>
          Refresh this page
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-transparent text-forest-dark font-semibold text-[15px] px-6 py-3 rounded-full border-[1.5px] border-forest hover:bg-[#E6EBDF] transition-colors"
        >
          Go back home <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Help callout */}
      <div className="mt-12 mb-20 mx-auto max-w-[560px] px-6">
        <div className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-xl px-7 py-6 text-center shadow-[0_14px_26px_-22px_rgba(45,58,46,0.2)]">
          <p className="font-display italic text-[16px] text-[#C97B5C] mb-3">Still broken?</p>
          <p className="text-[15.5px] leading-[1.55] text-gray-600 m-0">
            Email{' '}
            <a
              className="text-forest-dark font-medium border-b border-transparent hover:text-forest hover:border-forest transition-colors"
              href="mailto:info@anywherelearning.co"
            >
              info@anywherelearning.co
            </a>{' '}
            with a brief description of what you were doing when this happened. Amelie reads
            every email and we&apos;ll get it sorted within 24 hours.
          </p>
        </div>
      </div>
    </main>
  );
}
