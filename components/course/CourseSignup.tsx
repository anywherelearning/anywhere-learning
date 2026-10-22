"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import useAttributionSource from "@/components/useAttributionSource";
import { SKILLS_MAP } from "@/lib/skills-map";

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
  const [ref, setRef] = useState<string | undefined>();
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
      setRef(typeof data.ref === "string" ? data.ref : undefined);
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
      <div className="-rotate-1 bg-[#FBF3DC] p-7 text-center shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)]">
        <p className="font-display text-[24px] leading-tight text-forest-dark">
          Day 1 is on its way.
        </p>
        <p className="mx-auto mt-2.5 max-w-[42ch] text-[15px] leading-[1.6] text-gray-700">
          Check your inbox in the next few minutes. The next four arrive one a day,
          in the morning. If you can&apos;t find it, look in Promotions and drag it
          into your main inbox.
        </p>
        <SkillsMapNote refId={ref} source={source} />
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

/**
 * The one paid offer, shown only after the free signup is done. `refId` is the
 * reader's Kit id, so checkout can grant the course bonus (they joined seconds
 * ago, well inside the bonus window).
 */
function SkillsMapNote({ refId, source }: { refId?: string; source?: string | null }) {
  const params = new URLSearchParams({ utm_source: "site", utm_medium: "course-signup", utm_campaign: source || "course" });
  if (refId) params.set("ref", refId);
  return (
    <a
      href={`/shop/${SKILLS_MAP.slug}?${params.toString()}`}
      className="group mt-6 flex items-center gap-4 rounded-xl border border-[#E6D3B3] bg-white/70 p-4 text-left transition-colors hover:border-forest/50 hover:bg-white"
    >
      <Image
        src="/skills-map-cover.jpg"
        alt="The Future-Ready Skills Map cover"
        width={80}
        height={104}
        className="w-[64px] shrink-0 rotate-[-3deg] rounded-[3px] shadow-[0_6px_14px_-6px_rgba(45,58,46,0.5)]"
      />
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B07A4A]">
          While you wait for Day 1
        </span>
        <span className="mt-1 block text-[14.5px] leading-[1.5] text-gray-700">
          The course gives you the how. The Skills Map gives you the what: 12 skill areas, and what
          each looks like from 6 to 14 and beyond. ${SKILLS_MAP.priceUsd}, and get it this week
          to add a full activity guide free.
        </span>
        <span className="mt-1.5 inline-block text-[14px] font-semibold text-forest group-hover:underline">
          See the Skills Map &rarr;
        </span>
      </span>
    </a>
  );
}
