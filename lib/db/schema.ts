import { pgTable, uuid, text, integer, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  /** Set when the user buys the Starter Pack ($44.99 one-time). NULL = never bought. */
  starterPackPurchasedAt: timestamp('starter_pack_purchased_at'),
  /**
   * Set when the user redeems their Starter Pack credit by upgrading to membership.
   * Used to enforce the "first year only" rule — once set, no further credit applies.
   */
  starterPackCreditAppliedAt: timestamp('starter_pack_credit_applied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  priceCents: integer('price_cents').notNull(),
  compareAtPriceCents: integer('compare_at_price_cents'),
  stripePriceId: text('stripe_price_id').notNull(),
  // Bundles have blobUrl = '' (empty string) because the Stripe webhook
  // expands a bundle purchase into child product orders. The download
  // endpoint only ever reads blobUrl from individual products. NOT NULL is
  // enforced at the column level; the value is simply unused for bundles.
  blobUrl: text('blob_url').notNull(),
  imageUrl: text('image_url'),
  previewBlobUrl: text('preview_blob_url'),
  category: text('category').notNull(),
  isBundle: boolean('is_bundle').default(false).notNull(),
  bundleProductIds: text('bundle_product_ids'),
  activityCount: integer('activity_count'),
  ageRange: text('age_range'),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_products_active_category').on(table.active, table.category),
  index('idx_products_active_sort').on(table.active, table.sortOrder),
  index('idx_products_stripe_price').on(table.stripePriceId),
]);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  stripeSessionId: text('stripe_session_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').default('completed').notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
}, (table) => [
  index('idx_orders_user_status').on(table.userId, table.status),
]);

export const downloads = pgTable('downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  /** Legacy: kept nullable for the migration. New reviews use productSlug. */
  productId: uuid('product_id').references(() => products.id),
  /** New canonical key — activity slug from lib/fallback-products.ts. */
  productSlug: text('product_slug'),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  /** Snapshot of the author's display name at write time. Avoids re-fetching
   *  Clerk on every review render. */
  authorName: text('author_name'),
  /** Snapshot of the author's Clerk profile image URL at write time. */
  authorImageUrl: text('author_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_reviews_product').on(table.productId),
  index('idx_reviews_product_slug').on(table.productSlug),
  index('idx_reviews_user_product').on(table.userId, table.productId),
  index('idx_reviews_user_slug').on(table.userId, table.productSlug),
]);

export const deviceTokens = pgTable('device_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  token: text('token').notNull().unique(),
  platform: text('platform').notNull(), // 'ios' | 'android'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_device_tokens_user').on(table.userId),
  index('idx_device_tokens_platform').on(table.platform),
]);

// ─────────────────────────────────────────────────────────────────────────────
// Membership subscriptions ($99/yr founder, $149/yr standard). Written by the
// Stripe webhook (customer.subscription.* + invoice.paid), read by the access
// tier resolver in lib/access. During a free trial the Stripe status is
// 'trialing' and currentPeriodEnd holds the trial end date.
// ─────────────────────────────────────────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status').notNull(), // 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_subscriptions_user_status').on(table.userId, table.status),
  uniqueIndex('idx_subscriptions_stripe_sub').on(table.stripeSubscriptionId),
  index('idx_subscriptions_stripe_customer').on(table.stripeCustomerId),
]);

// ─────────────────────────────────────────────────────────────────────────────
// RETAINED (unused): trial download ledger. Built when trials allowed a capped
// number of downloads. Trials are now view-only (downloading is a paid-member
// benefit), so nothing reads or writes this table. Kept to avoid a migration;
// drop in a dedicated migration if we're sure the capped-trial model is gone
// for good.
// ─────────────────────────────────────────────────────────────────────────────
export const trialDownloads = pgTable('trial_downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  slug: text('slug').notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_trial_downloads_user_slug').on(table.userId, table.slug),
]);

// ─────────────────────────────────────────────────────────────────────────────
// Stripe webhook idempotency ledger. Stripe delivers each event at-least-once,
// so duplicates are expected. The webhook inserts the event id here before
// processing; a conflict means "already handled" and the handler early-returns.
// Makes replay-safety a guarantee instead of relying on every side effect
// (emails, Kit tags) happening to be idempotent on its own.
// ─────────────────────────────────────────────────────────────────────────────
export const stripeEvents = pgTable('stripe_events', {
  /** Stripe event id, e.g. evt_1ABC… — the natural primary key. */
  id: text('id').primaryKey(),
  type: text('type'),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerUserId: uuid('referrer_user_id').references(() => users.id).notNull(),
  referrerEmail: text('referrer_email').notNull(),
  code: text('code').notNull().unique(),
  stripePromoId: text('stripe_promo_id').notNull(),
  referralCount: integer('referral_count').default(0).notNull(),
  rewardStripePromoCode: text('reward_stripe_promo_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_referrals_user').on(table.referrerUserId),
  index('idx_referrals_email').on(table.referrerEmail),
]);

export const referralConversions = pgTable('referral_conversions', {
  id: uuid('id').defaultRandom().primaryKey(),
  referralId: uuid('referral_id').references(() => referrals.id).notNull(),
  referredEmail: text('referred_email').notNull(),
  stripeSessionId: text('stripe_session_id').notNull(),
  convertedAt: timestamp('converted_at').defaultNow().notNull(),
}, (table) => [
  index('idx_referral_conversions_referral').on(table.referralId),
]);
