'use client';

import { useCapacitor } from './CapacitorProvider';
import type { ReactNode } from 'react';

/**
 * Hides its children when running inside the Capacitor native shell.
 * Used to suppress web-only elements (SiteHeader, SiteFooter) in the mobile app.
 */
export default function NativeHide({ children }: { children: ReactNode }) {
  const { isNative } = useCapacitor();
  if (isNative) return null;
  return <>{children}</>;
}
