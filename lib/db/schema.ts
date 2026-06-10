import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

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

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER DASHBOARD: log entries, calendar events, custom subjects
//
// userId is a TEXT field that holds either a Clerk userId (when authenticated)
// or an anonymous cookie-based identifier (for unauthenticated dashboard demos
// at /discover). When auth lands we can migrate anon rows by cookie → clerkId.
// ─────────────────────────────────────────────────────────────────────────────

export const logEntries = pgTable('log_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  /** ISO date 'YYYY-MM-DD' for when the activity happened. */
  date: date('date').notNull(),
  title: text('title').notNull(),
  /** 'activity' | 'custom' | 'field-trip' | 'book' | 'documentary' | 'lesson' | 'project' */
  type: text('type').notNull(),
  /** AL category (e.g. 'outdoor-learning') or null for custom non-AL entries. */
  category: text('category'),
  /** Slug of the AL product, when type='activity'. */
  productSlug: text('product_slug'),
  /** Array of subject IDs - mix of STANDARD_SUBJECTS ids and custom_subjects ids. */
  subjects: jsonb('subjects').$type<string[]>().default([]).notNull(),
  /** UUID references to children table. Canonical "who did this". */
  childIds: jsonb('child_ids').$type<string[]>().default([]).notNull(),
  /** Display-name snapshot at write time. Preserves history when a child is renamed or removed. */
  childNames: jsonb('child_names').$type<string[]>().default([]).notNull(),
  /** URLs to uploaded photos (Vercel Blob). */
  photos: jsonb('photos').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  durationMinutes: integer('duration_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_log_entries_user_date').on(table.userId, table.date),
  index('idx_log_entries_user_type').on(table.userId, table.type),
  index('idx_log_entries_product_slug').on(table.productSlug),
]);

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  date: date('date').notNull(),
  title: text('title').notNull(),
  /** 'activity' | 'custom' | 'field-trip' | 'lesson' | etc. */
  type: text('type').notNull(),
  category: text('category'),
  productSlug: text('product_slug'),
  notes: text('notes'),
  /** When true, a matching log entry has been created and the event is "done". */
  completed: boolean('completed').default(false).notNull(),
  /** FK to log_entries row created when this event was marked completed. */
  logEntryId: uuid('log_entry_id'),
  /** Recurrence rule: 'none' | 'weekly' | 'biweekly' | 'monthly'. */
  recurrence: text('recurrence').default('none').notNull(),
  /** Inclusive ISO date when recurrence stops emitting events. NULL = forever. */
  recurrenceUntil: date('recurrence_until'),
  /** UUID references to children table. Which kid(s) this event is for. Empty = family-wide. */
  childIds: jsonb('child_ids').$type<string[]>().default([]).notNull(),
  /** Display-name snapshot for the assigned kids. */
  childNames: jsonb('child_names').$type<string[]>().default([]).notNull(),
  /** Capacity mode: 'independent' (kid alone) | 'together' (needs parent) | 'either'. */
  mode: text('mode').default('either').notNull(),
  /** Estimated block size in minutes. Used by the auto-rescheduler to budget time. */
  durationMinutes: integer('duration_minutes'),
  /** Set when the auto-rescheduler placed this event. Used to know what's safe to reshuffle. */
  generatedByPlannerAt: timestamp('generated_by_planner_at'),
  /** FK to weekly_goals row this event was generated to satisfy. NULL for hand-placed events. */
  weeklyGoalId: uuid('weekly_goal_id'),
  /** FK to custom_resources when this event is the parent's own curriculum (not an AL activity). */
  customResourceId: uuid('custom_resource_id'),
  /** True when the parent skipped this and the scheduler has redistributed it. */
  skipped: boolean('skipped').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_calendar_events_user_date').on(table.userId, table.date),
  index('idx_calendar_events_user_completed').on(table.userId, table.completed),
  index('idx_calendar_events_user_recurrence').on(table.userId, table.recurrence),
  index('idx_calendar_events_user_goal').on(table.userId, table.weeklyGoalId),
]);

export const children = pgTable('children', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  /** Birth year (YYYY) — optional, used to compute current age. */
  birthYear: integer('birth_year'),
  /** Hex color for visual identification in lists / chips. */
  color: text('color').notNull(),
  /** Single emoji / character used as a legacy fallback avatar. */
  emoji: text('emoji'),
  /** Illustrated avatar id (see app/(store)/discover/kid-avatars.tsx), e.g. 'fox'. */
  avatar: text('avatar'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_children_user_sort').on(table.userId, table.sortOrder),
]);

