import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface BundleHighlightProps {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  activityCount: number | null;
}

export default function BundleHighlight({
  name,
  slug,
  priceCents,
  compareAtPriceCents,
  activityCount,
}: BundleHighlightProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="rounded-xl bg-forest p-8 text-cream sm:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gray-900">
          Best Value
        </span>
        <h3 className="mt-4 font-display text-2xl sm:text-3xl">
          {name}
        </h3>
        {activityCount && (
          <p className="mt-2 text-cream/80">
            {activityCount} activities in one download
          </p>
        )}
        <div className="mt-4 flex items-baseline justify-center gap-3">
          <span className="text-3xl font-bold">{formatPrice(priceCents)}</span>
          {compareAtPriceCents && savings > 0 && (
            <>
              <span className="text-lg text-cream/50 line-through">
                {formatPrice(compareAtPriceCents)}
              </span>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-sm font-medium text-gold-light">
                Save {formatPrice(savings)}
              </span>
            </>
          )}
        </div>
        <Link
          href={`/shop/${slug}`}
          className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gold-light"
        >
          View Bundle &rarr;
        </Link>
      </div>
    </div>
  );
}
