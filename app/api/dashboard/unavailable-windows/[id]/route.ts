import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { unavailableWindows } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getDashboardUserId();
  const { id } = await ctx.params;
  await db
    .delete(unavailableWindows)
    .where(and(eq(unavailableWindows.id, id), eq(unavailableWindows.userId, userId)));
  return NextResponse.json({ ok: true });
}
