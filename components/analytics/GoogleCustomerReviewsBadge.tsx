'use client';

import Script from 'next/script';

declare global {
  interface Window {
    merchantwidget?: {
      start: (config: { merchant_id: number; position?: string; region?: string }) => void;
    };
  }
}

/**
 * Renders the Google Customer Reviews seller badge in the bottom-left of
 * every page. Pairs with the opt-in survey on /checkout/success.
 *
 * Uses next/script's onLoad to call merchantwidget.start() exactly once,
 * right after the gstatic script finishes loading. This avoids the race
 * condition where an inline script might run before OR after the async
 * gstatic script settles.
 *
 * Position is BOTTOM_LEFT to avoid clashing with the mobile sticky buy
 * bar (bottom-center) and chat widgets (bottom-right).
 */
export default function GoogleCustomerReviewsBadge() {
  return (
    <Script
      id="merchantWidgetScript"
      src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && window.merchantwidget) {
          window.merchantwidget.start({
            merchant_id: 5778587597,
            position: 'BOTTOM_LEFT',
            region: 'US',
          });
        }
      }}
    />
  );
}
