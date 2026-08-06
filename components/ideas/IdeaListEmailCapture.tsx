'use client';

// ─── Content upgrade for the free idea lists ───
//
// The idea lists stay fully open (SEO and Pinterest traffic depend on it). This
// sits directly under the list and trades one complete guided activity for an
// email. It is deliberately a different KIND of thing from the page above it:
// the list gives ideas, the guide shows how to run one. More ideas would not be
// worth an email; this is.
//
// The activity is matched to the category, so a nature list gives a nature
// guide. Delivery is instant and on-page, so it works with no Kit automation in
// place. The `guide:{tag}` tag still fires for a later delivery sequence, and
// `from-ideas-{category}` tags the signup for segmented nurture.

import Image from 'next/image';
import Link from 'next/link';
import type { IdeaFreeActivity } from '@/lib/ideas-free-activity';
import { useIdeaOffer } from './useIdeaOffer';

interface Props {
  /** Category slug, used for the Kit attribution tag (from-ideas-{slug}). */
  categorySlug: string;
  /** Category accent colour, to keep the block inside its section's world. */
  accent: string;
  /** The guided activity given away here. */
  activity: IdeaFreeActivity;
}

export default function IdeaListEmailCapture({
  categorySlug,
  accent,
  activity,
}: Props) {
  // Shared with the compact offer beside the PDF download, so claiming in
  // either place settles both.
  const {
    email,
    setEmail,
    status,
    errorMessage,
    setErrorMessage,
    claimed,
    submit,
  } = useIdeaOffer(categorySlug, activity);
  // Show the membership pitch whenever what they hold isn't this page's guide:
  // either the server told us they'd already claimed, or they claimed a
  // different category earlier and localStorage carried it here.
  const priorClaim =
    claimed && (claimed.wasPrior || claimed.name !== activity.name)
      ? claimed
      : null;

  return (
    <section className="py-11 md:py-14 print:hidden">
      <div className="mx-auto max-w-[920px] px-6">
        <div
          className="rounded-[18px] p-7 md:p-10"
          style={{ background: `${accent}0f` }}
        >
          {status === 'success' && priorClaim ? (
            /* Already used their one free activity on another list. Say so
               plainly, hand back the one they own, and make the membership the
               obvious way to get the rest. */
            <div className="text-center py-2">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] tracking-tight text-balance">
                You&rsquo;ve already got yours.
              </h2>
              <p className="mt-3 text-[15.5px] leading-[1.6] text-[#4a4843] max-w-[480px] mx-auto">
                This email claimed{' '}
                <strong className="font-semibold">{priorClaim.name}</strong>, so
                here it is again. Every free idea list stays free, but the
                complete guides come with the membership.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/#membership"
                  className="inline-flex items-center gap-2.5 bg-[#588157] text-[#faf9f6] font-semibold py-3.5 px-7 rounded-xl text-[15.5px] hover:bg-[#3d5c3b] hover:-translate-y-px transition-all duration-200 no-underline"
                >
                  Get {activity.name} and the rest
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <a
                  href={priorClaim.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-[#588157] underline decoration-[1.5px] underline-offset-[3px] hover:text-[#3d5c3b] transition-colors"
                >
                  Re-download {priorClaim.name}
                </a>
              </div>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-2">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] tracking-tight text-balance">
                Here it is. Go and have fun.
              </h2>
              <p className="mt-3 text-[15.5px] leading-[1.6] text-[#4a4843] max-w-[460px] mx-auto">
                <strong className="font-semibold">{claimed?.name}</strong>{' '}
                is yours. Save it somewhere you&rsquo;ll find it again, and use
                it year after year.
              </p>
              <a
                href={claimed?.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 bg-[#588157] text-[#faf9f6] font-semibold py-3.5 px-7 rounded-xl text-[15.5px] hover:bg-[#3d5c3b] hover:-translate-y-px transition-all duration-200 no-underline"
              >
                Download {claimed?.name}
                <span aria-hidden="true">&darr;</span>
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_auto] gap-7 md:gap-10 items-center">
              <div className="min-w-0">
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] tracking-tight text-balance">
                  Ideas are the easy part.{' '}
                  <span className="italic" style={{ color: accent }}>
                    Here&rsquo;s one done properly.
                  </span>
                </h2>

                <p className="mt-3.5 text-[15.5px] leading-[1.65] text-[#4a4843]">
                  A list tells you what to do. <strong>{activity.name}</strong>{' '}
                  shows you how to run it: step by step, three skill levels so it
                  works for different ages, and what to say when they get stuck.
                </p>

                <p className="mt-2.5 text-[15.5px] leading-[1.65] text-[#4a4843]">
                  {activity.blurb}
                </p>

                <form onSubmit={submit} className="mt-6">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="ideas-capture-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="ideas-capture-email"
                        type="email"
                        required
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        aria-describedby={
                          errorMessage ? 'ideas-capture-error' : undefined
                        }
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-[15.5px] text-gray-800 placeholder-gray-500 outline-none transition-shadow focus:ring-2 focus:ring-[#588157]/30 ${
                          errorMessage ? 'border-red-400' : 'border-[#D8D4C5]'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="rounded-lg bg-[#588157] px-6 py-3 text-[15.5px] font-semibold text-[#faf9f6] whitespace-nowrap transition-all hover:bg-[#3d5c3b] active:scale-[0.98] disabled:opacity-70"
                    >
                      {status === 'loading' ? 'Sending…' : 'Send it to me'}
                    </button>
                  </div>

                  {errorMessage && (
                    <p
                      id="ideas-capture-error"
                      role="alert"
                      className="mt-2 text-[13.5px] text-red-600"
                    >
                      {errorMessage}
                    </p>
                  )}

                  <p className="mt-2.5 text-[12.5px] text-[#6e6b64]">
                    Normally {activity.priceLabel}. No spam, unsubscribe any
                    time.
                  </p>
                </form>
              </div>

              {/* Cover, so the offer looks like a real thing you receive.
                  Fixed 3:4 box: covers vary in ratio, and an unreserved one
                  shifted the layout when it loaded. */}
              <div className="hidden md:block relative w-[168px] aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden border border-black/10 shadow-[0_16px_30px_-18px_rgba(45,58,46,0.55)]">
                <Image
                  src={`/products/${activity.slug}.jpg`}
                  alt={`${activity.name} guide cover`}
                  fill
                  loading="lazy"
                  sizes="168px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
