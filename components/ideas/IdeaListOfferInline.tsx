'use client';

// ─── Compact offer, beside the PDF download ───
//
// The full offer block sits below the list, roughly five screens down on a
// phone. Most Google and Pinterest visitors take the PDF near the top and
// leave, so they never reach it. This puts the same ask one screen in, at the
// moment they're already accepting something.
//
// Deliberately small and deliberately not a gate: the PDF above it stays free
// with no email, and this reads as "also this" rather than a toll.

import Image from 'next/image';
import Link from 'next/link';
import type { IdeaFreeActivity } from '@/lib/ideas-free-activity';
import { useIdeaOffer } from './useIdeaOffer';

export default function IdeaListOfferInline({
  categorySlug,
  accent,
  activity,
}: {
  categorySlug: string;
  accent: string;
  activity: IdeaFreeActivity;
}) {
  const { email, setEmail, status, errorMessage, setErrorMessage, claimed, submit } =
    useIdeaOffer(categorySlug, activity);

  if (status === 'success' && claimed) {
    return (
      <div
        className="mt-4 rounded-xl p-4 sm:p-5 flex flex-wrap items-center gap-x-4 gap-y-2"
        style={{ background: `${accent}12` }}
      >
        <p className="text-[14.5px] leading-[1.5] text-[#3f3d38] m-0 flex-1 min-w-[190px]">
          {claimed.wasPrior ? (
            <>
              You&rsquo;ve already claimed{' '}
              <strong className="font-semibold">{claimed.name}</strong>. The
              rest come with the{' '}
              <Link
                href="/join"
                className="font-semibold text-[#588157] underline decoration-[1.5px] underline-offset-2 hover:text-[#3d5c3b]"
              >
                membership
              </Link>
              .
            </>
          ) : (
            <>
              <strong className="font-semibold">{claimed.name}</strong> is
              yours. Enjoy it.
            </>
          )}
        </p>
        <a
          href={claimed.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#588157] px-4 py-2.5 text-[14px] font-semibold text-[#faf9f6] no-underline transition-colors hover:bg-[#3d5c3b] whitespace-nowrap"
        >
          Download it
          <span aria-hidden="true">&darr;</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-xl p-4 sm:p-5"
      style={{ background: `${accent}0f` }}
    >
      <div className="flex items-start gap-4">
        {/* Cover, so the bonus reads as a real thing rather than a newsletter */}
        <div className="relative hidden sm:block w-[62px] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-md border border-black/10">
          <Image
            src={`/products/${activity.slug}.jpg`}
            alt=""
            fill
            loading="lazy"
            sizes="62px"
            className="object-cover object-top"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] leading-[1.5] text-[#3f3d38] m-0">
            <strong className="font-semibold">
              Want one done properly, free?
            </strong>{' '}
            The list gives ideas. <strong>{activity.name}</strong> is a complete
            guided activity, step by step, three skill levels. Normally{' '}
            {activity.priceLabel}.
          </p>

          <form onSubmit={submit} className="mt-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="ideas-inline-email" className="sr-only">
                Email address
              </label>
              <input
                id="ideas-inline-email"
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                aria-describedby={errorMessage ? 'ideas-inline-error' : undefined}
                className={`min-w-0 flex-1 rounded-lg border bg-white px-3.5 py-2.5 text-[14.5px] text-gray-800 placeholder-gray-500 outline-none transition-shadow focus:ring-2 focus:ring-[#588157]/30 ${
                  errorMessage ? 'border-red-400' : 'border-[#D8D4C5]'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-lg bg-[#588157] px-4 py-2.5 text-[14.5px] font-semibold text-[#faf9f6] whitespace-nowrap transition-all hover:bg-[#3d5c3b] active:scale-[0.98] disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending…' : 'Send it to me'}
              </button>
            </div>
            {errorMessage && (
              <p
                id="ideas-inline-error"
                role="alert"
                className="mt-1.5 text-[13px] text-red-600"
              >
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
