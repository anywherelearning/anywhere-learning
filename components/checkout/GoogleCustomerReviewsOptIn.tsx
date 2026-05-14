'use client';

import Script from 'next/script';

interface Props {
  orderId: string;
  email: string | null;
  country: string;
}

/**
 * Renders the Google Customer Reviews opt-in survey on the post-purchase page.
 *
 * After a buyer completes checkout, Google asks them (in a small popup) if
 * they'll receive a survey email a few days later to rate their experience.
 * Aggregated ratings power the "Store rating" badge on Google Shopping
 * listings, which lifts CTR and converts the "Incomplete" Store rating
 * metric in Merchant Center.
 *
 * Docs: https://support.google.com/merchants/answer/7106244
 *
 * Estimated delivery date is "today" because all products are digital and
 * delivered instantly. GTIN list is intentionally omitted: digital activity
 * guides don't have GTINs and the field is optional.
 */
export default function GoogleCustomerReviewsOptIn({ orderId, email, country }: Props) {
  if (!email) return null;

  const today = new Date().toISOString().slice(0, 10);

  const renderScript = `
    window.renderOptIn = function() {
      window.gapi.load('surveyoptin', function() {
        window.gapi.surveyoptin.render({
          "merchant_id": 5778587597,
          "order_id": ${JSON.stringify(orderId)},
          "email": ${JSON.stringify(email)},
          "delivery_country": ${JSON.stringify(country)},
          "estimated_delivery_date": ${JSON.stringify(today)}
        });
      });
    };
  `;

  return (
    <>
      <Script id="gcr-render-config" strategy="afterInteractive">
        {renderScript}
      </Script>
      <Script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="afterInteractive"
      />
    </>
  );
}
