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
      redirectUrl: '/account',
      signInForceRedirectUrl: '/account',
      signUpForceRedirectUrl: '/account',
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
