/**
 * GET /api/skills-map/download?t=<token>&f=<file> — Skills Map file delivery.
 *
 * The token is signed per purchase (lib/skills-map.ts) and carries whether the
 * course bonus is included, so no database lookup is needed. Redirects to the
 * Blob file with a download-friendly name.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MAP_FILES, readDownloadToken, type MapFileKey } from '@/lib/skills-map';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') || '';
  const f = req.nextUrl.searchParams.get('f') || '';
  const parsed = readDownloadToken(token);
  if (!parsed || !(f in MAP_FILES)) {
    return new NextResponse('This download link is not valid. Reply to your receipt email and Amelie will send a new one.', { status: 403 });
  }
  const file = MAP_FILES[f as MapFileKey];
  if (file.bonus && !parsed.bonus) {
    return new NextResponse('This file is not part of your purchase.', { status: 403 });
  }
  return NextResponse.redirect(`${file.url}?download=1`, 302);
}
