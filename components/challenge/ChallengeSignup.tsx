"use client";

import { useState, useEffect, FormEvent } from "react";
import { CHALLENGE } from "@/lib/challenge";

const SOURCE_STORAGE_KEY = "subscribe-source";

/**
 * Email capture for the 5-Day Challenge. Posts to /api/challenge (challenge-
 * signup tag, no generic `lead` tag). Mirrors EmailForm's attribution +
 * tracking, but its own success state points to the inbox / FB group.
 */
export default function ChallengeSignup({ id = "top" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const [source, setSource] = useState("");

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
      // sessionStorage unavailable (private mode) - fail silently
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
      const res = await fetch("/api/challenge", {
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
      try { localStorage.setItem("challenge-signup", "1"); } catch {}
      try {
        const { pinterestSetEnhancedMatch, metaLead } = await import("@/lib/tracking");
        pinterestSetEnhancedMatch(email);
        metaLead(source ? `challenge:${source}` : "challenge");
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
      <div className="rounded-2xl border border-[#C9D3BE] bg-[#E6EBDF] p-7 text-center">
        <p className="font-display text-[24px] leading-tight text-forest-dark">
          You&apos;re in. Save the date.
        </p>
        <p className="mx-auto mt-2.5 max-w-[42ch] text-[15px] leading-[1.6] text-gray-700">
          Check your inbox for a welcome email. It has everything you need, plus
          the link to our pop-up group. We start {CHALLENGE.startLabel}, and
          I&apos;ll be right there in the group with you.
        </p>
        {CHALLENGE.fbGroupUrl ? (
          <a
            href={CHALLENGE.fbGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 text-[15px] font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98]"
          >
            Join the group now
            <span className="font-display text-[17px] leading-none">&rarr;</span>
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${shaking ? "animate-shake" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`challenge-email-${id}`} className="sr-only">
          Email address
        </label>
        <input
          id={`challenge-email-${id}`}
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          aria-describedby={errorMessage ? `challenge-email-error-${id}` : undefined}
          className={`min-w-0 flex-1 rounded-lg border bg-white px-4 py-3.5 text-base text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
            errorMessage ? "border-red-400" : "border-gray-200"
          }`}
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-forest px-6 py-3.5 text-base font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98] disabled:opacity-70"
        >
          {status === "loading" ? "Saving your spot…" : "Save my free spot"}
        </button>
      </div>
      {errorMessage && (
        <p id={`challenge-email-error-${id}`} role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-gray-400">
        Free to join. No spam, no fluff. Unsubscribe any time.
      </p>
    </form>
  );
}
