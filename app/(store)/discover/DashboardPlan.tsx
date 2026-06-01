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
  ALIcons,
  ALTokens,
  CategoryTag,
  ChildAvatar,
  Dot,
  Eyebrow,
  GhostButton,
  PrimaryButton,
  Stepper,
  accentForSubject,
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
        <div style={{ display: 'inline-flex' }}>
          <Eyebrow>Plan the week</Eyebrow>
        </div>
        <h1
          className="mt-4"
          style={{
            fontFamily: ALTokens.font,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '-0.02em',
            color: ALTokens.color.ink,
            margin: '14px 0 8px',
          }}
        >
          Add a kid first
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: ALTokens.font,
            color: ALTokens.color.muted,
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          The planner builds the week around each kid&apos;s goals. Add one or more kids in
          Family Setup, then come back here.
        </p>
        <div className="mt-6 flex justify-center">
          <PrimaryButton onClick={onOpenFamilySetup}>Set up family</PrimaryButton>
        </div>
      </div>
    );
  }

  // Sub-tab icon mapping for the segmented control.
  const SUB_TABS = [
    { key: 'ai' as const,      label: 'AI Assist',        Icon: ALIcons.Chat },
    { key: 'program' as const, label: 'Guided Program',   Icon: ALIcons.Path },
    { key: 'manual' as const,  label: 'Build it yourself',Icon: ALIcons.Sliders },
    { key: 'library' as const, label: 'Library',          Icon: ALIcons.Grid },
  ];

  const isThisWeek = weekStart === isoMonday(todayIso());

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ─── Editorial week header: eyebrow + DM Sans h1 + nav ──────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div style={{ maxWidth: '40em' }}>
          <div style={{ display: 'inline-flex' }}>
            <Eyebrow>Plan the week</Eyebrow>
          </div>
          <h1
            className="mt-3"
            style={{
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: '-0.02em',
              color: ALTokens.color.ink,
              margin: '12px 0 8px',
              lineHeight: 1.08,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatRange(weekStart)}
          </h1>
          <p
            style={{
              fontFamily: ALTokens.font,
              fontSize: 15,
              color: ALTokens.color.muted,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Set the goals. The planner places activities. Skip what gets blown up and it
            reshuffles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GhostButton
            small
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            style={{ padding: '9px 14px' }}
          >
            <ALIcons.Arrow
              size={14}
              color={ALTokens.color.forest}
              style={{ transform: 'rotate(180deg)' }}
            />
            Last week
          </GhostButton>
          <GhostButton
            small
            active={isThisWeek}
            onClick={() => setWeekStart(isoMonday(todayIso()))}
            style={{ padding: '9px 14px' }}
          >
            This week
          </GhostButton>
          <GhostButton
            small
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            style={{ padding: '9px 14px' }}
          >
            Next week
            <ALIcons.Arrow size={14} color={ALTokens.color.forest} />
          </GhostButton>
        </div>
      </header>

      {/* ─── Sub-tab segmented control: icon + label, forest fill when active ─── */}
      <div
        className="al-subtabs"
        style={{
          display: 'flex',
          gap: 4,
          padding: 5,
          background: ALTokens.color.sand,
          borderRadius: ALTokens.radius.lg,
          border: `1px solid ${ALTokens.color.line}`,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {SUB_TABS.map((s) => {
          const on = subTab === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSubTab(s.key)}
              aria-current={on ? 'page' : undefined}
              className="al-subtab-btn"
              style={{
                flex: '1 1 0%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 14px',
                borderRadius: ALTokens.radius.md,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: ALTokens.font,
                fontSize: 14,
                fontWeight: on ? 700 : 500,
                color: on ? ALTokens.color.cream : ALTokens.color.muted,
                background: on ? ALTokens.color.forest : 'transparent',
                border: `1px solid ${on ? ALTokens.color.forest : 'transparent'}`,
                boxShadow: on ? ALTokens.shadow.xs : 'none',
                transition: `all 160ms ${ALTokens.ease}`,
              }}
            >
              <s.Icon
                size={17}
                color={on ? ALTokens.color.cream : ALTokens.color.muted}
              />
              <span className="al-subtab-label">{s.label}</span>
            </button>
          );
        })}
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

      {/* ─── Build it yourself: editorial planner sheet ─────────────────── */}
      {subTab === 'manual' && (
        <BuildItYourselfPanel
          kidsToShow={kidsToShow}
          goals={goals}
          materials={materials}
          windows={windows}
          generating={generating}
          loading={loading}
          onOpenMaterials={() => setMaterialsOpen(true)}
          onOpenWindows={() => setWindowEditorOpen(true)}
          onGenerate={runPlanner}
          onSetGoal={setGoal}
        />
      )}

      {/* ─── Shared week view: hairline divider + day cards ─────────────── */}
      <div
        aria-hidden
        style={{
          height: 1,
          background: ALTokens.color.line,
          marginTop: 8,
          marginBottom: 4,
        }}
      />
      <section className="space-y-4">
        {/* "Your week" eyebrow + count band */}
        <div className="flex flex-wrap items-end justify-between gap-3" style={{ marginBottom: 4 }}>
          <div>
            <div style={{ display: 'inline-flex' }}>
              <Eyebrow>Your week</Eyebrow>
            </div>
            <h2
              style={{
                fontFamily: ALTokens.font,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: '-0.01em',
                color: ALTokens.color.ink,
                margin: '10px 0 0',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {events.length === 0
                ? 'Nothing planned yet'
                : `${events.length} ${events.length === 1 ? 'activity' : 'activities'} placed`}
            </h2>
          </div>
        </div>

        {/* Empty-week message: reframes a blank week as a good thing. */}
        {!loading && events.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              background: ALTokens.color.sand,
              borderRadius: ALTokens.radius.lg,
              border: `1px dashed ${ALTokens.color.line}`,
              fontFamily: ALTokens.font,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                margin: '0 auto 14px',
                borderRadius: '50%',
                background: 'rgba(88,129,87,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ALIcons.Leaf size={24} color={ALTokens.color.forest} />
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: ALTokens.color.forestInk,
                margin: '0 0 6px',
              }}
            >
              A blank week is a good thing.
            </p>
            <p
              style={{
                fontSize: 14,
                color: ALTokens.color.muted,
                margin: '0 auto',
                maxWidth: 380,
                lineHeight: 1.55,
              }}
            >
              Fill it any of the four ways above, or leave room to follow what the day brings.
              Both count.
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
            month: 'short',
            timeZone: 'UTC',
          });
          const dayNum = new Date(`${date}T00:00:00Z`).getUTCDate();

          return (
            <article
              key={label}
              style={{
                background: ALTokens.color.paper,
                borderRadius: ALTokens.radius.lg,
                border: `1px solid ${isToday ? 'rgba(88,129,87,0.32)' : ALTokens.color.line}`,
                boxShadow: isToday ? ALTokens.shadow.xs : 'none',
                opacity: allOff ? 0.65 : 1,
                overflow: 'hidden',
                transition: `all 180ms ${ALTokens.ease}`,
              }}
            >
              {/* Day header */}
              <header
                className="flex flex-wrap items-baseline justify-between gap-3"
                style={{
                  borderBottom: `1px solid ${ALTokens.color.lineSoft}`,
                  padding: '14px 20px',
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    style={{
                      fontFamily: ALTokens.font,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '.10em',
                      textTransform: 'uppercase',
                      color: isToday ? ALTokens.color.forest : ALTokens.color.forestInk,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: ALTokens.font,
                      fontSize: 13,
                      color: ALTokens.color.muted,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    · {monthLabel} {dayNum}
                  </span>
                  {isToday && (
                    <span
                      className="ml-1"
                      style={{
                        background: 'rgba(212,163,115,0.18)',
                        color: ALTokens.color.goldDark,
                        fontFamily: ALTokens.font,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: '.10em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: ALTokens.radius.pill,
                      }}
                    >
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {allOff && (
                    <span
                      style={{
                        background: ALTokens.color.sand,
                        color: ALTokens.color.body,
                        fontFamily: ALTokens.font,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: ALTokens.radius.pill,
                      }}
                    >
                      Day off
                    </span>
                  )}
                  {!allOff && momOutMin > 0 && (
                    <span
                      title="Parent unavailable. Solo work scheduled."
                      style={{
                        background: 'rgba(212,163,115,0.18)',
                        color: ALTokens.color.goldDark,
                        fontFamily: ALTokens.font,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: ALTokens.radius.pill,
                      }}
                    >
                      You&apos;re out · {Math.round((momOutMin / 60) * 10) / 10}h
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: ALTokens.font,
                      fontSize: 12,
                      color: ALTokens.color.faint,
                    }}
                  >
                    {events.length === 0 ? 'Nothing planned' : `${events.length} planned`}
                  </span>
                </div>
              </header>

              {/* Day body */}
              {events.length === 0 ? (
                allOff ? null : (
                  <p
                    style={{
                      fontFamily: ALTokens.font,
                      fontSize: 12.5,
                      color: ALTokens.color.faint,
                      padding: '14px 20px',
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    Open
                  </p>
                )
              ) : (
                <div style={{ borderTop: `1px solid ${ALTokens.color.lineSoft}` }}>
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
          style={{
            borderRadius: ALTokens.radius.md,
            border: `1px solid rgba(212,163,115,0.32)`,
            background: 'rgba(212,163,115,0.07)',
            padding: '14px 18px',
            fontFamily: ALTokens.font,
          }}
        >
          <div style={{ display: 'inline-flex' }}>
            <Eyebrow>Planner notes</Eyebrow>
          </div>
          <ul
            style={{
              margin: '10px 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 14,
              color: ALTokens.color.body,
              lineHeight: 1.5,
            }}
          >
            {lastResult.notes.map((note, i) => (
              <li key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: ALTokens.color.gold }} aria-hidden>·</span>
                <span>{note}</span>
              </li>
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

// ─── Build-it-yourself panel ────────────────────────────────────────────────
//
// Editorial hero panel: linear-gradient on cream-to-sand, 4px river spine,
// eyebrow + Sliders icon header, the live "sessions planned" counter top
// right, per-kid avatar tile, per-subject stepper rows that tint in the
// subject's accent color as you add, "Custom Add" pill, unavailable
// windows line, and a prominent Generate primary CTA.

function BuildItYourselfPanel({
  kidsToShow,
  goals,
  materials,
  windows,
  generating,
  loading,
  onOpenMaterials,
  onOpenWindows,
  onGenerate,
  onSetGoal,
}: {
  kidsToShow: Child[];
  goals: WeeklyGoals;
  materials: CustomResource[];
  windows: UnavailableWindow[];
  generating: boolean;
  loading: boolean;
  onOpenMaterials: () => void;
  onOpenWindows: () => void;
  onGenerate: () => void;
  onSetGoal: (childId: string, subjectId: string, count: number) => void;
}) {
  // Live counter: sum of all goals across the kids in view.
  const totalSessions = useMemo(() => {
    let n = 0;
    for (const kid of kidsToShow) {
      const kg = goals[kid.id] ?? {};
      for (const v of Object.values(kg)) n += v;
    }
    return n;
  }, [goals, kidsToShow]);

  const accent = ALTokens.color.river;
  const canGenerate = totalSessions > 0 && !generating && !loading;

  return (
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(166deg, #fffdf9 0%, #f6f1e7 100%)',
        borderRadius: ALTokens.radius.xl,
        border: `1px solid ${ALTokens.color.line}`,
        padding: 'clamp(20px, 4vw, 32px)',
        boxShadow: ALTokens.shadow.sm,
        overflow: 'hidden',
      }}
    >
      {/* 4px accent rule along the top edge */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accent,
          opacity: 0.85,
        }}
      />

      {/* Header: eyebrow + Sliders icon, live counter aligned right */}
      <div
        className="flex flex-wrap items-start justify-between"
        style={{ gap: 16 }}
      >
        <div style={{ maxWidth: '32em' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: ALTokens.radius.sm,
                background: `${accent}22`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ALIcons.Sliders size={18} color={accent} />
            </span>
            <Eyebrow color={accent}>Build it yourself</Eyebrow>
          </div>
          <h3
            style={{
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '-0.015em',
              color: ALTokens.color.ink,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Set the rhythm. We place the activities.
          </h3>
          <p
            style={{
              fontFamily: ALTokens.font,
              fontSize: 15,
              color: ALTokens.color.body,
              lineHeight: 1.55,
              margin: '10px 0 0',
              maxWidth: '34em',
            }}
          >
            How many of each subject this week, per kid? The planner fills these with real
            Anywhere Learning activities.
          </p>
        </div>
        <div
          style={{ textAlign: 'right', flexShrink: 0, minWidth: 130 }}
        >
          <div
            style={{
              fontFamily: ALTokens.font,
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1,
              color: ALTokens.color.forest,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {totalSessions}
          </div>
          <div
            style={{
              fontFamily: ALTokens.font,
              fontSize: 12,
              color: ALTokens.color.muted,
              marginTop: 4,
              letterSpacing: '.04em',
            }}
          >
            sessions planned
          </div>
        </div>
      </div>

      {/* Per-kid goal blocks */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {kidsToShow.map((kid) => (
          <KidGoalRow
            key={kid.id}
            kid={kid}
            kidGoals={goals[kid.id] ?? {}}
            onSetGoal={(subjectId, count) => onSetGoal(kid.id, subjectId, count)}
          />
        ))}
      </div>

      {/* Action footer: Custom Add pill + unavailable line + Generate CTA */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: `1px solid ${ALTokens.color.lineSoft}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onOpenMaterials}
            className="cursor-pointer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              borderRadius: ALTokens.radius.pill,
              background: ALTokens.color.paper,
              border: `1px solid ${ALTokens.color.line}`,
              color: ALTokens.color.forest,
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: `all 160ms ${ALTokens.ease}`,
            }}
          >
            <ALIcons.Plus size={14} color={ALTokens.color.forest} />
            Custom Add
          </button>
          <p
            style={{
              fontFamily: ALTokens.font,
              fontSize: 13,
              color: ALTokens.color.muted,
              margin: 0,
              maxWidth: 360,
              lineHeight: 1.5,
            }}
          >
            {materials.length > 0
              ? `${materials.length} of your own material${materials.length === 1 ? '' : 's'} in the mix. Singapore Math, piano, co-op.`
              : 'Add your own curriculum, lessons, or co-op so the planner schedules them too.'}
          </p>
        </div>
        <PrimaryButton onClick={onGenerate} disabled={!canGenerate}>
          {generating ? 'Generating...' : 'Generate week plan'}
          {!generating && <ALIcons.Arrow size={15} color={ALTokens.color.cream} />}
        </PrimaryButton>
      </div>

      {/* Unavailable windows line, secondary */}
      <p
        style={{
          marginTop: 14,
          fontFamily: ALTokens.font,
          fontSize: 12.5,
          color: ALTokens.color.muted,
          lineHeight: 1.5,
        }}
      >
        {windows.length > 0 ? (
          <>
            <span style={{ fontWeight: 600, color: ALTokens.color.forestInk }}>
              {windows.length}
            </span>{' '}
            unavailable window{windows.length === 1 ? '' : 's'} this week.{' '}
          </>
        ) : (
          <>No travel days or unavailable times set. </>
        )}
        <button
          type="button"
          onClick={onOpenWindows}
          className="cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: ALTokens.color.forest,
            fontFamily: ALTokens.font,
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Edit
        </button>
      </p>
    </section>
  );
}

// ─── Per-kid goal row (Almanac restyle) ─────────────────────────────────────
//
// One block per kid: avatar tile + name + total, then per-subject rows that
// tint their border in the subject accent when the count is > 0. The
// shared Stepper primitive handles the -/+ control.

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
    <div>
      <div
        className="flex items-center"
        style={{ gap: 10, marginBottom: 12 }}
      >
        <ChildAvatar child={kid} size={32} />
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 15,
            fontWeight: 700,
            color: ALTokens.color.ink,
          }}
        >
          {kid.name}
        </span>
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 12.5,
            color: ALTokens.color.muted,
          }}
        >
          ·{' '}
          {totalGoals === 0
            ? 'no goals set'
            : `${totalGoals} session${totalGoals === 1 ? '' : 's'}`}
        </span>
      </div>
      <div
        className="al-goal-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {STANDARD_SUBJECTS.map((subj) => (
          <GoalStepperRow
            key={subj.id}
            label={subj.label}
            accent={accentForSubject(subj.id)}
            value={kidGoals[subj.id] ?? 0}
            onChange={(n) => onSetGoal(subj.id, n)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Single stepper row inside the goal grid. Border tints to the subject
 * accent (with 33% opacity) when value > 0. Uses the shared `Stepper`
 * primitive.
 */
function GoalStepperRow({
  label,
  accent,
  value,
  onChange,
}: {
  label: string;
  accent: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const active = value > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '11px 14px',
        background: ALTokens.color.paper,
        border: `1px solid ${active ? `${accent}55` : ALTokens.color.line}`,
        borderRadius: ALTokens.radius.md,
        transition: `border-color 180ms ${ALTokens.ease}`,
      }}
    >
      <span
        className="truncate"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: ALTokens.font,
          fontSize: 14.5,
          fontWeight: 500,
          color: ALTokens.color.ink,
          minWidth: 0,
        }}
      >
        <Dot color={accent} />
        <span className="truncate">{label}</span>
      </span>
      <Stepper
        value={value}
        onChange={onChange}
        accent={accent}
        ariaLabel={`${label} sessions`}
      />
    </div>
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
    <div style={{ padding: '14px 20px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <ChildAvatar child={kid} size={24} />
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 13,
            fontWeight: 700,
            color: ALTokens.color.forestInk,
            letterSpacing: '.02em',
          }}
        >
          {kid.name}
        </span>
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 12,
            color: ALTokens.color.muted,
          }}
        >
          · {events.length} activit{events.length === 1 ? 'y' : 'ies'}
        </span>
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
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
    <div
      style={{
        background: ALTokens.color.sand,
        padding: '14px 20px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ display: 'inline-flex' }}>
          {kids.slice(0, 4).map((k, i) => (
            <span
              key={k.id}
              style={{
                marginLeft: i === 0 ? 0 : -6,
                border: `2px solid ${ALTokens.color.sand}`,
                borderRadius: 999,
                display: 'inline-flex',
              }}
            >
              <ChildAvatar child={k} size={22} />
            </span>
          ))}
        </span>
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 13,
            fontWeight: 700,
            color: ALTokens.color.forestInk,
          }}
        >
          Together
        </span>
        <span
          style={{
            fontFamily: ALTokens.font,
            fontSize: 12,
            color: ALTokens.color.muted,
          }}
        >
          · {kids.length > 0 ? kids.map((k) => k.name).join(', ') : 'whole family'}
        </span>
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {events.map((ev) => (
          <PlannedEventRow
            key={ev.id}
            event={ev}
            accentColor={ALTokens.color.forest}
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
    independent: ALTokens.color.goldDark,
    together: ALTokens.color.forestInk,
    either: ALTokens.color.body,
  };
  const modeBg: Record<typeof event.mode, string> = {
    independent: 'rgba(212,163,115,0.18)',
    together: 'rgba(88,129,87,0.10)',
    either: ALTokens.color.sand,
  };
  const duration = event.durationMinutes
    ? event.durationMinutes >= 60
      ? `~${(Math.round(event.durationMinutes / 15) * 15) / 60}h`
      : `~${event.durationMinutes} min`
    : null;

  if (event.completed) {
    return (
      <li
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(88,129,87,0.06)',
          borderRadius: ALTokens.radius.sm,
          fontFamily: ALTokens.font,
        }}
      >
        <ALIcons.Check size={14} color={ALTokens.color.forest} />
        <span
          title={event.title}
          style={{
            fontSize: 13,
            color: ALTokens.color.muted,
            textDecoration: 'line-through',
          }}
        >
          {event.title}
        </span>
      </li>
    );
  }

  return (
    <li
      style={{
        background: ALTokens.color.cream,
        border: `1px solid ${ALTokens.color.lineSoft}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: ALTokens.radius.md,
      }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between"
        style={{ gap: 12, padding: 14 }}
      >
        {/* Left: title + meta */}
        <div className="min-w-0 flex-1">
          <p
            title={event.title}
            style={{
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.3,
              color: ALTokens.color.ink,
              margin: 0,
            }}
          >
            {event.title}
          </p>
          <div
            className="flex flex-wrap items-center"
            style={{ marginTop: 8, gap: 7 }}
          >
            {event.customResourceId || event.type === 'custom' ? (
              <span
                title="Your own curriculum"
                style={{
                  background: ALTokens.color.sand,
                  color: ALTokens.color.body,
                  fontFamily: ALTokens.font,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: ALTokens.radius.pill,
                }}
              >
                Your material
              </span>
            ) : (
              event.category && <CategoryTag category={event.category} />
            )}
            <span
              style={{
                background: modeBg[event.mode],
                color: modeColor[event.mode],
                fontFamily: ALTokens.font,
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: ALTokens.radius.pill,
              }}
            >
              {modeLabel[event.mode]}
            </span>
            {duration && (
              <span
                style={{
                  fontFamily: ALTokens.font,
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: ALTokens.color.muted,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {duration}
              </span>
            )}
          </div>
          {event.notes && !event.notes.startsWith('Moved ') && (
            <p
              style={{
                marginTop: 8,
                fontFamily: ALTokens.font,
                fontSize: 12,
                color: ALTokens.color.muted,
                lineHeight: 1.5,
              }}
            >
              {event.notes.length > 120 ? `${event.notes.slice(0, 120)}...` : event.notes}
            </p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center" style={{ gap: 6 }}>
          {event.productSlug && (
            <a
              href={`/api/download/activity/${event.productSlug}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open the activity in a new tab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: ALTokens.color.forest,
                color: ALTokens.color.cream,
                fontFamily: ALTokens.font,
                fontSize: 12.5,
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: ALTokens.radius.sm,
                textDecoration: 'none',
                transition: `all 160ms ${ALTokens.ease}`,
              }}
            >
              Open
              <ALIcons.Arrow size={12} color={ALTokens.color.cream} />
            </a>
          )}
          <button
            type="button"
            onClick={() => onComplete(event)}
            className="cursor-pointer"
            style={{
              background: 'transparent',
              border: `1px solid ${ALTokens.color.line}`,
              color: ALTokens.color.forest,
              fontFamily: ALTokens.font,
              fontSize: 12.5,
              fontWeight: 600,
              padding: '7px 12px',
              borderRadius: ALTokens.radius.sm,
              cursor: 'pointer',
              transition: `all 160ms ${ALTokens.ease}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ALIcons.Check size={12} color={ALTokens.color.forest} />
            Done
          </button>
          <button
            type="button"
            onClick={() => onSkip(event)}
            title="Skip and reshuffle to another day this week"
            className="cursor-pointer"
            style={{
              background: 'transparent',
              border: `1px solid ${ALTokens.color.lineSoft}`,
              color: ALTokens.color.muted,
              fontFamily: ALTokens.font,
              fontSize: 12.5,
              fontWeight: 500,
              padding: '7px 12px',
              borderRadius: ALTokens.radius.sm,
              cursor: 'pointer',
              transition: `all 160ms ${ALTokens.ease}`,
            }}
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
