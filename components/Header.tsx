"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/Logo";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToForm(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById("hero-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header
      className={`sticky top-0 right-0 left-0 z-50 bg-cream/95 backdrop-blur-sm border-b transition-all ${
        scrolled ? "border-forest/10 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span className="font-display text-xl text-forest">
            Anywhere Learning
          </span>
        </Link>

        {/* CTA */}
        <a
          href="#hero-form"
          onClick={scrollToForm}
          className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark"
        >
          Get the free guide &rarr;
        </a>
      </div>
    </header>
  );
}
