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
      <div className="mt-8 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-lg text-gray-600">No purchases yet.</p>
        <p className="mt-2 text-gray-500">
          Browse our activity packs and start learning today.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-lg bg-forest px-6 py-3 font-semibold text-cream transition-colors hover:bg-forest-dark"
        >
          Browse Activity Packs &rarr;
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
