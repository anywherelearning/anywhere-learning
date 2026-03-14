import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function SiteFooter() {
  return (
    <footer className="relative bg-[#f7f5f0] pt-0 pb-[max(4rem,calc(1rem+env(safe-area-inset-bottom)))]">
      {/* Decorative organic top edge */}
      <div className="relative h-12 -mt-1 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1200 48" fill="none" preserveAspectRatio="none" className="absolute top-0 w-full h-12">
          <path d="M0 0 Q200 40 400 24 T800 32 T1200 16 V48 H0 Z" fill="#f7f5f0" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="Anywhere Learning home">
              <LogoIcon size={28} />
              <span className="font-display text-xl text-forest">
                Anywhere Learning
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Meaningful learning, wherever you are. Real-world activity packs
              for homeschool and worldschool families.
            </p>
          </div>

          {/* Column 2: Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Explore
            </h3>
            <nav className="space-y-2.5">
              <Link
                href="/shop"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                Activity Packs
              </Link>
              <Link
                href="/shop?category=bundle"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                Bundles
              </Link>
              <Link
                href="/account/downloads"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                My Downloads
              </Link>
              <Link
                href="/free-guide"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                Free Guide
              </Link>
              <Link
                href="/blog"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Connect
            </h3>
            <nav className="space-y-2.5">
              <a
                href="mailto:info@anywherelearning.co"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
              >
                info@anywherelearning.co
              </a>
              <a
                href="https://instagram.com/anywherelearning"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://ca.pinterest.com/anywherelearning/"
                className="block text-sm text-gray-400 transition-colors hover:text-forest"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pinterest
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200/60 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-300">
            &copy; {new Date().getFullYear()} Anywhere Learning. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-300 hover:text-forest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-300 hover:text-forest transition-colors">
              Terms
            </Link>
          </div>
          <p className="font-display text-sm text-forest/40">
            Meaningful Learning, Wherever You Are
          </p>
        </div>
      </div>
    </footer>
  );
}
