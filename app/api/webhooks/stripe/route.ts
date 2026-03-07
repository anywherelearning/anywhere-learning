import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, users, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

    // Get the price ID from line items
    const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId);
    const priceId = lineItems.data[0]?.price?.id;
    const productSlug = session.metadata?.product_slug;

    if (!priceId && !productSlug) {
      console.error('No price ID or slug found for session:', stripeSessionId);
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

    // Find product by Stripe price ID (primary) or slug (fallback)
    let product;
    if (priceId) {
      product = await db
        .select()
        .from(products)
        .where(eq(products.stripePriceId, priceId))
        .limit(1);
    }
    if ((!product || product.length === 0) && productSlug) {
      product = await db
        .select()
        .from(products)
        .where(eq(products.slug, productSlug))
        .limit(1);
    }

    if (product && product.length > 0) {
      // Create order(s) atomically in a transaction
      await db.transaction(async (tx) => {
        await tx.insert(orders).values({
          userId: user[0].id,
          productId: product[0].id,
          stripeSessionId,
          amountCents: amountTotal,
          status: 'completed',
        });

        // If bundle, create orders for each included product
        if (product[0].isBundle && product[0].bundleProductIds) {
          const bundledIds = JSON.parse(product[0].bundleProductIds) as string[];
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
      });

      // Post-transaction: send email + tag (non-critical, outside transaction)
      try {
        await sendPurchaseEmail({
          to: customerEmail,
          productName: product[0].name,
          downloadUrl: `${process.env.NEXT_PUBLIC_URL}/account/downloads`,
        });
      } catch (error) {
        console.error('Failed to send purchase email:', error);
      }

      try {
        await tagBuyerInConvertKit(customerEmail, product[0].slug);
      } catch (error) {
        console.error('Failed to tag buyer in ConvertKit:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
