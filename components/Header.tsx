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
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-2">
          {/* Placeholder logo circle */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="14" fill="#588157" />
            <path
              d="M8 18c2-4 4-8 6-8s4 4 6 8"
              stroke="#faf9f6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M11 16c1-2 2-4 3-4s2 2 3 4"
              stroke="#faf9f6"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-[family-name:var(--font-display)] text-lg text-forest">
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
