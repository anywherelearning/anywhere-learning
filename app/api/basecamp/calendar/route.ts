import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAccessTierForClerkId } from '@/lib/access';
import { basecampIcs, basecampZoomUrl, nextBasecamp } from '@/lib/basecamp';

/**
 * GET /api/basecamp/calendar
 * The next Basecamp as an .ics file (Apple Calendar, Outlook). Members only:
 * the event carries the Zoom link.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId || (await getAccessTierForClerkId(userId)) === 'guest') {
    return NextResponse.json({ error: 'Members only.' }, { status: 403 });
  }
  const session = nextBasecamp();
  const zoom = basecampZoomUrl();
  if (!session || !zoom) return NextResponse.json({ error: 'No session scheduled.' }, { status: 404 });

  return new NextResponse(basecampIcs(session, zoom), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="basecamp-${session.date}.ics"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
