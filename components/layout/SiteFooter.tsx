import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function SiteFooter() {
  return (
    <footer className="bg-cream py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <Link href="/" aria-label="Anywhere Learning home">
            <LogoIcon size={32} />
          </Link>

          {/* Tagline */}
          <p className="font-display text-sm text-forest/60">
            Anywhere Learning · Meaningful Learning, Wherever You Are
          </p>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/shop"
              className="text-sm text-gray-500 transition-colors hover:text-forest"
            >
              Shop
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-forest"
            >
              About
            </Link>
            <a
              href="mailto:info@anywherelearning.co"
              className="text-sm text-gray-500 transition-colors hover:text-forest"
            >
              Contact
            </a>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-forest"
            >
              Privacy Policy
            </Link>
          </nav>

          {/* Email */}
          <a
            href="mailto:info@anywherelearning.co"
            className="text-sm text-gray-400 transition-colors hover:text-forest"
          >
            info@anywherelearning.co
          </a>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Anywhere Learning
          </p>
        </div>
      </div>
    </footer>
  );
}
