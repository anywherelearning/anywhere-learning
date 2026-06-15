'use client';

/**
 * In-app PDF reader. Renders every page of a guide onto <canvas> elements
 * via pdf.js, fetching the bytes from the same-origin streaming endpoint
 * (/api/view/activity/[slug]) so the Blob URL is never exposed.
 *
 * Why this exists: trial members can read everything but download nothing.
 * The browser's built-in PDF viewer ships its own download button, which
 * would turn every "view" into a free download. Canvas rendering removes that
 * one-click hole (screenshots remain possible; this is a speed bump, not DRM).
 *
 * For trial members the Download button opens the upgrade-to-download modal.
 * Members and starters download normally.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TrialCapModal from '@/components/account/TrialCapModal';

interface Props {
  slug: string;
  title: string;
  tier: 'member' | 'trial' | 'starter';
  trialEndsAt?: string | null;
  priceLabel?: string;
  isFounder?: boolean;
}

export default function PdfViewer({
  slug,
  title,
  tier,
  trialEndsAt,
  priceLabel,
  isFounder,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pageCount, setPageCount] = useState(0);
  const [capModalOpen, setCapModalOpen] = useState(false);

  const downloadHref = `/api/download/activity/${slug}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument({ url: `/api/view/activity/${slug}` }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        // Render at 2x the container width for crisp text on retina, capped
        // so huge PDFs don't allocate absurd canvases.
        const cssWidth = Math.min(container.clientWidth, 860);

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = (cssWidth / baseViewport.width) * Math.min(window.devicePixelRatio || 1, 2);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${(cssWidth * viewport.height) / viewport.width}px`;
          canvas.className =
            'block mx-auto mb-5 rounded-[10px] border border-[#D8D4C5] bg-white shadow-[0_18px_36px_-26px_rgba(45,58,46,0.35)]';
          container.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        }
        if (!cancelled) setState('ready');
      } catch (err) {
        console.error('[viewer] failed to render PDF:', err);
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (tier !== 'trial') return; // members/starters: plain navigation
    e.preventDefault();
    setCapModalOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#E9E5DC]">
      {/* Reader toolbar */}
      <div className="sticky top-0 z-40 bg-[#DAD7CD]/95 backdrop-blur-sm border-b border-[#C9C5B7]">
        <div className="mx-auto max-w-[1100px] px-5 py-3 flex items-center justify-between gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 font-body font-medium text-[13.5px] text-gray-600 no-underline hover:text-forest-dark transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true">&larr;</span> Library
          </Link>
          <h1 className="m-0 flex-1 min-w-0 truncate text-center font-display italic text-[16px] text-ink">
            {title}
          </h1>
          <a
            href={downloadHref}
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[12.5px] py-2 px-3.5 rounded-lg no-underline hover:bg-forest-dark transition-colors whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            {tier === 'trial' ? 'Download with membership' : 'Download'}
          </a>
        </div>
      </div>

      {/* Pages */}
      <div className="mx-auto max-w-[920px] px-4 py-8">
        {state === 'loading' && (
          <p className="text-center font-body text-[14.5px] text-gray-500 py-16">
            Opening {title}&hellip;
          </p>
        )}
        {state === 'error' && (
          <div className="text-center py-16">
            <p className="font-body text-[15px] text-gray-600">
              This guide didn&apos;t load. Give it another try, or head back to your library.
            </p>
            <Link
              href="/account"
              className="mt-4 inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold text-[14px] py-2.5 px-5 rounded-xl no-underline hover:bg-forest-dark transition-colors"
            >
              Back to library
            </Link>
          </div>
        )}
        <div ref={containerRef} />
        {state === 'ready' && pageCount > 0 && (
          <p className="text-center font-body text-[12.5px] text-gray-500 pb-6">
            {pageCount} page{pageCount === 1 ? '' : 's'} · {title}
          </p>
        )}
      </div>

      <TrialCapModal
        open={capModalOpen}
        onClose={() => setCapModalOpen(false)}
        trialEndsAt={trialEndsAt}
        priceLabel={priceLabel}
        isFounder={isFounder}
      />
    </main>
  );
}
