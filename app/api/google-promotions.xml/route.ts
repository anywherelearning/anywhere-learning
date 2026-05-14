import { NextResponse } from 'next/server';
import { SALE_CONFIG, isSaleActive } from '@/lib/sale';

/**
 * Google Merchant Center promotions feed.
 *
 * Paste `https://anywherelearning.co/api/google-promotions.xml` into GMC
 * > Data sources > Add product source > "Use a scheduled fetch", and choose
 * "Promotions" as the feed type.
 *
 * Format: RSS 2.0 with Google product namespace.
 * Docs: https://support.google.com/merchants/answer/2906014
 *
 * Source of truth: lib/sale.ts (SALE_CONFIG). When a new sale starts, edit
 * SALE_CONFIG and the feed updates automatically on the next Google fetch.
 *
 * Behavior:
 *   - Sale window upcoming or active → outputs one promotion entry
 *   - Sale window already ended → outputs an empty feed (no items)
 */

const SITE_URL = 'https://anywherelearning.co';

function escapeXml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
}

function toIso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function buildPromotionItem(): string | null {
  const now = new Date();
  // Skip if the sale window has already ended; expired promotions add noise.
  if (now > SALE_CONFIG.endsAt) return null;

  const effective = `${toIso(SALE_CONFIG.startsAt)}/${toIso(SALE_CONFIG.endsAt)}`;

  return `    <item>
      <g:promotion_id>${escapeXml(SALE_CONFIG.promoCode)}</g:promotion_id>
      <g:product_applicability>all_products</g:product_applicability>
      <g:offer_type>generic_code</g:offer_type>
      <g:long_title>${escapeXml(SALE_CONFIG.name)} - ${SALE_CONFIG.percentOff}% off sitewide</g:long_title>
      <g:coupon_value_type>percent_off</g:coupon_value_type>
      <g:percent_off>${SALE_CONFIG.percentOff}</g:percent_off>
      <g:generic_redemption_code>${escapeXml(SALE_CONFIG.promoCode)}</g:generic_redemption_code>
      <g:promotion_effective_dates>${effective}</g:promotion_effective_dates>
      <g:promotion_display_dates>${effective}</g:promotion_display_dates>
      <g:redemption_channel>online</g:redemption_channel>
      <g:promotion_destination>Shopping ads</g:promotion_destination>
      <g:promotion_destination>Free listings</g:promotion_destination>
    </item>`;
}

export async function GET() {
  const item = buildPromotionItem();
  const items = item ?? '';
  const active = isSaleActive() ? 'active' : 'upcoming or none';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Anywhere Learning Promotions</title>
    <link>${SITE_URL}</link>
    <description>Sitewide promotions and discount codes for Anywhere Learning. Current status: ${active}.</description>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Short cache because promotion windows can flip in/out at known times.
      // 15 minutes at the CDN keeps GMC responsive without hammering us.
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
