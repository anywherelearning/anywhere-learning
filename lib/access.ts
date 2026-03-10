import { getUserByClerkId, hasActiveMembership, hasUserPurchasedProduct } from '@/lib/db/queries';

export type AccessLevel =
  | { hasAccess: false }
  | { hasAccess: true; accessType: 'member' | 'purchased' | 'both'; userId: string };

/**
 * Check whether a user can access a specific product.
 * Returns the access type so callers can decide what to show
 * (e.g. download button for purchasers, viewer for members).
 */
export async function checkProductAccess(
  clerkId: string,
  productId: string,
): Promise<AccessLevel> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return { hasAccess: false };

  const [isMember, hasPurchased] = await Promise.all([
    hasActiveMembership(user.id),
    hasUserPurchasedProduct(user.id, productId),
  ]);

  if (isMember && hasPurchased) return { hasAccess: true, accessType: 'both', userId: user.id };
  if (isMember) return { hasAccess: true, accessType: 'member', userId: user.id };
  if (hasPurchased) return { hasAccess: true, accessType: 'purchased', userId: user.id };
  return { hasAccess: false };
}
