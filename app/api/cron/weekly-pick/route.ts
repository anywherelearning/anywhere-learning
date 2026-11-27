/**
 * Manual trigger for the Sunday weekly-pick email (the real run is inside the
 * daily renewal-reminders cron, so it needs no Vercel cron slot of its own).
 *
 *   ?dry=1    who would get which guide, sends nothing
 *   ?force=1  run even if it isn't Sunday (Eastern)
 *
 * Authed with CRON_SECRET like the other cron routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyPicks } from '@/lib/weekly-pick-run';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get('dry') === '1';
  const force = req.nextUrl.searchParams.get('force') === '1';
  return NextResponse.json(await runWeeklyPicks({ dryRun, force }));
}
