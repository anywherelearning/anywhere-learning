'use client';

import Link from 'next/link';
import { usePassMember } from '@/hooks/usePassMember';

export default function AnnualPassNudge() {
  const { active, loading } = usePassMember();

  // Don't show for members or while loading
  if (loading || active) return null;

  return (
    <div className="mt-4 bg-gold/10 border border-gold/20 rounded-xl p-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-forest">
          Or get this and every other guide
        </p>
        <p className="text-sm text-gray-600 mt-0.5">
          The Annual Pass includes all 90+ guides for $99/year.{' '}
          <Link
            href="/annual-pass"
            className="text-forest font-medium underline underline-offset-2 hover:text-forest-dark transition-colors"
          >
            Learn more &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
