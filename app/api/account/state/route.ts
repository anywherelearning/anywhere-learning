import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { memberState } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Hard cap so a runaway client can't write a giant blob.
const MAX_BYTES = 256 * 1024;

/** GET /api/account/state -> { data } (the member's synced state, or null). */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ data: null });
  try {
    const rows = await db
      .select({ data: memberState.data })
      .from(memberState)
      .where(eq(memberState.clerkId, clerkId))
      .limit(1);
    return NextResponse.json({ data: rows[0]?.data ?? null });
  } catch {
    // DB not configured — fall back to client localStorage silently.
    return NextResponse.json({ data: null });
  }
}

/** POST /api/account/state { data } -> upsert the member's state. */
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 });
  }
  const data = body?.data;
  if (data === undefined || data === null || typeof data !== 'object') {
    return NextResponse.json({ ok: false, error: 'missing data' }, { status: 400 });
  }
  if (JSON.stringify(data).length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'too large' }, { status: 413 });
  }

  try {
    await db
      .insert(memberState)
      .values({ clerkId, data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: memberState.clerkId,
        set: { data, updatedAt: new Date() },
      });
    return NextResponse.json({ ok: true });
  } catch {
    // DB not configured — accept silently so the client keeps working locally.
    return NextResponse.json({ ok: true, persisted: false });
  }
}
