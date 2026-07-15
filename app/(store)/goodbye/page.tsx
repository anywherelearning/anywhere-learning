import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * /goodbye — landing page for the one-tap exit survey in cancellation
 * emails. The reason was already recorded by /api/exit-reason before the
 * redirect here, so this page has one job: say thank you like a person.
 */

export const metadata: Metadata = {
  title: 'Thank You',
  robots: { index: false, follow: false },
};

export default function GoodbyePage() {
  return (
    <main className="bg-cream px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[560px] text-center">
        <span className="inline-grid h-14 w-14 place-items-center rounded-full border border-[#C9D3BE] bg-[#E6EBDF] text-forest-dark">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-[clamp(34px,4.6vw,48px)] leading-[1.1] tracking-tight text-gray-900">
          Thank you. <em className="font-display not-italic text-forest">That genuinely helps.</em>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-gray-500">
          Anywhere Learning is built by one person, and answers like yours are how it gets
          better. If you ever want to say more, just reply to the confirmation email, it lands
          straight in Amelie&apos;s inbox.
        </p>
        <p className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-forest-dark underline decoration-dotted underline-offset-4 hover:text-forest"
          >
            Back to the site
            <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </main>
  );
}
