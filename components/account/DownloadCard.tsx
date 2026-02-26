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
  purchasedAt,
}: DownloadCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-6 hover:shadow-sm transition-shadow">
      {/* Small product mockup */}
      <div className="w-16 h-20 bg-gradient-to-br from-cream to-gold-light/30 rounded-xl flex items-center justify-center flex-shrink-0">
        <div className="w-10 h-12 bg-white rounded-lg shadow-sm border border-forest/10 p-1">
          <div className="w-3 h-3 rounded-full bg-forest/20 mx-auto mb-1" />
          <div className="space-y-0.5 px-0.5">
            <div className="h-0.5 bg-gray-200 rounded-full" />
            <div className="h-0.5 bg-gray-200 rounded-full w-3/4" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{productName}</h3>
        <p className="text-sm text-gray-400">
          Purchased {formatDate(purchasedAt)}
        </p>
      </div>

      {/* Download button */}
      <a
        href={`/api/download/${productId}`}
        className="flex-shrink-0 bg-forest hover:bg-forest-dark text-cream font-medium py-2.5 px-5 rounded-xl transition-colors text-sm"
      >
        <span className="hidden sm:inline">Download PDF &darr;</span>
        <span className="sm:hidden" aria-label="Download PDF">&darr;</span>
      </a>
    </div>
  );
}
