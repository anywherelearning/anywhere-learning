import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product catalog — same data as seed.ts, only the fields Stripe needs
const catalog = [
  // Bundles
  { slug: 'master-bundle', name: 'Master Bundle (Everything)', priceCents: 8999, description: 'Every single activity pack — 220+ activities in one download.' },
  { slug: 'seasonal-bundle', name: 'Full Seasonal Bundle (All 4 Seasons)', priceCents: 4999, description: 'All 4 seasonal packs — 80 outdoor activities for every time of year.' },
  { slug: 'real-world-bundle', name: 'Real-World Skills Bundle (All 4 Packs)', priceCents: 3499, description: 'All 4 real-world skills packs — 49 practical activities kids actually use.' },
  { slug: 'creativity-bundle', name: 'Creativity Bundle (All 3 Packs)', priceCents: 3299, description: 'All 3 creativity packs — 45 design challenges for imaginative kids.' },
  { slug: 'nature-bundle', name: 'Nature & Outdoor Bundle (All 3 Packs)', priceCents: 2499, description: 'All 3 nature packs — 60 outdoor activities for curious families.' },
  // Seasonal
  { slug: 'spring-outdoor-pack', name: 'Spring Outdoor Learning Pack', priceCents: 1499, description: '20 outdoor activities that use spring\'s energy to build real-world skills.' },
  { slug: 'summer-outdoor-pack', name: 'Summer Outdoor Learning Pack', priceCents: 1499, description: '20 summer activities for families who learn on the move.' },
  { slug: 'fall-outdoor-pack', name: 'Fall Outdoor Learning Pack', priceCents: 1499, description: '20 autumn activities that use the changing season to build observation and creative skills.' },
  { slug: 'winter-outdoor-pack', name: 'Winter Outdoor Learning Pack', priceCents: 1499, description: '20 winter activities for cosy indoor days and cold outdoor adventures.' },
  // Creativity
  { slug: 'creativity-board-game', name: 'Creativity Anywhere: Board Game Studio', priceCents: 1299, description: 'Design, build, and playtest an original board game.' },
  { slug: 'creativity-rube-goldberg', name: 'Creativity Anywhere: Rube Goldberg Machine', priceCents: 1299, description: 'Build an absurdly complicated machine to do something simple.' },
  { slug: 'creativity-invent-sport', name: 'Creativity Anywhere: Invent a Sport', priceCents: 1299, description: 'Create an entirely new sport with original rules, equipment, and scoring.' },
  // Nature
  { slug: 'nature-journal-walks', name: 'Nature Journal & Walk Cards', priceCents: 999, description: '25 nature walk prompts and journaling activities.' },
  { slug: 'outdoor-stem-challenges', name: 'Outdoor STEM Challenge Cards', priceCents: 999, description: '20 outdoor STEM challenges that use the natural world as a laboratory.' },
  { slug: 'land-art-challenges', name: 'Land Art Challenge Cards', priceCents: 999, description: '15 land art challenges — creating beautiful, temporary art using natural materials.' },
  // Real-World Skills
  { slug: 'budget-challenge', name: 'Budget Challenge', priceCents: 999, description: '12 real-money challenges that teach kids budgeting and smart spending.' },
  { slug: 'kitchen-math', name: 'Kitchen Math & Meal Planning', priceCents: 999, description: '15 activities that turn cooking into a rich maths and science experience.' },
  { slug: 'smart-shopper', name: 'Smart Shopper Lab', priceCents: 999, description: '12 activities that teach kids to be critical, informed consumers.' },
  { slug: 'micro-business', name: 'Micro-Business Challenge', priceCents: 999, description: '10 guided activities to help your child plan, launch, and run a simple real business.' },
  // Life Skills
  { slug: 'life-skills-guide', name: '10 Life Skills Guide', priceCents: 999, description: '10 real-world activities your kids can try this week.' },
  // AI Literacy
  { slug: 'ai-basics', name: 'AI Basics: Myths, Facts & Smart Rules', priceCents: 999, description: '12 age-appropriate activities that help kids understand what AI actually is.' },
  { slug: 'hallucination-detective', name: 'Hallucination Detective', priceCents: 999, description: '10 investigation activities that teach kids to spot when AI gets things wrong.' },
];

async function createStripeProducts() {
  console.log(`Creating ${catalog.length} products in Stripe...\n`);
  const mapping: Record<string, string> = {};

  for (const item of catalog) {
    // Check if product already exists (by metadata slug)
    const existing = await stripe.products.search({
      query: `metadata["slug"]:"${item.slug}"`,
    });

    let productId: string;

    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      console.log(`  exists  ${item.name} (${productId})`);
    } else {
      const product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { slug: item.slug },
      });
      productId = product.id;
      console.log(`  created ${item.name} (${productId})`);
    }

    // Check if price already exists for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    let priceId: string;

    if (prices.data.length > 0 && prices.data[0].unit_amount === item.priceCents) {
      priceId = prices.data[0].id;
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: item.priceCents,
        currency: 'usd',
      });
      priceId = price.id;
    }

    mapping[item.slug] = priceId;
  }

  console.log('\n--- Stripe Price ID Mapping ---\n');
  console.log(JSON.stringify(mapping, null, 2));

  console.log('\nNext steps:');
  console.log('1. Replace STRIPE_PRICE_* placeholders in scripts/seed.ts with the IDs above');
  console.log('2. Run `npm run db:seed` to seed your database');
}

createStripeProducts().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
