import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { children } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

const HEX_COLOR = /^#([0-9a-fA-F]{3}){1,2}$/;
const KID_PALETTE = ['#588157', '#C4836A', '#5B8FA8', '#C47A8F', '#D4A373', '#7B88A8', '#8B7355', '#5A9B9C'];

interface PostBody {
  name?: string;
  birthYear?: number | null;
  color?: string;
  emoji?: string | null;
  avatar?: string | null;
}

export async function GET() {
  const userId = await getDashboardUserId();
  const rows = await db
    .select()
    .from(children)
    .where(eq(children.userId, userId))
    .orderBy(asc(children.sortOrder), asc(children.createdAt));
  return NextResponse.json({ children: rows });
}

export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  // Pick the next color in palette that isn't already used (best-effort).
  let color = body.color && HEX_COLOR.test(body.color) ? body.color : '';
  if (!color) {
    const existing = await db.select({ color: children.color }).from(children).where(eq(children.userId, userId));
    const used = new Set(existing.map((r) => r.color));
    color = KID_PALETTE.find((c) => !used.has(c)) ?? KID_PALETTE[existing.length % KID_PALETTE.length];
  }

  const birthYear =
    typeof body.birthYear === 'number' && body.birthYear >= 1990 && body.birthYear <= new Date().getFullYear()
      ? body.birthYear
      : null;

  const existingCount = await db.select({ id: children.id }).from(children).where(eq(children.userId, userId));

  const [created] = await db
    .insert(children)
    .values({
      userId,
      name: body.name.trim().slice(0, 40),
      birthYear,
      color,
      emoji: body.emoji && body.emoji.length <= 4 ? body.emoji : null,
      avatar: body.avatar && body.avatar.length <= 24 ? body.avatar : null,
      sortOrder: existingCount.length,
    })
    .returning();
  return NextResponse.json({ child: created }, { status: 201 });
}
