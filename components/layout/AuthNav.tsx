'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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

  return (
    <>
      <SignedIn>
        <Link
          href="/account"
          onClick={onLinkClick}
          className="text-sm font-medium text-gray-700 transition-colors hover:text-forest"
        >
          My Account
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          onClick={onLinkClick}
          className="text-sm font-medium text-gray-700 transition-colors hover:text-forest"
        >
          Sign In
        </Link>
      </SignedOut>
    </>
  );
}
