import { NextResponse } from 'next/server';
import { getFallbackProducts, type FallbackProduct } from '@/lib/fallback-products';

/**
 * Pinterest product catalog feed.
 *
 * Pinterest fetches this URL daily to ingest the full product catalog. Paste
 * `https://anywherelearning.co/api/pinterest-feed.tsv` into Pinterest Business
 * Manager > Catalog > Data sources > "Provide a URL link".
 *
 * Format: TSV (tab-separated values) per Pinterest's catalog spec.
 * Docs: https://help.pinterest.com/en/business/article/data-source-ingestion
 *
 * Columns used:
 *   id                         – unique product identifier (slug)
 *   title                      – product name (max 500 chars)
 *   description                – long description (max 10,000 chars)
 *   link                       – canonical product page URL
 *   image_link                 – absolute URL to primary image
 *   price                      – "X.XX USD" (Pinterest requires currency suffix)
 *   sale_price                 – optional, only if compareAtPriceCents set
 *   availability               – always "in stock" for digital goods
 *   condition                  – always "new" for digital goods
 *   brand                      – "Anywhere Learning"
 *   google_product_category    – educational materials taxonomy ID
 *   product_type               – our internal category for shoppers
 *   item_group_id              – bundles group their own variants
 */

const SITE_URL = 'https://anywherelearning.co';
const BRAND = 'Anywhere Learning';
// Google product taxonomy: Education > Educational Materials
const GOOGLE_CATEGORY = '543559';

const HEADERS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'price',
  'sale_price',
  'availability',
  'condition',
  'brand',
  'google_product_category',
  'product_type',
  'item_group_id',
] as const;

/**
 * Escape a single field for TSV output. Tabs, newlines, and carriage returns
 * would corrupt the row structure, so we replace them with spaces. Pinterest
 * also rejects unescaped quotes in some parsers, so we strip them.
 */
function escapeField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/"/g, "'")
    .trim();
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} USD`;
}

function productToRow(product: FallbackProduct): string {
  const link = `${SITE_URL}/shop/${product.slug}`;
  const imageLink = product.imageUrl
    ? `${SITE_URL}${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}`
    : `${SITE_URL}/og-default.jpg`;

  const price = formatPrice(product.priceCents);
  const salePrice = product.compareAtPriceCents
    ? formatPrice(product.priceCents) // current price is the sale price
    : '';
  // When a compareAt exists, the "price" field should hold the original
  // (higher) price and "sale_price" holds the current price.
  const displayPrice = product.compareAtPriceCents
    ? formatPrice(product.compareAtPriceCents)
    : price;

  const row = [
    product.slug,
    product.name,
    product.description,
    link,
    imageLink,
    displayPrice,
    salePrice,
    'in stock',
    'new',
    BRAND,
    GOOGLE_CATEGORY,
    product.category,
    product.isBundle ? product.slug : product.category,
  ];

  return row.map(escapeField).join('\t');
}

export async function GET() {
  const products = getFallbackProducts();

  const lines: string[] = [];
  lines.push(HEADERS.join('\t'));

  for (const product of products) {
    lines.push(productToRow(product));
  }

  const body = lines.join('\n') + '\n';

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      // Cache for 1 hour at the CDN, allow stale-while-revalidate for 24h.
      // Pinterest re-fetches daily so this cadence is plenty fresh.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
