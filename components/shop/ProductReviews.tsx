import { getProductReviews, getProductReviewStats } from '@/lib/db/queries';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewFormWrapper from './ReviewFormWrapper';

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export default async function ProductReviews({
  productId,
  productSlug,
  productName,
}: ProductReviewsProps) {
  let reviewList: Awaited<ReturnType<typeof getProductReviews>> = [];
  let stats = { averageRating: 0, reviewCount: 0 };

  try {
    [reviewList, stats] = await Promise.all([
      getProductReviews(productId),
      getProductReviewStats(productId),
    ]);
  } catch {
    // DB unavailable - show empty state gracefully
  }

  const hasReviews = stats.reviewCount > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        What Families Are Saying
      </h2>

      {hasReviews ? (
        <>
          <ReviewSummary
            averageRating={stats.averageRating}
            reviewCount={stats.reviewCount}
          />
          <ReviewList reviews={reviewList} />
        </>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-6">
          {/* Leaf icon */}
          <div className="mx-auto w-12 h-12 bg-forest/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-forest/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Be the first to share your experience with{' '}
            <span className="font-medium text-gray-700">{productName}</span>.
          </p>
        </div>
      )}

      {/* Auth-gated review form */}
      <ReviewFormWrapper
        productId={productId}
        productSlug={productSlug}
        productName={productName}
      />
    </div>
  );
}
