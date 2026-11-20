"use client";

import { useEffect, useState, FormEvent, ReactNode } from "react";
import useAttributionSource from "@/components/useAttributionSource";

/**
 * One-field email capture shared by /workshop and /a-reason-to-learn.
 * Same attribution and Meta/GA4 lead tracking as the course signup.
 */
export default function LiveSignup({
  id,
  endpoint,
  trackAs,
  buttonLabel,
  finePrint,
  successTitle,
  successBody,
  defaultEmail = "",
}: {
  id: string;
  endpoint: string;
  /** Lead source label for the pixel, e.g. "workshop". */
  trackAs: string;
  buttonLabel: string;
  finePrint?: string;
  successTitle: string;
  successBody: ReactNode;
  /** Prefilled for signed-in members, so it's one click. */
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const { newMetaEventId } = await import("@/lib/tracking");
      const metaEventId = newMetaEventId();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: source || undefined, metaEventId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        fail(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      try {
        const { pinterestSetEnhancedMatch, trackLead } = await import("@/lib/tracking");
        pinterestSetEnhancedMatch(email);
        trackLead(source ? `${trackAs}:${source}` : trackAs, metaEventId);
      } catch {}
    } catch {
      fail("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="-rotate-1 bg-[#FBF3DC] p-7 text-center shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)]">
        <p className="font-display text-[24px] leading-tight text-forest-dark">{successTitle}</p>
        <div className="mx-auto mt-2.5 max-w-[42ch] text-[15px] leading-[1.6] text-gray-700">{successBody}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${shaking ? "animate-shake" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`live-email-${id}`} className="sr-only">
          Email address
        </label>
        <input
          id={`live-email-${id}`}
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          aria-describedby={errorMessage ? `live-email-error-${id}` : undefined}
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
          {status === "loading" ? "Saving…" : buttonLabel}
        </button>
      </div>
      {errorMessage && (
        <p id={`live-email-error-${id}`} role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      {finePrint && <p className="mt-3 text-center text-xs text-gray-500">{finePrint}</p>}
    </form>
  );
}

/** The workshop time in the visitor's own time zone (rendered after mount). */
export function LocalTime({ iso, className }: { iso: string; className?: string }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "America/New_York" || tz === "America/Toronto") return;
      setLabel(
        new Date(iso).toLocaleString("en-US", {
          weekday: "long",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
      );
    } catch {}
  }, [iso]);
  if (!label) return null;
  return <span className={className}>That&apos;s {label} where you are.</span>;
}
