'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { pinterestSetEnhancedMatch } from '@/lib/tracking';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Pushes the signed-in user's email into Pinterest's automatic enhanced match
 * so Pinterest can tie browsing sessions to its own users for better attribution
 * and audience quality. Pinterest hashes the email in-browser before sending.
 *
 * Rendered inside the nested provider tree (next to CartDrawer) so Clerk's
 * `useUser` hook resolves cleanly. Same pattern CartDrawer uses.
 */
export default function PinterestEnhancedMatch() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkState = hasClerk ? useUser() : { user: null, isSignedIn: false };
  const email = clerkState.user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!email) return;
    pinterestSetEnhancedMatch(email);
  }, [email]);

  return null;
}
