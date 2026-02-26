import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface DownloadCardProps {
  productId: string;
  productName: string;
  imageUrl: string | null;
  purchasedAt: Date | string;
}

export default function DownloadCard({
  productId,
  productName,
  imageUrl,
  purchasedAt,
}: DownloadCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-forest/10 to-gold-light/30 sm:h-20 sm:w-20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-forest/30">PDF</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{productName}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Purchased {formatDate(purchasedAt)}
        </p>
      </div>

      {/* Download button */}
      <a
        href={`/api/download/${productId}`}
        className="shrink-0 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark"
      >
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden" aria-label="Download PDF">&darr;</span>
      </a>
    </div>
  );
}