export const customSubjects = pgTable('custom_subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  /** Stable slug used in log_entries.subjects[]. e.g. 'spanish', 'piano' */
  slug: text('slug').notNull(),
  label: text('label').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_custom_subjects_user_slug').on(table.userId, table.slug),
]);

// ─────────────────────────────────────────────────────────────────────────────
// PLANNER: weekly goals, unavailable windows
//
// The auto-rescheduler is goal-based: parents declare how many activities of
// each subject each kid needs per week, and the system places them across the
// week respecting hard constraints (unavailable windows, co-op, travel days)
// and soft constraints (don't stack mom-led blocks on the same kid back-to-back,
// fill mom-unavailable windows with independent activities).
//
// weekStart is always the Monday of that ISO week, YYYY-MM-DD.
// ─────────────────────────────────────────────────────────────────────────────

export const weeklyGoals = pgTable('weekly_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  /** Monday of the ISO week, YYYY-MM-DD. */
  weekStart: date('week_start').notNull(),
  /** Per-kid goals stored as JSON: { childId: { subjectId: targetCount } }. */
  goals: jsonb('goals').$type<Record<string, Record<string, number>>>().default({}).notNull(),
  /** Last time the planner ran for this week. */
  lastGeneratedAt: timestamp('last_generated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_weekly_goals_user_week').on(table.userId, table.weekStart),
]);

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM RESOURCES: the parent's own curriculum / materials
//
// Anywhere Learning activities are the enrichment layer, but most families also
// run their own curriculum (Singapore Math, Story of the World), lessons (piano),
// and commitments (co-op). These rows let the planner treat that real backbone
// as first-class: it places them at their cadence first, then tops up the weekly
// subject goals with AL activities. One week view holds the whole week.
// ─────────────────────────────────────────────────────────────────────────────

export const customResources = pgTable('custom_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  /** Display title, e.g. "Singapore Math 3A", "Piano lessons". */
  title: text('title').notNull(),
  /** Subject ids this counts toward (standard or custom). */
  subjects: jsonb('subjects').$type<string[]>().default([]).notNull(),
  /** Which kids use it. Empty = all kids. */
  childIds: jsonb('child_ids').$type<string[]>().default([]).notNull(),
  /** Capacity mode: 'independent' | 'together' | 'either'. */
  mode: text('mode').default('either').notNull(),
  /** Typical block length in minutes. */
  durationMinutes: integer('duration_minutes'),
  /**
   * How it gets scheduled:
   *   - 'flexible' = N times per week, planner chooses the days
   *   - 'fixed'    = specific weekdays (co-op, lessons)
   */
  cadence: text('cadence').default('flexible').notNull(),
  /** For 'flexible': how many times per week to schedule it. */
  timesPerWeek: integer('times_per_week').default(3),
  /** For 'fixed': weekday indices, 0=Mon ... 6=Sun. */
  fixedDays: jsonb('fixed_days').$type<number[]>().default([]).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_custom_resources_user').on(table.userId, table.active),
]);

export const unavailableWindows = pgTable('unavailable_windows', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  /** ISO date YYYY-MM-DD. */
  date: date('date').notNull(),
  /** Start time HH:MM in 24h local time. */
  startTime: text('start_time').notNull(),
  /** End time HH:MM in 24h local time. */
  endTime: text('end_time').notNull(),
  /** Short label: 'Phone call', 'Co-op', 'Travel day', 'Sick day', etc. */
  label: text('label'),
  /**
   * What this window means for the scheduler:
   * - 'mom-out'   = parent unavailable, kids should get independent activities
   * - 'all-off'   = nobody schoolworks (travel, sick, holiday)
   * - 'co-op'     = kids busy elsewhere, no scheduling needed
   */
  kind: text('kind').default('mom-out').notNull(),
  /** Recurrence rule: 'none' | 'weekly' | 'biweekly' | 'monthly'. */
  recurrence: text('recurrence').default('none').notNull(),
  /** Inclusive ISO date when recurrence stops. NULL = forever. */
  recurrenceUntil: date('recurrence_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_unavailable_windows_user_date').on(table.userId, table.date),
  index('idx_unavailable_windows_user_kind').on(table.userId, table.kind),
]);
