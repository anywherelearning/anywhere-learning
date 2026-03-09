'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}

export default function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const interactive = !!onChange;
  const displayValue = hoveredStar || value;

  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating' : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHoveredStar(star)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform p-0 border-none bg-transparent`}
          aria-label={interactive ? `Rate ${star} out of 5` : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? star === value : undefined}
          tabIndex={interactive ? 0 : -1}
        >
          <svg
            className={`${starSize} ${star <= displayValue ? 'text-gold' : 'text-gray-300'} transition-colors`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
