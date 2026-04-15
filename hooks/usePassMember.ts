'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface PassStatus {
  /** Whether the user has an active Annual Pass */
  active: boolean;
  /** End of the current billing period (ISO string) */
  currentPeriodEnd: string | null;
  /** Whether the subscription is set to cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** True while the initial fetch is in progress */
  loading: boolean;
}

const defaultStatus: PassStatus = {
  active: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  loading: true,
};

const resolvedStatus: PassStatus = {
  active: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  loading: false,
};

export const PassMemberContext = createContext<PassStatus>(defaultStatus);

export function usePassMember(): PassStatus {
  return useContext(PassMemberContext);
}

/**
 * Hook that fetches the pass status. Used inside PassMemberProvider.
 * Separated so the provider component can be in its own file.
 */
export function usePassMemberStatus(): PassStatus {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkState = hasClerk ? useUser() : { isSignedIn: false, isLoaded: true };
  const isSignedIn = !!clerkState.isSignedIn;
  const isLoaded = clerkState.isLoaded !== false;
  const [status, setStatus] = useState<PassStatus>(defaultStatus);

  const fetchStatus = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setStatus(resolvedStatus);
      return;
    }

    try {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStatus({
        active: data.active,
        currentPeriodEnd: data.currentPeriodEnd || null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        loading: false,
      });
    } catch {
      setStatus(resolvedStatus);
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return status;
}
