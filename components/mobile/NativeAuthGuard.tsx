'use client';

import Link from 'next/link';

/**
 * Branded sign-in prompt shown in the native app when the user isn't authenticated.
 * Used by Library and Account tabs.
 */
export default function NativeAuthGuard({
  message = 'Sign in to access your activity packs',
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Book icon */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: 'rgba(88, 129, 87, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#588157"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '24px',
          fontWeight: 700,
          color: '#588157',
          marginBottom: '8px',
        }}
      >
        Your Library
      </h2>
      <p
        style={{
          color: '#6b7280',
          fontSize: '15px',
          maxWidth: '280px',
          lineHeight: 1.5,
          marginBottom: '24px',
        }}
      >
        {message}
      </p>

      <Link
        href="/app-login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#588157',
          color: '#faf9f6',
          fontWeight: 600,
          fontSize: '15px',
          padding: '12px 32px',
          borderRadius: '12px',
          textDecoration: 'none',
          transition: 'background-color 0.2s',
        }}
      >
        Sign In
      </Link>
    </div>
  );
}
