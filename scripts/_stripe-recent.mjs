import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  console.log('=== Recent subscriptions in Stripe ===');
  const subs = await stripe.subscriptions.list({ limit: 10, status: 'all' });
  for (const s of subs.data) {
    const customer = typeof s.customer === 'string' ? s.customer : s.customer.id;
    const cust = await stripe.customers.retrieve(customer);
    console.log(`  ${s.id} | ${s.status} | ${cust.email || '(no email)'} | $${(s.items.data[0]?.price?.unit_amount || 0) / 100}`);
  }

  console.log('\n=== Recent successful checkout sessions ===');
  const sessions = await stripe.checkout.sessions.list({ limit: 10 });
  for (const sess of sessions.data) {
    const kind = sess.metadata?.kind || sess.mode;
    console.log(`  ${sess.id} | ${sess.payment_status} | ${kind} | ${sess.customer_details?.email || '(no email)'}`);
  }
}
main();
