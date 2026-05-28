import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { children } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

const HEX_COLOR = /^#([0-9a-fA-F]{3}){1,2}$/;

interface PatchBody {
  name?: string;
  birthYear?: number | null;
  color?: string;
  emoji?: string | null;
  avatar?: string | null;
  sortOrder?: number;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getDashboardUserId();
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Partial<typeof children.$inferInsert> = {};
  if (typeof body.name === 'string') updates.name = body.name.trim().slice(0, 40);
  if ('birthYear' in body) {
    updates.birthYear =
      typeof body.birthYear === 'number' && body.birthYear >= 1990 && body.birthYear <= new Date().getFullYear()
        ? body.birthYear
        : null;
  }
  if (typeof body.color === 'string' && HEX_COLOR.test(body.color)) updates.color = body.color;
  if ('emoji' in body) updates.emoji = body.emoji && body.emoji.length <= 4 ? body.emoji : null;
  if ('avatar' in body) updates.avatar = body.avatar && body.avatar.length <= 24 ? body.avatar : null;
  if (typeof body.sortOrder === 'number') updates.sortOrder = body.sortOrder;

  const [updated] = await db
    .update(children)
    .set(updates)
    .where(and(eq(children.id, id), eq(children.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ child: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getDashboardUserId();

  const result = await db
    .delete(children)
    .where(and(eq(children.id, id), eq(children.userId, userId)))
    .returning({ id: children.id });

  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
