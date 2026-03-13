import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, users, products, subscriptions } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sendPurchaseEmail, sendMembershipWelcomeEmail } from '@/lib/resend';
import { tagBuyerInConvertKit, subscribeAndTag } from '@/lib/convertkit';
import { getSubscriptionByStripeId } from '@/lib/db/queries';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ─── checkout.session.completed ──────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    // ── Subscription checkout ──────────────────────────────────────
    if (session.mode === 'subscription') {
      await handleSubscriptionCheckout(session);
      return NextResponse.json({ received: true });
    }

    // ── One-time payment checkout (existing logic) ─────────────────
    await handlePaymentCheckout(session);
  }

  // ─── customer.subscription.updated ───────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    await handleSubscriptionUpdated(sub);
  }

  // ─── customer.subscription.deleted ───────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await handleSubscriptionDeleted(sub);
  }

  // ─── invoice.payment_failed ──────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    await handleInvoicePaymentFailed(invoice);
  }

  // ─── invoice.payment_succeeded ───────────────────────────────────
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    await handleInvoicePaymentSucceeded(invoice);
  }

  return NextResponse.json({ received: true });
}

// ═══════════════════════════════════════════════════════════════════
// Subscription handlers
// ═══════════════════════════════════════════════════════════════════

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const clerkId = session.metadata?.clerkId;
  const plan = session.metadata?.plan || 'monthly';
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!customerEmail || !clerkId) {
    console.error('Missing email or clerkId in subscription checkout:', session.id);
    return;
  }

  // Get the full subscription to read price/period info
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Find user by clerkId
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (user.length === 0) {
    console.error('User not found for clerkId:', clerkId);
    return;
  }

  // Store Stripe Customer ID on user (for future use / portal)
  if (!user[0].stripeCustomerId) {
    await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, user[0].id));
  }

  // Create subscription record
  await db.insert(subscriptions).values({
    userId: user[0].id,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId: stripeSub.items.data[0]?.price.id || '',
    status: 'active',
    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
  });

  // Send welcome email (non-critical)
  try {
    await sendMembershipWelcomeEmail({
      to: customerEmail,
      plan: plan === 'annual' ? 'annual' : 'monthly',
    });
  } catch (error) {
    console.error('Failed to send membership welcome email:', error);
  }

  // Tag in ConvertKit (non-critical)
  try {
    const tags = ['member', `member-${plan}`];
    await subscribeAndTag(customerEmail, tags);
  } catch (error) {
    console.error('Failed to tag member in ConvertKit:', error);
  }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const existing = await getSubscriptionByStripeId(sub.id);
  if (!existing) {
    console.error('Subscription not found for update:', sub.id);
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id));

  // If canceled, tag in ConvertKit for win-back flow
  if (sub.cancel_at_period_end) {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, existing.userId))
        .limit(1);
      if (user[0]?.email) {
        await subscribeAndTag(user[0].email, ['member-canceling']);
      }
    } catch (error) {
      console.error('Failed to tag canceling member in ConvertKit:', error);
    }
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const existing = await getSubscriptionByStripeId(sub.id);
  if (!existing) {
    console.error('Subscription not found for deletion:', sub.id);
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id));

  // Tag in ConvertKit for win-back flow
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, existing.userId))
      .limit(1);
    if (user[0]?.email) {
      await subscribeAndTag(user[0].email, ['member-canceled']);
    }
  } catch (error) {
    console.error('Failed to tag canceled member in ConvertKit:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubId = invoice.subscription as string | null;
  if (!stripeSubId) return;

  const existing = await getSubscriptionByStripeId(stripeSubId);
  if (!existing) return;

  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeSubId = invoice.subscription as string | null;
  if (!stripeSubId) return;

  const existing = await getSubscriptionByStripeId(stripeSubId);
  if (!existing) return;

  // Retrieve latest subscription data from Stripe
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

  await db
    .update(subscriptions)
    .set({
      status: 'active',
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));
}

// ═══════════════════════════════════════════════════════════════════
// One-time payment handler (existing logic)
// ═══════════════════════════════════════════════════════════════════

async function handlePaymentCheckout(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const stripeSessionId = session.id;
  const amountTotal = session.amount_total ?? 0;

  if (!customerEmail) {
    console.error('No customer email in checkout session:', stripeSessionId);
    return;
  }

  // ── SECURITY: Only trust Stripe-verified line items ──────────────
  // Never fall back to client-supplied metadata slugs. The line items
  // come directly from Stripe's records and cannot be spoofed.
  const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
    limit: 100,
  });

  // Collect price IDs from Stripe-verified line items
  const priceIds = lineItems.data
    .map((li) => li.price?.id)
    .filter((id): id is string => !!id);

  if (priceIds.length === 0) {
    console.error('No price IDs found in Stripe line items for session:', stripeSessionId);
    return;
  }

  // Find or create user
  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, customerEmail))
    .limit(1);

  if (user.length === 0) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: `pending_${customerEmail}`,
        email: customerEmail,
      })
      .returning();
    user = [newUser];
  }

  // Store Stripe Customer ID if we have one and user doesn't
  const stripeCustomerId = session.customer as string | null;
  if (stripeCustomerId && !user[0].stripeCustomerId) {
    await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, user[0].id));
  }

  // Look up products ONLY by Stripe-verified price IDs
  const purchasedProducts = await db
    .select()
    .from(products)
    .where(inArray(products.stripePriceId, priceIds));

  if (purchasedProducts.length < priceIds.length) {
    const foundPriceIds = new Set(purchasedProducts.map((p) => p.stripePriceId));
    const missingPriceIds = priceIds.filter((id) => !foundPriceIds.has(id));
    console.error(
      'Some Stripe price IDs did not match any product in the database:',
      missingPriceIds,
      'session:',
      stripeSessionId,
    );
  }

  if (purchasedProducts.length > 0) {
    // Check if this is a first-time buyer (no existing orders)
    const existingOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, user[0].id))
      .limit(1);
    const isFirstPurchase = existingOrders.length === 0;
    const hasBundles = purchasedProducts.some((p) => p.isBundle);

    // Distribute total across products proportionally
    const totalProductCents = purchasedProducts.reduce((sum, p) => sum + p.priceCents, 0);

    // Create order(s) atomically in a transaction
    await db.transaction(async (tx) => {
      for (const product of purchasedProducts) {
        // Distribute amount proportionally (last product gets remainder)
        const isLast = product === purchasedProducts[purchasedProducts.length - 1];
        const proportionalAmount = isLast
          ? amountTotal - purchasedProducts.slice(0, -1).reduce(
              (sum, p) => sum + Math.round((p.priceCents / totalProductCents) * amountTotal), 0
            )
          : Math.round((product.priceCents / totalProductCents) * amountTotal);

        await tx.insert(orders).values({
          userId: user[0].id,
          productId: product.id,
          stripeSessionId,
          amountCents: proportionalAmount,
          status: 'completed',
        });

        // If bundle, create orders for each included product
        if (product.isBundle && product.bundleProductIds) {
          const bundledIds = JSON.parse(product.bundleProductIds) as string[];
          for (const pid of bundledIds) {
            await tx.insert(orders).values({
              userId: user[0].id,
              productId: pid,
              stripeSessionId,
              amountCents: 0,
              status: 'completed',
            });
          }
        }
      }
    });

    // Post-transaction: send email with all product names (non-critical)
    const productNames = purchasedProducts.map((p) => p.name).join(', ');
    try {
      await sendPurchaseEmail({
        to: customerEmail,
        productName: productNames,
        downloadUrl: `${process.env.NEXT_PUBLIC_URL}/account/downloads`,
      });
    } catch (error) {
      console.error('Failed to send purchase email:', error);
    }

    // Tag in ConvertKit with all product slugs + purchase-type + cross-sell tags (non-critical)
    try {
      const categories = [...new Set(purchasedProducts.map((p) => p.category))];
      await tagBuyerInConvertKit(
        customerEmail,
        purchasedProducts.map((p) => p.slug),
        { isFirstPurchase, hasBundles, categories },
      );
    } catch (error) {
      console.error('Failed to tag buyer in ConvertKit:', error);
    }
  }
}
