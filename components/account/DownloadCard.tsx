'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/categories';

export interface DownloadCardProps {
  productId: string;
  productName: string;
  slug: string;
  shortDescription: string;
  imageUrl: string | null;
  purchasedAt: Date | string;
  productCategory: string;
  ageRange: string | null;
  activityCount: number | null;
  isBundle: boolean;
  blobUrl: string;
  showReviewPrompt: boolean;
}

const coverClasses: Record<string, string> = {
  'ai-literacy': 'cover-ai-literacy',
  'creativity-anywhere': 'cover-creativity-anywhere',
  'communication-writing': 'cover-communication-writing',
  'outdoor-learning': 'cover-outdoor-learning',
  'real-world-math': 'cover-real-world-math',
  'entrepreneurship': 'cover-entrepreneurship',
  'planning-problem-solving': 'cover-planning-problem-solving',
  'start-here': 'cover-start-here',
  bundle: 'cover-bundle',
};

export default function DownloadCard({
  productId,
  productName,
  slug,
  shortDescription,
  imageUrl,
  purchasedAt,
  productCategory,
  ageRange,
  activityCount,
  isBundle,
  blobUrl,
  showReviewPrompt,
}: DownloadCardProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const coverClass = coverClasses[productCategory] || 'cover-outdoor-learning';
  const categoryLabel = CATEGORY_LABELS[productCategory] || productCategory;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-forest/15 transition-all">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Thumbnail */}
        <div className={`w-16 h-20 sm:w-18 sm:h-22 rounded-xl flex-shrink-0 overflow-hidden ${coverClass}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              width={72}
              height={88}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="flex items-center justify-center h-full text-cream/80 text-xs font-bold tracking-wider">
              PDF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isBundle && (
                  <span className="text-[10px] font-bold bg-gold/15 text-gold-dark px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Bundle
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
                {productName}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1 mt-0.5 hidden sm:block">
                {shortDescription}
              </p>
            </div>

            {/* View + Download buttons - desktop (not for bundles) */}
            {!isBundle && (
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(blobUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium py-2.5 px-4 rounded-xl transition-all text-sm border border-forest/20 text-forest hover:bg-forest/5"
                  aria-label={`View ${productName} in browser`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View
                </a>
                <a
                  href={`/api/download/${productId}`}
                  onClick={handleDownload}
                  className={`inline-flex items-center gap-1.5 font-medium py-2.5 px-4 rounded-xl transition-all text-sm ${
                    downloaded
                      ? 'bg-forest/10 text-forest'
                      : 'bg-forest hover:bg-forest-dark text-cream'
                  }`}
                  aria-label={`Download ${productName} as PDF`}
                >
                  {downloaded ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Done
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download
                    </>
                  )}
                </a>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
            {ageRange && <span>Ages {ageRange}</span>}
            {activityCount && <span>{activityCount} activities</span>}
            <span>Purchased {formatDate(purchasedAt)}</span>
          </div>
        </div>
      </div>

      {/* Mobile View + Download buttons (not for bundles) */}
      {!isBundle && (
        <div className="sm:hidden flex gap-2 mt-3">
          <a
            href={`https://docs.google.com/gview?url=${encodeURIComponent(blobUrl)}&embedded=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all text-sm border border-forest/20 text-forest hover:bg-forest/5"
            aria-label={`View ${productName} in browser`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View
          </a>
          <a
            href={`/api/download/${productId}`}
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all text-sm ${
              downloaded
                ? 'bg-forest/10 text-forest'
                : 'bg-forest hover:bg-forest-dark text-cream'
            }`}
            aria-label={`Download ${productName} as PDF`}
          >
            {downloaded ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Done
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </>
            )}
          </a>
        </div>
      )}

      {/* Bundle note - individual packs listed separately */}
      {isBundle && (
        <p className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-400">
          Each pack in this bundle is listed separately in your downloads.
        </p>
      )}

      {/* Review prompt (not for bundles) */}
      {showReviewPrompt && !isBundle && (
        <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-400">
          Enjoying this pack?{' '}
          <Link
            href={`/shop/${slug}#reviews`}
            className="text-forest hover:text-forest-dark underline underline-offset-2 transition-colors"
          >
            Share your experience
          </Link>
        </div>
      )}
    </div>
  );
}
