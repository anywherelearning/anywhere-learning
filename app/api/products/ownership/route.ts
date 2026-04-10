import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * GET /api/products/ownership?slug=future-ready-skills-map
 * GET /api/products/ownership?slugs=slug-a,slug-b
 *
 * Returns which of the requested slugs the signed-in user already owns
 * (via a completed or partially_refunded order). Used by the cart drawer
 * to hide the free-bonus upsell if the user already has it.
 *
 * Response: { owned: string[] }
 *   - Signed-out users always receive an empty array (no leak).
 */
export async function GET(req: NextRequest) {
  const single = req.nextUrl.searchParams.get('slug');
  const multi = req.nextUrl.searchParams.get('slugs');
  const slugList = (single ? [single] : (multi ?? '').split(','))
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugList.length === 0) {
    return NextResponse.json({ owned: [] });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ owned: [] });
  }

  try {
    // Resolve user via Clerk id first, then fall back to email so pending
    // webhook-created users (bought before they ever signed in) are matched.
    let user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        user = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
      }
    }

    if (user.length === 0) {
      return NextResponse.json({ owned: [] });
    }

    // Look up product ids for the requested slugs
    const requested = await db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(inArray(products.slug, slugList));

    if (requested.length === 0) {
      return NextResponse.json({ owned: [] });
    }

    const idToSlug = new Map(requested.map((r) => [r.id, r.slug]));
    const requestedIds = requested.map((r) => r.id);

    // A purchase counts as "owned" if the order is completed or
    // partially_refunded (matches the download-endpoint gate).
    const ownedRows = await db
      .select({ productId: orders.productId })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user[0].id),
          inArray(orders.productId, requestedIds),
          inArray(orders.status, ['completed', 'partially_refunded']),
        ),
      );

    const owned = Array.from(
      new Set(ownedRows.map((r) => idToSlug.get(r.productId)!).filter(Boolean)),
    );
    return NextResponse.json({ owned });
  } catch (err) {
    console.error('Ownership check failed:', err);
    return NextResponse.json({ owned: [] });
  }
}
