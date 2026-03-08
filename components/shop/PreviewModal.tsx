'use client';

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use the CDN worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PreviewModalProps {
  slug: string;
  productName: string;
  onClose: () => void;
  onGetPack: () => void;
}

export default function PreviewModal({
  slug,
  productName,
  onClose,
  onGetPack,
}: PreviewModalProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
  }, [numPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, goToPrev, goToNext]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-label={`Preview of ${productName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {productName}
          </h2>
          <p className="text-xs text-gray-400">Sample preview</p>
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

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto flex items-start justify-center py-4 sm:py-8 px-2">
        {error ? (
          <div className="text-center py-20">
            <p className="text-white/80 text-lg mb-2">Preview unavailable</p>
            <p className="text-white/50 text-sm">This preview is not available right now.</p>
          </div>
        ) : (
          <Document
            file={`/api/preview/${slug}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Loading preview&hellip;</p>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : 700, 700)}
              className="shadow-2xl rounded-lg overflow-hidden"
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      {/* Footer: Navigation + CTA */}
      {!error && !loading && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
          {/* Page nav */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={goToPrev}
              disabled={currentPage <= 1}
              className="p-2 text-gray-500 hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-forest/5 transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 tabular-nums">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage >= numPages}
              className="p-2 text-gray-500 hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-forest/5 transition-colors"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={onGetPack}
            className="bg-forest text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-forest-dark transition-colors shadow-sm"
          >
            Get This Pack
          </button>
        </div>
      )}
    </div>
  );
}
