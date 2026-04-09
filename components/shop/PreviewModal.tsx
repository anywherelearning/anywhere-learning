'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use a local copy of the pdf.js worker (copied from node_modules/pdfjs-dist/build)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState(700);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // Calculate page width based on container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Leave some padding on each side
        const available = containerRef.current.clientWidth - 32;
        setPageWidth(Math.min(available, 800));
      } else {
        setPageWidth(Math.min(window.innerWidth - 32, 800));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
          <p className="text-xs text-gray-400">
            {loading ? 'Loading preview\u2026' : `${numPages} page preview`}
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

      {/* Scrollable PDF Viewer - all pages */}
      <div ref={containerRef} className="flex-1 overflow-auto px-2 sm:px-4 py-4 sm:py-6">
        {error ? (
          <div className="text-center py-20">
            <p className="text-white/80 text-lg mb-2">Preview unavailable</p>
            <p className="text-white/50 text-sm">This preview is not available right now.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
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
              {numPages > 0 &&
                Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <Page
                      pageNumber={i + 1}
                      width={pageWidth}
                      className="shadow-2xl rounded-lg overflow-hidden"
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
            </Document>
          </div>
        )}
      </div>

      {/* Footer: CTA */}
      {!error && !loading && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
          <p className="text-sm text-gray-500 hidden sm:block">
            {numPages} pages &middot; Scroll to browse
          </p>
          <button
            onClick={onGetPack}
            className="bg-forest text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-forest-dark transition-colors shadow-sm ml-auto"
          >
            Get This Pack
          </button>
        </div>
      )}
    </div>
  );
}
