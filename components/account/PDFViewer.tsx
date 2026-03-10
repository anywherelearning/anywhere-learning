'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Link from 'next/link';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use the CDN worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  productId: string;
  productName: string;
  /** Whether the user also purchased this product (shows download button) */
  canDownload: boolean;
}

export default function PDFViewer({
  productId,
  productName,
  canDownload,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState(700);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setLoading(false);
    },
    [],
  );

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // Calculate page width based on container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth - 48;
        setPageWidth(Math.min(available, 900));
      } else {
        setPageWidth(Math.min(window.innerWidth - 48, 900));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/account/library"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Library
          </Link>
          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {productName}
            </h1>
            <p className="text-xs text-gray-400">
              {loading ? 'Loading\u2026' : `${numPages} pages`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canDownload && (
            <a
              href={`/api/download/${productId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-forest/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 px-4 sm:px-6 py-6"
        onContextMenu={(e) => e.preventDefault()}
      >
        {error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-1">Unable to load this activity pack</p>
            <p className="text-gray-400 text-sm">Please try again later or contact support.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Document
              file={`/api/view/${productId}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Loading activity pack&hellip;</p>
                </div>
              }
            >
              {numPages > 0 &&
                Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <Page
                      pageNumber={i + 1}
                      width={pageWidth}
                      className="shadow-lg rounded-lg overflow-hidden"
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
