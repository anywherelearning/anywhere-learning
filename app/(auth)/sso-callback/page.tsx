'use client';

/**
 * OAuth landing page. Clerk redirects here after Google sign-in completes,
 * and we forward to the post-sign-in destination.
 */

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({
      redirectUrl: '/post-sign-in',
      // Same decider as the email/password form: welcome quiz first time,
      // homepage after. A fresh OAuth sign-up has no profile yet, so it lands
      // on the quiz too.
      signInForceRedirectUrl: '/post-sign-in',
      signUpForceRedirectUrl: '/post-sign-in',
    });
  }, [handleRedirectCallback]);

  return (
    <main className="min-h-[70vh] grid place-items-center bg-cream px-6 py-16">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="mt-4 text-[14px] text-gray-500 font-body">Signing you in…</p>
      </div>
    </main>
  );
}
