import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { deviceTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 requests per 60 seconds
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const body = await req.json();
    const { token, platform } = body;

    if (!token || typeof token !== 'string' || token.length > 512) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (!platform || !['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Get user ID if authenticated (optional - tokens can be registered before login)
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      userId = clerkId;
    } catch {
      // Auth not available - register token without user
    }

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Upsert: if token already exists, update the user and timestamp
    const existing = await db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.token, token))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(deviceTokens)
        .set({
          userId: userId ?? existing[0].userId,
          platform,
          updatedAt: new Date(),
        })
        .where(eq(deviceTokens.token, token));
    } else {
      await db.insert(deviceTokens).values({
        token,
        platform,
        userId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push registration error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
