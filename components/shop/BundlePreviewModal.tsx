'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface BundlePreviewItem {
  slug: string;
  name: string;
  imageUrl: string | null;
  hasPreview: boolean;
}

interface BundlePreviewModalProps {
  bundle: {
    slug: string;
    name: string;
    imageUrl: string | null;
    description: string;
  };
  items: BundlePreviewItem[];
  onClose: () => void;
  onGetBundle: () => void;
}

type Selection = { type: 'overview' } | { type: 'item'; slug: string; name: string };

/**
 * TpT-style multi-product preview for bundles.
 * Left sidebar: bundle cover + each included product thumbnail.
 * Right panel: either the bundle overview (cover + description) or
 * a scrollable PDF preview of the selected product.
 */
export default function BundlePreviewModal({
  bundle,
  items,
  onClose,
  onGetBundle,
}: BundlePreviewModalProps) {
  const [selection, setSelection] = useState<Selection>({ type: 'overview' });
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState(700);
  const viewerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // Reset loading state on selection change
  useEffect(() => {
    if (selection.type === 'item') {
      setLoading(true);
      setError(false);
      setNumPages(0);
      // Scroll viewer to top
      viewerRef.current?.scrollTo({ top: 0 });
    }
  }, [selection]);

  // Calculate page width based on container
  useEffect(() => {
    const updateWidth = () => {
      if (viewerRef.current) {
        const available = viewerRef.current.clientWidth - 32;
        setPageWidth(Math.min(available, 760));
      } else {
        setPageWidth(Math.min(window.innerWidth - 32, 760));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [selection]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isOverview = selection.type === 'overview';
  const selectedSlug = selection.type === 'item' ? selection.slug : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-label={`Preview of ${bundle.name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {bundle.name}
          </h2>
          <span className="hidden sm:inline text-xs text-gray-400">&rsaquo;</span>
          <p className="hidden sm:block text-xs text-gray-500 truncate">
            {isOverview ? 'Overview' : selection.name}
            <span className="text-gray-400"> by Anywhere Learning</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label="Close preview"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body: sidebar + main viewer */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-32 sm:w-48 md:w-60 bg-white/95 backdrop-blur-sm border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-3 sm:p-4 space-y-4">
            {/* Bundle Overview tile */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                Bundle Overview
              </p>
              <button
                onClick={() => setSelection({ type: 'overview' })}
                className={`group w-full text-left rounded-lg overflow-hidden border-2 transition-colors ${
                  isOverview ? 'border-forest' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  {bundle.imageUrl && (
                    <Image
                      src={bundle.imageUrl}
                      alt={bundle.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="px-2 py-2">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
                    {bundle.name}
                  </p>
                </div>
              </button>
            </div>

            {/* Included products */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                {items.length} included products
              </p>
              <ul className="space-y-2">
                {items.map((item) => {
                  const isSelected = selectedSlug === item.slug;
                  const selectable = item.hasPreview;
                  return (
                    <li key={item.slug}>
                      <button
                        disabled={!selectable}
                        onClick={() =>
                          selectable &&
                          setSelection({ type: 'item', slug: item.slug, name: item.name })
                        }
                        className={`group w-full text-left rounded-lg overflow-hidden border-2 transition-colors ${
                          isSelected
                            ? 'border-forest'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!selectable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="relative aspect-[3/4] bg-gray-100">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="240px"
                              className="object-cover"
                            />
                          )}
                          {!selectable && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                              <span className="text-[10px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
                                No preview
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="px-2 py-2">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
                            {item.name}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main viewer */}
        <div
          ref={viewerRef}
          className="flex-1 overflow-auto px-2 sm:px-6 py-4 sm:py-6 bg-gray-50"
        >
          {isOverview ? (
            /* Bundle overview */
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative aspect-[3/4] bg-gray-100">
                {bundle.imageUrl && (
                  <Image
                    src={bundle.imageUrl}
                    alt={bundle.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-display text-2xl sm:text-3xl text-forest mb-3">
                  {bundle.name}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {bundle.description}
                </p>
                <p className="mt-6 text-xs text-gray-400">
                  Select a product on the left to preview its sample pages.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-20">
              <p className="text-gray-800 text-lg font-medium mb-2">Preview unavailable</p>
              <p className="text-gray-500 text-sm">
                This preview is not available right now. Try another product from the list.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Document
                key={selectedSlug ?? 'empty'}
                file={`/api/preview/${selectedSlug}`}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex flex-col items-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-forest rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading preview&hellip;</p>
                  </div>
                }
              >
                {!loading && numPages > 0 &&
                  Array.from({ length: numPages }, (_, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <Page
                        pageNumber={i + 1}
                        width={pageWidth}
                        className="shadow-xl rounded-lg overflow-hidden bg-white"
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
        <p className="text-sm text-gray-500 hidden sm:block">
          {isOverview
            ? `${items.length} activity guides included`
            : loading
              ? 'Loading preview\u2026'
              : `${numPages} page preview`}
        </p>
        <button
          onClick={onGetBundle}
          className="bg-forest text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-forest-dark transition-colors shadow-sm ml-auto"
        >
          Get Bundle
        </button>
      </div>
    </div>
  );
}
