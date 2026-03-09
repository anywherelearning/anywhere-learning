interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export default function ReviewSummary({ averageRating, reviewCount }: ReviewSummaryProps) {
  if (reviewCount === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Stars display */}
      <div className="flex items-center gap-0.5" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(averageRating);
          return (
            <svg
              key={star}
              className={`w-5 h-5 ${filled ? 'text-gold' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {averageRating.toFixed(1)} out of 5
      </span>
      <span className="text-sm text-gray-400">
        &middot; {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}
