import { formatDate } from '@/lib/utils';

interface DownloadCardProps {
  productId: string;
  productName: string;
  imageUrl: string | null;
  purchasedAt: Date | string;
  productCategory?: string;
}

const coverClasses: Record<string, string> = {
  seasonal: 'cover-seasonal',
  creativity: 'cover-creativity',
  nature: 'cover-nature',
  'real-world': 'cover-real-world',
  'life-skills': 'cover-life-skills',
  'ai-literacy': 'cover-ai-literacy',
  bundle: 'cover-bundle',
};

export default function DownloadCard({
  productId,
  productName,
  purchasedAt,
  productCategory,
}: DownloadCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-6 hover:shadow-sm transition-shadow">
      {/* Category colour strip */}
      <div
        className={`w-14 h-18 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
          productCategory ? coverClasses[productCategory] || 'cover-nature' : 'cover-nature'
        }`}
      >
        {'\uD83D\uDCC4'}
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
