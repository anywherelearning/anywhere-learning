'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';
import AuthNav from './AuthNav';

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b transition-all ${
        scrolled ? 'border-forest/10 shadow-sm' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="Anywhere Learning home">
          <LogoIcon size={28} />
          <span className="font-display text-xl text-forest">
            Anywhere Learning
          </span>
        </Link>

        {/* Center: Nav links (desktop only) */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-forest"
          >
            Shop
          </Link>
          <Link
            href="/free-guide"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-forest"
          >
            Free Guide
          </Link>
          <Link
            href="/#about"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-forest"
          >
            Our Philosophy
          </Link>
        </nav>

        {/* Right: Account + CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <AuthNav />
          <Link
            href="/shop"
            className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark"
          >
            Browse Packs
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-forest/5 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-forest"
          >
            {mobileOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu — full screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-cream md:hidden">
          <nav className="flex flex-col items-center justify-center gap-8 pt-20">
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-medium text-forest transition-colors hover:text-forest-dark"
            >
              Shop
            </Link>
            <Link
              href="/free-guide"
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-medium text-forest transition-colors hover:text-forest-dark"
            >
              Free Guide
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-medium text-forest transition-colors hover:text-forest-dark"
            >
              Our Philosophy
            </Link>
            <div className="text-2xl font-medium text-forest">
              <AuthNav onLinkClick={() => setMobileOpen(false)} />
            </div>
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-xl bg-forest px-8 py-3.5 text-lg font-semibold text-cream transition-colors hover:bg-forest-dark"
            >
              Browse Packs
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
