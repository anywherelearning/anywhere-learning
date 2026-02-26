import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
}

export default function PriceDisplay({ priceCents, compareAtPriceCents }: PriceDisplayProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-forest">
        {formatPrice(priceCents)}
      </span>
      {compareAtPriceCents && savings > 0 && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(compareAtPriceCents)}
          </span>
          <span className="text-sm font-medium text-gold">
            Save {formatPrice(savings)}
          </span>
        </>
      )}
    </div>
  );
}
