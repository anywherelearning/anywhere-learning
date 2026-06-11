import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customResources } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

const VALID_MODE = new Set(['independent', 'together', 'either']);
const VALID_CADENCE = new Set(['flexible', 'fixed']);

interface PatchBody {
  title?: string;
  subjects?: string[];
  childIds?: string[];
  mode?: string;
  durationMinutes?: number | null;
  cadence?: string;
  timesPerWeek?: number | null;
  fixedDays?: number[];
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getDashboardUserId();
  const { id } = await ctx.params;
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Partial<typeof customResources.$inferInsert> = { updatedAt: new Date() };
  if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim().slice(0, 80);
  if (Array.isArray(body.subjects)) {
    updates.subjects = body.subjects.filter((s): s is string => typeof s === 'string').slice(0, 12);
  }
  if (Array.isArray(body.childIds)) {
    updates.childIds = body.childIds.filter((s): s is string => typeof s === 'string').slice(0, 8);
  }
  if (typeof body.mode === 'string' && VALID_MODE.has(body.mode)) updates.mode = body.mode;
  if ('durationMinutes' in body) {
    updates.durationMinutes =
      typeof body.durationMinutes === 'number' && body.durationMinutes > 0 && body.durationMinutes < 600
        ? Math.round(body.durationMinutes)
        : null;
  }
  if (typeof body.cadence === 'string' && VALID_CADENCE.has(body.cadence)) updates.cadence = body.cadence;
  if ('timesPerWeek' in body) {
    updates.timesPerWeek =
      typeof body.timesPerWeek === 'number' && body.timesPerWeek > 0 && body.timesPerWeek <= 14
        ? Math.round(body.timesPerWeek)
        : null;
  }
  if (Array.isArray(body.fixedDays)) {
    updates.fixedDays = Array.from(
      new Set(body.fixedDays.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)),
    );
  }

  const [updated] = await db
    .update(customResources)
    .set(updates)
    .where(and(eq(customResources.id, id), eq(customResources.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ resource: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getDashboardUserId();
  const { id } = await ctx.params;
  // Soft-delete: keep historical calendar events intact, just stop scheduling it.
  const [updated] = await db
    .update(customResources)
    .set({ active: false, updatedAt: new Date() })
    .where(and(eq(customResources.id, id), eq(customResources.userId, userId)))
    .returning({ id: customResources.id });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
