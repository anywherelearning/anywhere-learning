/**
 * GET /coop/<code>: the short link on co-op flyers. Sends the family into the
 * yearly trial with their co-op's code, which checkout applies for them
 * (lib/coop-offer.ts). A malformed code still lands on the plan picker.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeCoopCode } from '@/lib/coop-offer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = sanitizeCoopCode((await params).code);
  const origin = (process.env.NEXT_PUBLIC_URL || req.nextUrl.origin).replace(/\/$/, '');
  const target = code ? `/start-trial?plan=annual&code=${code}` : '/choose-plan';
  return NextResponse.redirect(`${origin}${target}`, 303);
}
