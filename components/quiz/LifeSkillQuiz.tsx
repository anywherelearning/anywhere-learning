"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QUESTIONS,
  RESULTS,
  scoreTopTwo,
  type QuizResultId,
  type AgeBand,
} from "@/lib/quiz";

const SOURCE_STORAGE_KEY = "subscribe-source";

type Phase = "intro" | "questions" | "email" | "result";

export default function LifeSkillQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  // answers[i] holds the chosen option index for question i, or null.
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => QUESTIONS.map(() => null),
  );
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [source, setSource] = useState("");

  // Capture attribution source on mount (same pattern as EmailForm).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSource =
        params.get("source") || params.get("utm_source") || "";
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

  // Derive age band + result (top-2 gaps) from the recorded answers.
  const { ageBand, result, secondaryGap } = useMemo(() => {
    const ageQ = QUESTIONS[0];
    const ageIdx = answers[0];
    let band: AgeBand | null = null;
    if (ageQ.kind === "age" && ageIdx != null) {
      band = ageQ.options[ageIdx].value;
    }

    const buckets: QuizResultId[] = [];
    QUESTIONS.forEach((q, i) => {
      const a = answers[i];
      if (q.kind === "bucket" && a != null) {
        buckets.push(q.options[a].bucket);
      }
    });

    const top = buckets.length ? scoreTopTwo(buckets) : null;
    return {
      ageBand: band,
      result: top?.primary ?? null,
      secondaryGap: top?.secondaryGap ?? null,
    };
  }, [answers]);

  const total = QUESTIONS.length;
  const progress = Math.round(((current + (phase === "email" ? 1 : 0)) / total) * 100);

  function selectOption(optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
    // Brief pause so the selection registers visually, then advance.
    window.setTimeout(() => {
      if (current < total - 1) {
        setCurrent((c) => c + 1);
      } else {
        setPhase("email");
      }
    }, 220);
  }

  function goBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!result || !ageBand) {
      setErrorMessage("Please answer the questions first.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          result,
          ageBand,
          secondaryGap: secondaryGap || undefined,
          source: source || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("idle");
      setPhase("result");
      // Mark the quiz as taken so the exit-intent popup stops pitching it and
      // moves this visitor to the membership variant instead.
      try {
        localStorage.setItem("quiz-taken", "1");
      } catch {}
      try {
        const { pinterestSetEnhancedMatch, metaLead } = await import("@/lib/tracking");
        pinterestSetEnhancedMatch(email);
        metaLead(source ? `quiz:${source}` : "quiz");
      } catch {}
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  // ─── INTRO ───
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-[680px] text-center">
        <div className="rounded-[20px] border border-[#D8D4C5] bg-cream p-9 md:p-12 shadow-[0_24px_48px_-34px_rgba(45,58,46,0.4)]">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
            <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
            2-minute quiz
          </p>
          <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[1.04] tracking-tight mt-4 text-balance">
            What&apos;s your kid&apos;s{" "}
            <span className="italic text-forest">missing life skill?</span>
          </h1>
          <p className="mt-5 text-[17.5px] leading-[1.6] text-gray-600 max-w-[480px] mx-auto">
            Eight quick questions. No judgment, no right answers. At the end you&apos;ll
            get your kid&apos;s Real-World Skills Plan: their type, the top two skills to
            build next, one thing to try this Saturday, and three activities to start with.
          </p>
          <button
            onClick={() => setPhase("questions")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-forest px-8 py-4 text-base font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98]"
          >
            Start the quiz
            <span className="font-display italic text-[19px] leading-none">&rarr;</span>
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Free. Takes about 2 minutes.
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  if (phase === "result" && result) {
    const r = RESULTS[result];
    const ageLabel = ageBand ? ageBand.replace("-", " to ") : null;
    const skills = [
      r.gapLabel,
      ...(secondaryGap ? [RESULTS[secondaryGap].gapLabel] : []),
    ];

    return (
      <div className="mx-auto max-w-[680px]">
        <article
          className="al-rise relative overflow-hidden rounded-[24px] bg-cream shadow-[0_40px_80px_-48px_rgba(45,58,46,0.55)]"
          style={{ border: "1px solid rgba(45,58,46,0.14)" }}
        >
          {/* accent ribbon along the very top: the one place the kid's color leads */}
          <span
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: r.accent }}
          />
          {/* faint botanical watermark, bottom-right, so the plate isn't empty paper */}
          <LeafMark
            className="pointer-events-none absolute -bottom-8 -right-6 h-44 w-44 opacity-[0.05]"
            color="#3d5c3b"
          />

          <div className="relative px-7 pb-9 pt-10 md:px-12 md:pb-12 md:pt-12">
            {/* ── Identity crest ── */}
            <header className="flex flex-col items-center text-center">
              <span
                className="grid h-16 w-16 place-items-center rounded-full"
                style={{
                  background: `color-mix(in srgb, ${r.accent} 14%, #faf9f6)`,
                  boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${r.accent} 40%, transparent)`,
                }}
              >
                <LeafMark className="h-8 w-8" color={r.accent} />
              </span>
              <p className="mt-5 font-display text-[19px] italic text-gray-500">
                Your kid is
              </p>
              <h2 className="mt-0.5 font-display text-[clamp(2.15rem,6vw,3.25rem)] leading-[1.02] tracking-tight text-balance">
                {r.title}
              </h2>
              <p
                className="mt-2 text-[15px] font-medium uppercase tracking-[0.14em]"
                style={{ color: r.accent }}
              >
                {r.tagline}
              </p>
            </header>

            <p className="mx-auto mt-7 max-w-[52ch] text-center text-[16.5px] leading-[1.75] text-gray-700">
              {r.description}
            </p>

            {/* ── The plan proper ── one titled document, not four boxes */}
            <div className="mt-10 flex items-baseline justify-between border-b border-[#E4DFCF] pb-3">
              <h3 className="font-display text-[26px] leading-none text-forest-dark">
                The Plan
              </h3>
              {ageLabel && (
                <p className="text-[13px] text-gray-500">
                  for your {ageLabel} year old
                </p>
              )}
            </div>

            {/* Skills as an editorial numbered list: hanging display numerals, no box */}
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              {skills.length > 1 ? "Two skills to build next" : "The skill to build next"}
            </p>
            <ol className="mt-3 flex flex-col gap-4">
              {skills.map((skill, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 font-display text-[34px] leading-[0.8] tabular-nums"
                    style={{ color: r.accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[18px] leading-[1.4] text-ink">
                    {skill}.
                  </span>
                </li>
              ))}
            </ol>

            {/* ── Try this Saturday ── the peak: a warm note placed on the plan */}
            <div className="relative mt-9">
              <div
                className="relative overflow-hidden rounded-[16px] px-6 py-6 shadow-[0_18px_36px_-24px_rgba(120,83,40,0.6)]"
                style={{
                  background:
                    "linear-gradient(180deg, #fbf3e2 0%, #f7ecd6 100%)",
                  border: "1px solid rgba(181,128,62,0.32)",
                  transform: "rotate(-0.5deg)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <SparkMark className="h-4 w-4 shrink-0 text-gold-dark" />
                  <p className="font-display text-[21px] leading-none text-gold-dark">
                    Try this together on Saturday
                  </p>
                </div>
                <p className="mt-3 text-[16px] leading-[1.65] text-[#5c4a2e]">
                  {r.saturday}
                </p>
                <p className="mt-3 text-[13px] italic text-[#94825f]">
                  Free, no prep. This is the whole idea, in one afternoon.
                </p>
              </div>
            </div>

            {/* ── Matched activities ── */}
            <p className="mt-10 text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Three activities that fit this plan
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {r.activities.map((a) => (
                <Link
                  key={a.slug}
                  href={`/shop/${a.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#E4DFCF] bg-white/70 p-2.5 pr-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:bg-white hover:shadow-[0_14px_28px_-22px_rgba(45,58,46,0.6)]"
                >
                  <span className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl border border-[#ECE7DB] bg-[#F4F1E9]">
                    <Image
                      src={`/products/${a.slug}.jpg`}
                      alt=""
                      fill
                      sizes="60px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink text-[15.5px] leading-tight">
                      {a.name}
                    </span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-gray-500">
                      {a.note}
                    </span>
                  </span>
                  <span
                    className="font-display text-[20px] leading-none transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: r.accent }}
                  >
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>

            {/* ── The ask ── */}
            <div className="mt-10 rounded-[18px] bg-forest px-7 py-8 text-center text-cream">
              <p className="font-display text-[24px] leading-tight">
                These three are just the start.
              </p>
              <p className="mx-auto mt-2.5 max-w-[42ch] text-[15px] leading-[1.6] text-cream/85">
                Your membership opens 120+ guided activities like these, built to
                close exactly this gap. No planning, no prep. Free for 14 days.
              </p>
              <Link
                href="/join"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cream px-7 py-3.5 text-[15px] font-semibold text-forest-dark transition-all hover:bg-white active:scale-[0.98]"
              >
                Start your free trial
                <span className="font-display text-[17px] leading-none">&rarr;</span>
              </Link>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#E4DFCF] bg-white/70 px-5 py-4">
              <LeafMark className="mt-0.5 h-6 w-6 flex-shrink-0" color="#b5803e" />
              <p className="text-[14px] leading-[1.55] text-gray-600">
                <span className="font-semibold text-ink">A free gift is on its way too.</span>{" "}
                Check your inbox for your full plan plus the complete{" "}
                <span className="font-medium text-ink">Kitchen Math &amp; Meal Planning</span>{" "}
                guide, normally $5.99, yours free.
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // ─── EMAIL GATE ───
  if (phase === "email") {
    return (
      <div className="mx-auto max-w-[600px]">
        <ProgressBar progress={100} />
        <div className="mt-6 rounded-[20px] border border-[#C9D3BE] bg-[#E6EBDF] p-9 md:p-11 text-center shadow-[0_24px_44px_-34px_rgba(58,90,64,0.4)]">
          <p className="font-display italic text-[17px] text-forest-dark">
            That&apos;s the last one.
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.375rem)] leading-[1.1] tracking-tight mt-1.5 text-balance">
            Where should we send{" "}
            <span className="italic text-forest-dark">your result?</span>
          </h2>
          <p className="mt-3 text-[15px] text-gray-600 max-w-[400px] mx-auto">
            You&apos;ll get your kid&apos;s full Real-World Skills Plan, plus the activities
            picked for them.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 max-w-[420px] mx-auto">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="quiz-email" className="sr-only">
                Email address
              </label>
              <input
                id="quiz-email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                aria-describedby={errorMessage ? "quiz-email-error" : undefined}
                className={`flex-1 rounded-lg border bg-white px-4 py-3.5 text-base text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
                  errorMessage ? "border-red-400" : "border-gray-200"
                }`}
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-forest px-6 py-3.5 text-base font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98] disabled:opacity-70"
              >
                {status === "loading" ? "Revealing…" : "See my result"}
              </button>
            </div>
            {errorMessage && (
              <p id="quiz-email-error" role="alert" className="mt-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            <p className="mt-3 text-xs text-gray-500">
              One email, no spam, unsubscribe any time.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ─── QUESTIONS ───
  const q = QUESTIONS[current];
  const selected = answers[current];

  return (
    <div className="mx-auto max-w-[600px]">
      <ProgressBar progress={progress} />
      <div className="mt-6 rounded-[20px] border border-[#D8D4C5] bg-cream p-8 md:p-10 shadow-[0_24px_48px_-34px_rgba(45,58,46,0.4)]">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-forest-dark">
          Question {current + 1} of {total}
        </p>
        <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.125rem)] leading-[1.16] tracking-tight mt-2.5 text-balance">
          {q.prompt}
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`w-full text-left rounded-xl border px-5 py-4 text-[15.5px] leading-[1.4] transition-all hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-forest bg-forest/8 text-forest-dark font-medium"
                    : "border-[#D8D4C5] bg-white text-gray-700 hover:border-forest/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {current > 0 && (
          <button
            onClick={goBack}
            className="mt-6 text-[13.5px] text-gray-500 transition-colors hover:text-forest-dark"
          >
            &larr; Back
          </button>
        )}
      </div>
    </div>
  );
}

// A single leaf with a center vein: the brand's motif, reused as the plan's
// seal (in the kid's accent) and as a faint watermark on the plate.
function LeafMark({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M20 3C10 4 4 10 4 18c0 1 .2 2 .5 3 6 .5 15-3.5 15.5-18Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M6 20C9 13 13 8 19 5"
        fill="none"
        stroke="#faf9f6"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

// A small four-point spark that marks the "Saturday" note as the thing to do.
function SparkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2c.7 4.8 2.5 6.6 7.3 7.3-4.8.7-6.6 2.5-7.3 7.3-.7-4.8-2.5-6.6-7.3-7.3C9.5 8.6 11.3 6.8 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[#E1DDCE] overflow-hidden">
      <div
        className="h-full rounded-full bg-forest transition-all duration-300 ease-out"
        style={{ width: `${Math.max(6, progress)}%` }}
      />
    </div>
  );
}
