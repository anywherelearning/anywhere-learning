import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { BYOB_TIERS, BUNDLE_CONTENTS } from '@/lib/cart';
import { auth } from '@clerk/nextjs/server';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

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

    // Extract and validate email (optional - Stripe collects if not provided)
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let email = rawEmail && emailRegex.test(rawEmail) ? rawEmail : '';
    if (rawEmail && !email) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // If no email provided, try to get it from Clerk auth (for direct upgrade flows)
    if (!email) {
      try {
        const { userId: clerkId } = await auth();
        if (clerkId) {
          const clerkUser = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);
          if (clerkUser.length > 0) {
            email = clerkUser[0].email;
          }
        }
      } catch {
        // Non-critical - proceed without email
      }
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
      console.error('Checkout rejected - unrecognised price IDs:', invalidPriceIds);
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
    let byobDiscount = 0;
    for (const tier of BYOB_TIERS) {
      if (individualCount >= tier.minItems) byobDiscount = tier.discountPercent;
    }

    const siteUrl = process.env.NEXT_PUBLIC_URL;
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_URL is not set - checkout cannot create valid redirect URLs');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // ── Bundle upgrade credits: if user already owns child products, credit what they paid ──
    const bundleCredits: Record<string, number> = {};
    const bundleProducts = verifiedProducts.filter((p) => p.isBundle);
    if (email && bundleProducts.length > 0) {
      try {
        const existingUser = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          for (const bundle of bundleProducts) {
            const childSlugs = BUNDLE_CONTENTS[bundle.slug];
            if (!childSlugs || childSlugs.length === 0) continue;

            // Find child products in DB
            const childProducts = await db
              .select({ id: products.id, slug: products.slug })
              .from(products)
              .where(inArray(products.slug, childSlugs));

            if (childProducts.length === 0) continue;
            const childIds = childProducts.map((p) => p.id);

            // Get completed orders for these child products
            const ownedOrders = await db
              .select({
                productId: orders.productId,
                amountCents: orders.amountCents,
              })
              .from(orders)
              .where(
                and(
                  eq(orders.userId, existingUser[0].id),
                  inArray(orders.productId, childIds),
                  eq(orders.status, 'completed'),
                ),
              );

            if (ownedOrders.length === 0) continue;

            // Credit individual purchases (amountCents > 0)
            let totalCredit = 0;
            const paidByProduct: Record<string, number> = {};
            for (const o of ownedOrders) {
              if (o.amountCents > 0) {
                paidByProduct[o.productId] = Math.max(
                  paidByProduct[o.productId] || 0,
                  o.amountCents,
                );
              }
            }
            totalCredit += Object.values(paidByProduct).reduce((sum, v) => sum + v, 0);

            // Credit sub-bundle purchases whose children overlap with this bundle.
            // Each sub-bundle is credited once at full price (that's what the user paid).
            for (const [subBundleSlug, subChildSlugs] of Object.entries(BUNDLE_CONTENTS)) {
              if (subBundleSlug === bundle.slug) continue;
              if (!subChildSlugs.some((s) => childSlugs.includes(s))) continue;

              const subBundle = await db
                .select({ id: products.id })
                .from(products)
                .where(and(eq(products.slug, subBundleSlug), eq(products.isBundle, true)))
                .limit(1);
              if (subBundle.length === 0) continue;

              const subBundleOrder = await db
                .select({ amountCents: orders.amountCents })
                .from(orders)
                .where(
                  and(
                    eq(orders.userId, existingUser[0].id),
                    eq(orders.productId, subBundle[0].id),
                    eq(orders.status, 'completed'),
                  ),
                )
                .limit(1);

              if (subBundleOrder.length > 0) {
                totalCredit += subBundleOrder[0].amountCents;
              }
            }

            if (totalCredit > 0) {
              bundleCredits[bundle.slug] = totalCredit;
            }
          }
        }
      } catch (error) {
        console.error('Failed to calculate bundle credits:', error);
        // Non-critical - proceed without credits
      }
    }

    // Build line items - apply BYOB discount to individual items via price_data
    const hasBundle = verifiedProducts.some((p) => p.isBundle);
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
      // Skills Map is free when any bundle is in the cart
      if (hasBundle && product.slug === 'future-ready-skills-map') {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.name} (FREE Bundle Bonus)`,
              description: 'A 42-page parent guide to the 10 skills that matter most, included free with your bundle.',
              images: product.imageUrl
                ? [`${siteUrl}${product.imageUrl}`]
                : undefined,
              metadata: { stripePriceId: product.stripePriceId },
            },
            unit_amount: 0,
          },
          quantity: 1,
        };
      }
      if (!product.isBundle && byobDiscount > 0) {
        // BYOB-discounted individual item - use price_data with adjusted amount
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
      // Bundle with upgrade credit - use price_data with adjusted amount
      const credit = product.isBundle ? (bundleCredits[product.slug] || 0) : 0;
      if (credit > 0) {
        const upgradeAmount = Math.max(0, product.priceCents - credit);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.name} (Upgrade, you save ${formatCents(credit)})`,
              images: product.imageUrl
                ? [`${siteUrl}${product.imageUrl}`]
                : undefined,
              metadata: { stripePriceId: product.stripePriceId },
            },
            unit_amount: upgradeAmount,
          },
          quantity: 1,
        };
      }
      // Bundles and non-discounted items use their existing Stripe price
      return { price: product.stripePriceId, quantity: 1 };
    });

    // Add free Skills Map bonus when any bundle is in the cart,
    // but skip if the customer already owns it or already added it themselves.
    const skillsMapAlreadyInCart = verifiedProducts.some((p) => p.slug === 'future-ready-skills-map');
    let alreadyOwnsSkillsMap = false;

    if (hasBundle && !skillsMapAlreadyInCart) {
      // Check if this email has a past completed order for the Skills Map (skip if no email)
      if (email) try {
        const existingUser = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          const skillsMapProduct = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.slug, 'future-ready-skills-map'))
            .limit(1);

          if (skillsMapProduct.length > 0) {
            const pastOrder = await db
              .select({ id: orders.id })
              .from(orders)
              .where(
                and(
                  eq(orders.userId, existingUser[0].id),
                  eq(orders.productId, skillsMapProduct[0].id),
                  eq(orders.status, 'completed'),
                ),
              )
              .limit(1);

            alreadyOwnsSkillsMap = pastOrder.length > 0;
          }
        }
      } catch (error) {
        // Non-critical - if the check fails, still offer the bonus
        console.error('Failed to check past Skills Map ownership:', error);
      }

      if (!alreadyOwnsSkillsMap) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Future-Ready Skills Map (FREE Bundle Bonus)',
              description: 'A 42-page parent guide to the 10 skills that matter most, included free with your bundle.',
              images: [`${siteUrl}/products/future-ready-skills-map.jpg`],
            },
            unit_amount: 0,
          },
          quantity: 1,
        });
      }
    }

    // Generate a one-time token to prevent session ID guessing on the success page
    const successToken = randomBytes(16).toString('hex');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(email && { customer_email: email }),
      customer_creation: 'always',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&token=${successToken}`,
      cancel_url: `${siteUrl}/shop?cart=open`,
      metadata: {
        product_slugs: verifiedSlugs.join(','),
        success_token: successToken,
        ...(byobDiscount > 0 && { byob_discount_percent: String(byobDiscount) }),
        ...(Object.keys(bundleCredits).length > 0 && {
          bundle_upgrade_credits: JSON.stringify(bundleCredits),
        }),
      },
      // Disable promo codes when BYOB discount is active to prevent stacking
      ...(byobDiscount === 0 && { allow_promotion_codes: true }),
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
