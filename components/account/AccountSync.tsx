'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { applyServerState, gatherLocalState, isEmptyState } from '@/lib/account-sync';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function push(data: unknown) {
  try {
    void fetch('/api/account/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * Keeps the member's localStorage in sync with the server row, so their kids,
 * plan, and progress follow them across devices. Pulls once on load (and
 * reloads once if the server has newer state so every component re-reads it),
 * then pushes a debounced copy whenever local state changes.
 */
function SyncInner() {
  const { isLoaded, isSignedIn } = useAuth();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulled = useRef(false);

  // Pull on load (and seed the server from local if the server is empty).
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/state');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const server = json?.data as ReturnType<typeof gatherLocalState> | null;
        const local = gatherLocalState();
        if (server && !isEmptyState(server)) {
          if (JSON.stringify(server) !== JSON.stringify(local)) {
            applyServerState(server);
            // Reload once so every component picks up the synced state.
            if (!sessionStorage.getItem('al:hydrated')) {
              sessionStorage.setItem('al:hydrated', '1');
              window.location.reload();
              return;
            }
          }
        } else if (!isEmptyState(local)) {
          push(local); // server empty: seed it from this device
        }
      } catch {
        /* offline / no DB — keep working locally */
      } finally {
        pulled.current = true; // only allow pushes after the initial pull
        // Signal that local state now reflects the server, so first-run logic
        // can safely decide whether a member truly has no profile yet.
        (window as { __alSyncReady?: boolean }).__alSyncReady = true;
        window.dispatchEvent(new Event('al:sync-ready'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  // Push debounced on any local change (only once the initial pull is done).
  useEffect(() => {
    if (!isSignedIn) return;
    function onChange() {
      if (!pulled.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => push(gatherLocalState()), 1200);
    }
    window.addEventListener('al:local-changed', onChange);
    return () => {
      window.removeEventListener('al:local-changed', onChange);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isSignedIn]);

  return null;
}

export default function AccountSync() {
  if (!hasClerk) return null;
  return <SyncInner />;
}
