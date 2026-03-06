import Link from 'next/link';
import { LogoFull } from '@/components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12">
      {/* Decorative leaf accent */}
      <svg
        className="pointer-events-none fixed right-[8%] top-[12%] w-48 opacity-[0.04]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M100 20 Q120 60 160 80 Q120 90 100 140 Q80 90 40 80 Q80 60 100 20Z"
          fill="#588157"
        />
        <path
          d="M100 40 L100 140"
          stroke="#588157"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M100 70 Q80 60 60 70" stroke="#588157" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M100 90 Q120 80 140 85" stroke="#588157" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>

      {/* Logo + tagline */}
      <Link href="/" className="mb-8 flex flex-col items-center gap-3 transition-opacity hover:opacity-80">
        <LogoFull iconSize={44} />
        <p className="text-sm text-gray-400">
          Meaningful Learning, Wherever You Are
        </p>
      </Link>

      {/* Clerk component */}
      {children}

      {/* Back to home */}
      <Link
        href="/"
        className="mt-8 text-sm text-gray-400 transition-colors hover:text-forest"
      >
        &larr; Back to home
      </Link>
    </div>
  );
}
