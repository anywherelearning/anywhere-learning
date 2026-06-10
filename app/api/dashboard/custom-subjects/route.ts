import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customSubjects } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { STANDARD_SUBJECT_IDS } from '@/lib/taxonomy';

export const runtime = 'nodejs';

const HEX_COLOR = /^#([0-9a-fA-F]{3}){1,2}$/;
const SUBJECT_SLUG = /^[a-z0-9-]{2,32}$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32);
}

export async function GET() {
  const userId = await getDashboardUserId();
  const rows = await db
    .select()
    .from(customSubjects)
    .where(eq(customSubjects.userId, userId))
    .orderBy(asc(customSubjects.label));
  return NextResponse.json({ subjects: rows });
}

interface PostBody {
  label?: string;
  color?: string;
}

export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.label || typeof body.label !== 'string') {
    return NextResponse.json({ error: 'label required' }, { status: 400 });
  }
  const slug = slugify(body.label);
  if (!SUBJECT_SLUG.test(slug)) {
    return NextResponse.json({ error: 'invalid label' }, { status: 400 });
  }
  if (STANDARD_SUBJECT_IDS.has(slug)) {
    return NextResponse.json({ error: 'reserved subject id' }, { status: 400 });
  }
  const color = body.color && HEX_COLOR.test(body.color) ? body.color : '#7B8378';

  try {
    const [created] = await db
      .insert(customSubjects)
      .values({
        userId,
        slug,
        label: body.label.trim().slice(0, 40),
        color,
      })
      .returning();
    return NextResponse.json({ subject: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'subject already exists' }, { status: 409 });
  }
}
