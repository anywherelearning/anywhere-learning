/**
 * Shared types for the member dashboard.
 * Mirrors lib/db/schema.ts shapes after JSON serialization.
 */

export interface LogEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: string;
  category: string | null;
  productSlug: string | null;
  subjects: string[];
  childIds: string[];
  childNames: string[];
  photos: string[];
  notes: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  birthYear: number | null;
  color: string;
  emoji: string | null;
  /** Illustrated avatar id (see kid-avatars.tsx), e.g. 'fox'. Null = legacy color+initial. */
  avatar: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  date: string;
  title: string;
  type: string;
  category: string | null;
  productSlug: string | null;
  notes: string | null;
  completed: boolean;
  logEntryId: string | null;
  /** 'none' | 'weekly' | 'biweekly' | 'monthly' */
  recurrence: string;
  /** ISO date when recurrence ends, or null = forever. */
  recurrenceUntil: string | null;
  /** UUID references to children table. Which kid(s) this event is for. */
  childIds: string[];
  /** Display-name snapshot of the assigned kids. */
  childNames: string[];
  /** Capacity mode: 'independent' | 'together' | 'either'. */
  mode: 'independent' | 'together' | 'either';
  /** Estimated duration in minutes. Null when unspecified. */
  durationMinutes: number | null;
  /** Set when the auto-rescheduler placed this event. */
  generatedByPlannerAt: string | null;
  /** UUID of the weekly_goals row this satisfies. */
  weeklyGoalId: string | null;
  /** UUID of the custom_resources row when this is the parent's own curriculum. */
  customResourceId: string | null;
  /** True when the parent skipped this event. */
  skipped: boolean;
  /** True when this row represents a synthetic recurrence occurrence
   *  (a future repeat of an underlying series), false for the original event. */
  isOccurrence?: boolean;
  /** Id of the original event in the series. Equal to id for the seed. */
  seriesId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnavailableWindow {
  id: string;
  userId: string;
  date: string;
  startTime: string; // HH:MM
  endTime: string;
  label: string | null;
  kind: 'mom-out' | 'all-off' | 'co-op';
  recurrence: string;
  recurrenceUntil: string | null;
  createdAt: string;
}

/** Per-kid per-subject goals for a single week. Shape: { childId: { subjectId: count } }. */
export type WeeklyGoals = Record<string, Record<string, number>>;

/** The parent's own curriculum / materials the planner schedules alongside AL activities. */
export interface CustomResource {
  id: string;
  userId: string;
  title: string;
  subjects: string[];
  childIds: string[];
  mode: 'independent' | 'together' | 'either';
  durationMinutes: number | null;
  cadence: 'flexible' | 'fixed';
  timesPerWeek: number | null;
  fixedDays: number[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerPlacement {
  date: string;
  title: string;
  type: string;
  category: string | null;
  productSlug: string;
  subjects: string[];
  childIds: string[];
  childNames: string[];
  mode: 'independent' | 'together' | 'either';
  durationMinutes: number;
  weeklyGoalKey: string;
  reason: string;
}

export interface PlannerResult {
  weekStart: string;
  placements: PlannerPlacement[];
  unfulfilled: Record<string, Record<string, number>>;
  notes: string[];
  createdEventIds: string[];
  /** True when a non-member tried a member-only action. */
  needsUpgrade?: boolean;
}

export interface CustomSubject {
  id: string;
  userId: string;
  slug: string;
  label: string;
  color: string;
  createdAt: string;
}
