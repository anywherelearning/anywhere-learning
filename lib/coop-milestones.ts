/**
 * Co-op milestones: email Amelie when a co-op's code reaches 5 families (the
 * organizer's membership becomes free) or 10 (their private Zoom session).
 * Runs in the daily cron. Each milestone emails once, deduped in sent_emails
 * as kind 'coop_milestone:<CODE>:<n>'.
 *
 * The count is Stripe's times_redeemed for the code, so it includes families
 * still in their free trial. The email says so: check they stayed before
 * giving the reward.
 */

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sentEmails } from '@/lib/db/schema';
import { stripe } from '@/lib/stripe';
import { sendOwnerAlertEmail } from '@/lib/resend';
import { COOP_OFFER } from '@/lib/coop-offer';

const OWNER = 'info@anywherelearning.co';

const MILESTONES = [
  { families: 5, reward: "the organizer's own membership is free" },
  { families: 10, reward: 'they get a private 40-minute live session on Zoom' },
] as const;

export async function runCoopMilestones({ dryRun = false }: { dryRun?: boolean } = {}) {
  const codes = await stripe.promotionCodes.list({ coupon: COOP_OFFER.couponId, limit: 100 });
  const reached: { code: string; coop: string; families: number; used: number }[] = [];

  for (const p of codes.data) {
    const coop = p.metadata?.coop || p.code;
    for (const m of MILESTONES) {
      if (p.times_redeemed < m.families) continue;
      const kind = `coop_milestone:${p.code}:${m.families}`;
      const already = await db
        .select({ id: sentEmails.id })
        .from(sentEmails)
        .where(and(eq(sentEmails.email, OWNER), eq(sentEmails.kind, kind)))
        .limit(1);
      if (already.length > 0) continue;

      reached.push({ code: p.code, coop, families: m.families, used: p.times_redeemed });
      if (dryRun) continue;

      await sendOwnerAlertEmail({
        subject: `${coop} reached ${m.families} families`,
        text: [
          `${p.times_redeemed} families have now joined with the ${p.code} code from ${coop}.`,
          '',
          `At ${m.families}, ${m.reward}.`,
          '',
          'This count includes families still in their free trial, so check in Stripe that they stayed before you give the reward:',
          `https://dashboard.stripe.com/promotion_codes/${p.id}`,
          '',
          `${COOP_OFFER.maxFamiliesPerCode} families max per code.`,
        ].join('\n'),
      });
      await db.insert(sentEmails).values({ email: OWNER, kind });
    }
  }

  return { codes: codes.data.length, reached, sent: !dryRun };
}
