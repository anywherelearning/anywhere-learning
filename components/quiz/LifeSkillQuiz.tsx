"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QUESTIONS,
  RESULTS,
  scoreBuckets,
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

  // Derive age band + result from the recorded answers.
  const { ageBand, result } = useMemo(() => {
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

    return {
      ageBand: band,
      result: buckets.length ? scoreBuckets(buckets) : null,
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
            get your kid&apos;s type, the one skill to focus on next, and three real
            activities to start with.
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
    return (
      <div className="mx-auto max-w-[680px]">
        <div
          className="rounded-[20px] border bg-cream p-9 md:p-12 shadow-[0_24px_48px_-34px_rgba(45,58,46,0.4)]"
          style={{ borderColor: "rgba(45,58,46,0.16)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-2.5"
            style={{ color: r.accent }}
          >
            <span className="w-[22px] h-px inline-block" style={{ background: r.accent }} />
            Your kid is
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-tight mt-3 text-balance">
            {r.title}
          </h2>
          <p className="mt-2 font-display italic text-[19px]" style={{ color: r.accent }}>
            {r.tagline}
          </p>

          <p className="mt-6 text-[16.5px] leading-[1.7] text-gray-700">
            {r.description}
          </p>

          <div
            className="mt-7 rounded-[14px] border p-6"
            style={{ borderColor: "rgba(45,58,46,0.14)", background: "rgba(88,129,87,0.06)" }}
          >
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest-dark">
              The skill to focus on next
            </p>
            <p className="mt-2 font-display text-[20px] leading-[1.25] text-ink">
              {r.gapLabel}.
            </p>
          </div>

          <p className="mt-8 font-display italic text-[18px] text-ink">
            Where I&apos;d start with your kid:
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {r.activities.map((a) => (
              <Link
                key={a.slug}
                href={`/shop/${a.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-[#D8D4C5] bg-white py-3 pl-3 pr-5 transition-all hover:-translate-y-0.5"
                style={{ borderLeftWidth: 3, borderLeftColor: r.accent }}
              >
                <span className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#ECE7DB] bg-[#F4F1E9]">
                  <Image
                    src={`/products/${a.slug}.jpg`}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink text-[15.5px]">
                    {a.name}
                  </span>
                  <span className="block text-[13.5px] text-gray-500">{a.note}</span>
                </span>
                <span
                  className="font-display italic text-[18px] group-hover:translate-x-0.5 transition-transform"
                  style={{ color: r.accent }}
                >
                  &rarr;
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-[14px] border border-[#C9D3BE] bg-[#E6EBDF] p-6 text-center">
            <p className="font-display text-[19px] text-forest-dark">
              These three are just the start.
            </p>
            <p className="mt-2 text-[15px] leading-[1.6] text-gray-600">
              Your membership unlocks 120+ guided activities like these, built to close
              exactly this gap. No planning, no prep. Try it free for 14 days.
            </p>
            <Link
              href="/join"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 text-[15px] font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98]"
            >
              Start your free trial
              <span className="font-display italic text-[17px] leading-none">&rarr;</span>
            </Link>
          </div>

          <p className="mt-6 text-center text-[13px] text-gray-500">
            Your result is on its way to your inbox too, along with the activities
            picked for your kid.
          </p>
        </div>
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
            You&apos;ll get your kid&apos;s type plus a few activities picked for them.
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
