"use client";

import { useState, FormEvent } from "react";
import useAttributionSource from "@/components/useAttributionSource";

/**
 * Email capture for the free 5-day course. Posts to /api/course (course-rwl
 * tag, no generic `lead` tag). Mirrors ChallengeSignup's attribution and
 * tracking, with its own success state.
 */
export default function CourseSignup({ id = "top" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const source = useAttributionSource();

  function fail(message: string) {
    setErrorMessage(message);
    setStatus("error");
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fail("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      // Shared browser/server id so Meta dedupes the pixel + Conversions API pair.
      const { newMetaEventId } = await import("@/lib/tracking");
      const metaEventId = newMetaEventId();
      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: source || undefined, metaEventId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        fail(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      try {
        const { pinterestSetEnhancedMatch, trackLead } = await import("@/lib/tracking");
        pinterestSetEnhancedMatch(email);
        trackLead(source ? `course:${source}` : "course", metaEventId);
      } catch {}
    } catch {
      fail("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[#C9D3BE] bg-[#E6EBDF] p-7 text-center">
        <p className="font-display text-[24px] leading-tight text-forest-dark">
          Day 1 is on its way.
        </p>
        <p className="mx-auto mt-2.5 max-w-[42ch] text-[15px] leading-[1.6] text-gray-700">
          Check your inbox in the next few minutes. The next four arrive one a day,
          in the morning. If you can&apos;t find it, look in Promotions and drag it
          into your main inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${shaking ? "animate-shake" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`course-email-${id}`} className="sr-only">
          Email address
        </label>
        <input
          id={`course-email-${id}`}
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          aria-describedby={errorMessage ? `course-email-error-${id}` : undefined}
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
          {status === "loading" ? "Sending…" : "Send me Day 1"}
        </button>
      </div>
      {errorMessage && (
        <p id={`course-email-error-${id}`} role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-gray-400">
        Free. One short email a day for five days. Unsubscribe any time.
      </p>
    </form>
  );
}
