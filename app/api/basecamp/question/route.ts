import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getAccessTierForClerkId } from '@/lib/access';
import { nextBasecamp } from '@/lib/basecamp';
import { sendOwnerAlertEmail } from '@/lib/resend';
import { checkRateLimit, standardLimiter } from '@/lib/rate-limit';

/**
 * POST /api/basecamp/question  { question }
 * A member sends a question ahead of Basecamp. It lands in Amelie's inbox as a
 * plain email, with the member's address so she can answer it live or reply.
 */
export const dynamic = 'force-dynamic';

const MAX = 1000;

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const { userId } = await auth();
  if (!userId || (await getAccessTierForClerkId(userId)) === 'guest') {
    return NextResponse.json({ error: 'Members only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, MAX) : '';
  if (question.length < 3) return NextResponse.json({ error: 'Write a question first.' }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? 'unknown';
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email;
  const session = nextBasecamp();

  await sendOwnerAlertEmail({
    subject: `Basecamp question from ${name}`,
    text: [
      `For Basecamp${session ? ` on ${session.dayLabel}` : ''}:`,
      '',
      question,
      '',
      `From: ${name} <${email}>`,
    ].join('\n'),
  });
  return NextResponse.json({ ok: true });
}
