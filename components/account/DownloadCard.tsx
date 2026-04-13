'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS, coverClassFor } from '@/lib/categories';
import {
  DownloadIcon,
  EyeIcon,
  ChevronRightIcon,
} from '@/components/shop/icons';

export interface BundleChild {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  viewUrl: string;
  downloadUrl: string;
}

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
  /** Direct Vercel Blob URL for inline viewing. Bypasses the API for instant opens. */
  viewUrl: string;
  /** Direct Vercel Blob URL with ?download=1 appended for save-to-device. */
  downloadUrl: string;
  showReviewPrompt: boolean;
  bundleChildren?: BundleChild[];
}

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
  viewUrl,
  downloadUrl,
  showReviewPrompt,
  bundleChildren,
}: DownloadCardProps) {
  const [bundleOpen, setBundleOpen] = useState(false);

  // Prefetch the PDF bytes into the browser HTTP cache as soon as the user
  // hovers, focuses, or taps the Open Guide button. The ~100-300ms between
  // intent and click is usually enough to fully download a guide, so by the
  // time the new tab opens, the PDF viewer already has its bytes and renders
  // immediately instead of showing a loading spinner.
  //
  // useRef (not useState) so the prefetch flag doesn't trigger re-renders.
  // mode: 'no-cors' lets us warm the cache without needing CORS headers.
  const prefetchedRef = useRef(false);
  const prefetchPdf = useCallback(() => {
    if (prefetchedRef.current || !viewUrl) return;
    prefetchedRef.current = true;
    fetch(viewUrl, { mode: 'no-cors', credentials: 'omit' }).catch(() => {});
  }, [viewUrl]);

  const coverClass = coverClassFor(productCategory);
  const categoryLabel = CATEGORY_LABELS[productCategory] || productCategory;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-forest/15 transition-all">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Thumbnail */}
        <div className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex-shrink-0 overflow-hidden ${coverClass}`}>
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
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isBundle && productCategory !== 'bundle' && (
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

            {/* Open Guide - desktop (not for bundles).
                Direct link to the Blob CDN. Prefetches on hover/focus so
                the PDF is already cached by the time the user clicks. */}
            {!isBundle && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={prefetchPdf}
                onFocus={prefetchPdf}
                onTouchStart={prefetchPdf}
                className="hidden sm:inline-flex items-center gap-1.5 font-semibold py-2.5 px-5 rounded-xl transition-all text-sm bg-forest hover:bg-forest-dark text-cream flex-shrink-0"
                aria-label={`Open ${productName} in a new tab`}
              >
                <EyeIcon />
                Open Guide
              </a>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-600">
            {ageRange && <span>{ageRange}</span>}
            {activityCount && <span>{activityCount} activities</span>}
            <span>Purchased {formatDate(purchasedAt)}</span>
          </div>
        </div>
      </div>

      {/* Mobile Open Guide primary (not for bundles).
          Prefetches on touchstart so the PDF is warming while the tap
          animation plays. */}
      {!isBundle && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={prefetchPdf}
          onFocus={prefetchPdf}
          onTouchStart={prefetchPdf}
          className="sm:hidden mt-3 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all text-sm bg-forest hover:bg-forest-dark text-cream w-full"
          aria-label={`Open ${productName} in a new tab`}
        >
          <EyeIcon />
          Open Guide
        </a>
      )}

      {/* Save to device - secondary text link, centered with breathing
          room below the primary action. Same pattern on desktop and
          mobile so it never feels cramped. */}
      {!isBundle && (
        <div className="mt-3 flex justify-center sm:justify-end">
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-forest transition-colors py-1"
            aria-label={`Save ${productName} to your device`}
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            Save to device
          </a>
        </div>
      )}

      {/* Bundle children dropdown */}
      {isBundle && bundleChildren && bundleChildren.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={() => setBundleOpen(!bundleOpen)}
            aria-expanded={bundleOpen}
            aria-controls={`bundle-children-${productId}`}
            aria-label={`${bundleOpen ? 'Hide' : 'Show'} ${bundleChildren.length} guides in this bundle`}
            className="flex items-center gap-2 text-sm font-medium text-forest hover:text-forest-dark transition-colors w-full"
          >
            <ChevronRightIcon
              className={`w-4 h-4 transition-transform duration-200 ${bundleOpen ? 'rotate-90' : ''}`}
            />
            {bundleOpen ? 'Hide' : 'Show'} {bundleChildren.length} guides in this bundle
          </button>

          {bundleOpen && (
            <div id={`bundle-children-${productId}`} className="mt-3 space-y-2">
              {bundleChildren.map((child) => (
                <div
                  key={child.productId}
                  className="flex items-center gap-3 bg-forest/5 rounded-xl p-3"
                >
                  {/* Child thumbnail */}
                  <div className={`w-10 h-12 rounded-lg flex-shrink-0 overflow-hidden ${coverClassFor(child.category)}`}>
                    {child.imageUrl ? (
                      <Image
                        src={child.imageUrl}
                        alt=""
                        width={40}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-cream/80 text-[9px] font-bold">
                        PDF
                      </span>
                    )}
                  </div>

                  {/* Child name */}
                  <span className="flex-1 text-sm text-gray-700 font-medium truncate">
                    {child.name}
                  </span>

                  {/* View + Download */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={child.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-forest/20 text-forest hover:bg-forest/5 transition-colors"
                      aria-label={`View ${child.name}`}
                      title="View"
                    >
                      <EyeIcon />
                    </a>
                    <a
                      href={child.downloadUrl}
                      className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-forest text-cream hover:bg-forest-dark transition-colors"
                      aria-label={`Download ${child.name}`}
                      title="Download"
                    >
                      <DownloadIcon />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bundle note fallback (no children resolved) */}
      {isBundle && (!bundleChildren || bundleChildren.length === 0) && (
        <p className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600">
          Each guide in this bundle is listed separately in your downloads.
        </p>
      )}

      {/* Review prompt (not for bundles) */}
      {showReviewPrompt && !isBundle && (
        <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600">
          Enjoying this guide?{' '}
          <Link
            href={`/shop/${slug}#reviews`}
            className="font-medium text-forest hover:text-forest-dark underline underline-offset-2 transition-colors"
          >
            Share your experience
          </Link>
        </div>
      )}
    </div>
  );
}
