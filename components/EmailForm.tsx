"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

const SOURCE_STORAGE_KEY = "subscribe-source";

interface EmailFormProps {
  variant?: "light" | "dark";
  buttonText?: string;
  successHeading?: string;
  successBody?: string;
  /** Stack input above button instead of placing them side-by-side. Use in narrow sidebars. */
  stacked?: boolean;
}

export default function EmailForm({ variant = "light", buttonText = "Send me the free guide", successHeading = "Check your inbox! Your guide is on its way.", successBody = "While you wait, explore our ready-to-use activity guides.", stacked = false }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const [source, setSource] = useState("");

  const isLight = variant === "light";

  // Capture attribution source on mount: prefer ?source= over ?utm_source=,
  // persist in sessionStorage so it survives blog navigation before signup.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSource = params.get("source") || params.get("utm_source") || "";

      if (urlSource) {
        setSource(urlSource);
        sessionStorage.setItem(SOURCE_STORAGE_KEY, urlSource);
        return;
      }

      const stored = sessionStorage.getItem(SOURCE_STORAGE_KEY) || "";
      if (stored) setSource(stored);
    } catch {
      // sessionStorage unavailable (private mode, etc.) - fail silently
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: source || undefined }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        return;
      }

      setStatus("success");
      try { localStorage.setItem('free-guide-submitted', 'true'); } catch {}
      // Push email into Pinterest enhanced match so any subsequent events
      // on this session (and future sessions if the cookie persists) carry
      // em coverage for Event Quality Score.
      try {
        const { pinterestSetEnhancedMatch } = await import('@/lib/tracking');
        pinterestSetEnhancedMatch(email);
      } catch {}
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-xl p-6 text-center ${
          isLight ? "bg-forest/5" : "bg-cream/10"
        }`}
      >
        <p
          className={`text-lg font-semibold ${
            isLight ? "text-forest" : "text-cream"
          }`}
        >
          {successHeading}
        </p>
        <p
          className={`mt-2 text-sm ${
            isLight ? "text-gray-500" : "text-cream/80"
          }`}
        >
          {successBody}
        </p>
        <Link
          href="/shop"
          className={`mt-4 inline-block rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] ${
            isLight
              ? "bg-forest text-cream hover:bg-forest-dark"
              : "bg-gold text-forest-dark hover:bg-gold-light"
          }`}
        >
          Browse Activity Guides
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${shaking ? "animate-shake" : ""}`}>
      <div className={`flex flex-col ${stacked ? 'gap-2' : 'gap-3 sm:flex-row'}`}>
        <div className="flex-1">
          <label htmlFor={`email-${variant}`} className="sr-only">
            Email address
          </label>
          <input
            id={`email-${variant}`}
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            aria-describedby={errorMessage ? `email-error-${variant}` : undefined}
            className={`w-full rounded-lg outline-none transition-shadow focus:ring-2 ${
              stacked ? "px-3 py-2.5 text-[14px]" : "px-4 py-3.5 text-base"
            } ${
              isLight
                ? "border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-forest/30"
                : "border border-cream/20 bg-white/10 text-cream placeholder-cream/60 focus:ring-gold/40"
            } ${errorMessage ? (isLight ? "border-red-400" : "border-red-300") : ""}`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className={`rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-70 ${
            stacked ? "px-4 py-2.5 text-[14px]" : "px-6 py-3.5 text-base"
          } ${
            isLight
              ? "bg-forest text-cream hover:bg-forest-dark"
              : "bg-gold text-forest-dark hover:bg-gold-light"
          }`}
        >
          {status === "loading" ? "Sending…" : buttonText}
        </button>
      </div>

      {errorMessage && (
        <p id={`email-error-${variant}`} role="alert" className={`mt-2 text-sm ${isLight ? "text-red-600" : "text-red-300"}`}>
          {errorMessage}
        </p>
      )}

      <p
        className={`mt-3 text-center text-xs ${
          isLight ? "text-gray-400" : "text-cream/50"
        }`}
      >
        No spam. No fluff. Unsubscribe any time.
      </p>
    </form>
  );
}
