/**
 * Generate a static Pinterest catalog feed file.
 *
 * Writes a TSV snapshot to `pinterest-feed.tsv` at the repo root. Use this
 * pre-launch when the site isn't deployed yet and Pinterest can't fetch from
 * the /api/pinterest-feed.tsv route.
 *
 * Usage:
 *   npx tsx scripts/generate-pinterest-feed.ts
 *
 * Then upload the generated file to Google Sheets (File > Import) and
 * paste the public sheet URL into Pinterest Catalog.
 *
 * Post-launch, delete this script and point Pinterest at the live API route.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getFallbackProducts,
  type FallbackProduct,
} from '../lib/fallback-products';

const SITE_URL = 'https://anywherelearning.co';
const BRAND = 'Anywhere Learning';
const GOOGLE_CATEGORY = '543559'; // Education > Educational Materials

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

  const currentPrice = formatPrice(product.priceCents);
  const salePrice = product.compareAtPriceCents ? currentPrice : '';
  const displayPrice = product.compareAtPriceCents
    ? formatPrice(product.compareAtPriceCents)
    : currentPrice;

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

function main() {
  const products = getFallbackProducts();
  const lines: string[] = [HEADERS.join('\t')];
  for (const product of products) {
    lines.push(productToRow(product));
  }
  const body = lines.join('\n') + '\n';

  const outPath = resolve(process.cwd(), 'pinterest-feed.tsv');
  writeFileSync(outPath, body, 'utf-8');

  console.log(`Wrote ${products.length} products to ${outPath}`);
  console.log('\nNext steps:');
  console.log('  1. Open https://sheets.google.com and create a new sheet');
  console.log('  2. File > Import > Upload > select pinterest-feed.tsv');
  console.log('     (choose "Tab" as separator, "Replace spreadsheet")');
  console.log('  3. File > Share > Publish to web > Publish (as TSV)');
  console.log('  4. Copy the published URL and paste it into Pinterest Catalog');
}

main();
