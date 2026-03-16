'use client';

import { useCapacitor } from './CapacitorProvider';
import type { ReactNode } from 'react';

/**
 * Adds bottom padding when running inside Capacitor to account for the MobileTabBar.
 * On web, renders children without extra padding.
 */
export default function NativePadding({ children }: { children: ReactNode }) {
  const { isNative } = useCapacitor();

  return (
    <main
      className="min-h-screen"
      style={isNative ? { paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' } : undefined}
    >
      {children}
    </main>
  );
}
