import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12" aria-label="Anywhere Learning home">
        <LogoIcon size={32} />
        <span className="font-display text-xl" style={{ color: '#588157' }}>
          Anywhere Learning
        </span>
      </Link>

      {/* Leaf icon */}
      <div className="w-16 h-16 bg-[#588157]/5 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" style={{ color: '#588157' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      </div>

      {/* Message */}
      <h1 className="font-display text-3xl md:text-4xl text-center leading-tight mb-3" style={{ color: '#588157' }}>
        This trail doesn&apos;t lead anywhere
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        The page you&apos;re looking for has wandered off. Let&apos;s get you back on track.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/shop"
          className="text-sm font-semibold py-3 px-6 rounded-xl transition-all text-white"
          style={{ backgroundColor: '#588157' }}
        >
          Browse Activity Packs
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold py-3 px-6 rounded-xl border-2 transition-all"
          style={{ borderColor: '#588157', color: '#588157' }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
