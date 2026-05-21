import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CustomSignInForm from '../CustomSignInForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Anywhere Learning account to access your library.',
};

export default function SignInPage() {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) return <FallbackSignIn />;

  return (
    <main className="relative min-h-screen bg-cream overflow-hidden">
      {/* Faint horizon arcs bottom-right (decorative) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-20 opacity-50"
        width="360"
        height="360"
        viewBox="0 0 360 360"
      >
        <circle cx="180" cy="180" r="160" stroke="#E6EBDF" strokeWidth="1" fill="none" />
        <circle cx="180" cy="180" r="120" stroke="#E6EBDF" strokeWidth="1" fill="none" />
        <circle cx="180" cy="180" r="80" stroke="#E6EBDF" strokeWidth="1" fill="none" />
      </svg>

      {/* Top: centered logo + skill-focused tagline */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 pt-9 px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-ink no-underline hover:opacity-85 transition-opacity"
          aria-label="Anywhere Learning home"
        >
          <Image
            src="/logo-icon-transparent.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-auto"
            aria-hidden="true"
            priority
          />
          <span className="inline-flex items-baseline gap-1">
            <span className="font-body font-normal text-[20px] text-ink tracking-wide">anywhere</span>
            <span className="font-display italic text-[22px] text-forest-dark leading-none">
              learning
            </span>
          </span>
        </Link>
        <span className="font-display italic text-[14px] text-gray-500 tracking-[0.01em]">
          Hands-on activities for raising capable kids, ready for real life.
        </span>
      </div>

      {/* Main composition: warm-side + card */}
      <div className="relative z-10 mx-auto max-w-[1180px] px-6 lg:px-14 pt-12 pb-24 lg:pt-20 lg:pb-28">
        <CustomSignInForm />
      </div>

      {/* Bottom: Back to home */}
      <div className="absolute left-0 right-0 bottom-6 text-center z-10">
        <Link
          href="/"
          className="text-[13px] text-gray-500 font-body border-b border-dashed border-[#C9C5B7] pb-0.5 hover:text-forest-dark hover:border-forest transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </main>
  );
}

function FallbackSignIn() {
  return (
    <main className="min-h-[70vh] grid place-items-center bg-cream px-6 py-16">
      <div className="max-w-[480px] text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5 mb-4">
          <span className="w-[22px] h-px bg-forest inline-block" />
          Sign in
        </p>
        <h1 className="font-display text-[clamp(1.875rem,3.6vw,2.5rem)] leading-[1.08] tracking-tight text-balance">
          Sign-in is{' '}
          <em className="not-italic italic text-forest">coming soon.</em>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.6] text-gray-600 max-w-[420px] mx-auto">
          Member accounts open with the public launch. If you bought the Starter Pack or membership
          before then, your account link will arrive in your welcome email from Amelie.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/join"
            className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15px] shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all"
          >
            See the membership
            <span className="font-display italic">&rarr;</span>
          </Link>
          <Link
            href="/free-guide"
            className="inline-flex items-center gap-2 text-forest-dark font-semibold text-[14.5px] border-b border-forest/25 pb-0.5 hover:text-forest transition-colors"
          >
            Or get the free guide
            <span className="font-display italic">&rarr;</span>
          </Link>
        </div>
        <p className="mt-8 text-[13.5px] text-gray-500">
          Already a customer needing help?{' '}
          <Link
            href="/contact"
            className="text-forest-dark font-semibold border-b border-forest/25 pb-px hover:text-forest transition-colors"
          >
            Email us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
