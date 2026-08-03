'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Hides its children in the member zone (/account). The member area has its own
 * header (MemberNav) and footer (MemberFooter), so the marketing SiteFooter is
 * gated out here rather than stacking on top of them.
 */
export default function HideOnMemberZone({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/account')) return null;
  return <>{children}</>;
}
