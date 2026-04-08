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
    <div className="min-h-[60vh] bg-cream flex flex-col items-center justify-center px-5">
      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="font-display text-3xl md:text-4xl text-forest text-center leading-tight mb-3">
        Something went wrong
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        We hit a bump in the road. This usually fixes itself. Try again or head back to the shop.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="text-sm font-semibold py-3 px-6 rounded-xl bg-forest text-cream transition-all hover:bg-forest-dark cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/shop"
          className="text-sm font-semibold py-3 px-6 rounded-xl border-2 border-forest text-forest transition-all hover:bg-forest/5"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
