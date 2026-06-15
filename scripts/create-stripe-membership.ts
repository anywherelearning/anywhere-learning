/**
 * One-off script: creates the Stripe Test-mode products and prices for the
 * post-pivot model.
 *
 *   1. Anywhere Learning Membership — Founder rate ($99/year, recurring)
 *   2. Anywhere Learning Membership — Standard rate ($149/year, recurring)
 *   3. Anywhere Learning Starter Pack ($44.99 one-time)
 *
 * Re-runnable: it looks up existing products by name first and reuses them.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/create-stripe-membership.ts
 *
 * Prints the Price IDs to copy into lib/stripe-prices.ts (or .env.local).
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY required. Pass it inline: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/create-stripe-membership.ts');
  process.exit(1);
}

// Safety guard: by default the script only runs against test-mode keys.
// To create LIVE products (for launch), set ALLOW_LIVE_STRIPE=1 in the env.
const isLive = !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
if (isLive && process.env.ALLOW_LIVE_STRIPE !== '1') {
  console.warn('\n⚠️  STRIPE_SECRET_KEY is NOT a test-mode key. Aborting to prevent creating live products.');
  console.warn('   To intentionally create LIVE products, re-run with ALLOW_LIVE_STRIPE=1 set.\n');
  process.exit(1);
}
if (isLive) {
  console.log('\n🔴 LIVE STRIPE MODE — creating real products in production. (ALLOW_LIVE_STRIPE=1)\n');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });

interface ProductSpec {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Array<{
    nickname: string;
    unit_amount: number;
    currency: 'usd';
    recurring?: Stripe.PriceCreateParams.Recurring;
    metadata?: Record<string, string>;
  }>;
}

const SPECS: ProductSpec[] = [
  {
    name: 'Anywhere Learning Membership',
    description: 'Read every guide in the library on any device. During your free trial, viewing is unlimited and downloads unlock when your membership starts. New activities added every quarter.',
    metadata: { kind: 'membership' },
    prices: [
      {
        nickname: 'Founder rate (first 100 members, locked in for life)',
        unit_amount: 9900,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { tier: 'founder', kind: 'membership' },
      },
      {
        nickname: 'Standard rate (member 101+)',
        unit_amount: 14900,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { tier: 'standard', kind: 'membership' },
      },
    ],
  },
  {
    name: 'Anywhere Learning Starter Pack',
    description: '10 favorite activities + the Future-Ready Skills Map. One-time purchase, yours forever.',
    metadata: { kind: 'starter_pack' },
    prices: [
      {
        nickname: 'Starter Pack — one-time',
        unit_amount: 4499,
        currency: 'usd',
        metadata: { kind: 'starter_pack' },
      },
    ],
  },
];

async function findProductByName(name: string): Promise<Stripe.Product | null> {
  // Stripe doesn't let us query by name directly; list active and match locally.
  for await (const p of stripe.products.list({ active: true, limit: 100 })) {
    if (p.name === name) return p;
  }
  return null;
}

async function findPriceByNickname(productId: string, nickname: string): Promise<Stripe.Price | null> {
  for await (const p of stripe.prices.list({ product: productId, active: true, limit: 100 })) {
    if (p.nickname === nickname) return p;
  }
  return null;
}

async function upsert(spec: ProductSpec) {
  let product = await findProductByName(spec.name);
  if (product) {
    console.log(`  · product exists: ${product.id} "${product.name}"`);
  } else {
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      metadata: spec.metadata,
    });
    console.log(`  + created product: ${product.id} "${product.name}"`);
  }

  const priceIds: Record<string, string> = {};
  for (const priceSpec of spec.prices) {
    let price = await findPriceByNickname(product.id, priceSpec.nickname);
    if (price) {
      console.log(`    · price exists: ${price.id} (${priceSpec.nickname})`);
    } else {
      const createParams: Stripe.PriceCreateParams = {
        product: product.id,
        nickname: priceSpec.nickname,
        unit_amount: priceSpec.unit_amount,
        currency: priceSpec.currency,
        metadata: priceSpec.metadata,
      };
      if (priceSpec.recurring) createParams.recurring = priceSpec.recurring;
      price = await stripe.prices.create(createParams);
      console.log(`    + created price: ${price.id} (${priceSpec.nickname})`);
    }
    priceIds[priceSpec.metadata?.tier || priceSpec.metadata?.kind || priceSpec.nickname] = price.id;
  }

  return { product, priceIds };
}

async function main() {
  console.log('Creating Stripe sandbox products for Anywhere Learning…\n');

  const results: Array<{ name: string; productId: string; priceIds: Record<string, string> }> = [];

  for (const spec of SPECS) {
    console.log(`▶ ${spec.name}`);
    const { product, priceIds } = await upsert(spec);
    results.push({ name: spec.name, productId: product.id, priceIds });
    console.log();
  }

  // Print copy-paste-ready snippet
  console.log('─'.repeat(72));
  console.log('Copy this into lib/stripe-prices.ts:\n');
  console.log('export const STRIPE_PRICES = {');
  for (const r of results) {
    for (const [tier, id] of Object.entries(r.priceIds)) {
      const key =
        r.name.toLowerCase().includes('starter') ? 'STARTER_PACK_ONE_TIME' :
        tier === 'founder' ? 'MEMBERSHIP_FOUNDER' :
        tier === 'standard' ? 'MEMBERSHIP_STANDARD' :
        tier.toUpperCase();
      console.log(`  ${key}: '${id}',`);
    }
  }
  console.log('} as const;');
  console.log('─'.repeat(72));
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
