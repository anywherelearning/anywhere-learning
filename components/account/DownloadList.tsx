import Link from 'next/link';
import DownloadCard from './DownloadCard';

interface Purchase {
  order: {
    id: string;
    purchasedAt: Date;
  };
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface DownloadListProps {
  purchases: Purchase[];
}

export default function DownloadList({ purchases }: DownloadListProps) {
  if (purchases.length === 0) {
    return (
      <div className="mt-10 text-center py-20">
        <div className="text-6xl mb-6">&#x1F331;</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No packs yet</h2>
        <p className="text-gray-500 mb-6">
          Your activity packs will appear here after your first purchase.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-forest hover:bg-forest-dark text-cream font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Browse Activity Packs
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {purchases.map((p) => (
        <DownloadCard
          key={p.order.id}
          productId={p.product.id}
          productName={p.product.name}
          imageUrl={p.product.imageUrl}
          purchasedAt={p.order.purchasedAt}
        />
      ))}
    </div>
  );
}
