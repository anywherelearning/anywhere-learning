/**
 * GET /map-offer — the link in the Skills Map, its delivery email and the
 * buyer emails. Short and stable on purpose (it's printed in the PDF).
 * Starts the yearly trial with the owner offer; /start-trial checks the
 * 72-hour window against the signed-in email, and falls back to the normal
 * price once it has passed.
 */

import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  const url = new URL('/start-trial?plan=annual&offer=map', req.url);
  return NextResponse.redirect(url, 303);
}
