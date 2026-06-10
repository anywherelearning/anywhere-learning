import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

/**
 * Best-effort photo delete from Vercel Blob.
 * Authenticates the request and verifies the URL belongs to the caller
 * (path includes their userId) before deleting.
 */
export async function POST(req: NextRequest) {
  const userId = await getDashboardUserId();
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const url = body.url;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }
  // Cheap ownership check: ensure path contains the caller's user id segment
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
  if (!url.includes(`/dashboard/${safeUser}/`)) {
    return NextResponse.json({ error: 'Not your photo' }, { status: 403 });
  }
  try {
    await del(url);
  } catch (err) {
    console.error('[upload-photo/delete] failed:', err);
  }
  return NextResponse.json({ ok: true });
}
