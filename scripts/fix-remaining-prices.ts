import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const fixes: Record<string, string> = {
  'outdoor-stem-challenges': 'price_1TLrpkAkIBECpwGmu5xAWiJn',
  'outdoor-learning-missions': 'price_1TLrpkAkIBECpwGmTwx4qOin',
  'land-art-challenges': 'price_1TLrplAkIBECpwGmOiqnWNq2',
  'rube-goldberg-machine': 'price_1TLrplAkIBECpwGmkAIfCHjf',
  'nature-walk-task-cards': 'price_1TLrpjAkIBECpwGmJyJr1nLx',
  'nature-journal-walks': 'price_1TLrpjAkIBECpwGmzKYwKnSF',
};

async function main() {
  for (const [slug, priceId] of Object.entries(fixes)) {
    await db.update(products).set({ stripePriceId: priceId }).where(eq(products.slug, slug));
    console.log('Fixed:', slug);
  }

  const remaining = await db.select({ slug: products.slug, stripePriceId: products.stripePriceId }).from(products);
  const testIds = remaining.filter(r => r.stripePriceId?.includes('AMzOBftCnt'));
  console.log(testIds.length === 0 ? '✓ All clean!' : 'Still have test IDs: ' + testIds.map(r => r.slug).join(', '));
  process.exit(0);
}
main();
