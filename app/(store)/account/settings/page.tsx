import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import AccountSettings from './AccountSettings';
import { MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';
import { STRIPE_PRICES } from '@/lib/stripe-prices';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Account Settings',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AccountSettingsPage() {
  // 1. Identity from Clerk
  let clerkUser: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    clerkUser = await currentUser();
  } catch {
    /* Clerk not configured */
  }
  const fallbackEmail = 'you@example.com';
  const fallbackName = 'Member';
  const name =
    clerkUser?.fullName?.trim() ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim() ||
    clerkUser?.username ||
    fallbackName;
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress || fallbackEmail;

  // 2. Look up our DB row to get subscription + creation date
  let joinedAt: Date | null = null;
  let nextRenewalAt: Date | null = null;
  let paymentBrand: string | null = null;
  let paymentLast4: string | null = null;
  let subStatus: string | null = null;
  let cancelAtPeriodEnd = false;
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let subPriceId: string | null = null;

  if (clerkUser?.id) {
    try {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);
      const user = userRows[0];
      if (user) {
        // "Member since" — prefer the FIRST subscription's start date.
        // Falls back to user.createdAt for users without a subscription row yet.
        stripeCustomerId = user.stripeCustomerId;
        const subRows = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id))
          .orderBy(desc(subscriptions.createdAt))
          .limit(1);
        if (subRows[0]) {
          nextRenewalAt = subRows[0].currentPeriodEnd;
          subStatus = subRows[0].status;
          cancelAtPeriodEnd = subRows[0].cancelAtPeriodEnd;
          stripeSubscriptionId = subRows[0].stripeSubscriptionId;
          subPriceId = subRows[0].stripePriceId;
        }
        // Walk subscriptions to find the EARLIEST one (real signup date)
        const earliestSub = await db
          .select({ createdAt: subscriptions.createdAt })
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id))
          .orderBy(subscriptions.createdAt)
          .limit(1);
        joinedAt = earliestSub[0]?.createdAt ?? user.createdAt;
        // Pull the payment method from the live subscription (not customer
        // default, which subscriptions often don't set).
        if (stripeSubscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
              expand: ['default_payment_method'],
            });
            type ExpandedCardSource = { card?: { brand?: string; last4?: string } };
            const dpm = sub.default_payment_method as ExpandedCardSource | string | null;
            const card = typeof dpm === 'object' && dpm ? dpm.card : null;
            if (card) {
              paymentBrand = card.brand
                ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
                : null;
              paymentLast4 = card.last4 ?? null;
            }
            // Fall back to most recent invoice's payment method if subscription
            // didn't have one explicitly set.
            if (!card && (sub as Stripe.Subscription & { latest_invoice?: string }).latest_invoice) {
              const inv = await stripe.invoices.retrieve(
                (sub as Stripe.Subscription & { latest_invoice: string }).latest_invoice,
                { expand: ['payment_intent.payment_method'] },
              );
              type InvoiceWithPI = { payment_intent?: { payment_method?: ExpandedCardSource } };
              const pm = (inv as InvoiceWithPI).payment_intent?.payment_method;
              if (pm?.card) {
                paymentBrand = pm.card.brand
                  ? pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1)
                  : null;
                paymentLast4 = pm.card.last4 ?? null;
              }
            }
          } catch (err) {
            console.warn('[settings] subscription payment method lookup failed:', err);
          }
        }
      }
    } catch {
      /* DB not configured */
    }
  }

  // Stripe Customer Portal — single hosted page where the user can update card,
  // change plan, or cancel. Generated on demand via a server action so the
  // session is fresh.
  const billingPortalAvailable = !!stripeCustomerId;

  const isTrialing = subStatus === 'trialing';
  const statusLabel: 'active' | 'trialing' | 'canceling' | 'canceled' | 'past_due' | 'unknown' =
    !subStatus ? 'unknown'
    : isTrialing ? 'trialing'
    : subStatus === 'active' && cancelAtPeriodEnd ? 'canceling'
    : subStatus === 'active' ? 'active'
    : subStatus === 'canceled' ? 'canceled'
    : subStatus === 'past_due' ? 'past_due'
    : 'unknown';

  // Show the subscription tab only when the user actually has subscription
  // history (a subscription row exists).
  const hasSubscription = subStatus !== null;
  // "Founding member" only for users who actually paid the founder price.
  // Post-cap members keep paying $99 (locked-in) but new joiners after cap
  // get the standard rate AND the "Member" label. Trial members haven't paid
  // yet, so their plan shows as "Free trial".
  const isFounderSubscriber = subPriceId === STRIPE_PRICES.MEMBERSHIP_FOUNDER;
  const tierLabel = isTrialing ? 'Free trial' : isFounderSubscriber ? 'Founding member' : 'Member';

  const member = {
    name,
    email,
    tier: tierLabel,
    joinedAt: joinedAt ? formatDate(joinedAt) : '—',
    nextRenewalAt: nextRenewalAt ? formatDate(nextRenewalAt) : '—',
    priceLabel: MEMBERSHIP_PRICE_YEAR,
    paymentLast4: paymentLast4 || '—',
    paymentBrand: paymentBrand || '—',
    status: statusLabel,
    billingPortalAvailable,
    hasSubscription,
    isTrialing,
    // ISO trial end (== currentPeriodEnd while trialing) for the upgrade card.
    trialEndsAt: isTrialing && nextRenewalAt ? nextRenewalAt.toISOString() : null,
    isFounder: isFounderSubscriber,
    // True when a trial is set to expire at day 14 instead of converting.
    cancelAtPeriodEnd,
  };

  return <AccountSettings member={member} />;
}
