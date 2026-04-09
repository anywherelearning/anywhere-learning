import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createMembershipProduct() {
  console.log('Creating Anywhere Learning Membership in Stripe...\n');

  // Check if product already exists
  const existing = await stripe.products.search({
    query: 'metadata["type"]:"membership"',
  });

  let productId: string;

  if (existing.data.length > 0) {
    productId = existing.data[0].id;
    console.log(`  exists  Anywhere Learning Membership (${productId})`);
  } else {
    const product = await stripe.products.create({
      name: 'Anywhere Learning Membership',
      description:
        'Unlimited access to every activity guide — past, present, and future. Browse and read on any device.',
      metadata: { type: 'membership' },
    });
    productId = product.id;
    console.log(`  created Anywhere Learning Membership (${productId})`);
  }

  // Create monthly price ($19.99/month)
  const monthlyPrice = await stripe.prices.create({
    product: productId,
    unit_amount: 1999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'monthly' },
  });
  console.log(`  monthly price: ${monthlyPrice.id} ($19.99/month)`);

  // Create annual price ($149.99/year)
  const annualPrice = await stripe.prices.create({
    product: productId,
    unit_amount: 14999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { plan: 'annual' },
  });
  console.log(`  annual price:  ${annualPrice.id} ($149.99/year)`);

  console.log('\n--- Add to .env.local ---\n');
  console.log(`STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
  console.log(`STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID=${annualPrice.id}`);

  console.log('\nNext steps:');
  console.log('1. Add the two env vars above to .env.local and Vercel');
  console.log('2. Update Stripe webhook to listen for subscription events:');
  console.log(
    '   customer.subscription.updated, customer.subscription.deleted,',
  );
  console.log('   invoice.payment_succeeded, invoice.payment_failed');
}

createMembershipProduct().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
