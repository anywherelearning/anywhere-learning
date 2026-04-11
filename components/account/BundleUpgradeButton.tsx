'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface BundleUpgradeButtonProps {
  stripePriceId: string;
  slug: string;
  upgradePrice: number;
  amountAlreadyPaid: number;
  bundleName: string;
  email?: string;
  /** Extra classes merged onto the button (e.g. `w-full sm:w-auto` for mobile-stacked cards). */
  className?: string;
}

export default function BundleUpgradeButton({
  stripePriceId,
  slug,
  upgradePrice,
  amountAlreadyPaid,
  bundleName,
  email,
  className = '',
}: BundleUpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ stripePriceId, slug }],
          email: email || '',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Try again.');
        setLoading(false);
      }
    } catch {
      setError('Couldn\u2019t connect. Check your internet and try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`whitespace-nowrap bg-forest hover:bg-forest-dark text-cream font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 ${className}`}
      >
        {loading ? 'Preparing...' : `Upgrade for ${formatPrice(upgradePrice)}`}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
    </div>
  );
}
