'use client';

import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function AuthNav({ onLinkClick }: { onLinkClick?: () => void }) {
  if (!hasClerk) {
    return (
      <Link
        href="/sign-in"
        onClick={onLinkClick}
        className="text-sm font-medium text-gray-700 transition-colors hover:text-forest"
      >
        Sign In
      </Link>
    );
  }

  return <AuthNavInner onLinkClick={onLinkClick} />;
}

function AuthNavInner({ onLinkClick }: { onLinkClick?: () => void }) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <Link
          href="/account"
          onClick={onLinkClick}
          className="text-sm font-medium text-gray-700 transition-colors hover:text-forest"
        >
          My Account
        </Link>
        <UserButton />
      </>
    );
  }

  return (
    <Link
      href="/sign-in"
      onClick={onLinkClick}
      className="text-sm font-medium text-gray-700 transition-colors hover:text-forest"
    >
      Sign In
    </Link>
  );
}
