import { NextRequest, NextResponse } from 'next/server';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { isDashboardMember } from '@/lib/dashboard-access';
import { startProgramForUser } from '@/lib/planner-run';

export const runtime = 'nodejs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface PostBody {
  programId?: string;
  childIds?: string[];
  startDate?: string;
}

/**
 * POST /api/dashboard/start-program
 *
 * Drops a program's weekly activities onto the calendar. Member-only: guided
 * skill programs are a membership feature. See lib/planner-run.ts.
 */
export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();

  if (!(await isDashboardMember())) {
    return NextResponse.json({ needsUpgrade: true });
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.programId) {
    return NextResponse.json({ error: 'programId required' }, { status: 400 });
  }
  const childIds = Array.isArray(body.childIds)
    ? body.childIds.filter((s): s is string => typeof s === 'string')
    : [];
  const startDate = body.startDate && ISO_DATE.test(body.startDate) ? body.startDate : undefined;

  const result = await startProgramForUser(userId, body.programId, childIds, startDate);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
