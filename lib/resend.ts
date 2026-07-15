/**
 * Resend dispatcher — one function per outbound transactional email.
 *
 * Active emails:
 *   - sendMembershipWelcomeEmail              → after successful membership signup
 *   - sendAbandonedCheckoutMembershipEmail    → membership checkout expired w/o payment
 *   - sendMembershipRenewalEmail              → 14 days before subscription renewal
 *   - sendTrialEndingEmail                    → 3 days before a free trial converts
 *   - sendTrialCanceledEmail                  → free trial canceled (never paid)
 *   - sendMembershipCancellationScheduledEmail → paid member set cancel_at_period_end
 */

import { Resend } from 'resend';
import MembershipWelcome from '@/emails/MembershipWelcome';
import AbandonedCheckoutMembership from '@/emails/AbandonedCheckoutMembership';
import MembershipRenewal from '@/emails/MembershipRenewal';
import TrialEndingReminder from '@/emails/TrialEndingReminder';
import MembershipConverted from '@/emails/MembershipConverted';
import TrialCanceled from '@/emails/TrialCanceled';
import MembershipCancellationScheduled from '@/emails/MembershipCancellationScheduled';

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
  plan,
}: {
  to: string;
  firstName?: string;
  signInUrl: string;
  isFounderPhase: boolean;
  /** True for free-trial signups, swaps in trial framing ($0 today, ends date). */
  isTrial?: boolean;
  /** ISO date the trial converts. Only used when isTrial. */
  trialEndsAt?: string;
  /** Billing plan — swaps price/interval wording. Defaults to 'annual'. */
  plan?: 'annual' | 'monthly';
}) {
  const subject = isTrial
    ? `Your free trial is open${firstName ? `, ${firstName}` : ''}. Let's pick your first activity`
    : `You're in${firstName ? `, ${firstName}` : ''}. Let's open your library`;
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    react: MembershipWelcome({ firstName, signInUrl, isFounderPhase, isTrial, trialEndsAt, plan }),
  });
}

/** Membership-flow checkout expired without payment. */
export async function sendAbandonedCheckoutMembershipEmail({
  to,
  firstName,
  isFounderPhase,
  resumeUrl,
  spotsLeft,
  plan,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  resumeUrl: string;
  /** Live count of founder spots remaining (100 - active members). Optional. */
  spotsLeft?: number;
  /** Billing plan of the abandoned checkout. Defaults to 'annual'. */
  plan?: 'annual' | 'monthly';
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'I held your spot at Anywhere Learning',
    react: AbandonedCheckoutMembership({ firstName, isFounderPhase, resumeUrl, spotsLeft, plan }),
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
  plan,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  /** ISO date string for the trial end / first charge. */
  trialEndDate: string;
  manageUrl: string;
  libraryUrl: string;
  /** Billing plan — swaps price/interval wording. Defaults to 'annual'. */
  plan?: 'annual' | 'monthly';
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your free trial ends in 3 days. Here\'s exactly what happens',
    react: TrialEndingReminder({ firstName, isFounderPhase, trialEndDate, manageUrl, libraryUrl, plan }),
  });
}

/** Conversion confirmation — sent when a free trial converts to a paid membership. */
export async function sendMembershipConvertedEmail({
  to,
  firstName,
  isFounderPhase,
  renewalDate,
  libraryUrl,
  manageUrl,
  plan,
}: {
  to: string;
  firstName?: string;
  isFounderPhase: boolean;
  /** ISO date the membership renews (current paid period end). */
  renewalDate: string;
  libraryUrl: string;
  manageUrl: string;
  /** Billing plan — swaps price/interval wording. Defaults to 'annual'. */
  plan?: 'annual' | 'monthly';
}) {
  const subject = `It's official${firstName ? `, ${firstName}` : ''}. You're a member`;
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    react: MembershipConverted({ firstName, isFounderPhase, renewalDate, libraryUrl, manageUrl, plan }),
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

/** Trial-canceled confirmation — the trial ended without payment, nothing charged. */
export async function sendTrialCanceledEmail({
  to,
  firstName,
  plan,
  surveyToken,
}: {
  to: string;
  firstName?: string;
  /** Billing plan the trial was on. */
  plan?: 'annual' | 'monthly';
  /** exit_surveys row id for the one-tap reason links. Omit to hide the survey. */
  surveyToken?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your trial is canceled, nothing will be charged',
    react: TrialCanceled({ firstName, plan, surveyToken }),
  });
}

/** Cancellation-scheduled confirmation — access runs to period end, then no billing. */
export async function sendMembershipCancellationScheduledEmail({
  to,
  firstName,
  accessUntil,
  plan,
  manageUrl,
  surveyToken,
}: {
  to: string;
  firstName?: string;
  /** ISO date access runs until (paid period end). */
  accessUntil: string;
  /** Billing plan — swaps "your year" / "your month" wording. */
  plan?: 'annual' | 'monthly';
  manageUrl: string;
  /** exit_surveys row id for the one-tap reason links. Omit to hide the survey. */
  surveyToken?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Cancellation confirmed, and thank you',
    react: MembershipCancellationScheduled({ firstName, accessUntil, plan, manageUrl, surveyToken }),
  });
}
