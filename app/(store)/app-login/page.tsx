'use client';

import dynamic from 'next/dynamic';
import { openExternalBrowser } from '@/lib/capacitor';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Lazy-load to prevent Clerk hooks from running during static prerendering
const ClerkSignInBlock = dynamic(() => Promise.resolve(ClerkSignInBlockInner), {
  ssr: false,
});

export default function AppLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        backgroundColor: '#faf9f6',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '8px', textAlign: 'center' }}>
        <svg width="44" height="44" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="56" fill="#588157" opacity="0.1" />
          <path
            d="M30 65c10-20 30-30 50-25s20 25 10 35-30 10-45 0S25 55 30 65z"
            fill="#588157"
            opacity="0.6"
          />
          <path
            d="M35 60c8-15 25-22 40-18s15 20 8 28-24 8-36 0S30 50 35 60z"
            fill="#588157"
          />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '24px',
          fontWeight: 700,
          color: '#588157',
          marginBottom: '4px',
        }}
      >
        Anywhere Learning
      </h1>
      <p
        style={{
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '24px',
        }}
      >
        Sign in to access your activity guides
      </p>

      {/* Clerk Sign In */}
      {hasClerk ? (
        <ClerkSignInBlock />
      ) : (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f7f5f0',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '360px',
            width: '100%',
          }}
        >
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Sign in is not configured yet.
          </p>
        </div>
      )}

      {/* Sign up CTA */}
      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          padding: '16px 24px',
          backgroundColor: '#f0ede6',
          borderRadius: '12px',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
          Don&apos;t have an account?
        </p>
        <button
          onClick={() => openExternalBrowser('https://anywherelearning.co/sign-up')}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#588157',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Create your account on our website
        </button>
      </div>
    </div>
  );
}

function ClerkSignInBlockInner() {
  const { SignIn } = require('@clerk/nextjs');
  const { clerkAuthAppearance } = require('@/lib/clerk-theme');
  return (
    <SignIn
      appearance={clerkAuthAppearance}
      routing="hash"
      fallbackRedirectUrl="/library"
    />
  );
}
