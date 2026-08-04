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
        className="h-full rounded-xl border p-4 sm:p-5 flex gap-4"
        style={{ borderColor: `${accent}25`, background: `${accent}14` }}
      >
        <div className="relative w-[84px] sm:w-[92px] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg border border-black/10 shadow-[0_6px_16px_-10px_rgba(45,58,46,0.35)]">
          <Image
            src={`/products/${activity.slug}.jpg`}
            alt=""
            fill
            loading="lazy"
            sizes="92px"
            className="object-cover object-top"
          />
        </div>

        <div className="min-w-0 flex-1 flex flex-col">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5"
            style={{ color: accent }}
          >
            {claimed.wasPrior ? 'Already claimed' : 'It\u2019s yours'}
          </p>
          <p className="text-[14px] leading-[1.5] text-[#4a4843] m-0">
            {claimed.wasPrior ? (
              <>
                You already have{' '}
                <strong className="font-semibold text-[#3f3d38]">
                  {claimed.name}
                </strong>
                . The rest come with the{' '}
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
                <strong className="font-semibold text-[#3f3d38]">
                  {claimed.name}
                </strong>{' '}
                is yours. Use it year after year.
              </>
            )}
          </p>

          <div className="mt-auto pt-3.5">
            <a
              href={claimed.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#588157] px-3.5 py-2.5 text-[13px] font-semibold text-[#faf9f6] no-underline transition-colors hover:bg-[#3d5c3b] whitespace-nowrap"
            >
              Download it
              <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full rounded-xl border p-4 sm:p-5 flex gap-4"
      style={{ borderColor: `${accent}25`, background: `${accent}0f` }}
    >
      {/* Cover, so the bonus reads as a real thing rather than a newsletter.
          Matches the checklist thumb next to it, same size and same ratio. */}
      <div className="relative w-[84px] sm:w-[92px] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg border border-black/10 shadow-[0_6px_16px_-10px_rgba(45,58,46,0.35)]">
        <Image
          src={`/products/${activity.slug}.jpg`}
          alt=""
          fill
          loading="lazy"
          sizes="92px"
          className="object-cover object-top"
        />
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5"
          style={{ color: accent }}
        >
          Free bonus activity
        </p>
        <p className="text-[14px] leading-[1.5] text-[#4a4843] m-0">
          <strong className="font-semibold text-[#3f3d38]">
            Want one already planned out?
          </strong>{' '}
          {activity.name} gives you the whole thing: what to say, three skill
          levels, no prep. Normally {activity.priceLabel}.
        </p>

        <form onSubmit={submit} className="mt-auto pt-3.5">
          <div className="flex flex-row gap-2">
            <label htmlFor="ideas-inline-email" className="sr-only">
              Email address
            </label>
            <input
              id="ideas-inline-email"
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              aria-describedby={errorMessage ? 'ideas-inline-error' : undefined}
              className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2.5 text-[13.5px] text-gray-800 placeholder-gray-500 outline-none transition-shadow focus:ring-2 focus:ring-[#588157]/30 ${
                errorMessage ? 'border-red-400' : 'border-[#D8D4C5]'
              }`}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex-shrink-0 rounded-lg bg-[#588157] px-3.5 py-2.5 text-[13px] font-semibold text-[#faf9f6] whitespace-nowrap transition-all hover:bg-[#3d5c3b] active:scale-[0.98] disabled:opacity-70"
            >
              {status === 'loading' ? 'Sending…' : 'Send it'}
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
  );
}
