import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

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
        product_slugs: items.map((item) => item.slug).join(','),
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
