'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

/**
 * Download flow for the worksheet tools: "Download now" is always available
 * and never blocked; "Email it to me" is the soft option that subscribes via
 * /api/subscribe (Kit tag from-{source}) and then triggers the same download.
 */
export default function DownloadModal({
  open,
  onClose,
  onDownload,
  source,
  toolName,
}: {
  open: boolean;
  onClose: () => void;
  /** Kicks off the actual PDF generation + save. */
  onDownload: () => Promise<void>;
  /** Kit attribution tag, e.g. "tool-name-tracing" → from-tool-name-tracing. */
  source: string;
  /** Human name shown in copy, e.g. "name tracing worksheet". */
  toolName: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'emailing' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setErrorMessage('');
      closeButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleDownloadNow() {
    setStatus('downloading');
    setErrorMessage('');
    try {
      await onDownload();
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMessage("Something went wrong creating the PDF. Please try again.");
    }
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('emailing');
    setErrorMessage('');
    try {
      // Subscribe first, but never let a signup hiccup block the download.
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      }).catch(() => {});
      await onDownload();
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMessage("Something went wrong creating the PDF. Please try again.");
    }
  }

  const busy = status === 'downloading' || status === 'emailing';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="download-modal-title" className="font-display text-2xl text-forest-dark">
            {status === 'done' ? 'All set!' : 'Your worksheet is ready'}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-2 focus:outline-forest"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === 'done' ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              {`Your ${toolName} is downloading. Print it whenever you're ready, and come back anytime to make a new one.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark focus:outline-2 focus:outline-offset-2 focus:outline-forest"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            <button
              type="button"
              onClick={handleDownloadNow}
              disabled={busy}
              className="w-full rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark focus:outline-2 focus:outline-offset-2 focus:outline-forest disabled:opacity-60"
            >
              {status === 'downloading' ? 'Creating your PDF…' : 'Download now'}
            </button>

            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <p className="text-sm text-gray-600">
                Want it in your inbox too? We&apos;ll send it over along with a few of our favorite
                low-prep learning ideas.
              </p>
              <label htmlFor="download-modal-email" className="sr-only">
                Email address
              </label>
              <input
                id="download-modal-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm focus:border-forest focus:outline-2 focus:outline-forest/40"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full border-2 border-forest px-6 py-2.5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-forest disabled:opacity-60"
              >
                {status === 'emailing' ? 'Sending…' : 'Email it to me + download'}
              </button>
            </form>

            {errorMessage && (
              <p role="alert" className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
