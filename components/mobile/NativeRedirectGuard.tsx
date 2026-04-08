'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCapacitor } from './CapacitorProvider';

/**
 * Redirects web-only routes to /shop when running in the native app.
 * The app only has Shop, Library, and Account - no homepage, blog, or free-guide.
 */
export default function NativeRedirectGuard() {
  const { isNative } = useCapacitor();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isNative) return;

    // Routes that don't exist in the native app
    if (
      pathname === '/' ||
      pathname === '/free-guide' ||
      pathname.startsWith('/blog')
    ) {
      router.replace('/shop');
    }
  }, [isNative, pathname, router]);

  return null;
}
