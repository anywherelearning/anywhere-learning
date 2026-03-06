import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { stripePriceId, slug } = await req.json();

    if (!stripePriceId) {
      return NextResponse.json({ error: 'Missing price ID' }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_URL ||
      req.headers.get('origin') ||
      `http://localhost:3000`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_creation: 'always',
      success_url: `${origin}/account/downloads?success=true`,
      cancel_url: `${origin}/shop/${slug}`,
      metadata: {
        product_slug: slug,
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
