'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAccessTier } from '@/hooks/useAccessTier';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface AccessTierSwitchProps {
  guest: ReactNode;
  member: ReactNode;
  /** Defaults to `member` when omitted. */
  trial?: ReactNode;
}

/**
 * Swaps a block on a static page for its member/trial version once the
 * visitor's tier is known.
 *
 * Product pages are pre-built so search and AI crawlers never touch the
 * database (each crawler hit used to wake Neon for 5+ minutes). The server
 * renders the guest version; signed-in visitors ask /api/user/access, the same
 * check the header uses. Signed-out visitors make no request at all.
 */
export default function AccessTierSwitch(props: AccessTierSwitchProps) {
  if (!hasClerk) return <>{props.guest}</>;
  return <ClerkAccessTierSwitch {...props} />;
}

function ClerkAccessTierSwitch({ guest, member, trial }: AccessTierSwitchProps) {
  const { isSignedIn } = useAuth();
  const tier = useAccessTier(!!isSignedIn);
  if (tier === 'member') return <>{member}</>;
  if (tier === 'trial') return <>{trial ?? member}</>;
  return <>{guest}</>;
}
