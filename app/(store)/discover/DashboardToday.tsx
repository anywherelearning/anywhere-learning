'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { STANDARD_SUBJECTS, defaultSubjectsForCategory } from '@/lib/taxonomy';
import {
  ENRICHED_ACTIVITIES,
  PREP_LABEL,
  SETTING_LABEL,
  type Setting,
  type PrepLevel,
  type EnrichedActivity,
} from '@/lib/activity-metadata';
import {
  rankActivities,
  topByVariety,
  computeMonthlyCoverage,
  findCoverageGaps,
  kidsToAgeRange,
  type RecommenderFilters,
  type ScoredActivity,
} from '@/lib/recommender';
import {
  SERIF,
  ALIcons,
  ALTokens,
  AL_SUBJECT_ACCENT,
  accentForSubject,
  Dot,
  Eyebrow,
  CategoryTag,
  PrimaryButton,
  GhostButton,
  HelpHint,
  tintForCategory,
  resolveSubject,
} from './dashboard-shared';
import LogEntryEditor from './LogEntryEditor';
import CalendarEventEditor from './CalendarEventEditor';
import { useToast } from './Toast';
import {
  fetchLogEntries,
  fetchCustomSubjects,
  createLogEntry,
  createCalendarEvent,
  deleteLogEntry,
  updateLogEntry,
} from './dashboard-api';
import type { LogEntry, CustomSubject, Child } from './dashboard-types';

interface DashboardTodayProps {
  /**
   * Jump to a sibling tab. The optional `subTab` lets Today deep-link into the
   * Plan tab's library / AI assist / program / manual sub-view in one click.
   * Only consumed when `tab === 'plan'`.
   */
  onJumpToTab: (
    tab: 'log' | 'calendar' | 'plan',
    subTab?: 'ai' | 'program' | 'manual' | 'library',
  ) => void;
  children: Child[];
  /**
   * Currently-focused kid id, or null for the "All kids" / family-wide view.
   * Owned by the parent page so the focus persists across tab switches.
   */
  focusedKidId: string | null;
  onChildrenChange: (c: Child[]) => void;
  onOpenFamilySetup: () => void;
  initialLoaded: boolean;
}

const ONBOARDING_DISMISS_KEY = 'al-dashboard-onboarding-dismissed';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatLongDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function timeBasedGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Filter pill ─────────────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  const accent = color || ALTokens.color.forest;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: active ? accent : ALTokens.color.paper,
        border: `1px solid ${active ? accent : ALTokens.color.line}`,
        color: active ? '#fff' : ALTokens.color.body,
        fontFamily: ALTokens.font,
        fontWeight: active ? 600 : 500,
        fontSize: 12.5,
        padding: '7px 12px',
        borderRadius: ALTokens.radius.pill,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        transition: `all 150ms ${ALTokens.ease}`,
      }}
    >
      {color && <Dot color={active ? '#fff' : accent} size={7} />}
      {children}
    </button>
  );
}

// ─── Coverage widget ─────────────────────────────────────────────────────────

