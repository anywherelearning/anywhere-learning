'use client';

/**
 * Modal wrapper around ReviewForm, used from the /account dashboard.
 * Opens centered with a dimmed backdrop. Closes on backdrop click, Escape,
 * or the X button. Body scroll is locked while open.
 */

import { useEffect, useRef } from 'react';
import ReviewForm from './ReviewForm';

interface Props {
  slug: string;
  productName: string;
  onClose: () => void;
}

export default function ReviewModal({ slug, productName, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Escape to close
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);

    // Initial focus on the modal
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#2D3A2E]/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Write a review for ${productName}`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-gray-500 hover:text-forest-dark hover:border-forest transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ReviewForm always starts expanded inside the modal — we force the
            open state by feeding it a `defaultOpen` flag, and route Cancel
            to the modal's close handler. */}
        <ReviewForm slug={slug} productName={productName} defaultOpen onCancel={onClose} />
      </div>
    </div>
  );
}
