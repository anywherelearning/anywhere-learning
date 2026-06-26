'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  covers: { src: string; alt: string; href: string }[];
  bg: string;
  motif: string;
  motifColor: string;
}

export default function CategoryCoverCarousel({ covers, bg, motif, motifColor }: Props) {
  const [index, setIndex] = useState(0);

  if (covers.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + covers.length) % covers.length);
  const next = () => setIndex((i) => (i + 1) % covers.length);

  return (
    <div className="relative w-full max-w-[240px] md:max-w-[200px] mx-auto md:mx-0">
      <Link
        href={covers[index].href}
        aria-label={`View ${covers[index].alt.replace(/ cover$/, '')}`}
        className="group block relative aspect-[4/5] rounded-[10px] overflow-hidden border border-[#D8D4C5] shadow-[0_18px_32px_-22px_rgba(45,58,46,0.4)] -rotate-[1.5deg] transition-transform duration-300 hover:-rotate-[0.5deg] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        style={{ background: bg }}
      >
        {covers.map((c, i) => (
          <img
            key={c.src}
            src={c.src}
            alt={c.alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-cream/95 border border-[#D8D4C5] grid place-items-center font-display italic text-[16px] shadow-[0_4px_10px_-6px_rgba(45,58,46,0.4)] z-[2]"
          style={{ color: motifColor }}
        >
          {motif}
        </span>
      </Link>

      {covers.length > 1 && (
        <>
          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous cover"
            className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-9 md:h-9 rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-ink shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)] hover:bg-[#F2EFE4] hover:-translate-y-[calc(50%+1px)] transition-all z-[3]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next cover"
            className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-9 md:h-9 rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-ink shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)] hover:bg-[#F2EFE4] hover:-translate-y-[calc(50%+1px)] transition-all z-[3]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Counter */}
          <p className="text-center text-[11.5px] font-medium text-gray-500 mt-2.5">
            {index + 1} <span className="text-gray-400">/</span> {covers.length}
          </p>
        </>
      )}
    </div>
  );
}
