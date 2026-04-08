'use client';

import { useEffect, useRef, useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/nextjs';
import { clerkAuthAppearance } from '@/lib/clerk-theme';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onCheckout: (email: string) => void;
}

export default function CheckoutModal({ open, onClose, onCheckout }: CheckoutModalProps) {
  const [mode, setMode] = useState<'choose' | 'signin' | 'signup' | 'guest'>('choose');
  const [guestEmail, setGuestEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkState = hasClerk ? useUser() : { isSignedIn: false, user: null };
  const { isSignedIn, user } = clerkState;

  // If user signs in via the embedded Clerk form, auto-proceed to checkout
  useEffect(() => {
    if (open && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      onCheckout(user.primaryEmailAddress.emailAddress);
    }
  }, [isSignedIn, user, open, onCheckout]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode('choose');
      setEmailError(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open, mode]);

  if (!open) return null;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = guestEmail.trim();
    if (!trimmed) {
      setEmailError('Please enter your email so we can send your downloads.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    onCheckout(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Checkout">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-sm mx-4 bg-cream rounded-2xl shadow-2xl animate-fade-in-up outline-none overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        {mode === 'choose' && (
          <div className="p-6 pt-8">
            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Ready to check out?</h3>
              <p className="text-sm text-gray-500">
                Sign in for instant access to your downloads, or continue as a guest.
              </p>
            </div>

            <button
              onClick={() => setMode('signin')}
              className="w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl transition-colors text-center mb-3"
            >
              Sign in or create account
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              onClick={() => setMode('guest')}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-colors text-center text-sm"
            >
              Continue as guest
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Guests receive downloads by email. Sign in for instant access anytime.
            </p>
          </div>
        )}

        {mode === 'signin' && (
          <div className="p-4 pt-8">
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-forest transition-colors mb-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex justify-center [&_.cl-rootBox]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:bg-transparent [&_.cl-footer]:!hidden">
              <SignIn
                appearance={clerkAuthAppearance}
                fallbackRedirectUrl=""
              />
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-forest font-semibold hover:text-forest-dark transition-colors">
                Sign up
              </button>
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div className="p-4 pt-8">
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-forest transition-colors mb-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex justify-center [&_.cl-rootBox]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:bg-transparent [&_.cl-footer]:!hidden">
              <SignUp
                appearance={clerkAuthAppearance}
                fallbackRedirectUrl=""
              />
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-forest font-semibold hover:text-forest-dark transition-colors">
                Sign in
              </button>
            </p>
          </div>
        )}

        {mode === 'guest' && (
          <div className="p-6 pt-8">
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-forest transition-colors mb-4"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">Guest checkout</h3>
            <p className="text-sm text-gray-500 mb-4">
              We will send your download links to this email.
            </p>

            <form onSubmit={handleGuestSubmit}>
              <label htmlFor="guest-email" className="block text-sm font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                id="guest-email"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                aria-describedby={emailError ? 'guest-email-error' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-shadow focus:ring-2 focus:ring-forest/30 ${
                  emailError ? 'border-red-300' : 'border-gray-200'
                }`}
                autoComplete="email"
                autoFocus
              />
              {emailError && (
                <p id="guest-email-error" role="alert" className="mt-1.5 text-xs text-red-500">{emailError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl transition-colors text-center mt-4"
              >
                Continue to payment
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              We will create an account for you automatically so you can access your downloads anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
