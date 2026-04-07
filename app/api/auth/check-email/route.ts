import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/auth/check-email
 * Returns whether an email has an existing account (non-pending).
 * Used by the cart to nudge returning users to sign in.
 */
export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ hasAccount: false });
    }

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return NextResponse.json({ hasAccount: false });
    }

    const user = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(eq(users.email, trimmed))
      .limit(1);

    // Only flag as "has account" if they have a real Clerk account (not pending_)
    const hasAccount =
      user.length > 0 && !user[0].clerkId.startsWith('pending_');

    return NextResponse.json({ hasAccount });
  } catch {
    return NextResponse.json({ hasAccount: false });
  }
}
