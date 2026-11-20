import { NextRequest, NextResponse, after } from 'next/server';
import { subscribeAndTag } from '@/lib/convertkit';
import { cleanEventId, sendMetaLead } from '@/lib/meta-capi';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { REASON_TO_LEARN, cleanSource } from '@/lib/workshop';

/**
 * POST /api/reason-to-learn: "tell me when it opens" for the 6-week group
 * program. Tags rtl-interested + from-{source}; nothing else is sent now.
 * This list gets the first email when sign-ups open on Jan 13.
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

    await subscribeAndTag(email, [REASON_TO_LEARN.interestTag, `from-${source || 'rtl'}`]);

    const leadEventId = cleanEventId(body.metaEventId);
    if (leadEventId) {
      after(() =>
        sendMetaLead({
          eventId: leadEventId,
          email,
          source: source ? `rtl:${source}` : 'rtl',
          request,
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reason to Learn interest error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
