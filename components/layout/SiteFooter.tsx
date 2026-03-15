import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  );
}

export default function SiteFooter() {
  const linkClass = 'block text-sm text-gray-500 transition-colors hover:text-forest';

  return (
    <footer className="relative bg-[#faf9f6] pt-0 pb-[max(4rem,calc(1rem+env(safe-area-inset-bottom)))]">
      {/* Decorative organic top edge */}
      <div className="relative h-12 -mt-1 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1200 48" fill="none" preserveAspectRatio="none" className="absolute top-0 w-full h-12">
          <path d="M0 0 Q200 40 400 24 T800 32 T1200 16 V48 H0 Z" fill="#faf9f6" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="Anywhere Learning home">
              <LogoIcon size={28} />
              <span className="font-display text-xl text-forest">
                Anywhere Learning
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Real-world activity packs for homeschool and worldschool families. No prep, no worksheets — just meaningful time together.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/anywherelearning"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-forest transition-colors"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://ca.pinterest.com/anywherelearning/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-forest transition-colors"
                aria-label="Follow us on Pinterest"
              >
                <PinterestIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Shop
            </h3>
            <nav className="space-y-2.5">
              <Link href="/shop" className={linkClass}>
                Activity Packs
              </Link>
              <Link href="/shop?category=bundle" className={linkClass}>
                Bundles
              </Link>
              <Link href="/free-guide" className={linkClass}>
                Free Guide
              </Link>
            </nav>
          </div>

          {/* Column 3: Learn */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Learn
            </h3>
            <nav className="space-y-2.5">
              <Link href="/blog" className={linkClass}>
                Blog
              </Link>
              <Link href="/about" className={linkClass}>
                About
              </Link>
              <Link href="/faq" className={linkClass}>
                FAQ
              </Link>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <nav className="space-y-2.5">
              <a
                href="mailto:info@anywherelearning.co"
                className={linkClass}
              >
                info@anywherelearning.co
              </a>
              <Link href="/contact" className={linkClass}>
                Get in Touch
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200/60 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Anywhere Learning. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-forest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-forest transition-colors">
              Terms
            </Link>
          </div>
          <p className="font-display text-sm text-forest/60">
            Meaningful Learning, Wherever You Are
          </p>
        </div>
      </div>
    </footer>
  );
}
