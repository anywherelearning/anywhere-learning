'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Re-render the thank-you page a few times while the webhook catches up. */
export default function RefreshSoon() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 6) clearInterval(t);
    }, 2500);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
