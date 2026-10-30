/**
 * Shared member provisioning: find-or-create the Clerk account, upsert our
 * `users` row, and mint a one-tap sign-in link. Used by the Stripe webhook
 * (paid checkouts) and by access grants (gifts, funded orders, co-ops), so a
 * granted member ends up with exactly the same account shape as a paying one.
 */

import { createClerkClient } from '@clerk/backend';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/** Pull a Clerk backend client. Returns null if Clerk isn't configured. */
export function getClerk() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  return createClerkClient({ secretKey });
}

/** Find a Clerk user by email, or create one if none exists. */
export async function findOrCreateClerkUser(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<{ id: string; created: boolean } | null> {
  const clerk = getClerk();
  if (!clerk) {
    console.warn('[provision] Clerk not configured, skipping user provisioning');
    return null;
  }
  try {
    const existing = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
    if (existing.data.length > 0) {
      const u = existing.data[0];
      // Backfill firstName/lastName if Clerk has them empty but Stripe gave us
      // a name. People who signed up via magic-link first won't have a name.
      const needsFirst = !u.firstName && firstName;
      const needsLast = !u.lastName && lastName;
      if (needsFirst || needsLast) {
        try {
          await clerk.users.updateUser(u.id, {
            ...(needsFirst ? { firstName } : {}),
            ...(needsLast ? { lastName } : {}),
          });
        } catch (err) {
          console.warn('[provision] backfill name update failed:', err);
        }
      }
      return { id: u.id, created: false };
    }
    const created = await clerk.users.createUser({
      emailAddress: [email],
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    return { id: created.id, created: true };
  } catch (err) {
    console.error('[provision] findOrCreateClerkUser failed:', err);
    return null;
  }
}

/**
 * Generate a one-tap sign-in URL for a Clerk user (magic link).
 *
 * `destination` is where they land after the ticket is accepted. It rides the
 * fallback too, so someone whose token could not be minted still ends up in the
 * right place after signing in manually.
 */
export async function generateSignInUrl(
  clerkId: string,
  destination = '/account',
): Promise<string> {
  const base = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
  const redirect = encodeURIComponent(destination);
  const clerk = getClerk();
  const fallback = `${base}/sign-in?redirect_url=${redirect}`;
  if (!clerk) return fallback;
  try {
    const token = await clerk.signInTokens.createSignInToken({
      userId: clerkId,
      expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    });
    // Clerk's accept URL signs the user in and redirects them.
    return `${base}/sign-in?__clerk_ticket=${token.token}&redirect_url=${redirect}`;
  } catch (err) {
    console.error('[provision] generateSignInUrl failed:', err);
    return fallback;
  }
}

/** Upsert a `users` row keyed by Clerk ID. */
export async function upsertUser(opts: {
  clerkId: string;
  email: string;
  stripeCustomerId?: string;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, opts.clerkId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        email: opts.email.toLowerCase(),
        ...(opts.stripeCustomerId && { stripeCustomerId: opts.stripeCustomerId }),
      })
      .where(eq(users.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({
      clerkId: opts.clerkId,
      email: opts.email.toLowerCase(),
      stripeCustomerId: opts.stripeCustomerId,
    })
    .returning({ id: users.id });
  return inserted[0].id;
}
