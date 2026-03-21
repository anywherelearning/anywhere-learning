import { db } from '@/lib/db';
import { referrals, referralConversions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { sendReferralRewardEmail } from '@/lib/resend';

const REFERRAL_DISCOUNT_PERCENT = 15;
const REFERRAL_COUPON_NAME = 'Referral Discount — 15% Off';

// ─── Code Generation ────────────────────────────────────────────────

const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1

function randomSuffix(length = 2): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return result;
}

/**
 * Generate a human-friendly referral code from an email address.
 * Format: REF-{NAME}-{2CHAR} e.g. REF-AMELIE-7X
 */
export function generateReferralCode(email: string): string {
  const prefix = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
  return `REF-${prefix || 'FRIEND'}-${randomSuffix()}`;
}

// ─── Stripe Coupon Management ───────────────────────────────────────

let _couponId: string | null = null;

/**
 * Ensure the shared 15%-off referral coupon exists in Stripe.
 * Uses STRIPE_REFERRAL_COUPON_ID env var if set, otherwise creates one.
 */
async function ensureReferralCoupon(): Promise<string> {
  if (_couponId) return _couponId;

  // Check env var first
  if (process.env.STRIPE_REFERRAL_COUPON_ID) {
    _couponId = process.env.STRIPE_REFERRAL_COUPON_ID;
    return _couponId;
  }

  // Create the coupon lazily
  const coupon = await stripe.coupons.create({
    percent_off: REFERRAL_DISCOUNT_PERCENT,
    duration: 'once',
    name: REFERRAL_COUPON_NAME,
  });

  _couponId = coupon.id;
  console.log(`Created referral coupon: ${coupon.id} — set STRIPE_REFERRAL_COUPON_ID in env to skip creation next time`);
  return _couponId;
}

// ─── Core Referral Logic ────────────────────────────────────────────

/**
 * Get or create a referral code for a user. Idempotent — returns existing
 * referral if one already exists for this user.
 */
export async function getOrCreateReferral(userId: string, email: string) {
  // Check for existing referral
  const existing = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerUserId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // Generate unique code with retry
  const couponId = await ensureReferralCoupon();
  let code = '';
  let stripePromoId = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    code = generateReferralCode(email);
    try {
      const promo = await stripe.promotionCodes.create({
        coupon: couponId,
        code,
        metadata: { referrer_email: email, referrer_user_id: userId },
      });
      stripePromoId = promo.id;
      break;
    } catch (error: unknown) {
      // Code already exists in Stripe — retry with new suffix
      const stripeError = error as { code?: string };
      if (stripeError.code === 'resource_already_exists' && attempt < 2) continue;
      throw error;
    }
  }

  const [referral] = await db
    .insert(referrals)
    .values({
      referrerUserId: userId,
      referrerEmail: email,
      code,
      stripePromoId,
    })
    .returning();

  return referral;
}

/**
 * Process a referral conversion when a checkout session used a referral promo code.
 * - Records the conversion
 * - Increments the referrer's count
 * - Generates a one-time reward code for the referrer
 * - Sends the reward email
 */
export async function processReferralConversion(
  referralCode: string,
  referredEmail: string,
  stripeSessionId: string,
) {
  // Look up the referral
  const [referral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.code, referralCode))
    .limit(1);

  if (!referral) {
    console.error('Referral not found for code:', referralCode);
    return;
  }

  // Record the conversion
  await db.insert(referralConversions).values({
    referralId: referral.id,
    referredEmail,
    stripeSessionId,
  });

  // Increment referral count
  const newCount = referral.referralCount + 1;
  await db
    .update(referrals)
    .set({ referralCount: newCount })
    .where(eq(referrals.id, referral.id));

  // Generate a one-time reward code for the referrer (if they don't already have one)
  if (!referral.rewardStripePromoCode) {
    try {
      const couponId = await ensureReferralCoupon();
      const rewardCode = `REWARD-${referral.code.replace('REF-', '')}`;

      const rewardPromo = await stripe.promotionCodes.create({
        coupon: couponId,
        code: rewardCode,
        max_redemptions: 1,
        metadata: {
          type: 'referral_reward',
          referrer_email: referral.referrerEmail,
        },
      });

      await db
        .update(referrals)
        .set({ rewardStripePromoCode: rewardPromo.code })
        .where(eq(referrals.id, referral.id));

      // Send reward email to the referrer
      try {
        await sendReferralRewardEmail({
          to: referral.referrerEmail,
          rewardCode: rewardPromo.code!,
        });
      } catch (emailError) {
        console.error('Failed to send referral reward email:', emailError);
      }
    } catch (error) {
      console.error('Failed to create referral reward promo code:', error);
    }
  }
}

/**
 * Extract a referral promo code from a Stripe checkout session.
 * Returns the code string if a referral promo was used, null otherwise.
 */
export async function extractReferralFromSession(
  sessionId: string,
): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['total_details.breakdown'],
    });

    const discounts = session.total_details?.breakdown?.discounts;
    if (!discounts || discounts.length === 0) return null;

    for (const d of discounts) {
      const promoCodeId = d.discount.promotion_code;
      if (!promoCodeId || typeof promoCodeId !== 'string') continue;

      // Retrieve the promotion code to get the actual code string
      const promo = await stripe.promotionCodes.retrieve(promoCodeId);
      if (promo.code?.startsWith('REF-')) {
        return promo.code;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to extract referral from session:', error);
    return null;
  }
}

/**
 * Look up a referral by the referrer's email address.
 */
export async function getReferralByEmail(email: string) {
  const result = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerEmail, email))
    .limit(1);
  return result[0] || null;
}
