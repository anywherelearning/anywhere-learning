'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { metaPageView } from '@/lib/tracking';

/**
 * Meta Pixel lifecycle:
 * The base tag in layout.tsx fires `PageView` once on initial load. Next.js
 * client-side navigation doesn't reload the page, so this component fires an
 * additional `PageView` on every subsequent route change — otherwise Meta only
 * ever sees the landing page and undercounts sessions and retargeting reach.
 */
export default function MetaPixelTracker() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      // Skip the initial mount: the base tag already fired PageView on load.
      isFirstRun.current = false;
      return;
    }
    metaPageView();
  }, [pathname]);

  return null;
}
