import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { subscribeAndTag } from '@/lib/convertkit';

interface CheckoutItem {
  stripePriceId: string;
  slug: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 requests per 60 seconds
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

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

    // Extract and validate email for receipt / cart-abandonment recovery
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
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
      .select({
        stripePriceId: products.stripePriceId,
        slug: products.slug,
        isBundle: products.isBundle,
        name: products.name,
        priceCents: products.priceCents,
        imageUrl: products.imageUrl,
      })
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

    // ── BYOB tier calculation (server-side, never trust client) ─────
    const individualProducts = verifiedProducts.filter((p) => !p.isBundle);
    const individualCount = individualProducts.length;
    const BYOB_TIERS = [
      { minItems: 5,  discountPercent: 10 },
      { minItems: 7,  discountPercent: 15 },
      { minItems: 10, discountPercent: 20 },
    ];
    let byobDiscount = 0;
    for (const tier of BYOB_TIERS) {
      if (individualCount >= tier.minItems) byobDiscount = tier.discountPercent;
    }

    const siteUrl = process.env.NEXT_PUBLIC_URL;
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_URL is not set — checkout cannot create valid redirect URLs');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Build line items — apply BYOB discount to individual items via price_data
    const lineItems: Array<{
      price?: string;
      price_data?: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
          metadata?: Record<string, string>;
        };
        unit_amount: number;
      };
      quantity: number;
    }> = verifiedProducts.map((product) => {
      if (!product.isBundle && byobDiscount > 0) {
        // BYOB-discounted individual item — use price_data with adjusted amount
        const discountedAmount = Math.round(product.priceCents * (1 - byobDiscount / 100));
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.name} (${byobDiscount}% off)`,
              images: product.imageUrl
                ? [`${siteUrl}${product.imageUrl}`]
                : undefined,
              metadata: { stripePriceId: product.stripePriceId },
            },
            unit_amount: discountedAmount,
          },
          quantity: 1,
        };
      }
      // Bundles and non-discounted items use their existing Stripe price
      return { price: product.stripePriceId, quantity: 1 };
    });

    // Add free Skills Map bonus when any bundle is in the cart
    const hasBundle = verifiedProducts.some((p) => p.isBundle);
    const skillsMapAlreadyInCart = verifiedProducts.some((p) => p.slug === 'future-ready-skills-map');
    if (hasBundle && !skillsMapAlreadyInCart) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'The Future-Ready Skills Map (FREE Bundle Bonus)',
            description: 'A 42-page parent guide to the 10 skills that matter most — included free with your bundle.',
            images: [`${siteUrl}/products/future-ready-skills-map.jpg`],
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      customer_creation: 'always',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop`,
      metadata: {
        product_slugs: verifiedSlugs.join(','),
        ...(byobDiscount > 0 && { byob_discount_percent: String(byobDiscount) }),
      },
      allow_promotion_codes: true,
    });

    // Tag as cart-abandoner in ConvertKit — fire-and-forget (non-blocking).
    // If they complete purchase, the webhook adds 'buyer' which supersedes this.
    subscribeAndTag(email, ['cart-abandoner']).catch((err) => {
      console.error('Failed to tag cart-abandoner in ConvertKit:', err);
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
