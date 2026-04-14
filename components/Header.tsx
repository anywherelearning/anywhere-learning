"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 right-0 left-0 z-50 bg-cream/95 backdrop-blur-sm border-b transition-all ${
        scrolled ? "border-forest/10 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo. Must match SiteHeader exactly */}
        <Link href="/" className="flex items-center gap-2" aria-label="Anywhere Learning home">
          <Image
            src="/logo-icon-transparent.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-auto sm:h-9"
            priority
            aria-hidden="true"
          />
          <Image
            src="/logo-text-v2.png"
            alt="Anywhere Learning"
            width={200}
            height={50}
            className="hidden sm:block h-16 w-auto"
            priority
          />
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-600 hover:text-forest transition-colors"
          >
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
