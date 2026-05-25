/**
 * Stripe webhook for the post-pivot product line:
 *
 *   • Membership ($99/yr founder or $149/yr standard, recurring subscription)
 *   • Starter Pack ($44.99 one-time)
 *
 * Events handled:
 *   - checkout.session.completed         → provision user + send welcome email
 *   - customer.subscription.created      → upsert subscriptions row
 *   - customer.subscription.updated      → update subscriptions row
 *   - customer.subscription.deleted      → mark subscriptions row canceled
 *   - invoice.paid                       → extend currentPeriodEnd on renewal
 *   - invoice.payment_failed             → log + future: email "update card"
 *
 * Every other event is logged + acknowledged so Stripe stops retrying.
 *
 * On checkout.session.completed we:
 *   1. Look up or create a Clerk user by the buyer's email (via @clerk/backend)
 *   2. Upsert a `users` row linking clerkId + stripeCustomerId + email
 *   3. For Starter Pack: stamp `users.starterPackPurchasedAt`
 *      For Membership: a customer.subscription.created event will follow within
 *      seconds and upsert the subscriptions row
 *   4. Generate a Clerk sign-in token (magic link) and send the welcome email
 *      via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/backend';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { subscribeAndTag, applyAndRemoveTags } from '@/lib/convertkit';
import {
  sendMembershipWelcomeEmail,
  sendStarterPackWelcomeEmail,
  sendAbandonedCheckoutMembershipEmail,
  sendAbandonedCheckoutStarterPackEmail,
} from '@/lib/resend';
import type Stripe from 'stripe';

/** Pull a Clerk backend client. Returns null if Clerk isn't configured. */
function getClerk() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  return createClerkClient({ secretKey });
}

