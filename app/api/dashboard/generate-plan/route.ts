import { NextRequest, NextResponse } from 'next/server';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { isDashboardMember } from '@/lib/dashboard-access';
import { runPlannerForWeek } from '@/lib/planner-run';

export const runtime = 'nodejs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface PostBody {
  weekStart?: string;
  clearPriorGenerated?: boolean;
  dryRun?: boolean;
}

/**
 * POST /api/dashboard/generate-plan
 *
 * Runs the goal-based planner for one week. Member-only: auto-building a
 * skill-rich week is the membership's engine. See lib/planner-run.ts.
 */
export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();

  if (!(await isDashboardMember())) {
    return NextResponse.json({
      needsUpgrade: true,
      placements: [],
      unfulfilled: {},
      notes: [],
      createdEventIds: [],
    });
  }

  let body: PostBody = {};
  try {
    if (req.body) body = await req.json();
  } catch {
    // empty body is fine
  }

  const weekStart = body.weekStart && ISO_DATE.test(body.weekStart) ? body.weekStart : undefined;
  const result = await runPlannerForWeek(userId, weekStart, {
    clearPriorGenerated: body.clearPriorGenerated,
    dryRun: body.dryRun,
  });

  return NextResponse.json(result);
}
