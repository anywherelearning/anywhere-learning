import { NextResponse } from 'next/server';
import { WORKSHOP, workshopIcs } from '@/lib/workshop';

/** GET /api/workshop/calendar: the workshop as an .ics file (no Zoom link inside). */
export async function GET() {
  return new NextResponse(workshopIcs(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="anywhere-learning-workshop-${WORKSHOP.date}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
