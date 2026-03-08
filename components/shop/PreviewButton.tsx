'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const PreviewModal = dynamic(() => import('./PreviewModal'), {
  ssr: false,
});

interface PreviewButtonProps {
  slug: string;
  productName: string;
}

export default function PreviewButton({ slug, productName }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);

  const handleGetPack = useCallback(() => {
    setOpen(false);
    // Scroll to the buy button
    document.getElementById('buy-button')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 border-2 border-forest/20 text-forest font-semibold rounded-full hover:border-forest/40 hover:bg-forest/5 transition-all text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Preview Sample Pages
      </button>

      {open && (
        <PreviewModal
          slug={slug}
          productName={productName}
          onClose={() => setOpen(false)}
          onGetPack={handleGetPack}
        />
      )}
    </>
  );
}
