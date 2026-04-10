import { pgTable, uuid, text, integer, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
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
  // expands a bundle purchase into child product orders — the download
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
  productId: uuid('product_id').references(() => products.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_reviews_product').on(table.productId),
  index('idx_reviews_user_product').on(table.userId, table.productId),
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
// PARKED: subscriptions table
// The membership/subscription product was scrapped pre-launch (Apr 2026). No
// application code reads or writes this table. It is intentionally preserved
// so existing production data (if any ever gets written) is not lost, and so
// a future membership relaunch does not require a fresh migration. Drop this
// table in a dedicated migration if/when we decide membership is permanently
// off the roadmap.
// ─────────────────────────────────────────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status').notNull(), // 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_subscriptions_user_status').on(table.userId, table.status),
  uniqueIndex('idx_subscriptions_stripe_sub').on(table.stripeSubscriptionId),
  index('idx_subscriptions_stripe_customer').on(table.stripeCustomerId),
]);

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
