/**
 * Tiny client for the dashboard REST endpoints.
 * No SWR yet, just async helpers, with components managing local state.
 * Easy to swap for SWR/React Query later.
 */

import type {
  LogEntry,
  CalendarEvent,
  CustomSubject,
  Child,
  UnavailableWindow,
  WeeklyGoals,
  PlannerResult,
  CustomResource,
} from './dashboard-types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ─── Log entries ─────────────────────────────────────────────────────────────

export interface LogFilters {
  from?: string;
  to?: string;
  type?: string;
  category?: string;
  subject?: string;
  child?: string;
  q?: string;
}

export async function fetchLogEntries(filters: LogFilters = {}): Promise<LogEntry[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v);
  }
  const res = await fetch(`/api/dashboard/log-entries?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch log entries');
  const data = await res.json();
  return data.entries as LogEntry[];
}

export async function createLogEntry(
  input: Partial<LogEntry> & { date: string; title: string; type: string }
): Promise<LogEntry> {
  const res = await fetch('/api/dashboard/log-entries', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create log entry');
  const data = await res.json();
  return data.entry as LogEntry;
}

export async function updateLogEntry(
  id: string,
  patch: Partial<LogEntry>
): Promise<LogEntry> {
  const res = await fetch(`/api/dashboard/log-entries/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update log entry');
  const data = await res.json();
  return data.entry as LogEntry;
}

export async function deleteLogEntry(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/log-entries/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete log entry');
}

// ─── Calendar events ─────────────────────────────────────────────────────────

export async function fetchCalendarEvents(
  range: { from?: string; to?: string } = {}
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  const res = await fetch(`/api/dashboard/calendar-events?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch calendar events');
  const data = await res.json();
  return data.events as CalendarEvent[];
}

export async function createCalendarEvent(
  input: { date: string; title: string; type: string } & Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const res = await fetch('/api/dashboard/calendar-events', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create calendar event');
  const data = await res.json();
  return data.event as CalendarEvent;
}

export async function updateCalendarEvent(
  id: string,
  patch: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const res = await fetch(`/api/dashboard/calendar-events/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update calendar event');
  const data = await res.json();
  return data.event as CalendarEvent;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/calendar-events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete calendar event');
}

export async function completeCalendarEvent(
  eventId: string,
  opts: { subjects?: string[]; notes?: string } = {}
): Promise<{ event: CalendarEvent; entry: LogEntry }> {
  const res = await fetch('/api/dashboard/calendar-events', {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: 'complete', eventId, ...opts }),
  });
  if (!res.ok) throw new Error('Failed to complete event');
  return res.json();
}

/**
 * Skip an event and optionally have the planner reshuffle it to the best
 * remaining day this week. Returns the original event (now skipped=true)
 * and the new event the planner created, if any.
 */
export async function skipAndReshuffle(
  eventId: string,
  opts: { reshuffle?: boolean } = {}
): Promise<{ event: CalendarEvent; reshuffled: { event: CalendarEvent; reason: string } | null }> {
  const res = await fetch('/api/dashboard/calendar-events', {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      action: 'skip-and-reshuffle',
      eventId,
      reshuffle: opts.reshuffle !== false,
    }),
  });
  if (!res.ok) throw new Error('Failed to skip event');
  return res.json();
}

// ─── Weekly goals ────────────────────────────────────────────────────────────

