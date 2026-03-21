'use client';

import { openExternalBrowser } from '@/lib/capacitor';
import NativeAuthGuard from '@/components/mobile/NativeAuthGuard';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function AppAccountPage() {
  if (!hasClerk) {
    return <NativeAuthGuard message="Sign in to manage your account" />;
  }

  return <ClerkAccountContent />;
}

function ClerkAccountContent() {
  // These hooks are safe to call because we checked for Clerk above
  const { useUser, useClerk } = require('@clerk/nextjs');
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf9f6',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e2dc',
            borderTopColor: '#588157',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isSignedIn) {
    return <NativeAuthGuard message="Sign in to manage your account" />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#faf9f6',
        padding: '16px',
        paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '26px',
          fontWeight: 700,
          color: '#588157',
          marginBottom: '24px',
        }}
      >
        Account
      </h1>

      {/* User info */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #f0ede6',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(88, 129, 87, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#588157',
              }}
            >
              {user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
              {user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'Your Account'}
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              {user.emailAddresses?.[0]?.emailAddress || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #f0ede6',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <MenuItem
          label="Manage Subscription"
          subtitle="View or change your plan"
          onClick={() => openExternalBrowser(`${baseUrl}/account`)}
        />
        <Divider />
        <MenuItem
          label="Visit Website"
          subtitle="anywherelearning.co"
          onClick={() => openExternalBrowser(baseUrl)}
        />
        <Divider />
        <MenuItem
          label="Help & Support"
          subtitle="info@anywherelearning.co"
          onClick={() => openExternalBrowser(`${baseUrl}/contact`)}
        />
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ redirectUrl: '/app-login' })}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #f0ede6',
          fontSize: '15px',
          fontWeight: 600,
          color: '#dc2626',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Sign Out
      </button>

      {/* App version */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#d1d5db',
          marginTop: '24px',
        }}
      >
        Anywhere Learning v1.0
      </p>
    </div>
  );
}

function MenuItem({
  label,
  subtitle,
  onClick,
}: {
  label: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'DM Sans', sans-serif",
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div>
        <p style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a' }}>{label}</p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{subtitle}</p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function Divider() {
  return <div style={{ height: '1px', backgroundColor: '#f0ede6', marginLeft: '20px' }} />;
}
