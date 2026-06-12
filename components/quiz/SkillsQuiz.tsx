"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import {
  QUIZ_AGE_RANGES,
  QUIZ_DIMENSIONS,
  QUIZ_OPTIONS,
  QUIZ_QUESTIONS,
  QUIZ_MAX_SCORE,
  QUIZ_DIMENSION_MAX,
  computeQuizResult,
} from "@/lib/quiz-data";

/** 'age' → question index (0-14) → 'email' → 'results' */
type Step = "age" | number | "email" | "results";

const TOTAL_ANSWER_STEPS = QUIZ_QUESTIONS.length + 1; // age + questions

export default function SkillsQuiz() {
  const [step, setStep] = useState<Step>("age");
  const [age, setAge] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [pendingOption, setPendingOption] = useState<number | null>(null);

  const progress =
    step === "age"
      ? 0
      : typeof step === "number"
        ? (step + 1) / TOTAL_ANSWER_STEPS
        : 1;

  function selectAge(value: string) {
    setAge(value);
    setStep(0);
  }

  function selectOption(questionIndex: number, optionIndex: number) {
    if (pendingOption !== null) return; // ignore double-taps mid-transition
    setPendingOption(optionIndex);
    const next = [...answers];
    next[questionIndex] = QUIZ_OPTIONS[optionIndex].points;
    setAnswers(next);
    setTimeout(() => {
      setPendingOption(null);
      setStep(
        questionIndex + 1 < QUIZ_QUESTIONS.length ? questionIndex + 1 : "email",
      );
    }, 180);
  }

  function goBack() {
    if (typeof step === "number") {
      setStep(step === 0 ? "age" : step - 1);
    } else if (step === "email") {
      setStep(QUIZ_QUESTIONS.length - 1);
    }
  }

  function restart() {
    setStep("age");
    setAge(null);
    setAnswers([]);
    setPendingOption(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        {step !== "results" && (
          <div
            className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Scorecard progress"
          >
            <div
              className="h-full rounded-full bg-forest transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {step === "age" && <AgeStep onSelect={selectAge} />}

        {typeof step === "number" && (
          <QuestionStep
            key={step}
            index={step}
            currentAnswer={answers[step]}
            pendingOption={pendingOption}
            onSelect={(optionIndex) => selectOption(step, optionIndex)}
            onBack={goBack}
          />
        )}

        {step === "email" && (
          <EmailStep
            age={age}
            answers={answers}
            onDone={() => setStep("results")}
            onBack={goBack}
          />
        )}

        {step === "results" && (
          <ResultsStep answers={answers} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

/* ─── Step 1: age ─────────────────────────────────────────────── */

function AgeStep({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="animate-fade-in-up">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
        First things first
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800">
        How old is your kid?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Answer for one kid at a time. If you have a few, run it again after,
        it only takes two minutes. Every question means &ldquo;for their
        age&rdquo;, so a 6-year-old and a 13-year-old both get a fair score.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {QUIZ_AGE_RANGES.map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => onSelect(range.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-base font-semibold text-gray-700 transition-all hover:border-forest hover:bg-forest/5 hover:text-forest active:scale-[0.98]"
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: questions ───────────────────────────────────────── */

function QuestionStep({
  index,
  currentAnswer,
  pendingOption,
  onSelect,
  onBack,
}: {
  index: number;
  currentAnswer: number | undefined;
  pendingOption: number | null;
  onSelect: (optionIndex: number) => void;
  onBack: () => void;
}) {
  const question = QUIZ_QUESTIONS[index];
  const dimension = QUIZ_DIMENSIONS.find((d) => d.slug === question.dimension)!;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-400">
          Question {index + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${dimension.color}1a`, color: dimension.color }}
        >
          {dimension.name}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold leading-snug text-gray-800 sm:text-2xl">
        {question.text}
      </h2>

      <div className="mt-6 flex flex-col gap-3">
        {QUIZ_OPTIONS.map((option, optionIndex) => {
          const isPending = pendingOption === optionIndex;
          const wasChosen =
            pendingOption === null && currentAnswer === option.points;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelect(optionIndex)}
              className={`rounded-xl border px-5 py-4 text-left text-base font-medium transition-all active:scale-[0.99] ${
                isPending || wasChosen
                  ? "border-forest bg-forest/10 text-forest-dark"
                  : "border-gray-200 bg-white text-gray-700 hover:border-forest hover:bg-forest/5"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-sm text-gray-400 underline-offset-2 transition-colors hover:text-forest hover:underline"
      >
        &larr; Back
      </button>
    </div>
  );
}

/* ─── Step 3: email (optional) ────────────────────────────────── */

function EmailStep({
  age,
  answers,
  onDone,
  onBack,
}: {
  age: string | null;
  answers: number[];
  onDone: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);

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

    const result = computeQuizResult(answers);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "quiz",
          quiz: {
            band: result.band.slug,
            focus: result.focus.slug,
            age: age || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        return;
      }

      try {
        localStorage.setItem("free-guide-submitted", "true");
      } catch {}
      try {
        const { pinterestSetEnhancedMatch, pinterestTrack } = await import(
          "@/lib/tracking"
        );
        pinterestSetEnhancedMatch(email);
        pinterestTrack("Signup");
      } catch {}

      onDone();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }

  return (
    <div className="animate-fade-in-up text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
        All done
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-forest-dark">
        Your scorecard is ready
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        Pop in your email and I&rsquo;ll show your results, plus send you the
        free 7-day starter guide so you can start on your focus area this week.
      </p>

      <form
        onSubmit={handleSubmit}
        className={`mx-auto mt-6 max-w-md ${shaking ? "animate-shake" : ""}`}
      >
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
            className={`w-full flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
              errorMessage ? "border-red-400" : ""
            }`}
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-forest px-6 py-3.5 text-base font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98] disabled:opacity-70"
          >
            {status === "loading" ? "One sec…" : "Show my scorecard"}
          </button>
        </div>
        {errorMessage && (
          <p id="quiz-email-error" role="alert" className="mt-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          No spam. No fluff. Unsubscribe any time.
        </p>
      </form>

      <div className="mt-5 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 underline-offset-2 transition-colors hover:text-forest hover:underline"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-gray-400 underline underline-offset-2 transition-colors hover:text-forest"
        >
          Skip and just show my results
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: results ─────────────────────────────────────────── */

function ResultsStep({
  answers,
  onRestart,
}: {
  answers: number[];
  onRestart: () => void;
}) {
  const result = useMemo(() => computeQuizResult(answers), [answers]);
  const [grow, setGrow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGrow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          Your kid&rsquo;s snapshot
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold text-forest-dark">
          {result.band.name}
        </h2>
        <p className="mt-2 text-sm font-medium text-gray-400">
          {result.total} of {QUIZ_MAX_SCORE} skill points
        </p>
        <p className="mt-4 text-lg font-semibold text-gray-800">
          {result.band.headline}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-500">
          {result.band.body}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {result.dimensionScores.map(({ dimension, score }) => {
          const isFocus = dimension.slug === result.focus.slug;
          const isStrength = result.strength?.slug === dimension.slug;
          return (
            <div key={dimension.slug}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {dimension.name}
                  {isStrength && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold-dark">
                      Strongest
                    </span>
                  )}
                  {isFocus && (
                    <span className="rounded-full bg-[#C97B5C]/15 px-2 py-0.5 text-[11px] font-semibold text-[#C97B5C]">
                      Focus area
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {score}/{QUIZ_DIMENSION_MAX}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: grow ? `${(score / QUIZ_DIMENSION_MAX) * 100}%` : "0%",
                    backgroundColor: dimension.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {result.strength && (
        <p className="mt-6 text-sm leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">
            {result.strength.name}:
          </span>{" "}
          {result.strength.strengthCopy}
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-cream p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          Where to start
        </p>
        <h3 className="mt-1 text-lg font-semibold text-gray-800">
          {result.focus.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {result.focus.growthCopy}
        </p>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Three activities from the library that build exactly this:
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {result.focus.activities.map((activity) => (
            <li key={activity.slug}>
              <Link
                href={`/shop/${activity.slug}`}
                className="text-sm font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest-dark"
              >
                {activity.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl bg-forest p-6 text-center">
        <h3 className="font-display text-2xl font-bold text-cream">
          Want the full path?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-cream/80">
          Every activity in your results is inside the membership: 100+ guided
          real-world activities you open and follow along, adjustable to any
          kid, reusable year after year.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/join"
            className="w-full rounded-xl bg-gold px-6 py-3 text-base font-semibold text-forest-dark transition-all hover:bg-gold-light hover:scale-[1.02] sm:w-auto"
          >
            See how the membership works
          </Link>
          <Link
            href="/shop"
            className="w-full rounded-xl border border-cream/30 px-6 py-3 text-base font-semibold text-cream transition-all hover:bg-cream/10 sm:w-auto"
          >
            Browse the activity library
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm text-gray-400 underline underline-offset-2 transition-colors hover:text-forest"
        >
          Run it again for another kid
        </button>
      </div>
    </div>
  );
}
