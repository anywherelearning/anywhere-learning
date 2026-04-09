import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, users, products, subscriptions } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { sendPurchaseEmail, sendMembershipWelcomeEmail, sendCartAbandonmentEmail } from '@/lib/resend';
import { tagBuyerInConvertKit, subscribeAndTag } from '@/lib/convertkit';
import { getSubscriptionByStripeId } from '@/lib/db/queries';
import { BUNDLE_CONTENTS } from '@/lib/cart';
import { getOrCreateReferral, extractReferralFromSession, processReferralConversion } from '@/lib/referral';
import { getAbandonmentUpsell } from '@/lib/cart-abandonment';
import type { AbandonedProduct } from '@/lib/cart-abandonment';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set - cannot verify webhook signatures');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
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

    // ─── charge.refunded ──────────────────────────────────────────────
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      await handleChargeRefunded(charge);
    }

    // ─── charge.dispute.created ───────────────────────────────────────
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute;
      await handleDisputeCreated(dispute);
    }

    // ─── checkout.session.expired ──────────────────────────────────────
    // Tag as cart-abandoner only AFTER the session expires without payment.
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
    }
  } catch (error) {
    console.error(`Webhook handler failed for ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
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

  // ── Idempotency: skip if subscription already exists ──────────────
  const existingSub = await getSubscriptionByStripeId(stripeSubscriptionId);
  if (existingSub) {
    console.log('Duplicate webhook for subscription (skipping):', stripeSubscriptionId);
    return;
  }

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

  // ── Idempotency: skip if we already processed this session ────────
  const existingOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId))
    .limit(1);

  if (existingOrders.length > 0) {
    console.log('Duplicate webhook for session (skipping):', stripeSessionId);
    return;
  }

  // ── SECURITY: Only trust Stripe-verified line items ──────────────
  // Never fall back to client-supplied metadata slugs. The line items
  // come directly from Stripe's records and cannot be spoofed.
  const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
    limit: 100,
    expand: ['data.price', 'data.price.product'],
  });

  // Collect price IDs from Stripe-verified line items.
  // Standard items have a price ID matching our DB. BYOB-discounted items
  // use price_data with the original stripePriceId stored in product_data.metadata
  // (Stripe puts product_data.metadata on the Product object, NOT the Price object).
  const priceIds: string[] = [];
  for (const li of lineItems.data) {
    const priceObj = li.price;
    if (!priceObj) continue;
    // Check for BYOB metadata on the expanded product (product_data.metadata → product.metadata)
    const product = priceObj.product as Stripe.Product | string | null;
    const productMeta = typeof product === 'object' && product !== null
      ? (product.metadata as Record<string, string>)
      : null;
    const originalPriceId = productMeta?.stripePriceId;
    if (originalPriceId) {
      priceIds.push(originalPriceId);
    } else if (priceObj.id && !priceObj.id.startsWith('price_')) {
      // Skip ad-hoc prices without metadata (e.g., free Skills Map bonus)
      continue;
    } else {
      priceIds.push(priceObj.id);
    }
  }

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

    // Create order(s) for each purchased product
    for (const product of purchasedProducts) {
      // Distribute amount proportionally (last product gets remainder)
      const isLast = product === purchasedProducts[purchasedProducts.length - 1];
      const proportionalAmount = isLast
        ? amountTotal - purchasedProducts.slice(0, -1).reduce(
            (sum, p) => sum + Math.round((p.priceCents / totalProductCents) * amountTotal), 0
          )
        : Math.round((product.priceCents / totalProductCents) * amountTotal);

      await db.insert(orders).values({
        userId: user[0].id,
        productId: product.id,
        stripeSessionId,
        amountCents: proportionalAmount,
        status: 'completed',
      });

      // If bundle, create orders for each included product
      if (product.isBundle) {
        const childSlugs = BUNDLE_CONTENTS[product.slug] || [];
        if (childSlugs.length > 0) {
          const childProducts = await db
            .select({ id: products.id })
            .from(products)
            .where(inArray(products.slug, childSlugs));

          for (const child of childProducts) {
            await db.insert(orders).values({
              userId: user[0].id,
              productId: child.id,
              stripeSessionId,
              amountCents: 0,
              status: 'completed',
            });
          }
        }
      }
    }

    // ── Auto-grant Future-Ready Skills Map with any bundle purchase ──
    if (hasBundles) {
      try {
        const skillsMap = await db
          .select()
          .from(products)
          .where(eq(products.slug, 'future-ready-skills-map'))
          .limit(1);

        if (skillsMap.length > 0) {
          // Check if user already owns the Skills Map
          const existingSkillsMap = await db
            .select({ id: orders.id })
            .from(orders)
            .where(
              and(
                eq(orders.userId, user[0].id),
                eq(orders.productId, skillsMap[0].id),
                eq(orders.status, 'completed'),
              ),
            )
            .limit(1);

          if (existingSkillsMap.length === 0) {
            await db.insert(orders).values({
              userId: user[0].id,
              productId: skillsMap[0].id,
              stripeSessionId,
              amountCents: 0,
              status: 'completed',
            });
          }
        }
      } catch (error) {
        console.error('Failed to auto-grant Skills Map:', error);
      }
    }

    // ── Generate referral code for this buyer (non-critical) ──────────
    let referralCode: string | undefined;
    try {
      const referral = await getOrCreateReferral(user[0].id, customerEmail);
      referralCode = referral.code;
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    }

    // ── Auto-create Clerk account for guest buyers ───────────────────
    let signInUrl: string | undefined;
    const isGuestUser = user[0].clerkId.startsWith('pending_');
    if (isGuestUser) {
      try {
        const clerk = await clerkClient();
        // Check if a Clerk user with this email already exists
        const existingClerkUsers = await clerk.users.getUserList({
          emailAddress: [customerEmail],
          limit: 1,
        });
        if (existingClerkUsers.data.length > 0) {
          // Link existing Clerk user to our DB user
          const clerkUser = existingClerkUsers.data[0];
          await db
            .update(users)
            .set({ clerkId: clerkUser.id })
            .where(eq(users.id, user[0].id));
        } else {
          // Create new Clerk user
          const newClerkUser = await clerk.users.createUser({
            emailAddress: [customerEmail],
            skipPasswordRequirement: true,
          });
          await db
            .update(users)
            .set({ clerkId: newClerkUser.id })
            .where(eq(users.id, user[0].id));

          // Generate a one-time sign-in token for the magic link
          const token = await clerk.signInTokens.createSignInToken({
            userId: newClerkUser.id,
            expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
          });
          const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
          signInUrl = `${baseUrl}/account/downloads#__clerk_ticket=${token.token}`;
        }
      } catch (error) {
        console.error('Failed to auto-create Clerk account:', error);
        // Non-critical: purchase still works, user just needs to create account manually
      }
    }

    // Post-transaction: send email with all product names (non-critical)
    const skillsMapBonus = hasBundles ? ' + The Future-Ready Skills Map (FREE bonus!)' : '';
    const productNames = purchasedProducts.map((p) => p.name).join(', ') + skillsMapBonus;
    // Build product list with images for the email
    const emailProducts = purchasedProducts.map((p) => ({
      name: p.name,
      imageUrl: p.imageUrl || `${process.env.NEXT_PUBLIC_URL}/products/${p.slug}.jpg`,
    }));

    try {
      await sendPurchaseEmail({
        to: customerEmail,
        customerName: session.customer_details?.name?.split(' ')[0] || undefined,
        productName: productNames,
        downloadUrl: `${process.env.NEXT_PUBLIC_URL}/account/downloads`,
        referralCode,
        products: emailProducts,
        signInUrl: isGuestUser ? signInUrl : undefined,
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

    // ── Process referral conversion if a referral promo code was used ──
    try {
      const usedReferralCode = await extractReferralFromSession(stripeSessionId);
      if (usedReferralCode) {
        await processReferralConversion(usedReferralCode, customerEmail, stripeSessionId);
      }
    } catch (error) {
      console.error('Failed to process referral conversion:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// Refund & dispute handlers
// ═══════════════════════════════════════════════════════════════════

async function handleChargeRefunded(charge: Stripe.Charge) {
  // The payment_intent links back to the checkout session
  const paymentIntentId = charge.payment_intent as string | null;
  if (!paymentIntentId) return;

  // Find the checkout session that created this charge
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  const session = sessions.data[0];
  if (!session) {
    console.error('No checkout session found for refunded charge:', charge.id);
    return;
  }

  const isFullRefund = charge.amount_captured === charge.amount_refunded;

  if (isFullRefund) {
    // Full refund: mark ALL orders for this session as refunded
    await db
      .update(orders)
      .set({ status: 'refunded' })
      .where(eq(orders.stripeSessionId, session.id));

    console.log(
      `All orders for session ${session.id} marked as refunded (charge: ${charge.id})`,
    );
  } else {
    // Partial refund: mark all orders as partially_refunded for audit trail.
    // Download access is preserved (download endpoint allows both 'completed'
    // and 'partially_refunded' status). Handle full access revocation manually
    // in the dashboard if needed for specific products.
    await db
      .update(orders)
      .set({ status: 'partially_refunded' })
      .where(eq(orders.stripeSessionId, session.id));

    console.log(
      `Partial refund for session ${session.id} - orders marked partially_refunded, access preserved (charge: ${charge.id})`,
    );
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const email = session.customer_email || session.customer_details?.email;
  if (!email) return;

  // Tag in ConvertKit for drip follow-up sequence
  try {
    await subscribeAndTag(email, ['cart-abandoner']);
  } catch (error) {
    console.error('Failed to tag cart-abandoner in ConvertKit:', error);
  }

  // Send personalized cart abandonment email via Resend
  const productSlugs = session.metadata?.product_slugs?.split(',').filter(Boolean);
  if (!productSlugs || productSlugs.length === 0) return;

  try {
    // Look up the abandoned products from the DB
    const abandonedProducts = await db
      .select({
        slug: products.slug,
        name: products.name,
        category: products.category,
        priceCents: products.priceCents,
        isBundle: products.isBundle,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(inArray(products.slug, productSlugs));

    if (abandonedProducts.length === 0) return;

    // Build the upsell recommendation
    const upsellInput: AbandonedProduct[] = abandonedProducts.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      isBundle: p.isBundle,
      imageUrl: p.imageUrl,
    }));
    const upsell = getAbandonmentUpsell(upsellInput);

    // Build email items with full image URLs
    const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
    const emailItems = abandonedProducts.map((p) => ({
      name: p.name,
      imageUrl: p.imageUrl || `${siteUrl}/products/${p.slug}.jpg`,
      priceCents: p.priceCents,
    }));

    await sendCartAbandonmentEmail({ to: email, items: emailItems, upsell });
  } catch (error) {
    console.error('Failed to send cart abandonment email:', error);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const charge = dispute.charge as string;

  // Retrieve the charge to get the payment intent
  const chargeObj = await stripe.charges.retrieve(charge);
  const paymentIntentId = chargeObj.payment_intent as string | null;
  if (!paymentIntentId) return;

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  const session = sessions.data[0];
  if (!session) {
    console.error('No checkout session found for disputed charge:', charge);
    return;
  }

  await db
    .update(orders)
    .set({ status: 'disputed' })
    .where(eq(orders.stripeSessionId, session.id));

  console.error(
    `DISPUTE OPENED: session ${session.id}, charge ${charge}, reason: ${dispute.reason}`,
  );
}
