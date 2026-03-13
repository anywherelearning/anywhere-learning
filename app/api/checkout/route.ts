import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';

interface CheckoutItem {
  stripePriceId: string;
  slug: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both legacy single-item { stripePriceId, slug } and new multi-item { items: [...] }
    let items: CheckoutItem[];

    if (Array.isArray(body.items)) {
      items = body.items;
    } else if (body.stripePriceId) {
      items = [{ stripePriceId: body.stripePriceId, slug: body.slug }];
    } else {
      return NextResponse.json({ error: 'Missing items or price ID' }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate all items have price IDs
    if (items.some((item) => !item.stripePriceId)) {
      return NextResponse.json({ error: 'Missing price ID for one or more items' }, { status: 400 });
    }

    // ── SECURITY: Validate every stripePriceId against the database ──
    // Never trust client-supplied price IDs or slugs. Look up the real
    // product for each price ID and use the DB-verified slugs in metadata.
    const clientPriceIds = items.map((item) => item.stripePriceId);
    const verifiedProducts = await db
      .select({ stripePriceId: products.stripePriceId, slug: products.slug })
      .from(products)
      .where(and(
        inArray(products.stripePriceId, clientPriceIds),
        eq(products.active, true),
      ));

    // Build a set of verified price IDs for quick lookup
    const verifiedPriceIds = new Set(verifiedProducts.map((p) => p.stripePriceId));

    // Reject if ANY price ID doesn't match a real, active product
    const invalidPriceIds = clientPriceIds.filter((id) => !verifiedPriceIds.has(id));
    if (invalidPriceIds.length > 0) {
      console.error('Checkout rejected — unrecognised price IDs:', invalidPriceIds);
      return NextResponse.json(
        { error: 'One or more products could not be found' },
        { status: 400 },
      );
    }

    // Use DB-verified slugs (not client-supplied) for metadata
    const verifiedSlugs = verifiedProducts.map((p) => p.slug);

    const origin =
      process.env.NEXT_PUBLIC_URL ||
      req.headers.get('origin') ||
      `http://localhost:3000`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price: item.stripePriceId,
        quantity: 1,
      })),
      customer_creation: 'always',
      success_url: `${origin}/account/downloads?success=true`,
      cancel_url: `${origin}/shop`,
      metadata: {
        product_slugs: verifiedSlugs.join(','),
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
