'use client';

/**
 * Inline review form for the product detail page.
 *
 * Renders a 5-star picker + textarea + submit. POSTs to /api/reviews which
 * upserts (one review per user per activity). On success, the server triggers
 * a revalidation of /shop/[slug] so the new review shows on next nav.
 *
 * Visible only to users who have access to the activity (member, or starter
 * buyer when the activity is in their pack). Higher-level gating happens on
 * the page; this component just shows the form.
 */

import { useState, useTransition } from 'react';

export default function ReviewForm({
  slug,
  productName,
  defaultOpen = false,
  onCancel,
}: {
  slug: string;
  productName: string;
  /** Start expanded (no "Write a review" button preamble). Used inside the
   *  modal on /account where the trigger is the dashboard row link. */
  defaultOpen?: boolean;
  /** Called when Cancel is clicked. If provided, replaces the default
   *  collapse-back-to-button behavior (used by the modal to close itself). */
  onCancel?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function reset() {
    setRating(0);
    setHover(0);
    setComment('');
    setErr(null);
    // In page context, collapse back to the "Write a review" button.
    // In modal context (onCancel provided), defer to the parent to close.
    if (onCancel) {
      onCancel();
    } else {
      setCollapsed(true);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    if (rating < 1) {
      setErr('Pick a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setErr('Tell us a little more — a sentence or two.');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, rating, comment }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setErr(data.error || 'Could not save your review. Try again.');
          return;
        }
        setInfo('Thanks — your review is in. It will appear in a moment.');
        setTimeout(() => {
          reset();
          // Soft refresh so the new review appears
          if (typeof window !== 'undefined') window.location.reload();
        }, 1200);
      } catch {
        setErr('Network error. Check your connection and try again.');
      }
    });
  }

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold py-3 px-6 rounded-xl text-[14.5px] hover:bg-forest-dark hover:-translate-y-px transition-all border-0 cursor-pointer"
        >
          Write a review <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-[640px] mx-auto bg-cream border border-[#D8D4C5] rounded-[14px] px-6 py-6 shadow-[0_18px_36px_-26px_rgba(45,58,46,0.2)]"
    >
      <p className="font-display text-[18px] text-ink m-0 mb-1">
        Your take on{' '}
        <em className="not-italic italic text-forest-dark">{productName}.</em>
      </p>
      <p className="text-[13px] text-gray-500 m-0 mb-4">
        Tell other members what your kid actually did with it.
      </p>

      {/* Stars */}
      <fieldset className="m-0 p-0 border-0 mb-3.5">
        <legend className="sr-only">Rating</legend>
        <div
          className="inline-flex gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hover || rating);
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                onClick={() => setRating(n)}
                className="bg-transparent border-0 cursor-pointer text-[28px] leading-none transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 rounded"
                style={{ color: filled ? '#C97B5C' : '#D8D4C5' }}
              >
                ★
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block mb-2 font-body font-semibold text-[12.5px] uppercase tracking-[0.14em] text-gray-600">
        What worked?
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="A sentence or two — what your kid did, what got them engaged, how it went."
        className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all resize-y"
      />
      <p className="m-0 mt-1 text-[11.5px] text-gray-500 text-right">
        {comment.length} / 1000
      </p>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={pending || rating < 1 || comment.trim().length < 10}
          className="inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold py-2.5 px-5 rounded-[10px] text-[14px] cursor-pointer hover:bg-forest-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-0"
        >
          {pending ? 'Saving…' : 'Post review'}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="font-body text-[13px] text-gray-500 bg-transparent border-0 cursor-pointer hover:text-forest-dark transition-colors"
        >
          Cancel
        </button>
        {info && (
          <span className="text-[12.5px] text-forest-dark" role="status">
            {info}
          </span>
        )}
        {err && (
          <span className="text-[12.5px] text-[#7A3D24]" role="alert">
            {err}
          </span>
        )}
      </div>
    </form>
  );
}
