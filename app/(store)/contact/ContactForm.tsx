'use client';

import { useState, type FormEvent } from 'react';

const TOPICS = [
  { value: 'membership', label: 'Question about the membership' },
  { value: 'activity', label: 'Question about a specific activity' },
  { value: 'account', label: 'Help with my account or download' },
  { value: 'refund', label: 'Refund request' },
  { value: 'hi', label: 'Just saying hi' },
  { value: 'other', label: 'Press, partnership, or something else' },
];

interface Errors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Please add your name so Amelie can write back personally.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "That email doesn't look quite right. Mind double-checking?";
    }
    if (!topic) e.topic = 'Pick a topic so we can route it to the right place.';
    if (!message.trim()) e.message = 'A message helps. Even a sentence or two is enough.';
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstKey = Object.keys(e)[0];
      const el = document.getElementById(firstKey);
      el?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, website }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setServerError(data?.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setServerError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function reset() {
    setName('');
    setEmail('');
    setTopic('');
    setMessage('');
    setErrors({});
    setSubmitted(false);
    setServerError('');
    setTimeout(() => document.getElementById('name')?.focus(), 50);
  }

  const fieldClass = (hasError: boolean) =>
    `w-full appearance-none bg-cream border rounded-[11px] px-4 py-3.5 text-[15.5px] text-ink outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
        : 'border-[#D8D4C5] focus:border-forest focus:ring-2 focus:ring-forest/20'
    }`;

  if (submitted) {
    return (
      <div className="bg-cream border border-[#D8D4C5] rounded-[18px] p-10 md:p-12 text-center shadow-[0_24px_44px_-34px_rgba(58,90,64,0.4)]">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#E6EBDF] border border-[#C9D3BE] grid place-items-center text-forest-dark mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12l5 5L20 6" />
          </svg>
        </div>
        <h3 className="font-display text-[28px] leading-[1.1] tracking-tight mb-2">
          Got it. <span className="italic text-forest">Thanks for writing.</span>
        </h3>
        <p className="text-[15.5px] text-gray-600 max-w-[400px] mx-auto leading-[1.6]">
          Amelie will be in touch soon. Usually within 48 hours, Monday to Friday.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 text-forest-dark font-semibold text-[14.5px] border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-cream border border-[#D8D4C5] rounded-[18px] p-7 md:p-10 shadow-[0_24px_44px_-34px_rgba(58,90,64,0.3)]"
    >
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-[13px] font-semibold text-ink mb-1.5">
            Your name <span className="text-[#C97B5C]">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={fieldClass(!!errors.name)}
          />
          {errors.name && (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-ink mb-1.5">
            Your email <span className="text-[#C97B5C]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={fieldClass(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="topic" className="block text-[13px] font-semibold text-ink mb-1.5">
            What&apos;s this about? <span className="text-[#C97B5C]">*</span>
          </label>
          <div className="relative">
            <select
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) setErrors({ ...errors, topic: undefined });
              }}
              className={`${fieldClass(!!errors.topic)} pr-10 appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                Pick one...
              </option>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            >
              ▾
            </span>
          </div>
          {errors.topic && (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.topic}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-[13px] font-semibold text-ink mb-1.5">
            Your message <span className="text-[#C97B5C]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({ ...errors, message: undefined });
            }}
            className={`${fieldClass(!!errors.message)} resize-y min-h-[140px]`}
          />
          {errors.message && (
            <p className="mt-1.5 text-[13px] text-red-600">{errors.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-[14px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-7 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? 'Sending...' : 'Send message'}
            {!submitting && (
              <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                &rarr;
              </span>
            )}
          </button>
        </div>

        <p className="text-[13px] text-gray-500 leading-[1.55] m-0">
          <span className="font-display italic text-forest-dark">We read every email.</span>{' '}
          Replies come from Amelie directly, usually within 48 hours.
        </p>
      </div>
    </form>
  );
}
