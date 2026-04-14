'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const PreviewModal = dynamic(() => import('./PreviewModal'), {
  ssr: false,
});

interface PreviewButtonProps {
  slug: string;
  productName: string;
  /** Compact mode renders a small pill for use inside grids (e.g. bundle contents). */
  compact?: boolean;
  /** Block mode renders a full-width bordered button (matches BundlePreviewButton block style). */
  variant?: 'default' | 'block';
}

/**
 * Renders a portal container at the body level so the modal
 * escapes any ancestor overflow-hidden / backdrop-filter.
 */
function BodyPortal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    containerRef.current = el;
    setMounted(true);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!mounted || !containerRef.current) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactDOM = require('react-dom') as { createPortal: (children: React.ReactNode, container: Element) => React.ReactNode };
  return ReactDOM.createPortal(children, containerRef.current);
}

export default function PreviewButton({ slug, productName, compact, variant = 'default' }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);

  const handleGetPack = useCallback(() => {
    setOpen(false);
    document.getElementById('buy-button')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const isBlock = variant === 'block';

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={
          compact
            ? 'inline-flex items-center gap-1 text-xs font-medium text-forest/70 hover:text-forest transition-colors'
            : isBlock
              ? 'w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-forest font-semibold text-sm rounded-full border border-forest/20 bg-white hover:bg-forest/5 transition-colors shadow-sm'
              : 'flex items-center justify-center gap-2 py-2.5 px-5 text-forest font-semibold rounded-full hover:bg-forest/5 transition-all text-sm'
        }
      >
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {compact ? 'Preview' : isBlock ? 'View Preview' : 'Preview Sample Pages'}
      </button>

      {open && (
        <BodyPortal>
          <PreviewModal
            slug={slug}
            productName={productName}
            onClose={() => setOpen(false)}
            onGetPack={handleGetPack}
          />
        </BodyPortal>
      )}
    </>
  );
}
