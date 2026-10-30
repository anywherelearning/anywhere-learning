import { db } from '@/lib/db';
import { accessGrants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';

export interface GiftCardData {
  grantId: string;
  recipientName: string;
  giftFrom: string;
  giftMessage: string | null;
  startsAt: Date;
  scheduled: boolean;
  revoked: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Everything the printable gift card shows, looked up by grant id (an
 * unguessable uuid, the card's only "key"). The parent's first name lives in
 * the Stripe session metadata, not the grant row.
 */
export async function getGiftCard(grantId: string): Promise<GiftCardData | null> {
  if (!UUID_RE.test(grantId)) return null;
  const rows = await db.select().from(accessGrants).where(eq(accessGrants.id, grantId)).limit(1);
  const g = rows[0];
  if (!g || g.source !== 'gift') return null;
  return toCard(g);
}

/** Same, by the Stripe Checkout session that paid for it (thank-you page). */
export async function getGiftCardBySession(sessionId: string): Promise<GiftCardData | null> {
  const rows = await db.select().from(accessGrants).where(eq(accessGrants.stripeSessionId, sessionId)).limit(1);
  return rows[0] ? toCard(rows[0]) : null;
}

async function toCard(g: typeof accessGrants.$inferSelect): Promise<GiftCardData> {
  let recipientName = '';
  if (g.stripeSessionId) {
    try {
      const s = await stripe.checkout.sessions.retrieve(g.stripeSessionId);
      recipientName = s.metadata?.recipient_name || '';
    } catch {
      /* card still renders without the name */
    }
  }
  return {
    grantId: g.id,
    recipientName,
    giftFrom: g.giftFrom || 'someone who loves you',
    giftMessage: g.giftMessage,
    startsAt: g.startsAt,
    scheduled: !g.welcomeSentAt,
    revoked: !!g.revokedAt,
  };
}