/** Find a Clerk user by email, or create one if none exists. */
async function findOrCreateClerkUser(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<{ id: string; created: boolean } | null> {
  const clerk = getClerk();
  if (!clerk) {
    console.warn('[webhook] Clerk not configured, skipping user provisioning');
    return null;
  }
  try {
    const existing = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
    if (existing.data.length > 0) {
      const u = existing.data[0];
      // Backfill firstName/lastName if Clerk has them empty but Stripe gave us
      // a name. People who signed up via magic-link first won't have a name.
      const needsFirst = !u.firstName && firstName;
      const needsLast = !u.lastName && lastName;
      if (needsFirst || needsLast) {
        try {
          await clerk.users.updateUser(u.id, {
            ...(needsFirst ? { firstName } : {}),
            ...(needsLast ? { lastName } : {}),
          });
        } catch (err) {
          console.warn('[webhook] backfill name update failed:', err);
        }
      }
      return { id: u.id, created: false };
    }
    const created = await clerk.users.createUser({
      emailAddress: [email],
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    return { id: created.id, created: true };
  } catch (err) {
    console.error('[webhook] findOrCreateClerkUser failed:', err);
    return null;
  }
}

/** Generate a one-tap sign-in URL for a Clerk user (magic link). */
async function generateSignInUrl(clerkId: string): Promise<string> {
  const clerk = getClerk();
  const fallback = `${process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co'}/sign-in`;
  if (!clerk) return fallback;
  try {
    const token = await clerk.signInTokens.createSignInToken({
      userId: clerkId,
      expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    });
    const base = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    // Clerk's accept URL signs the user in and redirects them.
    return `${base}/sign-in?__clerk_ticket=${token.token}&redirect_url=${encodeURIComponent('/account')}`;
  } catch (err) {
    console.error('[webhook] generateSignInUrl failed:', err);
    return fallback;
  }
}

/** Upsert a `users` row keyed by Clerk ID. */
async function upsertUser(opts: {
  clerkId: string;
  email: string;
  stripeCustomerId?: string;
  starterPackPurchasedAt?: Date;
  /** Set when a membership checkout completes with the Starter Pack credit applied.
   *  Only set once per user; subsequent passes leave the existing value alone. */
  starterPackCreditAppliedAt?: Date;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, opts.clerkId))
    .limit(1);

  if (existing[0]) {
    // Only write starterPackCreditAppliedAt if not already set — guards against
    // a replayed webhook accidentally moving the timestamp forward.
    const shouldSetCredit =
      opts.starterPackCreditAppliedAt && !existing[0].starterPackCreditAppliedAt;
    await db
      .update(users)
      .set({
        email: opts.email.toLowerCase(),
        ...(opts.stripeCustomerId && { stripeCustomerId: opts.stripeCustomerId }),
        ...(opts.starterPackPurchasedAt && { starterPackPurchasedAt: opts.starterPackPurchasedAt }),
        ...(shouldSetCredit && { starterPackCreditAppliedAt: opts.starterPackCreditAppliedAt }),
      })
      .where(eq(users.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({
      clerkId: opts.clerkId,
      email: opts.email.toLowerCase(),
      stripeCustomerId: opts.stripeCustomerId,
      starterPackPurchasedAt: opts.starterPackPurchasedAt,
      starterPackCreditAppliedAt: opts.starterPackCreditAppliedAt,
    })
    .returning({ id: users.id });
  return inserted[0].id;
}

/** Handle a successful Checkout session (membership or starter-pack). */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid' && session.mode !== 'subscription') {
    console.log('[webhook] session not paid, ignoring:', session.id);
    return;
  }

  const email = session.customer_details?.email?.toLowerCase() || session.customer_email?.toLowerCase();
  if (!email) {
    console.error('[webhook] no email on session:', session.id);
    return;
  }

  const fullName = session.customer_details?.name?.trim() || '';
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.slice(1).join(' ') || undefined;
  const kind = session.metadata?.kind || (session.mode === 'subscription' ? 'membership' : 'starter_pack');
  const tier: 'member' | 'starter' = kind === 'membership' ? 'member' : 'starter';
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  // 1. Find or create Clerk user — also backfills firstName/lastName from
  //    Stripe checkout name if the existing Clerk profile was created earlier
  //    without one (e.g. via magic-link sign-up that didn't collect a name).
  const clerkUser = await findOrCreateClerkUser(email, firstName, lastName);
  if (!clerkUser) {
    console.error('[webhook] could not provision Clerk user for', email);
    return;
  }

  // The Starter Pack credit was attached at checkout when the buyer was eligible.
  // We trust the metadata flag here rather than re-deriving — the eligibility
  // check at checkout-time is the authoritative gate. Recording it on success
  // prevents the same user from redeeming it again on a future re-subscribe.
  const starterPackCreditApplied =
    tier === 'member' && session.metadata?.starter_pack_credit_applied === 'true';

  // 2. Upsert into our DB
  await upsertUser({
    clerkId: clerkUser.id,
    email,
    stripeCustomerId,
    ...(tier === 'starter' && { starterPackPurchasedAt: new Date() }),
    ...(starterPackCreditApplied && { starterPackCreditAppliedAt: new Date() }),
  });

  // 2b. If this was a subscription checkout, pull the subscription that Stripe
  // just created and upsert it. Stripe fires customer.subscription.created
  // BEFORE checkout.session.completed, so the subscription event arrived when
  // no user row existed yet and would have been ignored. Now we have a user
  // row, so we can reliably attach the subscription here.
  let isFounder = false;
  if (tier === 'member' && session.subscription) {
    try {
      const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subId);
      await upsertSubscriptionFromStripe(sub);
      // Founder status is determined by the Stripe Price ID the user actually
      // paid — not the IS_FOUNDER_PHASE flag at lookup time. This way founders
      // stay tagged as founders even after the cap flips.
      const priceId = sub.items.data[0]?.price.id;
      const { STRIPE_PRICES } = await import('@/lib/stripe-prices');
      isFounder = priceId === STRIPE_PRICES.MEMBERSHIP_FOUNDER;
    } catch (err) {
      console.error('[webhook] failed to attach subscription:', err);
    }
  }

  // 2c. Stash tier + founder flag in Clerk publicMetadata so the SiteHeader
  //     badge can read it client-side without an extra DB query on every page.
  try {
    const clerk = getClerk();
    if (clerk) {
      await clerk.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { tier, founder: isFounder },
      });
    }
  } catch (err) {
    console.warn('[webhook] could not write tier metadata:', err);
  }

  // 3. Welcome email — only on first creation, so existing buyers aren't spammed.
  //    Membership and Starter Pack buyers get different copy (renewal mention vs
  //    one-time + upgrade pointer), handled by two separate templates.
  if (clerkUser.created) {
    try {
      const signInUrl = await generateSignInUrl(clerkUser.id);
      if (tier === 'member') {
        await sendMembershipWelcomeEmail({
          to: email,
          firstName,
          signInUrl,
          // Use the per-buyer founder flag derived from their actual
          // Stripe Price ID (line ~205), NOT the global IS_FOUNDER_PHASE.
          // Guarantees the email reflects the rate they actually paid,
          // even if the cap flipped between checkout and email send.
          isFounderPhase: isFounder,
        });
      } else {
        await sendStarterPackWelcomeEmail({
          to: email,
          firstName,
          signInUrl,
        });
      }
    } catch (err) {
      console.error('[webhook] welcome email failed:', err);
    }
  }

  // 4. Kit tags — segment buyers so we can run member-only broadcasts,
  //    upgrade campaigns for starter buyers, founder-only perks, etc.
  //    Applied for every successful purchase (not gated on clerkUser.created
  //    because the tag should land even when an existing Clerk user buys).
  try {
    if (tier === 'member') {
      const tags = ['member', ...(isFounder ? ['founder'] : [])];
      // Removing any prior 'lapsed-member' or 'refunded' tag handles the
      // "former member who returns" case cleanly.
      await applyAndRemoveTags(email, {
        add: tags,
        remove: ['lapsed-member', 'refunded', 'member-canceled'],
      });
    } else {
      await applyAndRemoveTags(email, {
        add: ['starter-pack-buyer'],
        remove: ['refunded'],
      });
    }
  } catch (err) {
    console.error('[webhook] kit tag failed:', err);
  }

  console.log(`[webhook] provisioned ${tier} for ${email} (clerk: ${clerkUser.id})`);
}

