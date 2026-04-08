'use client';

import { useCapacitor } from './CapacitorProvider';
import type { ReactNode } from 'react';

/**
 * Only renders its children when running inside the Capacitor native shell.
 * Inverse of NativeHide - used for app-only UI.
 */
export default function NativeOnly({ children }: { children: ReactNode }) {
  const { isNative } = useCapacitor();
  if (!isNative) return null;
  return <>{children}</>;
}
