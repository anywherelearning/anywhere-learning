import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
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
  lemonVariantId: text('lemon_variant_id').notNull(),
  blobUrl: text('blob_url').notNull(),
  imageUrl: text('image_url'),
  category: text('category').notNull(),
  isBundle: boolean('is_bundle').default(false).notNull(),
  bundleProductIds: text('bundle_product_ids'),
  activityCount: integer('activity_count'),
  ageRange: text('age_range'),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  lemonOrderId: text('lemon_order_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').default('completed').notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
});

export const downloads = pgTable('downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
});
