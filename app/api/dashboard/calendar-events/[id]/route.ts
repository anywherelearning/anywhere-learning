import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { calendarEvents } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

interface PatchBody {
  date?: string;
  title?: string;
  type?: string;
  category?: string | null;
  productSlug?: string | null;
  notes?: string | null;
  recurrence?: string;
  recurrenceUntil?: string | null;
  childIds?: string[];
  childNames?: string[];
  mode?: string;
  durationMinutes?: number | null;
  skipped?: boolean;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const VALID_RECURRENCES = new Set(['none', 'weekly', 'biweekly', 'monthly']);
const VALID_MODES = new Set(['independent', 'together', 'either']);
/** Strip ":YYYY-MM-DD" suffix used for synthetic recurrence occurrences. */
function stripOccurrenceSuffix(id: string): string {
  return id.split(':')[0];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = stripOccurrenceSuffix(rawId);
  const userId = await getDashboardUserId();
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Partial<typeof calendarEvents.$inferInsert> = { updatedAt: new Date() };
  if (isIsoDate(body.date)) updates.date = body.date;
  if (typeof body.title === 'string') updates.title = body.title.trim().slice(0, 200);
  if (typeof body.type === 'string') updates.type = body.type;
  if ('category' in body) updates.category = body.category ?? null;
  if ('productSlug' in body) updates.productSlug = body.productSlug ?? null;
  if ('notes' in body) updates.notes = body.notes ? String(body.notes).slice(0, 2000) : null;
  if (typeof body.recurrence === 'string' && VALID_RECURRENCES.has(body.recurrence)) {
    updates.recurrence = body.recurrence;
  }
  if ('recurrenceUntil' in body) {
    updates.recurrenceUntil = isIsoDate(body.recurrenceUntil) ? body.recurrenceUntil : null;
  }
  if (Array.isArray(body.childIds)) {
    updates.childIds = body.childIds.filter((s): s is string => typeof s === 'string').slice(0, 8);
  }
  if (Array.isArray(body.childNames)) {
    updates.childNames = body.childNames.filter((s): s is string => typeof s === 'string').slice(0, 8);
  }
  if (typeof body.mode === 'string' && VALID_MODES.has(body.mode)) {
    updates.mode = body.mode;
  }
  if ('durationMinutes' in body) {
    updates.durationMinutes =
      typeof body.durationMinutes === 'number' && body.durationMinutes > 0 && body.durationMinutes < 600
        ? Math.round(body.durationMinutes)
        : null;
  }
  if (typeof body.skipped === 'boolean') {
    updates.skipped = body.skipped;
  }

  const [updated] = await db
    .update(calendarEvents)
    .set(updates)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = stripOccurrenceSuffix(rawId);
  const userId = await getDashboardUserId();

  const result = await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning({ id: calendarEvents.id });

  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
