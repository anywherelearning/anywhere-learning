import { NextRequest, NextResponse, after } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { subscribeAndTag } from '@/lib/convertkit';
import { cleanEventId, sendMetaLead } from '@/lib/meta-capi';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { sendWorkshopConfirmationEmail } from '@/lib/resend';
import { db } from '@/lib/db';
import { sentEmails } from '@/lib/db/schema';
import {
  WORKSHOP,
  WORKSHOP_DAY_LABEL,
  WORKSHOP_TIME_LABEL,
  cleanSource,
  isWorkshopOver,
  workshopGoogleUrl,
  workshopZoomUrl,
} from '@/lib/workshop';

/**
 * POST /api/workshop: save a seat at the free live workshop (/workshop).
 *
 * Tags: workshop-2027-01 (reminders + replay are Kit broadcasts to it) and
 * from-{source}. No generic `lead` tag, so nobody is dropped into the 7-day
 * free guide sequence. Before the session, sends a one-time "You're in"
 * email (deduped in sent_emails); after it, the tag alone (replay list).
 */
export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = (await request.json()) as { email?: string; source?: string; metaEventId?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const source = cleanSource(body.source);

    await subscribeAndTag(email, [WORKSHOP.signupTag, `from-${source || 'workshop'}`]);

    if (!isWorkshopOver()) {
      after(async () => {
        try {
          const already = await db
            .select({ id: sentEmails.id })
            .from(sentEmails)
            .where(and(eq(sentEmails.email, email), eq(sentEmails.kind, WORKSHOP.confirmKind)))
            .limit(1);
          if (already.length) return;
          const origin = (process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co').replace(/\/$/, '');
          await sendWorkshopConfirmationEmail({
            to: email,
            dayLabel: WORKSHOP_DAY_LABEL,
            timeLabel: WORKSHOP_TIME_LABEL,
            googleUrl: workshopGoogleUrl(),
            icsUrl: `${origin}/api/workshop/calendar`,
            zoomUrl: workshopZoomUrl(),
          });
          await db.insert(sentEmails).values({ email, kind: WORKSHOP.confirmKind });
        } catch (err) {
          console.error('[workshop] confirmation email failed:', err);
        }
      });
    }

    const leadEventId = cleanEventId(body.metaEventId);
    if (leadEventId) {
      after(() =>
        sendMetaLead({
          eventId: leadEventId,
          email,
          source: source ? `workshop:${source}` : 'workshop',
          request,
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Workshop signup error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
