'use client';

import { useEffect, useRef } from 'react';
import {
  ga4Purchase,
  metaPurchase,
  metaTrack,
  pinterestSetEnhancedMatch,
  pinterestTrack,
} from '@/lib/tracking';

interface Props {
  /** True when this signup started a 14-day free trial ($0 charged today). */
  isTrial: boolean;
  /** Annual membership price in USD (99 founder / 149 post-founder). */
  priceUSD: number;
  /** Order number shown on the receipt, used as the conversion's transaction id. */
  orderId: string;
  /** Buyer email from the Stripe session, for Pinterest enhanced match. */
  email?: string | null;
}

/**
 * Fires the membership conversion across all ad platforms once the checkout
 * success page mounts. This is the event ad campaigns optimize toward.
 *
 * - Trial signup  → Meta `StartTrial`, Pinterest `Signup`. Value is the
 *   predicted annual price (no money changed hands today, but this is the
 *   signal a trial/leads campaign optimizes for).
 * - Paid membership → Meta `Purchase`, Pinterest `Checkout`, GA4 `purchase`
 *   with the real annual value.
 *
 * A ref guard + sessionStorage dedupe prevents double-firing on refresh.
 *
 * Note: the trial→paid conversion 14 days later happens off-site (Stripe
 * webhook) and is NOT captured here — that needs server-side Conversions API.
 */
export default function MembershipConversionEvent({ isTrial, priceUSD, orderId, email }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Session-level dedupe across refreshes of the same success page.
    const key = `membership_conv_fired_${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage may be unavailable (private mode) — fall through.
    }

    // Enhanced match: pass buyer email so Pinterest can attribute this to its
    // own user data. Pinterest hashes it in-browser before sending.
    if (email) {
      pinterestSetEnhancedMatch(email);
    }

    const membershipItem = {
      product_id: 'annual-membership',
      product_name: 'Anywhere Learning Annual Membership',
      product_category: 'Membership',
      product_price: priceUSD,
      product_quantity: 1,
    };

    if (isTrial) {
      // Meta standard StartTrial event — value + predicted_ltv let a trial
      // campaign optimize toward likely-to-convert signups.
      metaTrack('StartTrial', {
        value: priceUSD,
        currency: 'USD',
        predicted_ltv: priceUSD,
      });
      pinterestTrack('Signup', {
        value: priceUSD,
        order_id: orderId,
        currency: 'USD',
        lead_type: 'trial',
      });
      return;
    }

    // Paid membership: real money, fire the full purchase across all platforms.
    metaPurchase({ value: priceUSD, currency: 'USD', orderId });
    pinterestTrack('Checkout', {
      value: priceUSD,
      order_id: orderId,
      order_quantity: 1,
      currency: 'USD',
      product_id: membershipItem.product_id,
      line_items: [membershipItem],
    });
    ga4Purchase({
      transactionId: orderId,
      value: priceUSD,
      currency: 'USD',
      items: [
        {
          item_id: membershipItem.product_id,
          item_name: membershipItem.product_name,
          item_category: membershipItem.product_category,
          price: priceUSD,
          quantity: 1,
        },
      ],
    });
  }, [isTrial, priceUSD, orderId, email]);

  return null;
}
