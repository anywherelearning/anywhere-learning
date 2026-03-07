import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, users, products } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sendPurchaseEmail } from '@/lib/resend';
import { tagBuyerInConvertKit } from '@/lib/convertkit';
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const customerEmail = session.customer_details?.email;
    const stripeSessionId = session.id;
    const amountTotal = session.amount_total ?? 0;

    if (!customerEmail) {
      console.error('No customer email in checkout session:', stripeSessionId);
      return NextResponse.json({ received: true });
    }

    // Get ALL line items (supports multi-item cart checkout)
    const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
      limit: 100,
    });

    // Collect price IDs from line items
    const priceIds = lineItems.data
      .map((li) => li.price?.id)
      .filter((id): id is string => !!id);

    // Fallback: slugs from metadata (supports both legacy single and new comma-separated)
    const metaSlugs = (session.metadata?.product_slugs || session.metadata?.product_slug || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (priceIds.length === 0 && metaSlugs.length === 0) {
      console.error('No price IDs or slugs found for session:', stripeSessionId);
      return NextResponse.json({ received: true });
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

    // Find all purchased products by price ID (primary) or slugs (fallback)
    let purchasedProducts: typeof products.$inferSelect[] = [];

    if (priceIds.length > 0) {
      purchasedProducts = await db
        .select()
        .from(products)
        .where(inArray(products.stripePriceId, priceIds));
    }

    // If we didn't find products for all price IDs, try slug fallback
    if (purchasedProducts.length < priceIds.length && metaSlugs.length > 0) {
      const foundSlugs = new Set(purchasedProducts.map((p) => p.slug));
      const missingSlugs = metaSlugs.filter((s) => !foundSlugs.has(s));
      if (missingSlugs.length > 0) {
        const fallbackProducts = await db
          .select()
          .from(products)
          .where(inArray(products.slug, missingSlugs));
        purchasedProducts = [...purchasedProducts, ...fallbackProducts];
      }
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

  return NextResponse.json({ received: true });
}
