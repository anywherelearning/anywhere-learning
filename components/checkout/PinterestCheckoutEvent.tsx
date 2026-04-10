'use client';

import { useEffect, useRef } from 'react';
import { ga4Purchase, pinterestSetEnhancedMatch, pinterestTrack } from '@/lib/tracking';

interface PinterestLineItem {
  product_id: string;
  product_name: string;
  product_category?: string;
  product_price?: number;
  product_quantity?: number;
}

interface Props {
  orderId: string;
  value: number;
  currency?: string;
  lineItems: PinterestLineItem[];
  buyerEmail?: string | null;
}

/**
 * Fires Pinterest `Checkout` conversion event once on mount.
 *
 * Also passes the buyer's email (from the Stripe session) into pintrk's
 * automatic enhanced match, dramatically improving attribution quality —
 * Pinterest hashes the email in-browser before sending it.
 *
 * Uses a ref guard + sessionStorage to avoid double-firing if the user
 * refreshes the success page.
 */
export default function PinterestCheckoutEvent({
  orderId,
  value,
  currency = 'USD',
  lineItems,
  buyerEmail,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Session-level dedupe across refreshes of the same success page.
    const key = `pin_checkout_fired_${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage may be unavailable (e.g., privacy mode) - fall through
    }

    // Enhanced match: pass buyer email before firing the conversion event
    // so Pinterest can match this purchase to its own user data.
    if (buyerEmail) {
      pinterestSetEnhancedMatch(buyerEmail);
    }

    pinterestTrack('Checkout', {
      value,
      order_id: orderId,
      order_quantity: lineItems.reduce((sum, i) => sum + (i.product_quantity ?? 1), 0),
      currency,
      line_items: lineItems,
    });

    ga4Purchase({
      transactionId: orderId,
      value,
      currency,
      items: lineItems.map((i) => ({
        item_id: i.product_id,
        item_name: i.product_name,
        item_category: i.product_category,
        price: i.product_price,
        quantity: i.product_quantity ?? 1,
      })),
    });
  }, [orderId, value, currency, lineItems, buyerEmail]);

  return null;
}
