import { Resend } from 'resend';
import PurchaseConfirmation from '@/emails/PurchaseConfirmation';
import MembershipWelcome from '@/emails/MembershipWelcome';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPurchaseEmail({
  to,
  productName,
  downloadUrl,
}: {
  to: string;
  productName: string;
  downloadUrl: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: 'Anywhere Learning <orders@anywherelearning.co>',
    to,
    subject: `Your ${productName} is ready ✓`,
    react: PurchaseConfirmation({ productName, downloadUrl }),
  });
}

export async function sendMembershipWelcomeEmail({
  to,
  plan,
}: {
  to: string;
  plan: string;
}) {
  const resend = getResend();
  const libraryUrl = `${process.env.NEXT_PUBLIC_URL}/account/library`;
  await resend.emails.send({
    from: 'Anywhere Learning <hello@anywherelearning.co>',
    to,
    subject: 'Welcome to your Anywhere Learning membership!',
    react: MembershipWelcome({ plan, libraryUrl }),
  });
}
