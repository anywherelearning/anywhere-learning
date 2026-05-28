'use client';

/**
 * The "Plan" tab.
 *
 * One screen, three rows:
 *
 *   1. Week navigator (jump weeks, "this week" reset)
 *
 *   2. Goal setter -- per-kid grid of subjects. Parents set "how many X
 *      activities does each kid need this week". Saves as you go. The grid
 *      shrinks when only one kid is focused via the parent KidPill.
 *
 *   3. Generated week view -- 7 day columns, each showing the events the
 *      planner placed (or that you placed manually). Each event card has:
 *      complete | skip & reshuffle | open in calendar.
 *
 *   plus a "Mom unavailable" strip and a "Generate plan" call to action.
 *
 * Auto-rescheduling is server-side. The "Skip" button POSTs to
 *   /api/dashboard/calendar-events  (action: 'skip-and-reshuffle')
 * which marks the event skipped and places a new one on the best remaining
 * day. The UI just refetches the week.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STANDARD_SUBJECTS } from '@/lib/taxonomy';
import { PROGRAMS, programActivityCount, type Program } from '@/lib/programs';
import { ENRICHED_BY_SLUG } from '@/lib/activity-metadata';
import {
  ChildAvatar,
  CategoryTag,
  Eyebrow,
  GhostButton,
  PrimaryButton,
  resolveSubject,
  tintForCategory,
} from './dashboard-shared';
import {
  completeCalendarEvent,
  createCustomResource,
  createUnavailableWindow,
  deleteCustomResource,
  deleteUnavailableWindow,
  fetchCalendarEvents,
  fetchCustomResources,
  fetchUnavailableWindows,
  fetchWeeklyGoals,
  generatePlan,
  saveWeeklyGoals,
  skipAndReshuffle,
  startProgram,
} from './dashboard-api';
import { useToast } from './Toast';
import PlannerAssistant from './PlannerAssistant';
import PlanLibrary from './PlanLibrary';
import type {
  CalendarEvent,
  Child,
  CustomResource,
  PlannerResult,
  UnavailableWindow,
  WeeklyGoals,
} from './dashboard-types';

interface DashboardPlanProps {
  children: Child[];
  focusedKidId: string | null;
  onChildrenChange: (children: Child[]) => void;
  onOpenFamilySetup: () => void;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isoMonday(input: string): string {
  const d = new Date(`${input}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun ... 6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  return new Date(d.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function formatRange(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPlan({
  children,
  focusedKidId,
  onOpenFamilySetup,
}: DashboardPlanProps) {
  const toast = useToast();
  const [weekStart, setWeekStart] = useState<string>(() => isoMonday(todayIso()));
  const [goals, setGoals] = useState<WeeklyGoals>({});
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [windows, setWindows] = useState<UnavailableWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<PlannerResult | null>(null);
  const [windowEditorOpen, setWindowEditorOpen] = useState(false);
  const [materials, setMaterials] = useState<CustomResource[]>([]);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [subTab, setSubTab] = useState<'ai' | 'program' | 'manual' | 'library'>('ai');
  // Skill-building upgrade prompt, shown when a non-member tries a member-only action.
  const [upgrade, setUpgrade] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });
  const showUpgrade = useCallback(
    (reason: string) => setUpgrade({ open: true, reason }),
    [],
  );

  // Debounce goal-save fires so rapid stepper clicks coalesce into one PUT.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingGoals = useRef<WeeklyGoals | null>(null);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const focusedKid = useMemo(
    () => children.find((c) => c.id === focusedKidId) ?? null,
    [children, focusedKidId],
  );

  // ─── Load week data ────────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [g, evs, ws, mats] = await Promise.all([
        fetchWeeklyGoals(weekStart),
        fetchCalendarEvents({ from: weekStart, to: weekEnd }),
        fetchUnavailableWindows({ from: weekStart, to: weekEnd }),
        fetchCustomResources(),
      ]);
      setGoals(g.goals);
      setEvents(evs);
      setWindows(ws);
      setMaterials(mats);
    } catch (err) {
      console.error(err);
      toast.error('Could not load this week. Try again?');
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, toast]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ─── Goal mutations ────────────────────────────────────────────────────────

  const setGoal = useCallback(
    (childId: string, subjectId: string, count: number) => {
      setGoals((prev) => {
        const nextChild = { ...(prev[childId] ?? {}) };
        if (count <= 0) {
          delete nextChild[subjectId];
        } else {
          nextChild[subjectId] = Math.min(12, Math.max(0, count));
        }
        const next: WeeklyGoals = { ...prev };
        if (Object.keys(nextChild).length === 0) {
          delete next[childId];
        } else {
          next[childId] = nextChild;
        }

        // Debounced save: coalesce rapid stepper clicks into one PUT.
        pendingGoals.current = next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          const payload = pendingGoals.current;
          if (!payload) return;
          saveWeeklyGoals({ weekStart, goals: payload }).catch((err) => {
            console.error(err);
            toast.error('Failed to save goal');
          });
        }, 350);

        return next;
      });
    },
    [weekStart, toast],
  );

  // Flush any pending save before navigating away
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        if (pendingGoals.current) {
          saveWeeklyGoals({ weekStart, goals: pendingGoals.current }).catch(() => {});
        }
      }
    };
  }, [weekStart]);

  // ─── Plan generation ───────────────────────────────────────────────────────

  const runPlanner = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await generatePlan({ weekStart, clearPriorGenerated: true });
      if (result.needsUpgrade) {
        showUpgrade('build your whole week automatically');
        return;
      }
      setLastResult(result);
      const placed = result.placements.length;
      const unfulfilledCount = Object.values(result.unfulfilled).reduce(
        (sum, kid) => sum + Object.values(kid).reduce((s, n) => s + n, 0),
        0,
      );
      if (placed === 0 && result.notes.length > 0) {
        toast.info(result.notes[0]);
      } else if (unfulfilledCount > 0) {
        toast.info(`Placed ${placed}. ${unfulfilledCount} goal slot(s) unfilled.`);
      } else {
        toast.success(`Placed ${placed} activities for this week.`);
      }
      await reload();
    } catch (err) {
      console.error(err);
      toast.error('Could not generate the plan. Try again?');
    } finally {
      setGenerating(false);
    }
  }, [weekStart, reload, toast, showUpgrade]);

  // ─── Event row actions ─────────────────────────────────────────────────────

  const handleComplete = useCallback(
    async (event: CalendarEvent) => {
      try {
        await completeCalendarEvent(event.id);
        toast.success(`Marked done: ${event.title}`);
        await reload();
      } catch (err) {
        console.error(err);
        toast.error('Failed to complete. Try again?');
      }
    },
    [reload, toast],
  );

  const handleSkip = useCallback(
    async (event: CalendarEvent) => {
      try {
        const result = await skipAndReshuffle(event.id, { reshuffle: true });
        if (result.reshuffled) {
          const newDate = new Date(`${result.reshuffled.event.date}T00:00:00Z`).toLocaleDateString(
            undefined,
            { weekday: 'long', timeZone: 'UTC' },
          );
          toast.success(`Moved to ${newDate}.`);
        } else {
          toast.info('Skipped. No room left this week to re-place.');
        }
        await reload();
      } catch (err) {
        console.error(err);
        toast.error('Failed to skip. Try again?');
      }
    },
    [reload, toast],
  );

  // ─── Derived: per-day, per-kid breakdown ───────────────────────────────────

  const dayBuckets = useMemo(() => {
    const buckets: CalendarEvent[][] = Array.from({ length: 7 }, () => []);
    for (const ev of events) {
      if (ev.skipped) continue;
      const day = (Date.parse(`${ev.date}T00:00:00Z`) - Date.parse(`${weekStart}T00:00:00Z`)) /
        86_400_000;
      const idx = Math.floor(day);
      if (idx >= 0 && idx < 7) buckets[idx].push(ev);
    }
    // Filter by focused kid if set
    if (focusedKidId) {
      return buckets.map((b) =>
        b.filter((e) => e.childIds.length === 0 || e.childIds.includes(focusedKidId)),
      );
    }
    return buckets;
  }, [events, weekStart, focusedKidId]);

  // Per-day mom-out coverage minutes (for the strip background)
  const momOutByDay = useMemo(() => {
    const arr: number[] = new Array(7).fill(0);
    for (const w of windows) {
      if (w.kind !== 'mom-out') continue;
      const day =
        (Date.parse(`${w.date}T00:00:00Z`) - Date.parse(`${weekStart}T00:00:00Z`)) / 86_400_000;
      const idx = Math.floor(day);
      if (idx >= 0 && idx < 7) {
        const [sh, sm] = w.startTime.split(':').map(Number);
        const [eh, em] = w.endTime.split(':').map(Number);
        arr[idx] += Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
      }
    }
    return arr;
  }, [windows, weekStart]);

  const allOffByDay = useMemo(() => {
    const arr: boolean[] = new Array(7).fill(false);
    for (const w of windows) {
      if (w.kind !== 'all-off') continue;
      const day =
        (Date.parse(`${w.date}T00:00:00Z`) - Date.parse(`${weekStart}T00:00:00Z`)) / 86_400_000;
      const idx = Math.floor(day);
      if (idx >= 0 && idx < 7) arr[idx] = true;
    }
    return arr;
  }, [windows, weekStart]);

  // ─── Kid list to display goals for ─────────────────────────────────────────

  const kidsToShow = focusedKid ? [focusedKid] : children;

  // ─── Empty state when no kids ──────────────────────────────────────────────

  if (children.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <Eyebrow>Plan the week</Eyebrow>
        <h1
          className="mt-4 text-2xl text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
        >
          Add a kid first
        </h1>
        <p className="mt-2 text-forest/70" style={{ fontFamily: '"DM Sans"' }}>
          The planner builds the week around each kid&apos;s goals. Add one or more kids in
          Family Setup, then come back here.
        </p>
        <div className="mt-6 flex justify-center">
          <PrimaryButton onClick={onOpenFamilySetup}>Set up family</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ─── Header: week navigator ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Plan the week</Eyebrow>
          <h1
            className="mt-2 text-3xl text-forest"
            style={{ fontFamily: '"DM Sans"', fontWeight: 600, lineHeight: 1.1 }}
          >
            {formatRange(weekStart)}
          </h1>
          <p
            className="mt-1 text-sm text-forest/70"
            style={{ fontFamily: '"DM Sans"' }}
          >
            Set goals. The planner places activities. Skip what gets blown up and
            it reshuffles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GhostButton onClick={() => setWeekStart(addDays(weekStart, -7))}>
            ← Last week
          </GhostButton>
          <GhostButton onClick={() => setWeekStart(isoMonday(todayIso()))}>
            This week
          </GhostButton>
          <GhostButton onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Next week →
          </GhostButton>
        </div>
      </header>

      {/* ─── How do you want to plan? Four ways to fill the week. ──────── */}
      <div className="flex flex-wrap gap-1.5 rounded-full border border-forest/10 bg-white p-1.5">
        {([
          ['ai', 'AI Assist'],
          ['program', 'Guided Program'],
          ['manual', 'Build it yourself'],
          ['library', 'Library'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className="rounded-full px-4 py-2 transition-colors cursor-pointer"
            style={{
              fontFamily: '"DM Sans"',
              fontSize: 13,
              fontWeight: 600,
              background: subTab === key ? '#588157' : 'transparent',
              color: subTab === key ? '#FAF9F6' : '#4F5A50',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── AI assistant: the "just tell me" door ─────────────────────── */}
      {subTab === 'ai' && (
        <PlannerAssistant
          weekStart={weekStart}
          onChanged={async (startedWeek) => {
            if (startedWeek) setWeekStart(startedWeek);
            await reload();
          }}
          onNeedsUpgrade={() => showUpgrade('plan your week just by talking')}
        />
      )}

      {/* ─── Programs: the done-for-you door ───────────────────────────── */}
      {subTab === 'program' && (
        <ProgramsShelf
          kids={children}
          weekStart={weekStart}
          onStarted={async (startedWeek) => {
            setWeekStart(startedWeek);
            await reload();
          }}
          onNeedsUpgrade={() => showUpgrade('start guided skill programs')}
        />
      )}

      {/* ─── Library: browse + add AL activities ───────────────────────── */}
      {subTab === 'library' && (
        <PlanLibrary kids={children} weekStart={weekStart} onAdded={reload} />
      )}

      {/* ─── Build it yourself: manual goal-based planner ──────────────── */}
      {subTab === 'manual' && (
      <section
        className="rounded-2xl border border-forest/10 bg-white p-5"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}
      >
        <div className="mb-1">
          <Eyebrow>Build it yourself</Eyebrow>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-base text-forest"
              style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
            >
              This week&apos;s goals
            </h2>
            <p className="mt-0.5 text-xs text-forest/60" style={{ fontFamily: '"DM Sans"' }}>
              Set how many of each subject per kid. The planner fills these with Anywhere Learning activities.
            </p>
          </div>
          <PrimaryButton onClick={runPlanner} disabled={generating || loading}>
            {generating ? 'Generating...' : 'Generate week plan'}
          </PrimaryButton>
        </div>
        <div className="mt-4 space-y-4">
          {kidsToShow.map((kid) => (
            <KidGoalRow
              key={kid.id}
              kid={kid}
              kidGoals={goals[kid.id] ?? {}}
              onSetGoal={(subjectId, count) => setGoal(kid.id, subjectId, count)}
            />
          ))}
        </div>
        {/* Your own stuff: a clear, separate control from the AL goals above. */}
        <div className="mt-5 border-t border-forest/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMaterialsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 px-3 py-1.5 text-forest hover:bg-forest/5 cursor-pointer"
              style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 12.5 }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }} aria-hidden>+</span>
              Custom Add
            </button>
            <span className="text-xs text-forest/60" style={{ fontFamily: '"DM Sans"' }}>
              {materials.length > 0
                ? `${materials.length} of your own material${materials.length === 1 ? '' : 's'} in the mix (Singapore Math, piano, co-op...)`
                : 'Add your own curriculum, lessons, or co-op so the planner schedules them too'}
            </span>
          </div>
          <p className="mt-2 text-xs text-forest/55" style={{ fontFamily: '"DM Sans"' }}>
            {windows.length > 0 ? (
              <>
                <span className="font-medium text-forest">{windows.length}</span> unavailable
                window{windows.length === 1 ? '' : 's'} this week.{' '}
              </>
            ) : (
              <>No travel days or unavailable times set. </>
            )}
            <button
              type="button"
              onClick={() => setWindowEditorOpen(true)}
              className="text-forest underline-offset-4 hover:underline cursor-pointer"
              style={{ fontFamily: '"DM Sans"', fontWeight: 500 }}
            >
              Edit
            </button>
          </p>
        </div>
      </section>
      )}

      {/* ─── Generated week view: day-grouped list (shared across sub-tabs) ─── */}
      <section className="space-y-4">
        {/* Single week-level empty hint, shown only when nothing is planned all week. */}
        {!loading && events.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-forest/20 bg-cream/40 px-5 py-6 text-center"
            style={{ fontFamily: '"DM Sans"' }}
          >
            <p className="text-forest" style={{ fontWeight: 600, fontSize: 15 }}>
              Your week is empty.
            </p>
            <p className="mt-1 text-forest/65" style={{ fontSize: 13 }}>
              Fill it any of four ways above: ask the assistant, start a program, build it by subject, or add from the library.
            </p>
          </div>
        )}
        {DAY_LABELS.map((label, idx) => {
          const date = addDays(weekStart, idx);
          const isToday = date === todayIso();
          const allOff = allOffByDay[idx];
          const momOutMin = momOutByDay[idx];
          const events = dayBuckets[idx];

          // Group events for this day by kid (and a "Together" bucket for
          // shared events). A "Together" event is one assigned to multiple
          // kids OR no kid at all (family-wide).
          const perKid = new Map<string, CalendarEvent[]>();
          const together: CalendarEvent[] = [];
          for (const ev of events) {
            if (ev.childIds.length !== 1) {
              together.push(ev);
              continue;
            }
            const kidId = ev.childIds[0];
            const list = perKid.get(kidId) ?? [];
            list.push(ev);
            perKid.set(kidId, list);
          }

          const monthLabel = new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
            month: 'long',
            timeZone: 'UTC',
          });
          const dayNum = new Date(`${date}T00:00:00Z`).getUTCDate();

          return (
            <article
              key={label}
              className={`rounded-2xl border bg-white ${
                isToday ? 'border-forest/40 ring-1 ring-forest/10' : 'border-forest/10'
              } ${allOff ? 'opacity-60' : ''}`}
            >
              {/* Day header */}
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-forest/10 px-5 py-3.5">
                <div className="flex items-baseline gap-2">
                  <p
                    className="text-forest"
                    style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 18 }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-forest/60"
                    style={{ fontFamily: '"DM Sans"', fontSize: 13 }}
                  >
                    {monthLabel} {dayNum}
                  </p>
                  {isToday && (
                    <span
                      className="ml-1 rounded-full px-2 py-0.5"
                      style={{
                        background: '#E6EBDF',
                        color: '#3A5A40',
                        fontFamily: '"DM Sans"',
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {allOff && (
                    <span
                      className="rounded-full px-2.5 py-1"
                      style={{
                        background: '#F2EFE4',
                        color: '#5A5240',
                        fontFamily: '"DM Sans"',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Day off
                    </span>
                  )}
                  {!allOff && momOutMin > 0 && (
                    <span
                      className="rounded-full px-2.5 py-1"
                      title="Parent unavailable - solo work scheduled"
                      style={{
                        background: '#F5E7D6',
                        color: '#7A5E1F',
                        fontFamily: '"DM Sans"',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      You&apos;re out · {Math.round(momOutMin / 60 * 10) / 10}h
                    </span>
                  )}
                  <span
                    className="text-forest/50"
                    style={{ fontFamily: '"DM Sans"', fontSize: 12 }}
                  >
                    {events.length === 0 ? 'Nothing planned' : `${events.length} planned`}
                  </span>
                </div>
              </header>

              {/* Day body */}
              {events.length === 0 ? (
                allOff ? null : (
                  <p
                    className="px-5 py-3 text-center"
                    style={{
                      fontFamily: '"DM Sans"',
                      fontSize: 12.5,
                      color: '#B8BBB2',
                    }}
                  >
                    Open
                  </p>
                )
              ) : (
                <div className="divide-y divide-forest/5">
                  {/* Per-kid sections */}
                  {children
                    .filter((kid) => perKid.has(kid.id))
                    .map((kid) => (
                      <KidDaySection
                        key={kid.id}
                        kid={kid}
                        events={perKid.get(kid.id) ?? []}
                        onComplete={handleComplete}
                        onSkip={handleSkip}
                      />
                    ))}
                  {/* Together / family-wide events */}
                  {together.length > 0 && (
                    <TogetherDaySection
                      kids={children}
                      events={together}
                      onComplete={handleComplete}
                      onSkip={handleSkip}
                    />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* ─── Last run summary ──────────────────────────────────────────── */}
      {lastResult && lastResult.notes.length > 0 && (
        <section
          className="rounded-xl border border-gold/30 bg-gold/5 p-4"
          style={{ fontFamily: '"DM Sans"' }}
        >
          <p
            className="text-xs uppercase text-forest/60"
            style={{ fontWeight: 600, letterSpacing: '.12em' }}
          >
            Planner notes
          </p>
          <ul className="mt-2 space-y-1 text-sm text-forest/80">
            {lastResult.notes.map((note, i) => (
              <li key={i}>· {note}</li>
            ))}
          </ul>
        </section>
      )}

      {windowEditorOpen && (
        <UnavailableEditor
          weekStart={weekStart}
          windows={windows}
          onClose={() => setWindowEditorOpen(false)}
          onChange={(next) => setWindows(next)}
        />
      )}

      {materialsOpen && (
        <MaterialsEditor
          materials={materials}
          kids={children}
          onClose={() => setMaterialsOpen(false)}
          onChange={(next) => setMaterials(next)}
        />
      )}

      {upgrade.open && (
        <UpgradePrompt reason={upgrade.reason} onClose={() => setUpgrade({ open: false, reason: '' })} />
      )}
    </div>
  );
}

// ─── Per-kid goal row ────────────────────────────────────────────────────────

function KidGoalRow({
  kid,
  kidGoals,
  onSetGoal,
}: {
  kid: Child;
  kidGoals: Record<string, number>;
  onSetGoal: (subjectId: string, count: number) => void;
}) {
  const totalGoals = Object.values(kidGoals).reduce((sum, n) => sum + n, 0);

  return (
    <div className="rounded-xl border border-forest/10 bg-cream/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChildAvatar child={kid} size={28} />
          <p
            className="text-sm text-forest"
            style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
          >
            {kid.name}
          </p>
        </div>
        <p
          className="text-xs text-forest/60"
          style={{ fontFamily: '"DM Sans"' }}
        >
          {totalGoals === 0 ? 'No goals set' : `${totalGoals} activities target`}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {STANDARD_SUBJECTS.map((subj) => (
          <GoalStepper
            key={subj.id}
            label={subj.label}
            color={subj.color}
            value={kidGoals[subj.id] ?? 0}
            onChange={(n) => onSetGoal(subj.id, n)}
          />
        ))}
      </div>
    </div>
  );
}

function GoalStepper({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border bg-white px-2.5 py-1.5"
      style={{
        borderColor: value > 0 ? color : 'rgba(88,129,87,.12)',
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            background: color,
            borderRadius: 999,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span
          className="truncate"
          style={{
            fontFamily: '"DM Sans"',
            fontSize: 12,
            color: '#3D5C3B',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <StepperButton
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          ariaLabel={`Decrease ${label}`}
        >
          −
        </StepperButton>
        <span
          className="w-4 text-center"
          style={{
            fontFamily: '"DM Sans"',
            fontSize: 13,
            fontWeight: 600,
            color: value > 0 ? color : '#9B9F94',
          }}
        >
          {value}
        </span>
        <StepperButton onClick={() => onChange(value + 1)} ariaLabel={`Increase ${label}`}>
          +
        </StepperButton>
      </div>
    </div>
  );
}

function StepperButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: '1px solid rgba(88,129,87,.18)',
        background: disabled ? 'transparent' : '#FAF9F6',
        color: disabled ? '#C5C8C0' : '#3D5C3B',
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: 15,
        lineHeight: 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ─── Kid day section + planned event row ────────────────────────────────────

function KidDaySection({
  kid,
  events,
  onComplete,
  onSkip,
}: {
  kid: Child;
  events: CalendarEvent[];
  onComplete: (e: CalendarEvent) => void;
  onSkip: (e: CalendarEvent) => void;
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <ChildAvatar child={kid} size={26} />
        <p
          className="text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 14 }}
        >
          {kid.name}
        </p>
        <span
          className="text-forest/50"
          style={{ fontFamily: '"DM Sans"', fontSize: 12 }}
        >
          · {events.length} activit{events.length === 1 ? 'y' : 'ies'}
        </span>
      </div>
      <ul className="space-y-2">
        {events.map((ev) => (
          <PlannedEventRow
            key={ev.id}
            event={ev}
            accentColor={kid.color}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        ))}
      </ul>
    </div>
  );
}

function TogetherDaySection({
  kids,
  events,
  onComplete,
  onSkip,
}: {
  kids: Child[];
  events: CalendarEvent[];
  onComplete: (e: CalendarEvent) => void;
  onSkip: (e: CalendarEvent) => void;
}) {
  return (
    <div className="bg-cream/40 px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex -space-x-1.5">
          {kids.slice(0, 4).map((k) => (
            <span
              key={k.id}
              style={{ border: '2px solid #FBFAF6', borderRadius: 999, display: 'inline-flex' }}
            >
              <ChildAvatar child={k} size={22} />
            </span>
          ))}
        </span>
        <p
          className="text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 14 }}
        >
          Together
        </p>
        <span
          className="text-forest/55"
          style={{ fontFamily: '"DM Sans"', fontSize: 12 }}
        >
          · {kids.length > 0 ? kids.map((k) => k.name).join(', ') : 'whole family'}
        </span>
      </div>
      <ul className="space-y-2">
        {events.map((ev) => (
          <PlannedEventRow
            key={ev.id}
            event={ev}
            accentColor="#588157"
            onComplete={onComplete}
            onSkip={onSkip}
          />
        ))}
      </ul>
    </div>
  );
}

function PlannedEventRow({
  event,
  accentColor,
  onComplete,
  onSkip,
}: {
  event: CalendarEvent;
  accentColor: string;
  onComplete: (e: CalendarEvent) => void;
  onSkip: (e: CalendarEvent) => void;
}) {
  const modeLabel: Record<typeof event.mode, string> = {
    independent: 'Independent',
    together: 'With you',
    either: 'Either',
  };
  const modeColor: Record<typeof event.mode, string> = {
    independent: '#7A5E1F',
    together: '#3A5A40',
    either: '#5A5240',
  };
  const modeBg: Record<typeof event.mode, string> = {
    independent: '#F5E7D6',
    together: '#E6EBDF',
    either: '#F2EFE4',
  };
  const duration = event.durationMinutes
    ? event.durationMinutes >= 60
      ? `~${Math.round(event.durationMinutes / 15) * 15 / 60}h`
      : `~${event.durationMinutes} min`
    : null;

  if (event.completed) {
    return (
      <li
        className="flex items-center gap-2 rounded-lg bg-forest/5 px-3 py-2"
        style={{ fontFamily: '"DM Sans"' }}
      >
        <span style={{ color: '#3A5A40', fontSize: 14 }} aria-hidden>
          ✓
        </span>
        <p
          className="line-through text-forest/55"
          style={{ fontSize: 13 }}
          title={event.title}
        >
          {event.title}
        </p>
      </li>
    );
  }

  return (
    <li
      className="rounded-xl border border-forest/10 bg-white"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: title + meta */}
        <div className="min-w-0 flex-1">
          <p
            className="text-forest"
            style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}
            title={event.title}
          >
            {event.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {event.customResourceId || event.type === 'custom' ? (
              <span
                className="rounded-full px-2.5 py-1"
                style={{
                  background: '#EDE7DA',
                  color: '#5A5240',
                  fontFamily: '"DM Sans"',
                  fontSize: 11,
                  fontWeight: 600,
                }}
                title="Your own curriculum"
              >
                Your material
              </span>
            ) : (
              event.category && <CategoryTag category={event.category} />
            )}
            <span
              className="rounded-full px-2.5 py-1"
              style={{
                background: modeBg[event.mode],
                color: modeColor[event.mode],
                fontFamily: '"DM Sans"',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {modeLabel[event.mode]}
            </span>
            {duration && (
              <span
                className="text-forest/55"
                style={{ fontFamily: '"DM Sans"', fontSize: 11.5, fontWeight: 500 }}
              >
                {duration}
              </span>
            )}
          </div>
          {event.notes && !event.notes.startsWith('Moved ') && (
            <p
              className="mt-1.5 text-forest/55"
              style={{ fontFamily: '"DM Sans"', fontSize: 12 }}
            >
              {event.notes.length > 120 ? `${event.notes.slice(0, 120)}...` : event.notes}
            </p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {event.productSlug && (
            <a
              href={`/api/download/activity/${event.productSlug}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 hover:opacity-90"
              style={{
                background: '#588157',
                color: '#FAF9F6',
                fontFamily: '"DM Sans"',
                fontSize: 12,
                fontWeight: 600,
              }}
              title="Open the activity in a new tab"
            >
              Open ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => onComplete(event)}
            className="rounded-md border border-forest/25 px-3 py-1.5 text-forest/85 hover:bg-forest/5 cursor-pointer"
            style={{ fontFamily: '"DM Sans"', fontSize: 12, fontWeight: 500 }}
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => onSkip(event)}
            className="rounded-md border border-forest/15 px-3 py-1.5 text-forest/60 hover:bg-cream cursor-pointer"
            style={{ fontFamily: '"DM Sans"', fontSize: 12, fontWeight: 500 }}
            title="Skip and reshuffle to another day this week"
          >
            Skip
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Unavailable windows editor (modal) ─────────────────────────────────────

function UnavailableEditor({
  weekStart,
  windows,
  onClose,
  onChange,
}: {
  weekStart: string;
  windows: UnavailableWindow[];
  onClose: () => void;
  onChange: (windows: UnavailableWindow[]) => void;
}) {
  const toast = useToast();
  const [draftDate, setDraftDate] = useState<string>(weekStart);
  const [draftStart, setDraftStart] = useState<string>('10:00');
  const [draftEnd, setDraftEnd] = useState<string>('11:00');
  const [draftKind, setDraftKind] = useState<UnavailableWindow['kind']>('mom-out');
  const [draftLabel, setDraftLabel] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const add = useCallback(async () => {
    setSaving(true);
    try {
      const created = await createUnavailableWindow({
        date: draftDate,
        startTime: draftStart,
        endTime: draftEnd,
        kind: draftKind,
        label: draftLabel || null,
      });
      onChange([...windows, created].sort((a, b) => a.date.localeCompare(b.date)));
      setDraftLabel('');
      toast.success('Window added.');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to add window');
    } finally {
      setSaving(false);
    }
  }, [draftDate, draftStart, draftEnd, draftKind, draftLabel, windows, onChange, toast]);

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteUnavailableWindow(id);
        onChange(windows.filter((w) => w.id !== id));
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove window');
      }
    },
    [windows, onChange, toast],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>When you&apos;re busy</Eyebrow>
        <h2
          className="mt-2 text-xl text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
        >
          Unavailable windows
        </h2>
        <p className="mt-1 text-sm text-forest/70" style={{ fontFamily: '"DM Sans"' }}>
          Mark times you can&apos;t supervise (calls, errands) or full days off (travel,
          sick). The planner uses these to place independent activities during gaps and
          skip days entirely when off.
        </p>

        <div className="mt-5 space-y-2">
          {windows.length === 0 ? (
            <p
              className="rounded-lg border border-dashed border-forest/15 px-3 py-3 text-center text-xs text-forest/50"
              style={{ fontFamily: '"DM Sans"' }}
            >
              None yet for this week.
            </p>
          ) : (
            windows.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg border border-forest/10 bg-white px-3 py-2"
              >
                <div>
                  <p
                    className="text-sm text-forest"
                    style={{ fontFamily: '"DM Sans"', fontWeight: 500 }}
                  >
                    {new Date(`${w.date}T00:00:00Z`).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}{' '}
                    · {w.startTime}-{w.endTime}
                    {w.label && <span className="text-forest/60"> · {w.label}</span>}
                  </p>
                  <p
                    className="text-[11px] text-forest/55"
                    style={{ fontFamily: '"DM Sans"' }}
                  >
                    {w.kind === 'mom-out'
                      ? 'Parent unavailable, schedule solo work'
                      : w.kind === 'all-off'
                      ? 'No schoolwork at all'
                      : 'Kids busy elsewhere'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(w.id)}
                  className="text-xs text-forest/50 hover:text-forest cursor-pointer"
                  style={{ fontFamily: '"DM Sans"' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div
          className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-forest/10 bg-white p-4"
          style={{ fontFamily: '"DM Sans"' }}
        >
          <label className="text-sm">
            <span className="text-forest/70">Date</span>
            <input
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="text-forest/70">Kind</span>
            <select
              value={draftKind}
              onChange={(e) => setDraftKind(e.target.value as UnavailableWindow['kind'])}
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            >
              <option value="mom-out">Parent out (kids OK alone)</option>
              <option value="all-off">All off (travel, sick, holiday)</option>
              <option value="co-op">Co-op / class</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-forest/70">Start</span>
            <input
              type="time"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="text-forest/70">End</span>
            <input
              type="time"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            />
          </label>
          <label className="col-span-2 text-sm">
            <span className="text-forest/70">Label (optional)</span>
            <input
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="Phone call, errands, co-op..."
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton onClick={add} disabled={saving}>
            {saving ? 'Adding...' : 'Add window'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── Programs: done-for-you skill paths ──────────────────────────────────────

function ProgramsShelf({
  kids,
  weekStart,
  onStarted,
  onNeedsUpgrade,
}: {
  kids: Child[];
  weekStart: string;
  onStarted: (startedWeek: string) => void | Promise<void>;
  onNeedsUpgrade: () => void;
}) {
  const [active, setActive] = useState<Program | null>(null);

  return (
    <section>
      <div className="mb-3">
        <Eyebrow>Done for you</Eyebrow>
        <h2
          className="mt-2 text-lg text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
        >
          Start a guided program
        </h2>
        <p className="mt-0.5 text-sm text-forest/65" style={{ fontFamily: '"DM Sans"' }}>
          Pick a path, pick your kid, pick a start date. The whole multi-week arc lands on your calendar. No setup.
        </p>
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {PROGRAMS.map((p) => {
          const tint = tintForCategory(p.category);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p)}
              className="text-left rounded-2xl border bg-white p-4 transition-shadow hover:shadow-md"
              style={{ borderColor: 'rgba(88,129,87,.14)', cursor: 'pointer' }}
            >
              <span
                className="inline-block rounded-full px-2.5 py-1"
                style={{
                  background: tint.bg,
                  color: tint.fg,
                  fontFamily: '"DM Sans"',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '.04em',
                }}
              >
                {p.weeks.length} weeks · {programActivityCount(p)} activities
              </span>
              <p
                className="mt-2 text-forest"
                style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}
              >
                {p.title}
              </p>
              <p
                className="mt-1 text-forest/65"
                style={{ fontFamily: '"DM Sans"', fontSize: 12.5, lineHeight: 1.4 }}
              >
                {p.tagline}
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-forest"
                style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 12.5 }}
              >
                Preview & start →
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <ProgramStartDialog
          program={active}
          kids={kids}
          defaultStart={weekStart}
          onClose={() => setActive(null)}
          onStarted={async (startedWeek) => {
            setActive(null);
            await onStarted(startedWeek);
          }}
          onNeedsUpgrade={() => {
            setActive(null);
            onNeedsUpgrade();
          }}
        />
      )}
    </section>
  );
}

function ProgramStartDialog({
  program,
  kids,
  defaultStart,
  onClose,
  onStarted,
  onNeedsUpgrade,
}: {
  program: Program;
  kids: Child[];
  defaultStart: string;
  onClose: () => void;
  onStarted: (startedWeek: string) => void | Promise<void>;
  onNeedsUpgrade: () => void;
}) {
  const toast = useToast();
  const tint = tintForCategory(program.category);
  const [selectedKids, setSelectedKids] = useState<string[]>(
    kids.length === 1 ? [kids[0].id] : [],
  );
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [starting, setStarting] = useState(false);

  const toggleKid = (id: string) =>
    setSelectedKids((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const start = useCallback(async () => {
    setStarting(true);
    try {
      const res = await startProgram({
        programId: program.id,
        childIds: selectedKids,
        startDate,
      });
      if (res.needsUpgrade) {
        onNeedsUpgrade();
        return;
      }
      toast.success(`${res.programTitle} added. ${res.created} activities across ${res.weeks} weeks.`);
      await onStarted(res.weekStart!);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Could not start program');
    } finally {
      setStarting(false);
    }
  }, [program.id, selectedKids, startDate, toast, onStarted, onNeedsUpgrade]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="inline-block rounded-full px-2.5 py-1"
          style={{
            background: tint.bg,
            color: tint.fg,
            fontFamily: '"DM Sans"',
            fontSize: 10.5,
            fontWeight: 600,
          }}
        >
          {program.weeks.length}-week program · ages {program.ageRange}
        </span>
        <h2
          className="mt-2 text-2xl text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600, lineHeight: 1.1 }}
        >
          {program.title}
        </h2>
        <p className="mt-1 text-sm text-forest/75" style={{ fontFamily: '"DM Sans"' }}>
          {program.outcome}
        </p>

        {/* Week-by-week preview */}
        <ol className="mt-4 space-y-1.5">
          {program.weeks.map((w) => {
            const names = w.activitySlugs
              .map((s) => ENRICHED_BY_SLUG[s]?.product.name ?? s)
              .join(' + ');
            return (
              <li
                key={w.week}
                className="flex gap-3 rounded-lg border border-forest/10 bg-white px-3 py-2"
              >
                <span
                  className="grid place-items-center shrink-0"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: tint.bg,
                    color: tint.fg,
                    fontFamily: '"DM Sans"',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {w.week}
                </span>
                <div className="min-w-0">
                  <p
                    className="text-forest"
                    style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 13 }}
                  >
                    {w.theme}
                  </p>
                  <p
                    className="text-forest/55 truncate"
                    style={{ fontFamily: '"DM Sans"', fontSize: 11.5 }}
                  >
                    {names}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Who + when */}
        <div className="mt-5" style={{ fontFamily: '"DM Sans"' }}>
          {kids.length > 0 ? (
            <>
              <p className="text-sm text-forest/70">Who&apos;s doing it?</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {kids.map((k) => {
                  const on = selectedKids.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => toggleKid(k.id)}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: on ? `${k.color}1A` : '#FFFFFF',
                        border: `1px solid ${on ? k.color : '#E5E0D2'}`,
                        color: on ? k.color : '#4F5A50',
                      }}
                    >
                      <ChildAvatar child={k} size={18} />
                      {k.name}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-forest/55">
              Tip: add kids in Family setup to tag the program to a specific child.
            </p>
          )}

          <label className="mt-3 block text-sm">
            <span className="text-forest/70">Start the week of</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={start} disabled={starting}>
            {starting ? 'Adding...' : 'Add to my calendar'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── My Materials editor (parent's own curriculum) ──────────────────────────

const DAY_PICKER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function MaterialsEditor({
  materials,
  kids,
  onClose,
  onChange,
}: {
  materials: CustomResource[];
  kids: Child[];
  onClose: () => void;
  onChange: (materials: CustomResource[]) => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cadence, setCadence] = useState<'flexible' | 'fixed'>('flexible');
  const [timesPerWeek, setTimesPerWeek] = useState(4);
  const [fixedDays, setFixedDays] = useState<number[]>([]);
  const [mode, setMode] = useState<'independent' | 'together' | 'either'>('either');
  const [childIds, setChildIds] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const reset = () => {
    setTitle('');
    setSubjects([]);
    setCadence('flexible');
    setTimesPerWeek(4);
    setFixedDays([]);
    setMode('either');
    setChildIds([]);
    setMinutes('');
  };

  const add = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Give it a name first.');
      return;
    }
    if (subjects.length === 0) {
      toast.error('Pick at least one subject so it counts toward goals.');
      return;
    }
    if (cadence === 'fixed' && fixedDays.length === 0) {
      toast.error('Pick which days, or switch to "a few times a week".');
      return;
    }
    setSaving(true);
    try {
      const created = await createCustomResource({
        title: title.trim(),
        subjects,
        childIds,
        mode,
        durationMinutes: minutes ? Number(minutes) : null,
        cadence,
        timesPerWeek: cadence === 'flexible' ? timesPerWeek : null,
        fixedDays: cadence === 'fixed' ? fixedDays : [],
      });
      onChange([...materials, created]);
      reset();
      toast.success('Material added. It will show up next time you generate.');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Could not add material');
    } finally {
      setSaving(false);
    }
  }, [title, subjects, childIds, mode, minutes, cadence, timesPerWeek, fixedDays, materials, onChange, toast]);

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteCustomResource(id);
        onChange(materials.filter((m) => m.id !== id));
      } catch (err) {
        console.error(err);
        toast.error('Could not remove material');
      }
    },
    [materials, onChange, toast],
  );

  const cadenceSummary = (m: CustomResource) =>
    m.cadence === 'fixed'
      ? m.fixedDays.length > 0
        ? m.fixedDays.map((d) => DAY_PICKER[d]).join(', ')
        : 'No days set'
      : `${m.timesPerWeek ?? 0}x / week`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>Your own curriculum</Eyebrow>
        <h2
          className="mt-2 text-xl text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
        >
          My materials
        </h2>
        <p className="mt-1 text-sm text-forest/70" style={{ fontFamily: '"DM Sans"' }}>
          Add anything you already use: Singapore Math, Story of the World, piano, a co-op.
          The planner schedules these first, then fills the rest of each week&apos;s goals
          with Anywhere Learning activities.
        </p>

        {/* Existing materials */}
        <div className="mt-5 space-y-2">
          {materials.length === 0 ? (
            <p
              className="rounded-lg border border-dashed border-forest/15 px-3 py-3 text-center text-xs text-forest/50"
              style={{ fontFamily: '"DM Sans"' }}
            >
              Nothing added yet.
            </p>
          ) : (
            materials.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-forest/10 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p
                    className="text-sm text-forest truncate"
                    style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
                  >
                    {m.title}
                  </p>
                  <p
                    className="text-[11px] text-forest/55"
                    style={{ fontFamily: '"DM Sans"' }}
                  >
                    {m.subjects
                      .map((s) => STANDARD_SUBJECTS.find((x) => x.id === s)?.label ?? s)
                      .join(', ')}
                    {' · '}
                    {cadenceSummary(m)}
                    {m.mode === 'independent' ? ' · solo' : m.mode === 'together' ? ' · with you' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="shrink-0 text-xs text-forest/50 hover:text-forest cursor-pointer"
                  style={{ fontFamily: '"DM Sans"' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <div
          className="mt-5 rounded-xl border border-forest/10 bg-white p-4"
          style={{ fontFamily: '"DM Sans"' }}
        >
          <label className="block text-sm">
            <span className="text-forest/70">What is it?</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Singapore Math 3A"
              className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
              maxLength={80}
            />
          </label>

          <div className="mt-3 text-sm">
            <span className="text-forest/70">Counts toward</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STANDARD_SUBJECTS.map((s) => {
                const on = subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubjects((arr) => toggle(arr, s.id))}
                    className="rounded-full px-2.5 py-1"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: on ? `${s.color}22` : '#FFFFFF',
                      border: `1px solid ${on ? s.color : '#E5E0D2'}`,
                      color: on ? s.color : '#4F5A50',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-sm">
            <span className="text-forest/70">How often?</span>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setCadence('flexible')}
                className="flex-1 rounded-md px-2 py-1.5"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: cadence === 'flexible' ? '#E6EBDF' : '#FFFFFF',
                  border: `1px solid ${cadence === 'flexible' ? '#588157' : '#E5E0D2'}`,
                  color: '#3A5A40',
                }}
              >
                A few times a week
              </button>
              <button
                type="button"
                onClick={() => setCadence('fixed')}
                className="flex-1 rounded-md px-2 py-1.5"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: cadence === 'fixed' ? '#E6EBDF' : '#FFFFFF',
                  border: `1px solid ${cadence === 'fixed' ? '#588157' : '#E5E0D2'}`,
                  color: '#3A5A40',
                }}
              >
                Specific days
              </button>
            </div>

            {cadence === 'flexible' ? (
              <div className="mt-2 flex items-center gap-2">
                <span style={{ fontSize: 13, color: '#4F5A50' }}>Times per week:</span>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={timesPerWeek}
                  onChange={(e) => setTimesPerWeek(Math.max(1, Math.min(7, Number(e.target.value) || 1)))}
                  className="w-16 rounded-md border border-forest/15 px-2 py-1"
                />
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DAY_PICKER.map((d, i) => {
                  const on = fixedDays.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFixedDays((arr) => toggle(arr, i))}
                      className="rounded-md px-2.5 py-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: on ? '#E6EBDF' : '#FFFFFF',
                        border: `1px solid ${on ? '#588157' : '#E5E0D2'}`,
                        color: '#3A5A40',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <label>
              <span className="text-forest/70">Who runs it?</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
              >
                <option value="either">Either way</option>
                <option value="independent">Kid solo</option>
                <option value="together">With you</option>
              </select>
            </label>
            <label>
              <span className="text-forest/70">Minutes (optional)</span>
              <input
                type="number"
                min={5}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="30"
                className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
              />
            </label>
          </div>

          {kids.length >= 2 && (
            <div className="mt-3 text-sm">
              <span className="text-forest/70">For which kids?</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setChildIds([])}
                  className="rounded-full px-2.5 py-1"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: childIds.length === 0 ? '#E6EBDF' : '#FFFFFF',
                    border: `1px solid ${childIds.length === 0 ? '#588157' : '#E5E0D2'}`,
                    color: '#3A5A40',
                  }}
                >
                  All kids
                </button>
                {kids.map((k) => {
                  const on = childIds.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setChildIds((arr) => toggle(arr, k.id))}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: on ? `${k.color}1A` : '#FFFFFF',
                        border: `1px solid ${on ? k.color : '#E5E0D2'}`,
                        color: on ? k.color : '#4F5A50',
                      }}
                    >
                      <ChildAvatar child={k} size={18} />
                      {k.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <PrimaryButton onClick={add} disabled={saving}>
              {saving ? 'Adding...' : 'Add material'}
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <GhostButton onClick={onClose}>Done</GhostButton>
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade prompt (skill-building framed, not "unlock the planner") ────────

function UpgradePrompt({ reason, onClose }: { reason: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-cream p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>Members build skills every week</Eyebrow>
        <h2
          className="mt-3 text-2xl text-forest"
          style={{ fontFamily: '"DM Sans"', fontWeight: 600, lineHeight: 1.15 }}
        >
          Let us build the week for you
        </h2>
        <p className="mt-2 text-sm text-forest/75" style={{ fontFamily: '"DM Sans"', lineHeight: 1.55 }}>
          Members get the system that turns real-world skills into a weekly habit: guided skill
          programs, the AI that plans your week, your own curriculum woven in, and a record of
          everything your kid learns. You were trying to {reason}, which is a member feature.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href="/join"
            className="rounded-full px-5 py-2.5 hover:opacity-90"
            style={{
              background: '#588157',
              color: '#FAF9F6',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Become a member
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-forest/60 hover:text-forest cursor-pointer"
            style={{ fontFamily: '"DM Sans"', fontSize: 13 }}
          >
            Keep looking around
          </button>
        </div>
        <p className="mt-3 text-xs text-forest/55" style={{ fontFamily: '"DM Sans"' }}>
          You can still browse the library and build a week by hand for free.
        </p>
      </div>
    </div>
  );
}

// Quiet unused import to satisfy linters in environments that strip TS types
void resolveSubject;
