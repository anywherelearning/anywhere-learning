"use client";

import { useState, FormEvent } from "react";

interface EmailFormProps {
  variant?: "light" | "dark";
}

export default function EmailForm({ variant = "light" }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);

  const isLight = variant === "light";

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
        body: JSON.stringify({ email }),
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
          🎉 Check your inbox! Your guide is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${shaking ? "animate-shake" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
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
            className={`w-full rounded-lg px-4 py-3.5 text-base outline-none transition-shadow focus:ring-2 ${
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
          className={`rounded-lg px-6 py-3.5 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 ${
            isLight
              ? "bg-forest text-cream hover:bg-forest-dark"
              : "bg-gold text-forest-dark hover:bg-gold-light"
          }`}
        >
          {status === "loading" ? "Sending…" : "Send me the free guide"}
        </button>
      </div>

      {errorMessage && (
        <p className={`mt-2 text-sm ${isLight ? "text-red-600" : "text-red-300"}`}>
          {errorMessage}
        </p>
      )}

      <p
        className={`mt-3 text-center text-xs ${
          isLight ? "text-gray-400" : "text-cream/50"
        }`}
      >
        🔒 No spam. No fluff. Unsubscribe any time.
      </p>
    </form>
  );
}
