interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  userEmail: string;
}

interface ReviewListProps {
  reviews: Review[];
}

function getFirstName(email: string): string {
  const local = email.split('@')[0];
  // Turn "amelie.drouin" or "amelie_drouin" into "Amelie"
  const name = local.split(/[._-]/)[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          {/* Header: stars + name + time */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'text-gold' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {getFirstName(review.userEmail)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {getRelativeTime(review.createdAt)}
            </span>
          </div>

          {/* Comment */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {review.comment}
          </p>

          {/* Verified badge */}
          <div className="mt-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-forest font-medium">Verified Purchase</span>
          </div>
        </div>
      ))}
    </div>
  );
}
