/**
 * POST /api/reviews — write or update a review for an activity.
 *
 * Auth & access:
 *   - User must be signed in (Clerk)
 *   - User must be a member or trial member
 *
 * Each user can leave one review per activity (upserts on re-submit).
 * Snapshots the author's Clerk name + image URL onto the review row so the
 * product page can render reviews without per-row Clerk lookups.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { reviews, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getAccessTierForClerkId } from '@/lib/access';

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { slug, rating, comment } = body as { slug?: string; rating?: number; comment?: string };

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing activity.' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5.' }, { status: 400 });
    }
    const cleaned = (typeof comment === 'string' ? comment : '').replace(/<[^>]*>/g, '').trim();
    if (cleaned.length < 10) {
      return NextResponse.json({ error: 'Tell us a little more — a sentence or two.' }, { status: 400 });
    }
    if (cleaned.length > 1000) {
      return NextResponse.json({ error: 'A bit too long. Trim to under 1000 characters.' }, { status: 400 });
    }

    // Tier check — members and trial members can review any activity.
    const tier = await getAccessTierForClerkId(clerkId);
    const allowed = tier === 'member' || tier === 'trial';
    if (!allowed) {
      return NextResponse.json(
        { error: 'Only members can review activities.' },
        { status: 403 },
      );
    }

    // Find user row
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Snapshot author info from Clerk (so we don't refetch on every render)
    let authorName = user.email; // sensible fallback
    let authorImageUrl: string | null = null;
    try {
      const u = await currentUser();
      if (u) {
        authorName =
          u.fullName?.trim() ||
          [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
          u.username ||
          user.email;
        authorImageUrl =
          u.hasImage && !u.imageUrl?.includes('clerk.com/identicon') ? u.imageUrl : null;
      }
    } catch {
      /* Clerk lookup failed — fine, name fallback is the email */
    }

    // Upsert
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, user.id), eq(reviews.productSlug, slug)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(reviews)
        .set({
          rating: rating as number,
          comment: cleaned,
          authorName,
          authorImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existing[0].id));
    } else {
      await db.insert(reviews).values({
        userId: user.id,
        productSlug: slug,
        rating: rating as number,
        comment: cleaned,
        authorName,
        authorImageUrl,
      });
    }

    revalidatePath(`/shop/${slug}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reviews] POST failed:', err);
    return NextResponse.json({ error: 'Could not save your review.' }, { status: 500 });
  }
}
