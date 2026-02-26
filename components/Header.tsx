"use client";

import { useState, useEffect } from "react";

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
      className={`fixed top-0 right-0 left-0 z-50 bg-cream/95 backdrop-blur-sm transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logo-icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            aria-hidden="true"
          />
          <span className="font-display text-lg text-forest">
            Anywhere Learning
          </span>
        </div>

        {/* CTA */}
        <a
          href="#hero-form"
          onClick={scrollToForm}
          className="rounded-lg bg-forest px-3.5 py-1.5 text-sm font-semibold text-cream transition-all hover:scale-[1.02] hover:bg-forest-dark"
        >
          Get the free guide →
        </a>
      </div>
    </header>
  );
}
