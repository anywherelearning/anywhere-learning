import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
  size?: 'sm' | 'lg';
}

export default function PriceDisplay({ priceCents, compareAtPriceCents, size = 'sm' }: PriceDisplayProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="flex items-baseline gap-3">
      <span className={`font-bold text-forest ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
        {formatPrice(priceCents)}
      </span>
      {compareAtPriceCents && savings > 0 && (
        <>
          <span className={`text-gray-400 line-through ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
            {formatPrice(compareAtPriceCents)}
          </span>
          <span className="bg-gold/20 text-sm font-semibold text-gold px-3 py-1 rounded-full">
            Save {formatPrice(savings)}
          </span>
        </>
      )}
    </div>
  );
}
