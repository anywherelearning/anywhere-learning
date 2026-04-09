import { Resend } from 'resend';
import PurchaseConfirmation from '@/emails/PurchaseConfirmation';
import MembershipWelcome from '@/emails/MembershipWelcome';
import ReferralReward from '@/emails/ReferralReward';
import CartAbandonment from '@/emails/CartAbandonment';
import type { AbandonedCartUpsell } from '@/lib/cart-abandonment';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPurchaseEmail({
  to,
  customerName,
  productName,
  downloadUrl,
  referralCode,
  productImageUrl,
  products,
  signInUrl,
}: {
  to: string;
  customerName?: string;
  productName: string;
  downloadUrl: string;
  referralCode?: string;
  productImageUrl?: string;
  products?: { name: string; imageUrl: string }[];
  signInUrl?: string;
}) {
  const resend = getResend();
  const count = products?.length || 1;
  const subject = count === 1
    ? `Your ${products?.[0]?.name || productName} is ready ✓`
    : `Your ${count} guides are ready ✓`;
  await resend.emails.send({
    from: 'Anywhere Learning <orders@anywherelearning.co>',
    to,
    subject,
    react: PurchaseConfirmation({ customerName, productName, downloadUrl, referralCode, productImageUrl, products, signInUrl }),
  });
}

export async function sendReferralRewardEmail({
  to,
  customerName,
  rewardCode,
}: {
  to: string;
  customerName?: string;
  rewardCode: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: 'Anywhere Learning <hello@anywherelearning.co>',
    to,
    subject: "Your friend just saved 15%, here's yours!",
    react: ReferralReward({ customerName, rewardCode }),
  });
}

export async function sendCartAbandonmentEmail({
  to,
  items,
  upsell,
}: {
  to: string;
  items: { name: string; imageUrl: string; priceCents: number }[];
  upsell: AbandonedCartUpsell | null;
}) {
  const resend = getResend();
  const shopUrl = `${process.env.NEXT_PUBLIC_URL}/shop?cart=open`;
  const count = items.length;
  const subject = count === 1
    ? `Your ${items[0].name} is still waiting for you`
    : `Your ${count} activity packs are still in your cart`;
  await resend.emails.send({
    from: 'Anywhere Learning <hello@anywherelearning.co>',
    to,
    subject,
    react: CartAbandonment({ items, upsell, shopUrl }),
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
