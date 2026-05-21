import { getFallbackProducts } from '../lib/fallback-products';

const products = getFallbackProducts().filter(
  (p) => p.category !== 'bundle' && p.category !== 'start-here',
);

const byCategory: Record<string, { slug: string; name: string; current: string }[]> = {};
for (const p of products) {
  (byCategory[p.category] ||= []).push({
    slug: p.slug,
    name: p.name,
    current: p.shortDescription,
  });
}

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`\n=== ${cat} (${items.length}) ===`);
  for (const it of items) {
    console.log(`\n${it.slug} | ${it.name}`);
    console.log(`  → ${it.current}`);
  }
}
