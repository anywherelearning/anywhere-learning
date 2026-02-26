import { Resend } from 'resend';
import PurchaseConfirmation from '@/emails/PurchaseConfirmation';

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
