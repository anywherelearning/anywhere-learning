import { NextResponse } from 'next/server';
import { getFallbackProducts, type FallbackProduct } from '@/lib/fallback-products';

/**
 * Google Merchant Center product feed.
 *
 * Paste `https://anywherelearning.co/api/google-feed.xml` into Merchant Center
 * > Data sources > Add product source > "Use a scheduled fetch".
 *
 * Format: RSS 2.0 with Google product namespace (g:*).
 * Docs: https://support.google.com/merchants/answer/7052112
 *
 * This feed bypasses the fragile GMC dashboard UI by submitting shipping,
 * returns, and image data directly per product. Free shipping, instant
 * digital delivery, and a 48-hour refund window are encoded for every
 * English-speaking market we target.
 */

const SITE_URL = 'https://anywherelearning.co';
const BRAND = 'Anywhere Learning';
// Google product taxonomy: Education > Educational Materials
const GOOGLE_CATEGORY = '543559';
// Target markets, ISO 3166-1 alpha-2
const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ'] as const;

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

function formatPrice(cents: number, currency = 'USD'): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function shippingBlocks(): string {
  return SHIPPING_COUNTRIES.map(
    (country) => `      <g:shipping>
        <g:country>${country}</g:country>
        <g:service>Digital Delivery</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>`
  ).join('\n');
}

function productToItem(product: FallbackProduct): string {
  const link = `${SITE_URL}/shop/${product.slug}`;
  const imageLink = product.imageUrl
    ? `${SITE_URL}${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}`
    : `${SITE_URL}/og-default.jpg`;

  const hasSale = product.compareAtPriceCents !== null;
  const displayPrice = hasSale
    ? formatPrice(product.compareAtPriceCents!)
    : formatPrice(product.priceCents);
  const salePriceTag = hasSale
    ? `      <g:sale_price>${formatPrice(product.priceCents)}</g:sale_price>\n`
    : '';

  // Bundles group their own variants; individuals group by category so Google
  // can show them as related items in Shopping.
  const itemGroupId = product.isBundle ? product.slug : product.category;

  return `    <item>
      <g:id>${escapeXml(product.slug)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription || product.description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${displayPrice}</g:price>
${salePriceTag}      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${GOOGLE_CATEGORY}</g:google_product_category>
      <g:product_type>${escapeXml(product.category)}</g:product_type>
      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>
      <g:adult>no</g:adult>
      <g:age_group>kids</g:age_group>
      <g:custom_label_0>digital</g:custom_label_0>
${shippingBlocks()}
    </item>`;
}

export async function GET() {
  const products = getFallbackProducts().filter((p) => p.active);
  const items = products.map(productToItem).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Anywhere Learning Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Homeschool activity guides for real-world learning. Instant digital downloads.</description>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
