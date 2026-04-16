'use client';

import { useState } from 'react';
import { usePassMember } from '@/hooks/usePassMember';
import Link from 'next/link';

interface AnnualPassCTAProps {
  size?: 'small' | 'large';
  /**
   * 'cream' = cream button on dark backgrounds (default)
   * 'forest' = forest button for placement on cream/light backgrounds
   */
  variant?: 'cream' | 'forest';
  className?: string;
}

export default function AnnualPassCTA({ size = 'large', variant = 'cream', className = '' }: AnnualPassCTAProps) {
  const { active, loading } = usePassMember();
  const [isLoading, setIsLoading] = useState(false);

  if (loading) return null;

  // Already a member -- show "My Library"
  if (active) {
    return (
      <Link
        href="/account/downloads"
        className={`inline-flex items-center justify-center font-semibold text-cream bg-forest hover:bg-forest-dark rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
          size === 'large' ? 'py-4 px-10 text-lg' : 'py-2.5 px-6 text-sm'
        } ${className}`}
      >
        My Library
      </Link>
    );
  }

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned:', data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      setIsLoading(false);
    }
  }

  const variantClasses =
    variant === 'forest'
      ? 'text-cream bg-forest hover:bg-forest-dark shadow-md'
      : 'text-forest-dark bg-cream hover:bg-white shadow-lg';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses} ${
        size === 'large' ? 'py-4 px-10 text-lg' : 'py-2.5 px-6 text-sm'
      } ${className}`}
    >
      {isLoading ? 'Loading...' : 'Get the Annual Pass'}
    </button>
  );
}
