/**
 * /api/email/weekly-off?t=<users.id> turns off the weekly-pick email.
 *
 * GET is the footer link (shows a short confirmation page). POST is the
 * one-click List-Unsubscribe that Gmail and Apple Mail send (RFC 8058). The
 * token is the member's users.id uuid, so no email address travels in a URL.
 * Recorded as a sent_emails row of kind 'weekly_pick_off', read by
 * lib/weekly-pick-run.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sentEmails, users } from '@/lib/db/schema';
import { WEEKLY_OFF_KIND } from '@/lib/weekly-pick-run';
import { checkRateLimit, standardLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function turnOff(token: string): Promise<boolean> {
  if (!UUID_RE.test(token)) return false;
  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, token)).limit(1);
  if (!u) return false;
  const email = u.email.toLowerCase();
  const existing = await db
    .select({ id: sentEmails.id })
    .from(sentEmails)
    .where(and(eq(sentEmails.email, email), eq(sentEmails.kind, WEEKLY_OFF_KIND)))
    .limit(1);
  if (!existing.length) await db.insert(sentEmails).values({ email, kind: WEEKLY_OFF_KIND });
  console.log(`[weekly-off] turned off for user ${token}`);
  return true;
}

const page = (ok: boolean) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Weekly pick turned off | Anywhere Learning</title><meta name="robots" content="noindex">
<style>body{margin:0;background:#FAF9F6;color:#2F3A2E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
main{max-width:520px;margin:12vh auto;padding:0 24px;text-align:center}h1{font-family:Georgia,serif;font-weight:400;font-size:30px;margin:0 0 14px}
p{font-size:17px;line-height:1.65;color:#4B5563}a{color:#588157;font-weight:600}</style></head>
<body><main>${
  ok
    ? `<h1>Done. No more weekly picks.</h1><p>You won't get the weekly email anymore. Your membership doesn't change, and your map and every guide are right where you left them.</p>`
    : `<h1>That link didn't work.</h1><p>To stop the weekly pick, email <a href="mailto:info@anywherelearning.co">info@anywherelearning.co</a> and I'll turn it off for you.</p>`
}<p><a href="https://anywherelearning.co/account">Go to your account</a></p></main></body></html>`;

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;
  let ok = false;
  try {
    ok = await turnOff(req.nextUrl.searchParams.get('t') || '');
  } catch (err) {
    console.error('[weekly-off] failed:', err);
  }
  return new NextResponse(page(ok), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function POST(req: NextRequest) {
  try {
    await turnOff(req.nextUrl.searchParams.get('t') || '');
  } catch (err) {
    console.error('[weekly-off] one-click failed:', err);
  }
  return new NextResponse(null, { status: 200 });
}
