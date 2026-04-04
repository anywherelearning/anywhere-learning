'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface UpgradeData {
  upgradePrice: number | null;
  totalCredit: number;
  ownedCount: number;
  totalCount: number;
}

interface Props {
  slug: string;
  stripePriceId: string;
  fullPriceCents: number;
}

export default function BundleUpgradePrice({ slug, stripePriceId, fullPriceCents }: Props) {
  const [data, setData] = useState<UpgradeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/upgrade-price?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.upgradePrice !== null && d.upgradePrice !== undefined) {
          setData(d);
        }
      })
      .catch(() => {});
  }, [slug]);

  if (!data || data.upgradePrice === null) return null;

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ stripePriceId, slug }],
          email: '',
        }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
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
    <div className="bg-forest/5 border border-forest/15 rounded-2xl p-5 mb-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <span className="text-sm font-semibold text-forest">Your upgrade price</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        You own {data.ownedCount} of {data.totalCount} packs. We&apos;ll credit the{' '}
        <span className="font-medium">{formatPrice(data.totalCredit)}</span> you already paid.
      </p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-gray-400 line-through">
          {formatPrice(fullPriceCents)}
        </span>
        <span className="text-lg font-bold text-forest">
          {formatPrice(data.upgradePrice)}
        </span>
        <span className="text-xs bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full font-medium">
          Save {formatPrice(data.totalCredit)}
        </span>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Preparing checkout...' : `Upgrade for ${formatPrice(data.upgradePrice)}`}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 text-center">{error}</p>
      )}
    </div>
  );
}
