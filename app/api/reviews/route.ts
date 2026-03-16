import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { reviews, orders, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 requests per 60 seconds
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productSlug, rating, comment } = body;

    // Validate input
    if (!productId || !rating || typeof comment !== 'string') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }
    const trimmedComment = comment.replace(/<[^>]*>/g, '').trim();
    if (trimmedComment.length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }
    if (trimmedComment.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }

    // Find user in DB
    const user = await db.select().from(users)
      .where(eq(users.clerkId, clerkId)).limit(1);
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify purchase
    const order = await db.select().from(orders).where(and(
      eq(orders.userId, user[0].id),
      eq(orders.productId, productId),
      eq(orders.status, 'completed'),
    )).limit(1);
    if (order.length === 0) {
      return NextResponse.json({ error: 'Purchase required to leave a review' }, { status: 403 });
    }

    // Check for existing review (upsert)
    const existing = await db.select().from(reviews)
      .where(and(eq(reviews.userId, user[0].id), eq(reviews.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing review
      await db.update(reviews)
        .set({ rating, comment: trimmedComment, updatedAt: new Date() })
        .where(eq(reviews.id, existing[0].id));
    } else {
      // Create new review
      await db.insert(reviews).values({
        userId: user[0].id,
        productId,
        rating,
        comment: trimmedComment,
      });
    }

    // Trigger ISR revalidation for the product page
    if (productSlug) {
      revalidatePath(`/shop/${productSlug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
