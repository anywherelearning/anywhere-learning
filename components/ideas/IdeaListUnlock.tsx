'use client';

// ─── The gated printable, at the top of an idea list page ───
//
// One email, one file: the printable version of this list. The 50 ideas below
// stay open, since they are what earns the search traffic, so nothing that
// ranks sits behind this.
//
// This replaced a pair of cards where the printable was free with no email and
// a complete guided activity beside it cost one. Nobody paid the email. See
// useIdeaOffer for why the activity is no longer bundled in here.

import Image from 'next/image';
import { useIdeaOffer } from './useIdeaOffer';

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function IdeaListUnlock({
  listSlug,
  listTitle,
  categorySlug,
  accent,
  pdfUrls,
}: {
  listSlug: string;
  listTitle: string;
  categorySlug: string;
  accent: string;
  /** Null when this list has no printable built yet, which hides the ask. */
  pdfUrls: { color: string; bw: string } | null;
}) {
  const { email, setEmail, status, errorMessage, setErrorMessage, unlocked, submit } =
    useIdeaOffer(listSlug, categorySlug);

  // No printable for this list yet: nothing to trade, so don't ask.
  if (!pdfUrls) return null;

  return (
    <div className="mx-auto max-w-[920px] px-6 -mt-2 mb-5 print:hidden">
      <div
        className="rounded-xl border p-4 sm:p-5 flex gap-4"
        style={{
          borderColor: `${accent}25`,
          background: unlocked ? `${accent}14` : `${accent}0f`,
        }}
      >
        {/* contain, not cover: the checklists are 0.773 and nothing here is
            croppable art, so a fixed ratio would slice the edges off. */}
        <div className="relative w-[84px] sm:w-[92px] aspect-[3/4] flex-shrink-0">
          <Image
            src={`/ideas/${listSlug}.jpg`}
            alt={listTitle}
            fill
            priority
            sizes="92px"
            className="object-contain drop-shadow-[0_5px_12px_rgba(45,58,46,0.3)]"
          />
        </div>

        <div className="min-w-0 flex-1 flex flex-col">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5"
            style={{ color: accent }}
          >
            {unlocked ? 'Yours to keep' : 'Free printable checklist'}
          </p>

          <p className="text-[14px] leading-[1.55] text-[#4a4843] m-0">
            {unlocked ? (
              <>
                Print it for the fridge or your bag, and tick things off as you
                go.
              </>
            ) : (
              <>
                <strong className="font-semibold text-[#3f3d38]">
                  Want this list on paper?
                </strong>{' '}
                Full colour or black and white, ready for the fridge or your
                bag.
              </>
            )}
          </p>

          {unlocked ? (
            <div className="mt-auto pt-3.5 flex flex-wrap gap-2">
              <a
                href={pdfUrls.color}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white px-3 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
                style={{ background: accent }}
              >
                <DownloadIcon />
                Full colour
              </a>
              <a
                href={pdfUrls.bw}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2.5 rounded-lg border-2 transition-all hover:-translate-y-px hover:shadow-md no-underline whitespace-nowrap"
                style={{ color: accent, borderColor: accent, background: 'transparent' }}
              >
                <DownloadIcon />
                Black &amp; white
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-auto pt-3.5">
              <div className="flex flex-row gap-2">
                <label htmlFor="ideas-unlock-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="ideas-unlock-email"
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  aria-describedby={
                    errorMessage ? 'ideas-unlock-error' : undefined
                  }
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
                  id="ideas-unlock-error"
                  role="alert"
                  className="mt-1.5 text-[13px] text-red-600"
                >
                  {errorMessage}
                </p>
              )}

              <p className="mt-2 text-[12px] text-[#6e6b64]">
                Every idea below stays free to read. No spam, unsubscribe any
                time.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
