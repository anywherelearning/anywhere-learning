/**
 * GET /api/exit-reason?t=<token>&r=<reason> — records a one-tap exit-survey
 * answer from a cancellation email, then shows the thank-you page.
 *
 * The token is the exit_surveys row uuid created when the email was sent, so
 * no email address ever travels in a URL. Clicking twice (or changing your
 * mind) just overwrites the reason — people misclick in emails.
 *
 * Always redirects to /goodbye, even on a bad token: the clicker meant to
 * answer, and an error page would punish them for our problem.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { exitSurveys } from '@/lib/db/schema';
import { subscribeAndTag } from '@/lib/convertkit';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/** Must match EXIT_REASONS in emails/TrialCanceled.tsx. */
const VALID_REASONS = new Set(['price', 'time', 'engagement', 'ages', 'other']);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function goodbye(req: NextRequest): NextResponse {
  const origin = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '') || req.nextUrl.origin;
  return NextResponse.redirect(`${origin}/goodbye`, 303);
}

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const token = req.nextUrl.searchParams.get('t') || '';
  const reason = req.nextUrl.searchParams.get('r') || '';

  if (!UUID_RE.test(token) || !VALID_REASONS.has(reason)) {
    return goodbye(req);
  }

  try {
    const rows = await db
      .update(exitSurveys)
      .set({ reason, reasonAt: new Date() })
      .where(eq(exitSurveys.id, token))
      .returning({ email: exitSurveys.email });

    const email = rows[0]?.email;
    if (email) {
      // Segment the win-back automations by reason (e.g. exit-price gets the
      // monthly-plan pitch; exit-engagement probably gets nothing).
      try {
        await subscribeAndTag(email, [`exit-${reason}`]);
      } catch (err) {
        console.warn('[exit-reason] kit tagging failed:', err);
      }
      console.log(`[exit-reason] recorded '${reason}' for survey ${token}`);
    }
  } catch (err) {
    console.error('[exit-reason] failed to record reason:', err);
  }

  return goodbye(req);
}
