CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"birth_year" integer,
	"color" text NOT NULL,
	"emoji" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unavailable_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"label" text,
	"kind" text DEFAULT 'mom-out' NOT NULL,
	"recurrence" text DEFAULT 'none' NOT NULL,
	"recurrence_until" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"week_start" date NOT NULL,
	"goals" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "recurrence" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "recurrence_until" date;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "child_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "child_names" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "mode" text DEFAULT 'either' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "generated_by_planner_at" timestamp;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "weekly_goal_id" uuid;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "skipped" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "log_entries" ADD COLUMN "child_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "starter_pack_credit_applied_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_children_user_sort" ON "children" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_unavailable_windows_user_date" ON "unavailable_windows" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_unavailable_windows_user_kind" ON "unavailable_windows" USING btree ("user_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_weekly_goals_user_week" ON "weekly_goals" USING btree ("user_id","week_start");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_user_recurrence" ON "calendar_events" USING btree ("user_id","recurrence");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_user_goal" ON "calendar_events" USING btree ("user_id","weekly_goal_id");