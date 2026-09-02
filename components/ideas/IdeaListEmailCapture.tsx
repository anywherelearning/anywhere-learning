'use client';

// ─── The same gated ask, repeated below the list ───
//
// The idea lists themselves stay fully open (SEO and Pinterest traffic depend
// on it). What sits behind the email is the printable version of the list.
//
// This is the full-size version of the card at the top of the page, for anyone
// who scrolled the whole list. Both share state through useIdeaOffer, so
// unlocking in either place settles both.
//
// Delivery is instant and on-page, so it works with no Kit automation in place.
// The signup gets `checklist-subscriber` rather than `lead`: these people asked
// for a checklist, not the 7-day guide, so they stay out of that sequence. A
// `checklist:{list}` tag records which list actually did the converting.

import Image from 'next/image';
import Link from 'next/link';
import { useIdeaOffer } from './useIdeaOffer';

interface Props {
  /** This list's slug, for the counting tag and the cover image. */
  listSlug: string;
  /** Category slug, for the Meta lead event. */
  categorySlug: string;
  /** Category accent colour, to keep the block inside its section's world. */
  accent: string;
  /** This list's printable. Null when no PDF has been built for it yet. */
  pdfUrls: { color: string; bw: string } | null;
}

export default function IdeaListEmailCapture({
  listSlug,
  categorySlug,
  accent,
  pdfUrls,
}: Props) {
  const { email, setEmail, status, errorMessage, setErrorMessage, unlocked, submit } =
    useIdeaOffer(listSlug, categorySlug);

  if (!pdfUrls) return null;

  return (
    <section className="py-11 md:py-14 print:hidden">
      <div className="mx-auto max-w-[920px] px-6">
        <div
          className="rounded-[18px] p-7 md:p-10"
          style={{ background: `${accent}0f` }}
        >
          {unlocked ? (
            <div className="text-center py-2">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] tracking-tight text-balance">
                Here it is. Go and have fun.
              </h2>

              <p className="mt-3 text-[15.5px] leading-[1.6] text-[#4a4843] max-w-[480px] mx-auto">
                Print it, stick it somewhere you&rsquo;ll see it, and tick
                things off as you go.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center items-center">
                <a
                  href={pdfUrls.color}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#588157] text-[#faf9f6] font-semibold py-3.5 px-7 rounded-xl text-[15.5px] hover:bg-[#3d5c3b] hover:-translate-y-px transition-all duration-200 no-underline"
                >
                  Download in full colour
                  <span aria-hidden="true">&darr;</span>
                </a>
                <a
                  href={pdfUrls.bw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-[#588157] underline decoration-[1.5px] underline-offset-[3px] hover:text-[#3d5c3b] transition-colors"
                >
                  Black &amp; white version
                </a>
              </div>

              <p className="mt-7 text-[15px] leading-[1.6] text-[#4a4843]">
                Ideas are the easy part.{' '}
                <Link
                  href="/#membership"
                  className="font-semibold text-[#588157] underline decoration-[1.5px] underline-offset-[3px] hover:text-[#3d5c3b] transition-colors"
                >
                  The membership
                </Link>{' '}
                shows you how to run them: step by step, three skill levels, and
                what to say when they get stuck.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_auto] gap-7 md:gap-10 items-center">
              <div className="min-w-0">
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] tracking-tight text-balance">
                  Want this list{' '}
                  <span className="italic" style={{ color: accent }}>
                    on paper?
                  </span>
                </h2>

                <p className="mt-3.5 text-[15.5px] leading-[1.65] text-[#4a4843]">
                  The printable version, in full colour and black and white.
                  Print it for the fridge or tuck it in your bag, and let them
                  tick things off themselves.
                </p>

                <p className="mt-2.5 text-[15.5px] leading-[1.65] text-[#4a4843]">
                  Everything on this page stays free to read. The printable is
                  just the version that survives leaving the house.
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
                    Straight to the download, no waiting on an email. No spam,
                    unsubscribe any time.
                  </p>
                </form>
              </div>

              {/* Cover, so the offer looks like a real thing you receive.
                  Fixed 3:4 box: an unreserved one shifted the layout when it
                  loaded. contain, not cover, so no edge gets sliced off. */}
              <div className="hidden md:block relative w-[168px] aspect-[3/4] flex-shrink-0">
                <Image
                  src={`/ideas/${listSlug}.jpg`}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="168px"
                  className="object-contain drop-shadow-[0_16px_30px_rgba(45,58,46,0.35)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
