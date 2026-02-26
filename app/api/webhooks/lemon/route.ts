import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { orders, users, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPurchaseEmail } from '@/lib/resend';
import { tagBuyerInConvertKit } from '@/lib/convertkit';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');

  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta.event_name;

  if (eventName === 'order_created') {
    const { data } = payload;
    const customerEmail = data.attributes.user_email;
    const lemonOrderId = data.id;
    const totalCents = data.attributes.total;
    const variantId = data.attributes.first_order_item?.variant_id;

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail))
      .limit(1);

    if (user.length === 0) {
      // Create stub user (will be linked when they sign up with Clerk)
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: `pending_${customerEmail}`,
          email: customerEmail,
        })
        .returning();
      user = [newUser];
    }

    // Find product by Lemon Squeezy variant ID
    const product = await db
      .select()
      .from(products)
      .where(eq(products.lemonVariantId, String(variantId)))
      .limit(1);

    if (product.length > 0) {
      // Create order
      await db.insert(orders).values({
        userId: user[0].id,
        productId: product[0].id,
        lemonOrderId: String(lemonOrderId),
        amountCents: totalCents,
        status: 'completed',
      });

      // If it's a bundle, also create orders for each included product
      if (product[0].isBundle && product[0].bundleProductIds) {
        const bundledIds = JSON.parse(product[0].bundleProductIds) as string[];
        for (const pid of bundledIds) {
          await db.insert(orders).values({
            userId: user[0].id,
            productId: pid,
            lemonOrderId: String(lemonOrderId),
            amountCents: 0,
            status: 'completed',
          });
        }
      }

      // Send purchase confirmation email
      try {
        await sendPurchaseEmail({
          to: customerEmail,
          productName: product[0].name,
          downloadUrl: `${process.env.NEXT_PUBLIC_URL}/account/downloads`,
        });
      } catch (error) {
        console.error('Failed to send purchase email:', error);
      }

      // Tag buyer in ConvertKit
      await tagBuyerInConvertKit(customerEmail, product[0].slug);
    }
  }

  return NextResponse.json({ received: true });
}
