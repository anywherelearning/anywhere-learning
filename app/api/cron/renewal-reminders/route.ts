/**
 * Daily cron — sends a renewal heads-up email to every member whose
 * subscription renews ~14 days from now.
 *
 * How it works:
 *   1. Vercel Cron hits GET /api/cron/renewal-reminders once a day at
 *      14:00 UTC (configured in vercel.json).
 *   2. We auth the request with the CRON_SECRET env var so randos can't
 *      trigger transactional emails by hitting the URL.
 *   3. Query subscriptions where:
 *        - status = 'active'
 *        - cancelAtPeriodEnd = false (skip people who already chose to cancel)
 *        - currentPeriodEnd between now+14d and now+15d (24-hour window
 *          ensures each subscription is hit exactly once per renewal cycle)
 *   4. For each match, generate a Stripe billing-portal session and send
 *      MembershipRenewal via Resend.
 *
 * Idempotency note: the 24-hour `currentPeriodEnd` window means each sub
 * is matched in exactly one daily run. If you ever want a stronger
 * guarantee (e.g. cron runs twice on the same day after a deployment),
 * add a `renewalReminderSentAt` column to the subscriptions table and
 * filter on `renewalReminderSentAt IS NULL OR renewalReminderSentAt < currentPeriodEnd - 13 days`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subscriptions, users } from '@/lib/db/schema';
import { stripe } from '@/lib/stripe';
import { sendMembershipRenewalEmail } from '@/lib/resend';
import { STRIPE_PRICES } from '@/lib/stripe-prices';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sets Authorization: Bearer ${CRON_SECRET}.
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  // Pull every subscription renewing in the 14-15-day window.
  const rows = await db
    .select({
      subId: subscriptions.id,
      userId: subscriptions.userId,
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripePriceId: subscriptions.stripePriceId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      clerkId: users.clerkId,
      email: users.email,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.status, 'active'),
        eq(subscriptions.cancelAtPeriodEnd, false),
        gte(subscriptions.currentPeriodEnd, windowStart),
        lt(subscriptions.currentPeriodEnd, windowEnd),
      ),
    );

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No renewals in the 14-day window.' });
  }

  // Try to grab first names from Clerk in one round-trip. Clerk doesn't
  // mind missing users — we just fall back to an empty firstName.
  let firstNameByClerkId: Record<string, string | undefined> = {};
  try {
    const { createClerkClient } = await import('@clerk/backend');
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const clerkIds = rows.map((r) => r.clerkId);
    const list = await clerk.users.getUserList({ userId: clerkIds, limit: rows.length });
    firstNameByClerkId = Object.fromEntries(
      list.data.map((u) => [u.id, u.firstName?.trim() || undefined]),
    );
  } catch (err) {
    console.error('[cron] clerk firstName lookup failed (continuing without names):', err);
  }

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const row of rows) {
    try {
      // Create a one-off billing-portal session so the "Manage my
      // membership" CTA in the email drops them straight into Stripe.
      const portal = await stripe.billingPortal.sessions.create({
        customer: row.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co'}/account/settings`,
      });

      const isFounderPhase = row.stripePriceId === STRIPE_PRICES.MEMBERSHIP_FOUNDER;

      // Fetch the customer's default card so the renewal email can show
      // "VISA •••• 4242 · expires 09/28". Best-effort — if Stripe can't
      // give us a card (unlikely for an active sub) we send the email
      // without that row and the template just skips it.
      let cardBrand: string | undefined;
      let cardLast4: string | undefined;
      let cardExp: string | undefined;
      try {
        const customer = await stripe.customers.retrieve(row.stripeCustomerId);
        if (customer && !customer.deleted) {
          const defaultPmId =
            (customer.invoice_settings?.default_payment_method as string | null | undefined) ||
            undefined;
          if (defaultPmId) {
            const pm = await stripe.paymentMethods.retrieve(defaultPmId);
            if (pm.card) {
              cardBrand = pm.card.brand;
              cardLast4 = pm.card.last4;
              const m = String(pm.card.exp_month).padStart(2, '0');
              const y = String(pm.card.exp_year).slice(-2);
              cardExp = `${m}/${y}`;
            }
          }
        }
      } catch (cardErr) {
        console.warn(`[cron] could not fetch card for ${row.email}:`, cardErr);
      }

      await sendMembershipRenewalEmail({
        to: row.email,
        firstName: firstNameByClerkId[row.clerkId],
        isFounderPhase,
        renewalDate: row.currentPeriodEnd.toISOString(),
        manageUrl: portal.url,
        cardBrand,
        cardLast4,
        cardExp,
      });
      results.push({ email: row.email, ok: true });
    } catch (err) {
      console.error(`[cron] renewal reminder failed for ${row.email}:`, err);
      results.push({
        email: row.email,
        ok: false,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  console.log(`[cron] renewal reminders: ${sent}/${rows.length} sent`);

  return NextResponse.json({
    matched: rows.length,
    sent,
    failed: rows.length - sent,
    results,
  });
}
