/**
 * Resend dispatcher — one function per outbound transactional email.
 *
 * Active emails:
 *   - sendMembershipWelcomeEmail              → after successful membership signup
 *   - sendStarterPackWelcomeEmail             → after successful Starter Pack purchase
 *   - sendAbandonedCheckoutMembershipEmail    → membership checkout expired w/o payment
 *   - sendAbandonedCheckoutStarterPackEmail   → starter pack checkout expired w/o payment
 *   - sendMembershipRenewalEmail              → 14 days before subscription renewal
 *   - sendTrialEndingEmail                    → 3 days before a free trial converts
 */

import { Resend } from 'resend';
import MembershipWelcome from '@/emails/MembershipWelcome';
import StarterPackWelcome from '@/emails/StarterPackWelcome';
import AbandonedCheckoutMembership from '@/emails/AbandonedCheckoutMembership';
import AbandonedCheckoutStarterPack from '@/emails/AbandonedCheckoutStarterPack';
import MembershipRenewal from '@/emails/MembershipRenewal';
import TrialEndingReminder from '@/emails/TrialEndingReminder';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = 'Anywhere Learning <hello@anywherelearning.co>';
const REPLY_TO = 'info@anywherelearning.co';

/** Welcome email for new members (paid subscription or free trial). */
export async function sendMembershipWelcomeEmail({
  to,
  firstName,
  signInUrl,
  isFounderPhase,
  isTrial,
  trialEndsAt,
}: {
  to: string;
  firstName?: string;
  signInUrl: string;
  isFounderPhase: boolean;
  /** True for free-trial signups, swaps in trial framing ($0 today, ends date). */
  isTrial?: boolean;
  /** ISO date the trial converts. Only used when isTrial. */
  trialEndsAt?: string;
}) {
  const subject = isTrial
    ? `Your free trial is open${firstName ? `, ${firstName}` : ''}. Let's pick your first activity`
    : `You're in${firstName ? `, ${firstName}` : ''}. Let's open your library`;
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    react: MembershipWelcome({ firstName, signInUrl, isFounderPhase, isTrial, trialEndsAt }),
  });
}

/** Welcome email for Starter Pack buyers (one-time $44.99). */
export async function sendStarterPackWelcomeEmail({
  to,
  firstName,
  signInUrl,
}: {
  to: string;
  firstName?: string;
  signInUrl: string;
}) {
  const subject = `Your Starter Pack is ready${firstName ? `, ${firstName}` : ''}`;
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    react: StarterPackWelcome({ firstName, signInUrl }),
  });
}

/** Membership-flow checkout expired without payment. */
export async function sendAbandonedCheckoutMembershipEmail({
  to,
  firstName,
  isFounderPhase,
  resumeUrl,
  spotsLeft,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  resumeUrl: string;
  /** Live count of founder spots remaining (100 - active members). Optional. */
  spotsLeft?: number;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'I held your spot — your Anywhere Learning checkout',
    react: AbandonedCheckoutMembership({ firstName, isFounderPhase, resumeUrl, spotsLeft }),
  });
}

/** Starter Pack checkout expired without payment. */
export async function sendAbandonedCheckoutStarterPackEmail({
  to,
  firstName,
  resumeUrl,
}: {
  to: string;
  firstName?: string;
  resumeUrl: string;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'I held your spot — your Anywhere Learning Starter Pack',
    react: AbandonedCheckoutStarterPack({ firstName, resumeUrl }),
  });
}

/** Trial-ending heads-up, sent when Stripe fires trial_will_end (3 days out). */
export async function sendTrialEndingEmail({
  to,
  firstName,
  isFounderPhase,
  trialEndDate,
  manageUrl,
  libraryUrl,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  /** ISO date string for the trial end / first charge. */
  trialEndDate: string;
  manageUrl: string;
  libraryUrl: string;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your free trial ends in 3 days. Here\'s exactly what happens',
    react: TrialEndingReminder({ firstName, isFounderPhase, trialEndDate, manageUrl, libraryUrl }),
  });
}

/** Renewal heads-up — sent 14 days before the subscription's currentPeriodEnd. */
export async function sendMembershipRenewalEmail({
  to,
  firstName,
  isFounderPhase,
  renewalDate,
  manageUrl,
  cardBrand,
  cardLast4,
  cardExp,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  /** ISO date string (YYYY-MM-DD or full ISO timestamp). */
  renewalDate: string;
  manageUrl: string;
  /** Card brand on file (Visa / Mastercard / etc). Optional. */
  cardBrand?: string;
  /** Last 4 digits of the card on file. Optional. */
  cardLast4?: string;
  /** Card expiry "MM/YY". Optional. */
  cardExp?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your Anywhere Learning membership renews in 14 days',
    react: MembershipRenewal({
      firstName,
      isFounderPhase,
      renewalDate,
      manageUrl,
      cardBrand,
      cardLast4,
      cardExp,
    }),
  });
}
