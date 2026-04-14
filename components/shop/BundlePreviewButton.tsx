'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { BundlePreviewItem } from './BundlePreviewModal';

const BundlePreviewModal = dynamic(() => import('./BundlePreviewModal'), {
  ssr: false,
});

interface BundlePreviewButtonProps {
  bundle: {
    slug: string;
    name: string;
    imageUrl: string | null;
    description: string;
  };
  items: BundlePreviewItem[];
  /** Visual variant. `inline` renders a small pill for use on the cover image. */
  variant?: 'inline' | 'block';
}

/** Portal so the modal escapes ancestor overflow-hidden / transform contexts. */
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
  const ReactDOM = require('react-dom') as {
    createPortal: (children: React.ReactNode, container: Element) => React.ReactNode;
  };
  return ReactDOM.createPortal(children, containerRef.current);
}

export default function BundlePreviewButton({
  bundle,
  items,
  variant = 'block',
}: BundlePreviewButtonProps) {
  const [open, setOpen] = useState(false);

  const handleGetBundle = useCallback(() => {
    setOpen(false);
    document.getElementById('buy-button')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const isInline = variant === 'inline';

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          isInline
            ? 'inline-flex items-center justify-center gap-2 py-2 px-4 text-forest font-semibold text-sm rounded-full hover:bg-forest/5 transition-colors'
            : 'w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-forest font-semibold text-sm rounded-full border border-forest/20 bg-white hover:bg-forest/5 transition-colors shadow-sm'
        }
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        View Preview
      </button>

      {open && (
        <BodyPortal>
          <BundlePreviewModal
            bundle={bundle}
            items={items}
            onClose={() => setOpen(false)}
            onGetBundle={handleGetBundle}
          />
        </BodyPortal>
      )}
    </>
  );
}