function CoverageStripe({
  coverage,
  customSubjects: _customSubjects,
}: {
  coverage: Record<string, number>;
  customSubjects: CustomSubject[];
}) {
  const total = Object.values(coverage).reduce((sum, n) => sum + n, 0);
  const max = Math.max(1, ...Object.values(coverage));
  return (
    <div
      style={{
        background: ALTokens.color.sand,
        border: `1px solid ${ALTokens.color.line}`,
        borderRadius: ALTokens.radius.lg,
        padding: '18px 20px',
      }}
    >
      <Eyebrow>Field notes</Eyebrow>
      <div className="flex items-baseline justify-between mt-2 mb-4">
        <h3
          style={{
            margin: 0,
            fontFamily: ALTokens.font,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.015em',
            color: ALTokens.color.ink,
          }}
        >
          Coverage this month
          <HelpHint title="Coverage at a glance">
            Counts of logged entries per standard subject this month. Used to surface
            gap-fill suggestions below.
          </HelpHint>
        </h3>
        <span
          style={{
            fontSize: 12,
            color: ALTokens.color.muted,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {total} {total === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="grid gap-2">
        {STANDARD_SUBJECTS.map((s) => {
          const count = coverage[s.id] ?? 0;
          const width = Math.max(2, (count / max) * 100);
          const accent = AL_SUBJECT_ACCENT[s.id] || s.color;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2"
                style={{
                  width: 110,
                  fontSize: 12,
                  color: count === 0 ? ALTokens.color.faint : ALTokens.color.body,
                  fontWeight: 600,
                  fontFamily: ALTokens.font,
                  justifyContent: 'flex-end',
                }}
              >
                {s.label}
                <Dot color={count === 0 ? ALTokens.color.faint : accent} size={7} />
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: ALTokens.color.sandDeep,
                  borderRadius: ALTokens.radius.pill,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: count === 0 ? 0 : `${width}%`,
                    height: '100%',
                    background: accent,
                    opacity: count === 0 ? 0 : 0.9,
                    transition: `width 300ms ${ALTokens.ease}`,
                    borderRadius: ALTokens.radius.pill,
                  }}
                />
              </div>
              <span
                style={{
                  width: 22,
                  fontSize: 13,
                  fontFamily: ALTokens.font,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: count === 0 ? ALTokens.color.faint : ALTokens.color.ink,
                  textAlign: 'right',
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compact activity card (for suggestion strips) ───────────────────────────

function MiniActivityCard({
  scored,
  onMarkDone,
  onAddToCalendar,
  showReason = true,
}: {
  scored: ScoredActivity;
  onMarkDone: (slug: string) => void;
  onAddToCalendar: (slug: string) => void;
  showReason?: boolean;
}) {
  const { activity, reasons } = scored;
  const tint = tintForCategory(activity.product.category);
  return (
    <div
      style={{
        background: ALTokens.color.paper,
        border: `1px solid ${ALTokens.color.line}`,
        borderLeft: `3px solid ${tint.dot}`,
        borderRadius: ALTokens.radius.lg,
        boxShadow: ALTokens.shadow.xs,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: `box-shadow 180ms ${ALTokens.ease}`,
      }}
    >
      <div
        className="relative"
        style={{
          aspectRatio: '4/3',
          background: tint.bg,
          borderBottom: `1px solid ${ALTokens.color.lineSoft}`,
          overflow: 'hidden',
        }}
      >
        {activity.product.imageUrl && (
          <Image
            src={activity.product.imageUrl}
            alt={activity.product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
      <div
        className="flex flex-col gap-2 grow"
        style={{ padding: '14px 16px 14px' }}
      >
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: ALTokens.font,
            fontWeight: 700,
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: tint.dot,
          }}
        >
          <Dot color={tint.dot} size={6} />
          {(activity.product.category && CATEGORIES.find((c) => c.value === activity.product.category)?.label) || 'Activity'}
        </span>
        <h3
          style={{
            margin: 0,
            fontFamily: ALTokens.font,
            fontWeight: 700,
            fontSize: 15.5,
            lineHeight: 1.25,
            letterSpacing: '-0.012em',
            color: ALTokens.color.ink,
          }}
        >
          {activity.product.name}
        </h3>
        {showReason && reasons.length > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: ALTokens.color.body,
              lineHeight: 1.45,
            }}
          >
            {reasons[0]}
          </p>
        )}
        <div
          className="flex items-center justify-between mt-auto pt-1"
          style={{ fontFamily: ALTokens.font, fontSize: 11.5, color: ALTokens.color.muted }}
        >
          <span>{activity.product.ageRange ?? 'All ages'}</span>
          <a
            href={`/api/download/activity/${activity.product.slug}?view=1`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: ALTokens.color.forest,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Open <ALIcons.Arrow size={12} color={ALTokens.color.forest} />
          </a>
        </div>
        <div className="flex gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onMarkDone(activity.product.slug)}
            style={{
              flex: 1,
              appearance: 'none',
              cursor: 'pointer',
              background: 'rgba(88,129,87,0.08)',
              color: ALTokens.color.forestInk,
              border: `1px solid ${ALTokens.color.line}`,
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontSize: 12,
              padding: '7px 8px',
              borderRadius: ALTokens.radius.sm,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: `background 150ms ${ALTokens.ease}`,
            }}
          >
            <ALIcons.Check size={13} color={ALTokens.color.forest} />
            Mark done
          </button>
          <button
            type="button"
            onClick={() => onAddToCalendar(activity.product.slug)}
            style={{
              flex: 1,
              appearance: 'none',
              cursor: 'pointer',
              background: ALTokens.color.paper,
              color: ALTokens.color.body,
              border: `1px solid ${ALTokens.color.line}`,
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontSize: 12,
              padding: '7px 8px',
              borderRadius: ALTokens.radius.sm,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: `background 150ms ${ALTokens.ease}`,
            }}
          >
            <ALIcons.Cal size={13} color={ALTokens.color.body} />
            Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const SETTING_OPTIONS: Array<{ value: Setting | 'any'; label: string }> = [
  { value: 'any', label: 'Anywhere' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'indoor', label: 'Indoor' },
];

const PREP_OPTIONS: Array<{ value: PrepLevel | 'any'; label: string }> = [
  { value: 'any', label: 'Any prep' },
  { value: 'none', label: 'No prep' },
  { value: 'minimal', label: 'Quick prep' },
  { value: 'planned', label: 'Plan ahead' },
];

export default function DashboardToday({
  onJumpToTab,
  children: kids,
  focusedKidId,
  onChildrenChange: _onChildrenChange,
  onOpenFamilySetup,
  initialLoaded,
}: DashboardTodayProps) {
  const now = useMemo(() => new Date(), []);
  const todayISO = now.toISOString().slice(0, 10);

  // Resolve the focused kid object (or null for All Kids).
  // Used to tailor the greeting, narrow recommender inputs, and pre-tag log entries.
  const focusedKid = useMemo(
    () => (focusedKidId ? kids.find((k) => k.id === focusedKidId) ?? null : null),
    [focusedKidId, kids]
  );

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedSetting, setSelectedSetting] = useState<Setting | 'any'>('any');
  const [selectedPrep, setSelectedPrep] = useState<PrepLevel | 'any'>('any');
  const [hideRecent, setHideRecent] = useState(true);
  const [showAllFilters, setShowAllFilters] = useState(false);
  // The whole filter block is collapsed by default so the top pick is the first
  // thing the eye lands on. Users open "Refine picks" only when they want to tune.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Recommendation cycling
  const [pickIndex, setPickIndex] = useState(0);

  // Data
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [customSubjects, setCustomSubjects] = useState<CustomSubject[]>([]);
  const [completedThisYear, setCompletedThisYear] = useState(0);
  // True once THIS component has fetched its own logs. Gates the onboarding
  // card so it never flashes for returning users while logs are still loading.
  const [dataLoaded, setDataLoaded] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);
  const toast = useToast();

  // Modals
  const [logEditorOpen, setLogEditorOpen] = useState(false);
  const [logEditorDefaults, setLogEditorDefaults] = useState<Partial<LogEntry> | null>(null);
  const [calEditorOpen, setCalEditorOpen] = useState(false);
  const [calEditorDefaults, setCalEditorDefaults] = useState<Partial<{
    date: string; title: string; type: string; productSlug: string | null; category: string | null;
    childIds: string[]; childNames: string[];
  }> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWelcomeDismissed(window.localStorage.getItem(ONBOARDING_DISMISS_KEY) === '1');
  }, []);

  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    try {
      window.localStorage.setItem(ONBOARDING_DISMISS_KEY, '1');
    } catch {}
  };

  // Fetch data
  useEffect(() => {
    const yearStart = `${now.getFullYear()}-01-01`;
    fetchLogEntries({ from: yearStart, to: todayISO })
      .then((entries) => {
        setLogs(entries);
        setCompletedThisYear(entries.length);
      })
      .catch(console.error)
      .finally(() => setDataLoaded(true));
    fetchCustomSubjects().then(setCustomSubjects).catch(console.error);
  }, [now, todayISO]);

  // Build recommender inputs. When a single kid is focused we narrow
  // BOTH the kids list (so the age range tightens to just them) AND
  // the logs (so freshness + gap analysis reflect THIS kid's history,
  // not the whole family's). Without that double-filter, focusing on
  // a kid would still see the family's combined coverage gaps.
  const scopedKids = useMemo(
    () => (focusedKid ? [focusedKid] : kids),
    [focusedKid, kids]
  );

  const scopedLogs = useMemo(
    () =>
      focusedKid
        ? logs.filter((l) => l.childIds.includes(focusedKid.id))
        : logs,
    [focusedKid, logs]
  );

  const logSummaries = useMemo(
    () =>
      scopedLogs.map((l) => ({
        productSlug: l.productSlug,
        date: l.date,
        subjects: l.subjects,
      })),
    [scopedLogs]
  );

  const filters: RecommenderFilters = useMemo(
    () => ({
      categories: selectedCategories,
      subjects: selectedSubjects,
      setting: selectedSetting,
      prep: selectedPrep,
      ageRange: null, // recommender will auto-derive from scopedKids
      hideRecentDays: hideRecent ? 7 : 0,
    }),
    [selectedCategories, selectedSubjects, selectedSetting, selectedPrep, hideRecent]
  );

  const ranked: ScoredActivity[] = useMemo(
    () =>
      rankActivities({
        filters,
        kids: scopedKids.map((k) => ({ id: k.id, name: k.name, birthYear: k.birthYear })),
        logs: logSummaries,
        now,
      }),
    [filters, scopedKids, logSummaries, now]
  );

  const coverage = useMemo(() => computeMonthlyCoverage(logSummaries, now), [logSummaries, now]);
  const gaps = useMemo(() => findCoverageGaps(coverage), [coverage]);
  const autoAgeRange = useMemo(() => kidsToAgeRange(scopedKids, now), [scopedKids, now]);

  // Family Activity mode: no specific kid is focused and there are 2+ kids.
  // The goal is ONE thing the whole family can do together, not a per-kid pick.
  const familyMode = !focusedKid && kids.length >= 2;

  // Re-rank for whole-family fit: prefer activities whose age range spans every
  // kid, and that are done together (or flexible) rather than solo.
  const familyRanked = useMemo(() => {
    if (!familyMode) return ranked;
    const ages = kids
      .map((k) => (k.birthYear ? now.getFullYear() - k.birthYear : null))
      .filter((a): a is number => a !== null);
    if (ages.length === 0) return ranked;
    const youngest = Math.min(...ages);
    const oldest = Math.max(...ages);

    return [...ranked]
      .map((s, idx) => {
        const a = s.activity;
        let bonus = 0;
        // Covers the whole age span (a small slack on each end).
        const covers = a.ageMin <= youngest + 1 && a.ageMax >= oldest - 1;
        bonus += covers ? 100 : -40;
        // Family activities are done together.
        if (a.independence === 'together') bonus += 30;
        else if (a.independence === 'either') bonus += 10;
        else bonus -= 25; // solo work is a poor "family activity"
        // Keep the original recommender order as a gentle tiebreaker.
        return { s, score: bonus - idx * 0.1 };
      })
      .sort((x, y) => y.score - x.score)
      .map((o) => o.s);
  }, [familyMode, ranked, kids, now]);

  const displayRanked = familyMode ? familyRanked : ranked;

  // Reset pickIndex when filters or mode change
  useEffect(() => {
    setPickIndex(0);
  }, [filters, familyMode]);

  const recommendation: ScoredActivity | null = displayRanked[pickIndex] || displayRanked[0] || null;

  const cycleRecommendation = useCallback(() => {
    if (displayRanked.length <= 1) return;
    setPickIndex((i) => (i + 1) % displayRanked.length);
  }, [displayRanked.length]);

  // Alternate strips
  const alternates = useMemo(() => {
    if (!recommendation) return [];
    const exclude = new Set([recommendation.activity.product.slug]);
    return topByVariety(
      ranked.filter((s) => !exclude.has(s.activity.product.slug)),
      3
    );
  }, [ranked, recommendation]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSubjects(new Set());
    setSelectedSetting('any');
    setSelectedPrep('any');
    setHideRecent(true);
  };

  /**
   * One-tap quick log: skips the modal and creates an entry with sensible
   * defaults (today's date, focused kid auto-tagged when present, subjects
   * derived from category). Shows a toast with Edit + Undo so users can
   * fix it if needed.
   */
  const handleQuickLog = async (slug: string, kidOverride?: Child | null) => {
    const product = ENRICHED_ACTIVITIES.find((a) => a.product.slug === slug);
    if (!product) return;
    // Auto-tag the kid when there's an unambiguous choice: an explicit
    // per-kid card override, the focused kid, OR the only kid set up.
    const autoKid = kidOverride ?? focusedKid ?? (kids.length === 1 ? kids[0] : null);
    const defaultChildIds = autoKid ? [autoKid.id] : [];
    const defaultChildNames = autoKid ? [autoKid.name] : [];
    const subjects = product.subjects.length
      ? product.subjects
      : defaultSubjectsForCategory(product.product.category);
    try {
      const created = await createLogEntry({
        date: todayISO,
        title: product.product.name,
        type: 'activity',
        productSlug: product.product.slug,
        category: product.product.category,
        subjects,
        childIds: defaultChildIds,
        childNames: defaultChildNames,
        photos: [],
        notes: null,
        durationMinutes: null,
      });
      setLogs((prev) => [created, ...prev]);
      setCompletedThisYear((c) => c + 1);
      toast.undoable({
        title: 'Logged',
        description: product.product.name,
        onUndo: async () => {
          try {
            await deleteLogEntry(created.id);
            setLogs((prev) => prev.filter((l) => l.id !== created.id));
            setCompletedThisYear((c) => Math.max(0, c - 1));
            toast.success('Removed');
          } catch {
            toast.error('Undo failed');
          }
        },
      });
    } catch {
      toast.error('Could not log entry');
    }
  };

  /**
   * Open the full editor pre-filled with this product. Used by the
   * "Edit details" action when one-tap defaults aren't enough.
   * Pre-tags the focused kid (if any) so the user doesn't repeat themselves.
   */
  const handleMarkDoneWithDetails = (slug: string) => {
    const product = ENRICHED_ACTIVITIES.find((a) => a.product.slug === slug);
    if (!product) return;
    const autoKid = focusedKid ?? (kids.length === 1 ? kids[0] : null);
    setLogEditorDefaults({
      date: todayISO,
      title: product.product.name,
      type: 'activity',
      productSlug: product.product.slug,
      category: product.product.category,
      subjects: product.subjects.length
        ? product.subjects
        : defaultSubjectsForCategory(product.product.category),
      childIds: autoKid ? [autoKid.id] : [],
      childNames: autoKid ? [autoKid.name] : [],
    });
    setLogEditorOpen(true);
  };

  // Backwards compatible alias used by MiniActivityCard cards
  const handleMarkDone = handleQuickLog;

  const handleAddToCalendar = (slug: string, kidOverride?: Child | null) => {
    const product = ENRICHED_ACTIVITIES.find((a) => a.product.slug === slug);
    if (!product) return;
    const autoKid = kidOverride ?? focusedKid ?? (kids.length === 1 ? kids[0] : null);
    setCalEditorDefaults({
      date: todayISO,
      title: product.product.name,
      type: 'activity',
      productSlug: product.product.slug,
      category: product.product.category,
      childIds: autoKid ? [autoKid.id] : [],
      childNames: autoKid ? [autoKid.name] : [],
    });
    setCalEditorOpen(true);
  };

  const handleSaveLog = async (
    data: Omit<LogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = await createLogEntry(data);
    setLogs((prev) => [created, ...prev]);
    setCompletedThisYear((c) => c + 1);
  };

  const handleSaveCalendarEvent = async (data: {
    date: string; title: string; type: string;
    category: string | null; productSlug: string | null; notes: string | null;
  }) => {
    await createCalendarEvent(data);
    toast.success('Added to calendar');
  };

  // Header counts
  const totalActivities = ENRICHED_ACTIVITIES.length;
  const matchCount = ranked.length;
  const hasFilters =
    selectedCategories.size > 0 ||
    selectedSubjects.size > 0 ||
    selectedSetting !== 'any' ||
    selectedPrep !== 'any';
  // Count of active narrowing filters, shown on the "Refine picks" toggle so
  // users can tell at a glance that something is filtering their picks.
  const activeFilterCount =
    selectedCategories.size +
    selectedSubjects.size +
    (selectedSetting !== 'any' ? 1 : 0) +
    (selectedPrep !== 'any' ? 1 : 0);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Scoped responsive rules for the top-pick hero. Kept inline (rather than
          in dashboard.css) so this component stays self-contained: single column
          on phones, two columns only from the sm breakpoint up (640px). */}
      <style>{`
        .dashboard-root .today-pick-grid { grid-template-columns: 1fr; }
        .dashboard-root .today-pick-grid .recommendation-image { aspect-ratio: 4/3 !important; }
        @media (min-width: 640px) {
          .dashboard-root .today-pick-grid { grid-template-columns: 1fr 220px !important; }
          .dashboard-root .today-pick-grid .recommendation-image { aspect-ratio: 4/5 !important; }
        }
      `}</style>
      {/* Onboarding welcome card. Auto-hides once the family has any history,
          so it stops dominating first paint for returning users. Manual
          dismiss still works for brand-new families with no logs yet. */}
      {initialLoaded && dataLoaded && !welcomeDismissed && logs.length === 0 && completedThisYear === 0 && (
        <section
          className="mb-8"
          style={{
            background: ALTokens.color.paper,
            border: `1px solid ${ALTokens.color.line}`,
            borderTop: `4px solid ${ALTokens.color.gold}`,
            borderRadius: ALTokens.radius.lg,
            padding: '24px 26px',
            position: 'relative',
            boxShadow: ALTokens.shadow.xs,
          }}
        >
          <button
            type="button"
            onClick={dismissWelcome}
            aria-label="Dismiss welcome"
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: ALTokens.color.muted,
              padding: 6,
              borderRadius: ALTokens.radius.sm,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ALIcons.X size={16} color={ALTokens.color.muted} />
          </button>
          <Eyebrow>Welcome to your almanac</Eyebrow>
          <h2
            style={{
              margin: '12px 0 8px',
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: ALTokens.color.ink,
            }}
          >
            Here is how to use this.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15.5,
              color: ALTokens.color.body,
              lineHeight: 1.6,
              maxWidth: 640,
            }}
          >
            Four pages, one job each. <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>Today</strong> helps you decide what to do.{' '}
            <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>Plan</strong> shapes the week ahead.{' '}
            <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>Activity Log</strong> records what you have already done.{' '}
            <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>Calendar</strong> is the long view.
          </p>
          <div
            className="grid gap-3 mt-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {[
              { n: '1', title: 'Set up your kids', body: 'Add each kid once. Then you can tag who did what with a single click.', action: 'Add your kids', onClick: onOpenFamilySetup },
              { n: '2', title: 'Pick an activity', body: 'Filter by age, subject, or category. The picker shows why it chose each one.' },
              { n: '3', title: 'Log everything', body: 'Books, lessons, field trips, anything counts. Tag subjects for your annual review. Export anytime.' },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  background: ALTokens.color.sand,
                  border: `1px solid ${ALTokens.color.lineSoft}`,
                  borderRadius: ALTokens.radius.md,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontFamily: ALTokens.font,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: ALTokens.color.goldDark,
                    marginBottom: 6,
                  }}
                >
                  {step.n} · {step.title}
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: ALTokens.color.body, lineHeight: 1.55 }}>
                  {step.body}
                </p>
                {step.action && (
                  <button
                    type="button"
                    onClick={step.onClick}
                    style={{
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      color: ALTokens.color.forest,
                      fontFamily: ALTokens.font,
                      fontWeight: 600,
                      fontSize: 13,
                      padding: '8px 0 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {step.action}
                    <ALIcons.Arrow size={13} color={ALTokens.color.forest} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Editorial header — paper page on cream field. Eyebrow with date, h1
          greeting, supporting line, then the family-log link as a hairline
          chip. Hairline forest divider at the bottom separates this from the
          smart-picker hero. */}
      <section className="pb-8 mb-8" style={{ borderBottom: `1px solid ${ALTokens.color.line}` }}>
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div className="flex-1 min-w-0">
            <Eyebrow>Today · {formatLongDate(now)}</Eyebrow>
            <h1
              className="dashboard-greeting"
              style={{
                margin: '14px 0 0',
                fontFamily: ALTokens.font,
                fontWeight: 700,
                fontSize: 44,
                lineHeight: 1.05,
                color: ALTokens.color.ink,
                letterSpacing: '-0.02em',
              }}
            >
              {focusedKid
                ? `What's for ${focusedKid.name} today?`
                : familyMode
                ? 'What can the whole family do today?'
                : `${timeBasedGreeting(now)}, friend.`}
            </h1>
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 15.5,
                color: ALTokens.color.body,
                maxWidth: 620,
                lineHeight: 1.6,
              }}
            >
              {focusedKid
                ? autoAgeRange
                  ? `Showing activities tuned to ${focusedKid.name}, age ${autoAgeRange.min === autoAgeRange.max ? autoAgeRange.min : `${autoAgeRange.min}-${autoAgeRange.max}`}. The picker draws on ${focusedKid.name}'s history alone.`
                  : `Showing activities and coverage just for ${focusedKid.name}.`
                : familyMode
                ? 'Finding one activity everyone can do together. Tap a kid above to focus on just them instead.'
                : autoAgeRange
                ? `Showing activities tuned to ages ${autoAgeRange.min} to ${autoAgeRange.max}. Refine below to narrow further.`
                : 'Pick something to do today, plan ahead, or log what you have already done.'}
            </p>
            <button
              type="button"
              onClick={() => onJumpToTab('log')}
              className="inline-flex items-center gap-3 mt-5"
              style={{
                background: ALTokens.color.paper,
                border: `1px solid ${ALTokens.color.line}`,
                borderRadius: ALTokens.radius.pill,
                padding: '8px 16px 8px 8px',
                cursor: 'pointer',
                transition: `border-color 150ms ${ALTokens.ease}`,
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(212,163,115,0.18)',
                  color: ALTokens.color.goldDark,
                  fontFamily: ALTokens.font,
                  fontWeight: 700,
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {completedThisYear}
              </span>
              <span style={{ fontSize: 13.5, color: ALTokens.color.body, fontFamily: ALTokens.font }}>
                Your family has logged{' '}
                <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>
                  {completedThisYear} {completedThisYear === 1 ? 'activity' : 'activities'}
                </strong>{' '}
                this year
              </span>
              <ALIcons.Arrow size={13} color={ALTokens.color.forest} />
            </button>
          </div>
        </div>
      </section>

      {/* "No kids yet" nudge — non-dismissible because it's the prerequisite
          for per-kid views, age-aware recommendations, and properly tagged
          log entries. Hidden as soon as the user adds at least one. */}
      {initialLoaded && kids.length === 0 && (
        <div
          className="mb-6 flex items-start gap-3"
          style={{
            background: ALTokens.color.paper,
            border: `1px solid ${ALTokens.color.line}`,
            borderLeft: `4px solid ${ALTokens.color.forest}`,
            borderRadius: ALTokens.radius.md,
            padding: '14px 18px',
          }}
        >
          <ALIcons.Leaf size={20} color={ALTokens.color.forest} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, color: ALTokens.color.ink, lineHeight: 1.5 }}>
              <strong style={{ fontWeight: 700 }}>Add your kids first.</strong> Recommendations get tuned to their actual ages, and you can tag who did what with one click.
            </div>
            <button
              type="button"
              onClick={onOpenFamilySetup}
              style={{
                marginTop: 8,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: ALTokens.color.forest,
                fontFamily: ALTokens.font,
                fontWeight: 600,
                fontSize: 13,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              Set up your family
              <ALIcons.Arrow size={13} color={ALTokens.color.forest} />
            </button>
          </div>
        </div>
      )}

      {/* Smart picker hero — paper page, no card-on-gray. Eyebrow + h1 sit at
          the top; the recommendation sits below with a subject-accent left
          spine. */}
      <div
        className="mb-8"
        style={{
          background: ALTokens.color.paper,
          border: `1px solid ${ALTokens.color.line}`,
          borderRadius: ALTokens.radius.xl,
          boxShadow: ALTokens.shadow.sm,
          padding: 'clamp(20px, 3.5vw, 32px)',
        }}
      >
        <div className="flex justify-between items-start mb-5 flex-wrap gap-2">
          <div>
            <Eyebrow>The picker</Eyebrow>
            <h2
              style={{
                margin: '8px 0 0',
                fontFamily: ALTokens.font,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: '-0.02em',
                color: ALTokens.color.ink,
                lineHeight: 1.1,
              }}
            >
              What should we do?
              <HelpHint title="How this picks">
                Considers your kids&apos; ages, what you have already logged this month, which
                subjects are under-covered, and any filters you set. Each pick explains why.
              </HelpHint>
            </h2>
          </div>
          <span
            style={{
              fontSize: 12,
              color: ALTokens.color.muted,
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              marginTop: 8,
            }}
          >
            {matchCount} of {totalActivities} match
          </span>
        </div>

        {/* Primary recommendation. In Family Activity mode it's one thing the
            whole family can do together (age-spanning + together-friendly).
            When a kid is focused, it's tuned to that kid. */}
        {recommendation ? (
          (() => {
            const spineColor =
              recommendation.activity.subjects.length > 0
                ? accentForSubject(recommendation.activity.subjects[0])
                : tintForCategory(recommendation.activity.product.category).dot;
            return (
              <div
                className="recommendation-card today-pick-grid"
                style={{
                  background: ALTokens.color.sand,
                  border: `1px solid ${ALTokens.color.lineSoft}`,
                  borderLeft: `4px solid ${spineColor}`,
                  borderRadius: ALTokens.radius.lg,
                  padding: '4px 4px 4px 22px',
                  display: 'grid',
                  // Single column by default (mobile-first); the scoped style block
                  // below promotes it to "1fr 220px" only at the sm+ breakpoint (640px)
                  // so it never squeezes on small phones.
                  gridTemplateColumns: '1fr',
                  gap: 18,
                  alignItems: 'center',
                }}
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <Eyebrow>{familyMode ? 'Family activity for today' : 'Top pick for today'}</Eyebrow>
                  <h3
                    style={{
                      margin: '10px 0 0',
                      fontFamily: ALTokens.font,
                      fontWeight: 700,
                      fontSize: 24,
                      lineHeight: 1.15,
                      letterSpacing: '-0.018em',
                      color: ALTokens.color.ink,
                      textWrap: 'balance',
                    }}
                  >
                    {recommendation.activity.product.name}
                  </h3>
                  {recommendation.reasons.length > 0 && (
                    <p
                      style={{
                        margin: '8px 0 10px',
                        fontSize: 13,
                        color: ALTokens.color.forestInk,
                        lineHeight: 1.55,
                        fontWeight: 500,
                      }}
                    >
                      Why this: {recommendation.reasons.join(' · ')}
                    </p>
                  )}
                  <p
                    style={{
                      margin: '4px 0 12px',
                      fontSize: 14,
                      color: ALTokens.color.body,
                      lineHeight: 1.55,
                      maxWidth: 520,
                    }}
                  >
                    {recommendation.activity.product.shortDescription}
                  </p>
                  <div className="flex gap-2 items-center mb-4 flex-wrap">
                    <CategoryTag category={recommendation.activity.product.category} />
                    <span style={{ fontSize: 12.5, color: ALTokens.color.muted }}>
                      {recommendation.activity.product.ageRange} · {SETTING_LABEL[recommendation.activity.setting]} · {PREP_LABEL[recommendation.activity.prepLevel]}
                    </span>
                  </div>
                  {/* Primary actions: one clear next step (open the activity) plus
                      one secondary (plan it for this week). "Mark done" lives in
                      the demoted secondary row because logging happens AFTER the
                      activity, not as a peer to opening it. */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <a
                      href={`/api/download/activity/${recommendation.activity.product.slug}?view=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <PrimaryButton>
                        Open this activity
                        <ALIcons.Arrow size={15} color={ALTokens.color.cream} />
                      </PrimaryButton>
                    </a>
                    <GhostButton onClick={() => handleAddToCalendar(recommendation.activity.product.slug)}>
                      <ALIcons.Cal size={14} color={ALTokens.color.forest} />
                      Plan it
                    </GhostButton>
                  </div>
                  {/* Demoted secondary actions: smaller, lighter text links so they
                      read as "more ways to use this" rather than competing CTAs. */}
                  <div
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3"
                    style={{ fontFamily: ALTokens.font }}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuickLog(recommendation.activity.product.slug)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        color: ALTokens.color.muted,
                        fontWeight: 600,
                        fontSize: 12,
                        padding: '2px 0',
                      }}
                    >
                      Mark done
                    </button>
                    {ranked.length > 1 && (
                      <button
                        type="button"
                        onClick={cycleRecommendation}
                        style={{
                          background: 'transparent',
                          border: 0,
                          cursor: 'pointer',
                          color: ALTokens.color.muted,
                          fontWeight: 600,
                          fontSize: 12,
                          padding: '2px 0',
                        }}
                      >
                        Try another ({pickIndex + 1}/{ranked.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleMarkDoneWithDetails(recommendation.activity.product.slug)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        color: ALTokens.color.muted,
                        fontWeight: 600,
                        fontSize: 12,
                        padding: '2px 0',
                      }}
                    >
                      Log with details
                    </button>
                  </div>
                </div>
                <div
                  className="relative overflow-hidden recommendation-image"
                  style={{
                    background: tintForCategory(recommendation.activity.product.category).bg,
                    border: `1px solid ${ALTokens.color.lineSoft}`,
                    // aspect-ratio is set by the scoped style block above so it can
                    // switch between mobile (4/3) and sm+ (4/5) at the right breakpoint.
                    borderRadius: ALTokens.radius.md,
                  }}
                >
                  {recommendation.activity.product.imageUrl && (
                    <Image
                      src={recommendation.activity.product.imageUrl}
                      alt={recommendation.activity.product.name}
                      fill
                      sizes="220px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div
            style={{
              background: ALTokens.color.sand,
              border: `1px dashed ${ALTokens.color.line}`,
              borderRadius: ALTokens.radius.md,
              padding: '24px 20px',
              textAlign: 'center',
              color: ALTokens.color.muted,
              fontSize: 14,
              fontFamily: ALTokens.font,
            }}
          >
            No activities match these filters yet.{' '}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: ALTokens.color.forest,
                  fontFamily: ALTokens.font,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Clear them
              </button>
            )}
          </div>
        )}

        {/* Refine picks. Collapsed by default and placed BELOW the top pick so
            the recommendation reads first. The chrome only appears when a user
            chooses to tune their picks. */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${ALTokens.color.line}`, paddingTop: 18 }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: ALTokens.color.forest,
                fontFamily: ALTokens.font,
                fontWeight: 600,
                fontSize: 13,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ALIcons.Sliders size={15} color={ALTokens.color.forest} />
              Refine picks
              <ALIcons.Chevron
                size={13}
                color={ALTokens.color.forest}
                style={{
                  transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: `transform 180ms ${ALTokens.ease}`,
                }}
              />
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: ALTokens.color.forest,
                    color: ALTokens.color.cream,
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    padding: '0 6px',
                    borderRadius: ALTokens.radius.pill,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: ALTokens.color.muted,
                  fontFamily: ALTokens.font,
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: 0,
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {filtersOpen && (
            <div style={{ marginTop: 18 }}>
              {/* Subjects */}
              <div className="mb-4">
                <div
                  style={{
                    fontFamily: ALTokens.font,
                    fontWeight: 700,
                    fontSize: 10.5,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: ALTokens.color.goldDark,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Subject {selectedSubjects.size > 0 && `(${selectedSubjects.size})`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STANDARD_SUBJECTS.map((s) => (
                    <FilterPill
                      key={s.id}
                      color={AL_SUBJECT_ACCENT[s.id] || s.color}
                      active={selectedSubjects.has(s.id)}
                      onClick={() => toggleSubject(s.id)}
                    >
                      {s.label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <div
                  style={{
                    fontFamily: ALTokens.font,
                    fontWeight: 700,
                    fontSize: 10.5,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: ALTokens.color.goldDark,
                    marginBottom: 10,
                  }}
                >
                  Category {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter((c) => c.value !== 'start-here').map((c) => (
                    <FilterPill
                      key={c.value}
                      active={selectedCategories.has(c.value)}
                      onClick={() => toggleCategory(c.value)}
                    >
                      {c.label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Advanced toggle row */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShowAllFilters((v) => !v)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    color: ALTokens.color.forest,
                    fontFamily: ALTokens.font,
                    fontWeight: 600,
                    fontSize: 12.5,
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {showAllFilters ? 'Hide' : 'More'} options
                  <ALIcons.Chevron
                    size={12}
                    color={ALTokens.color.forest}
                    style={{
                      transform: showAllFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: `transform 180ms ${ALTokens.ease}`,
                    }}
                  />
                </button>
                <label
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: ALTokens.font,
                    fontSize: 12.5,
                    color: hideRecent ? ALTokens.color.forest : ALTokens.color.muted,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hideRecent}
                    onChange={(e) => setHideRecent(e.target.checked)}
                    style={{ accentColor: ALTokens.color.forest, cursor: 'pointer' }}
                  />
                  Hide ones we did this week
                </label>
              </div>

              {showAllFilters && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      style={{
                        fontFamily: ALTokens.font,
                        fontWeight: 700,
                        fontSize: 10.5,
                        letterSpacing: '.18em',
                        textTransform: 'uppercase',
                        color: ALTokens.color.goldDark,
                        marginBottom: 8,
                      }}
                    >
                      Setting
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SETTING_OPTIONS.map((opt) => (
                        <FilterPill
                          key={opt.value}
                          active={selectedSetting === opt.value}
                          onClick={() => setSelectedSetting(opt.value)}
                        >
                          {opt.label}
                        </FilterPill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: ALTokens.font,
                        fontWeight: 700,
                        fontSize: 10.5,
                        letterSpacing: '.18em',
                        textTransform: 'uppercase',
                        color: ALTokens.color.goldDark,
                        marginBottom: 8,
                      }}
                    >
                      Prep level
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PREP_OPTIONS.map((opt) => (
                        <FilterPill
                          key={opt.value}
                          active={selectedPrep === opt.value}
                          onClick={() => setSelectedPrep(opt.value)}
                        >
                          {opt.label}
                        </FilterPill>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Coverage + alternates side by side. On mobile they stack via the
          scoped class below; on sm+ they sit as a 360 / 1fr grid. */}
      {logSummaries.length > 0 && (
        <section className="mb-8 al-today-grid">
          <CoverageStripe coverage={coverage} customSubjects={customSubjects} />
          <div>
            <div className="mb-4">
              <Eyebrow>More to consider</Eyebrow>
              <h2
                style={{
                  margin: '8px 0 0',
                  fontFamily: ALTokens.font,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: '-0.018em',
                  color: ALTokens.color.ink,
                }}
              >
                Smart picks for you
                <HelpHint title="Smart picks">
                  A small sample of high-scoring alternatives across different categories, so you
                  always have variety to choose from.
                </HelpHint>
              </h2>
            </div>
            {alternates.length > 0 ? (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
              >
                {alternates.map((alt) => (
                  <MiniActivityCard
                    key={alt.activity.product.slug}
                    scored={alt}
                    onMarkDone={handleMarkDone}
                    onAddToCalendar={handleAddToCalendar}
                  />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: ALTokens.color.muted, margin: 0, fontFamily: ALTokens.font }}>
                Adjust filters to see more.
              </p>
            )}
          </div>
        </section>
      )}


      {/* Browse-everything fallback. Jumps into the Plan tab's Library
          sub-view rather than the marketing /shop page, because membership
          access lives behind the dashboard, not behind a checkout flow. */}
      <div className="text-center mb-6">
        <button
          type="button"
          onClick={() => onJumpToTab('plan', 'library')}
          style={{
            fontFamily: ALTokens.font,
            fontWeight: 600,
            fontSize: 13.5,
            color: ALTokens.color.forest,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: ALTokens.radius.pill,
            border: `1px solid ${ALTokens.color.line}`,
            background: ALTokens.color.paper,
          }}
        >
          Browse the full library of {totalActivities} activities
          <ALIcons.Arrow size={13} color={ALTokens.color.forest} />
        </button>
      </div>

      {/* Modals */}
      <LogEntryEditor
        open={logEditorOpen}
        onClose={() => setLogEditorOpen(false)}
        defaults={logEditorDefaults ?? undefined}
        customSubjects={customSubjects}
        onCustomSubjectsChange={setCustomSubjects}
        childrenList={kids}
        onOpenFamilySetup={onOpenFamilySetup}
        onSave={handleSaveLog}
      />
      <CalendarEventEditor
        open={calEditorOpen}
        onClose={() => setCalEditorOpen(false)}
        defaults={calEditorDefaults ?? undefined}
        onSave={handleSaveCalendarEvent}
      />
    </div>
  );
}
