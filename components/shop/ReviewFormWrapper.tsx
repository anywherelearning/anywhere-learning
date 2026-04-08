'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import StarRating from './StarRating';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
}

interface ReviewFormWrapperProps {
  productId: string;
  productSlug: string;
  productName: string;
}

function SignInPrompt() {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-500">
        Purchased this product?{' '}
        <Link href="/sign-in" className="text-forest font-medium hover:text-forest-dark transition-colors">
          Sign in
        </Link>
        {' '}to leave a review.
      </p>
    </div>
  );
}

function NotPurchasedPrompt() {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-400">
        Purchase this product to share your experience.
      </p>
    </div>
  );
}

function ReviewForm({
  productId,
  productSlug,
  existingReview,
  onSubmitted,
}: {
  productId: string;
  productSlug: string;
  existingReview?: ExistingReview | null;
  onSubmitted: (review: { rating: number; comment: string }) => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length === 0) {
      setError('Please write a short review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productSlug, rating, comment: comment.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      onSubmitted({ rating, comment: comment.trim() });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gold-light/5 rounded-2xl p-5 border border-gold/10">
      <p className="text-sm font-medium text-gray-700 mb-3">
        {isEditing ? 'Edit your review' : 'Share your experience'}
      </p>

      {/* Star rating */}
      <div className="mb-4">
        <StarRating value={rating} onChange={setRating} size="md" />
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={`What did your family enjoy about this product?`}
        rows={3}
        maxLength={1000}
        className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none resize-none transition-all"
      />
      <div className="flex items-center justify-between mt-1 mb-3">
        <span className="text-xs text-gray-400">{comment.length}/1000</span>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-forest hover:bg-forest-dark active:scale-[0.98] text-cream font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {submitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
}

function ExistingReviewCard({
  review,
  onEdit,
}: {
  review: ExistingReview;
  onEdit: () => void;
}) {
  return (
    <div className="bg-gold-light/5 rounded-2xl p-5 border border-gold/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="sm" />
          <span className="text-xs text-forest font-medium">Your review</span>
        </div>
        <button
          onClick={onEdit}
          className="text-xs text-forest font-medium hover:text-forest-dark transition-colors"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  );
}

function AuthenticatedReviewSection({
  productId,
  productSlug,
  productName,
}: ReviewFormWrapperProps) {
  const [state, setState] = useState<'loading' | 'not-purchased' | 'can-review' | 'has-reviewed' | 'submitted'>('loading');
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/status?productId=${productId}`);
      const data = await res.json();

      if (!data.hasPurchased) {
        setState('not-purchased');
      } else if (data.existingReview) {
        setExistingReview(data.existingReview);
        setState('has-reviewed');
      } else {
        setState('can-review');
      }
    } catch {
      setState('not-purchased');
    }
  }, [productId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (state === 'loading') {
    return (
      <div className="py-4 text-center">
        <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (state === 'not-purchased') {
    return <NotPurchasedPrompt />;
  }

  if (state === 'submitted') {
    return (
      <div className="bg-forest/5 rounded-2xl p-5 text-center">
        <svg className="w-8 h-8 text-forest mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-forest">
          Thank you for sharing your experience!
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your review will appear on the page shortly.
        </p>
      </div>
    );
  }

  if (state === 'has-reviewed' && existingReview && !isEditing) {
    return (
      <ExistingReviewCard
        review={existingReview}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  // can-review or editing
  return (
    <ReviewForm
      productId={productId}
      productSlug={productSlug}
      existingReview={isEditing ? existingReview : null}
      onSubmitted={(review) => {
        setExistingReview({ id: existingReview?.id || 'new', ...review });
        setState('submitted');
        setIsEditing(false);
      }}
    />
  );
}

export default function ReviewFormWrapper(props: ReviewFormWrapperProps) {
  if (!hasClerk) {
    return <SignInPrompt />;
  }

  return <ReviewFormInner {...props} />;
}

function ReviewFormInner(props: ReviewFormWrapperProps) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <SignInPrompt />;
  }

  return <AuthenticatedReviewSection {...props} />;
}