/**
 * Handle a Stripe Checkout session that expired without payment. Sends a
 * friendly "you started signing up but didn't finish" email IF we have
 * the visitor's email (Stripe Checkout collects it before card entry).
 *
 * Important guard: skip sending if the session belongs to someone who is
 * already a member or starter — that would be confusing ("you already
 * bought this"). Stripe sets `customer_details.email` once the form is
 * submitted, even on expiry, so we use that as the lookup key.
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const email = (
    session.customer_details?.email ||
    session.customer_email ||
    ''
  ).toLowerCase();
  if (!email) {
    console.log('[webhook] checkout expired without email — skipping');
    return;
  }

  // Determine which flow they bailed on: subscription mode → membership,
  // payment mode → starter pack. Same logic as the success path.
  const kind: 'membership' | 'starter_pack' =
    session.metadata?.kind === 'starter_pack' || session.mode === 'payment'
      ? 'starter_pack'
      : 'membership';

  // Skip if we already provisioned this email (don't bug existing buyers).
  try {
    const rows = await db
      .select({ id: users.id, starterAt: users.starterPackPurchasedAt })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const existing = rows[0];
    if (existing) {
      // For membership flow: check if they have an active subscription
      if (kind === 'membership') {
        const subs = await db
          .select({ status: subscriptions.status })
          .from(subscriptions)
          .where(eq(subscriptions.userId, existing.id))
          .limit(1);
        if (subs.some((s) => s.status === 'active')) {
          console.log(`[webhook] checkout expired for ${email} — already a member, skipping`);
          return;
        }
      }
      // For starter flow: skip if they already have the pack
      if (kind === 'starter_pack' && existing.starterAt) {
        console.log(`[webhook] checkout expired for ${email} — already a starter, skipping`);
        return;
      }
    }
  } catch (err) {
    console.error('[webhook] expired-checkout DB lookup failed:', err);
    // Continue anyway — better to send a possibly-redundant email than miss it.
  }

  // Pull the recovery URL Stripe generates when `after_expiration.recovery`
  // is enabled on the session. Falls back to the landing page.
  const recoveryUrl =
    (session.after_expiration?.recovery as { url?: string } | undefined)?.url ||
    `${process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co'}/${kind === 'membership' ? 'join' : 'shop/starter-pack'}`;

  const firstName = session.customer_details?.name?.trim().split(/\s+/)[0] || undefined;

  try {
    if (kind === 'membership') {
      // For abandoned checkouts we don't have a price ID yet (no completed
      // purchase). Use the runtime helper — it tells the user whether the
      // founder rate is STILL available when they come back to finish.
      // Also compute the live spots-left count so the email's founder
      // banner can show a real "X spots left" stamp instead of fake urgency.
      const { isFounderPhaseOpen, getActiveMemberCount, FOUNDER_CAP } = await import('@/lib/membership');
      const [founderStillOpen, activeCount] = await Promise.all([
        isFounderPhaseOpen(),
        getActiveMemberCount(),
      ]);
      const spotsLeft = founderStillOpen
        ? Math.max(0, FOUNDER_CAP - activeCount)
        : undefined;
      await sendAbandonedCheckoutMembershipEmail({
        to: email,
        firstName,
        isFounderPhase: founderStillOpen,
        resumeUrl: recoveryUrl,
        spotsLeft,
      });
    } else {
      await sendAbandonedCheckoutStarterPackEmail({
        to: email,
        firstName,
        resumeUrl: recoveryUrl,
      });
    }
    console.log(`[webhook] sent abandoned-checkout email to ${email} (${kind})`);
  } catch (err) {
    console.error('[webhook] abandoned-checkout email failed:', err);
  }
}

/**
 * Handle a refunded Stripe charge. Revokes access for the buyer so a refund
 * actually means they lose what they bought (Stripe doesn't do this on its own
 * — refund and cancel are separate operations there by design).
 *
 *   - Subscription invoice refund → cancel the subscription immediately
 *     in Stripe (which fires `customer.subscription.deleted` → our DB row
 *     gets marked canceled → the access tier lookup drops the user to guest)
 *   - One-time Starter Pack refund → clear `users.starterPackPurchasedAt`
 *     directly so the download endpoint stops serving PDFs to this user
 *
 * Skips partial refunds (`charge.refunded === false`, only `amount_refunded`
 * partial) — those are usually goodwill gestures, not "give it all back."
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  // Only act on FULLY refunded charges.
  if (!charge.refunded || charge.amount_refunded < charge.amount) {
    console.log(
      `[webhook] partial refund on ${charge.id} (${charge.amount_refunded}/${charge.amount}) — skipping access revocation`,
    );
    return;
  }

  // Case 1: charge is tied to an invoice → it's a subscription payment.
  // Cancel the subscription now. The cancellation triggers
  // customer.subscription.deleted, which our other handler picks up to
  // update our DB row.
  if (charge.invoice) {
    try {
      const invoiceId = typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.id;
      const invoice = await stripe.invoices.retrieve(invoiceId);
      const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription })
        .subscription;
      if (subscriptionId) {
        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id;
        const sub = await stripe.subscriptions.cancel(subId, {
          invoice_now: false,
          prorate: false,
        });
        console.log(`[webhook] cancelled subscription ${subId} after refund (status=${sub.status})`);
        await upsertSubscriptionFromStripe(sub);
        // Stripe's `cancel` leaves `current_period_end` at the original
        // future date — fine for "cancel at period end" semantics, but for
        // a REFUND we want access to drop immediately. Override the DB
        // row to set periodEnd = now so the access tier check fails right
        // away (it grants access when canceled AND periodEnd > now).
        await db
          .update(subscriptions)
          .set({ currentPeriodEnd: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, subId));

        // Kit: mark this buyer as refunded, drop their member/founder tags
        // so they fall out of any active-member broadcasts.
        const refundEmail = (charge.billing_details?.email || '').toLowerCase();
        if (refundEmail) {
          try {
            await applyAndRemoveTags(refundEmail, {
              add: ['refunded'],
              remove: ['member', 'founder', 'member-canceled'],
            });
          } catch (err) {
            console.warn('[webhook] kit refund tagging failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('[webhook] failed to cancel subscription after refund:', err);
    }
    return;
  }

  // Case 2: charge has a payment_intent without an invoice → one-time payment.
  // Look up the PI's metadata to confirm it was a starter-pack purchase,
  // then clear `starterPackPurchasedAt` for the buyer's user row.
  if (charge.payment_intent) {
    try {
      const piId =
        typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent.id;
      const pi = await stripe.paymentIntents.retrieve(piId);
      const isStarterPack = pi.metadata?.kind === 'starter_pack' || pi.metadata?.tier === 'starter';
      if (!isStarterPack) {
        console.log(`[webhook] refund on non-starter PI ${piId} — nothing to revoke`);
        return;
      }
      const email = (charge.billing_details?.email || pi.receipt_email || '').toLowerCase();
      if (!email) {
        console.warn('[webhook] starter pack refund without email — cannot revoke access:', charge.id);
        return;
      }
      const result = await db
        .update(users)
        .set({ starterPackPurchasedAt: null })
        .where(eq(users.email, email))
        .returning({ id: users.id, clerkId: users.clerkId });
      console.log(
        `[webhook] cleared starter access for ${email} after refund (${result.length} row${result.length === 1 ? '' : 's'} updated)`,
      );

      // Also update Clerk publicMetadata → 'guest' so the SiteHeader badge
      // updates without requiring a sign-out / sign-in.
      const clerkId = result[0]?.clerkId;
      if (clerkId) {
        try {
          const clerk = getClerk();
          if (clerk) {
            await clerk.users.updateUserMetadata(clerkId, {
              publicMetadata: { tier: 'guest', founder: false },
            });
          }
        } catch (err) {
          console.warn('[webhook] could not write canceled metadata:', err);
        }
      }

      // Kit: mark refunded, drop the starter-pack-buyer tag.
      try {
        await applyAndRemoveTags(email, {
          add: ['refunded'],
          remove: ['starter-pack-buyer'],
        });
      } catch (err) {
        console.warn('[webhook] kit refund tagging failed:', err);
      }
    } catch (err) {
      console.error('[webhook] failed to revoke starter access after refund:', err);
    }
  }
}

/** Upsert a subscriptions row from a Stripe Subscription object. */
async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id || '';
  const periodEnd = new Date((sub as Stripe.Subscription & { current_period_end?: number }).current_period_end
    ? (sub as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000
    : Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Find user by stripeCustomerId
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  const user = userRows[0];
  if (!user) {
    console.warn('[webhook] subscription for unknown customer:', customerId);
    return;
  }

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (existing[0]) {
    await db
      .update(subscriptions)
      .set({
        status: sub.status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing[0].id));
  } else {
    await db.insert(subscriptions).values({
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    });
  }
  console.log(`[webhook] subscription ${sub.id} → ${sub.status} for ${user.email}`);

  // Keep Clerk publicMetadata in sync with the DB so the SiteHeader badge
  // updates immediately when a subscription ends. Without this, a canceled
  // user keeps showing "Member" in the nav until they sign out + back in.
  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    try {
      const clerk = getClerk();
      if (clerk && user.clerkId) {
        await clerk.users.updateUserMetadata(user.clerkId, {
          publicMetadata: { tier: 'guest', founder: false },
        });
        console.log(`[webhook] Clerk metadata → guest for ${user.email}`);
      }
    } catch (err) {
      console.warn('[webhook] could not write canceled metadata:', err);
    }

    // Kit lifecycle: if the period has ALREADY ended (natural expiry) →
    // lapsed-member. If the period is still in the future (user clicked
    // Cancel but hasn't reached their renewal date) → member-canceled.
    // The refund path handles its own Kit tagging above; this only runs
    // for non-refund cancellations.
    try {
      const expired = periodEnd <= new Date();
      if (expired) {
        await applyAndRemoveTags(user.email, {
          add: ['lapsed-member'],
          remove: ['member', 'founder', 'member-canceled'],
        });
      } else {
        await subscribeAndTag(user.email, ['member-canceled']);
      }
    } catch (err) {
      console.warn('[webhook] kit cancel tagging failed:', err);
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice & { subscription?: string };
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof inv.subscription === 'string' ? inv.subscription : inv.subscription,
          );
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice & { subscription?: string };
        console.warn('[webhook] payment failed for subscription:', inv.subscription);
        // TODO: trigger "please update your card" email
        break;
      }
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        // Silently acknowledge unhandled events so Stripe stops retrying.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] handler failed:', err);
    // Return 200 so Stripe doesn't keep retrying handler bugs forever.
    return NextResponse.json({ received: true, error: 'handler error' });
  }
}