export async function fetchWeeklyGoals(weekStart: string): Promise<{
  weekStart: string;
  goals: WeeklyGoals;
  lastGeneratedAt: string | null;
}> {
  const res = await fetch(
    `/api/dashboard/weekly-goals?weekStart=${encodeURIComponent(weekStart)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch weekly goals');
  return res.json();
}

export async function saveWeeklyGoals(input: {
  weekStart: string;
  goals: WeeklyGoals;
}): Promise<{ weekStart: string; goals: WeeklyGoals }> {
  const res = await fetch('/api/dashboard/weekly-goals', {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to save weekly goals');
  return res.json();
}

// ─── Unavailable windows ─────────────────────────────────────────────────────

export async function fetchUnavailableWindows(
  range: { from?: string; to?: string } = {},
): Promise<UnavailableWindow[]> {
  const params = new URLSearchParams();
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  const res = await fetch(
    `/api/dashboard/unavailable-windows?${params.toString()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch unavailable windows');
  const data = await res.json();
  return data.windows as UnavailableWindow[];
}

export async function createUnavailableWindow(input: {
  date: string;
  startTime: string;
  endTime: string;
  label?: string | null;
  kind?: 'mom-out' | 'all-off' | 'co-op';
  recurrence?: string;
  recurrenceUntil?: string | null;
}): Promise<UnavailableWindow> {
  const res = await fetch('/api/dashboard/unavailable-windows', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Failed to create unavailable window');
  }
  const data = await res.json();
  return data.window as UnavailableWindow;
}

export async function deleteUnavailableWindow(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/unavailable-windows/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete unavailable window');
}

// ─── Plan generation ─────────────────────────────────────────────────────────

export async function generatePlan(input: {
  weekStart?: string;
  clearPriorGenerated?: boolean;
  dryRun?: boolean;
}): Promise<PlannerResult> {
  const res = await fetch('/api/dashboard/generate-plan', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to generate plan');
  return res.json();
}

// ─── Custom resources (parent's own curriculum) ──────────────────────────────

export async function fetchCustomResources(): Promise<CustomResource[]> {
  const res = await fetch('/api/dashboard/custom-resources', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch materials');
  const data = await res.json();
  return data.resources as CustomResource[];
}

export async function createCustomResource(input: {
  title: string;
  subjects?: string[];
  childIds?: string[];
  mode?: 'independent' | 'together' | 'either';
  durationMinutes?: number | null;
  cadence?: 'flexible' | 'fixed';
  timesPerWeek?: number | null;
  fixedDays?: number[];
}): Promise<CustomResource> {
  const res = await fetch('/api/dashboard/custom-resources', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Failed to add material');
  }
  const data = await res.json();
  return data.resource as CustomResource;
}

export async function updateCustomResource(
  id: string,
  patch: Partial<{
    title: string;
    subjects: string[];
    childIds: string[];
    mode: 'independent' | 'together' | 'either';
    durationMinutes: number | null;
    cadence: 'flexible' | 'fixed';
    timesPerWeek: number | null;
    fixedDays: number[];
  }>,
): Promise<CustomResource> {
  const res = await fetch(`/api/dashboard/custom-resources/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update material');
  const data = await res.json();
  return data.resource as CustomResource;
}

export async function deleteCustomResource(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/custom-resources/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove material');
}

// ─── Programs (done-for-you skill paths) ─────────────────────────────────────

export async function fetchAccess(): Promise<{ tier: 'guest' | 'starter' | 'member'; isMember: boolean }> {
  const res = await fetch('/api/dashboard/access', { cache: 'no-store' });
  if (!res.ok) return { tier: 'guest', isMember: false };
  return res.json();
}

export async function startProgram(input: {
  programId: string;
  childIds: string[];
  startDate?: string;
}): Promise<{ created?: number; weekStart?: string; programTitle?: string; weeks?: number; needsUpgrade?: boolean }> {
  const res = await fetch('/api/dashboard/start-program', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Failed to start program');
  }
  return res.json();
}

// ─── AI planning assistant ───────────────────────────────────────────────────

export interface AgentReply {
  reply: string;
  changed: boolean;
  weekStart?: string;
  configured?: boolean;
  needsUpgrade?: boolean;
}

export async function askAgent(input: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  weekStart?: string;
}): Promise<AgentReply> {
  const res = await fetch('/api/dashboard/agent', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('The assistant is unavailable right now.');
  return res.json();
}

// ─── Log description assist ──────────────────────────────────────────────────

export type LogAssistResult =
  | { ok: true; description: string; durationMinutes: number; subjects: string[] }
  | { ok: false; reason: string };

/**
 * Draft a portfolio description (plus a duration + subject guess) from a few
 * words about what the kid did. The route always replies 200 with an `ok`
 * flag, so we never throw on the graceful-degrade path (no API key): the caller
 * just toasts `reason`.
 */
export async function logAssist(input: {
  title: string;
  type?: string;
  note?: string;
}): Promise<LogAssistResult> {
  try {
    const res = await fetch('/api/dashboard/log-assist', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return { ok: false, reason: 'The draft helper is unavailable right now.' };
    }
    return data as LogAssistResult;
  } catch {
    return { ok: false, reason: 'The draft helper is unavailable right now.' };
  }
}

// ─── Custom subjects ─────────────────────────────────────────────────────────

export async function fetchCustomSubjects(): Promise<CustomSubject[]> {
  const res = await fetch('/api/dashboard/custom-subjects', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch custom subjects');
  const data = await res.json();
  return data.subjects as CustomSubject[];
}

export async function createCustomSubject(
  input: { label: string; color?: string }
): Promise<CustomSubject> {
  const res = await fetch('/api/dashboard/custom-subjects', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Failed to create custom subject');
  }
  const data = await res.json();
  return data.subject as CustomSubject;
}

export async function deleteCustomSubject(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/custom-subjects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete custom subject');
}

// ─── Children ────────────────────────────────────────────────────────────────

export async function fetchChildren(): Promise<Child[]> {
  const res = await fetch('/api/dashboard/children', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch children');
  const data = await res.json();
  return data.children as Child[];
}

export async function createChild(input: {
  name: string;
  birthYear?: number | null;
  color?: string;
  emoji?: string | null;
  avatar?: string | null;
}): Promise<Child> {
  const res = await fetch('/api/dashboard/children', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Failed to create child');
  }
  const data = await res.json();
  return data.child as Child;
}

export async function updateChild(
  id: string,
  patch: Partial<Pick<Child, 'name' | 'birthYear' | 'color' | 'emoji' | 'avatar' | 'sortOrder'>>
): Promise<Child> {
  const res = await fetch(`/api/dashboard/children/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update child');
  const data = await res.json();
  return data.child as Child;
}

export async function deleteChild(id: string): Promise<void> {
  const res = await fetch(`/api/dashboard/children/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete child');
}

// ─── Photo upload ────────────────────────────────────────────────────────────

export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/dashboard/upload-photo', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }
  const data = await res.json();
  return { url: data.url };
}

export async function deletePhoto(url: string): Promise<void> {
  await fetch('/api/dashboard/upload-photo/delete', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ url }),
  });
}

// ─── Log entry search ────────────────────────────────────────────────────────

export interface ExtendedLogFilters extends LogFilters {
  q?: string;
}

export async function searchLogEntries(filters: ExtendedLogFilters = {}): Promise<LogEntry[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, String(v));
  }
  const res = await fetch(`/api/dashboard/log-entries?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to search log entries');
  const data = await res.json();
  return data.entries as LogEntry[];
}
