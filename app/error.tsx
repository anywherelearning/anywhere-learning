'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error.digest);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-5">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#d4a373]/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" style={{ color: '#d4a373' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>

      {/* Message */}
      <h1 className="font-display text-3xl md:text-4xl text-center leading-tight mb-3" style={{ color: '#588157' }}>
        Something went wrong
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        We hit a bump in the road. This usually fixes itself &mdash; try again or head back to the shop.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="text-sm font-semibold py-3 px-6 rounded-xl transition-all text-white cursor-pointer"
          style={{ backgroundColor: '#588157' }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-sm font-semibold py-3 px-6 rounded-xl border-2 transition-all"
          style={{ borderColor: '#588157', color: '#588157' }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
