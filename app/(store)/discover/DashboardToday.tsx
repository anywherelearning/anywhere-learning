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
  onJumpToTab: (tab: 'log' | 'calendar') => void;
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
  const accent = color || '#588157';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: active ? `${accent}1A` : '#FFFDF7',
        border: `1px solid ${active ? accent : '#E5E0D2'}`,
        color: active ? accent : '#4F5A50',
        fontFamily: '"DM Sans"',
        fontWeight: active ? 600 : 500,
        fontSize: 12.5,
        padding: '7px 12px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {active && <span style={{ fontSize: 10 }}>✓</span>}
      {children}
    </button>
  );
}

// ─── Coverage widget ─────────────────────────────────────────────────────────

function CoverageStripe({
  coverage,
  customSubjects,
}: {
  coverage: Record<string, number>;
  customSubjects: CustomSubject[];
}) {
  const total = Object.values(coverage).reduce((sum, n) => sum + n, 0);
  const max = Math.max(1, ...Object.values(coverage));
  return (
    <div
      style={{
        background: '#FAF9F6',
        border: '1px solid #E5E0D2',
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 16,
            color: '#2D3A2E',
          }}
        >
          Coverage this month
          <HelpHint title="Coverage at a glance">
            Counts of logged entries per standard subject this month. Used to surface
            &ldquo;gap-fill&rdquo; suggestions below.
          </HelpHint>
        </h3>
        <span style={{ fontSize: 12, color: '#7B8378' }}>
          {total} {total === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="grid gap-1.5">
        {STANDARD_SUBJECTS.map((s) => {
          const count = coverage[s.id] ?? 0;
          const width = Math.max(2, (count / max) * 100);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span
                style={{
                  width: 96,
                  fontSize: 11.5,
                  color: count === 0 ? '#B5B1A3' : s.color,
                  fontWeight: 600,
                  fontFamily: '"DM Sans"',
                  textAlign: 'right',
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: '#F0EDE2',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: count === 0 ? 0 : `${width}%`,
                    height: '100%',
                    background: s.color,
                    opacity: count === 0 ? 0 : 0.85,
                    transition: 'width .3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  width: 24,
                  fontSize: 12,
                  fontFamily: SERIF,
                  color: count === 0 ? '#B5B1A3' : '#2D3A2E',
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
        background: '#FAF9F6',
        border: '1px solid #E5E0D2',
        borderRadius: 16,
        boxShadow:
          '0 1px 0 rgba(255,255,255,.5) inset, 0 14px 28px -22px rgba(45,58,46,.18)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="relative"
        style={{
          aspectRatio: '4/3',
          background: tint.bg,
          borderBottom: '1px solid #E5E0D2',
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
        <CategoryTag category={activity.product.category} />
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.2,
            letterSpacing: '-.008em',
            color: '#2D3A2E',
          }}
        >
          {activity.product.name}
        </h3>
        {showReason && reasons.length > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              color: '#3A5A40',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            {reasons[0]}
          </p>
        )}
        <div
          className="flex items-center justify-between mt-auto pt-1"
          style={{ fontFamily: '"DM Sans"', fontSize: 11.5, color: '#7B8378' }}
        >
          <span>{activity.product.ageRange ?? 'All ages'}</span>
          <a
            href={`/api/download/activity/${activity.product.slug}?view=1`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3A5A40', fontWeight: 600, textDecoration: 'none' }}
          >
            Open →
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
              background: '#E6EBDF',
              color: '#3A5A40',
              border: '1px solid #C9D3BE',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 11.5,
              padding: '6px 8px',
              borderRadius: 8,
            }}
          >
            ✓ Mark done
          </button>
          <button
            type="button"
            onClick={() => onAddToCalendar(activity.product.slug)}
            style={{
              flex: 1,
              appearance: 'none',
              cursor: 'pointer',
              background: '#FFFDF7',
              color: '#4F5A50',
              border: '1px solid #E5E0D2',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 11.5,
              padding: '6px 8px',
              borderRadius: 8,
            }}
          >
            + Plan
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
        title: 'Logged ✓',
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
            background:
              'linear-gradient(135deg, #E6EBDF 0%, #F5E7D6 100%)',
            border: '1px solid #C9D3BE',
            borderRadius: 18,
            padding: 26,
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={dismissWelcome}
            aria-label="Dismiss welcome"
            style={{
              position: 'absolute',
              top: 12,
              right: 14,
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: '#7B8378',
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
          <Eyebrow>Welcome to your dashboard</Eyebrow>
          <h2
            style={{
              margin: '10px 0 8px',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 34,
              lineHeight: 1.05,
              color: '#3A5A40',
            }}
          >
            Here&apos;s how to use this.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14.5,
              color: '#4F5A50',
              lineHeight: 1.55,
              maxWidth: 640,
            }}
          >
            Three tabs, one job each. <strong>Today</strong> helps you decide what to do.{' '}
            <strong>Activity Log</strong> records what you&apos;ve already done, including books,
            field trips, lessons, and anything outside Anywhere Learning. <strong>Calendar</strong>{' '}
            lets you plan ahead.
          </p>
          <div
            className="grid gap-3 mt-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            <div
              style={{
                background: 'rgba(255,253,247,.7)',
                border: '1px solid #C9D3BE',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: '#3A5A40',
                  marginBottom: 4,
                }}
              >
                1 · Set up your kids
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#4F5A50', lineHeight: 1.5 }}>
                Add each kid once. Then you can tag who did what with a single click.
              </p>
              <button
                type="button"
                onClick={onOpenFamilySetup}
                style={{
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: '#3A5A40',
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '6px 0 0',
                  textDecoration: 'underline',
                }}
              >
                Add your kids →
              </button>
            </div>
            <div
              style={{
                background: 'rgba(255,253,247,.7)',
                border: '1px solid #C9D3BE',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: '#3A5A40',
                  marginBottom: 4,
                }}
              >
                2 · Pick an activity
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#4F5A50', lineHeight: 1.5 }}>
                Filter by age, subject, or category. The picker shows why it chose each one.
              </p>
            </div>
            <div
              style={{
                background: 'rgba(255,253,247,.7)',
                border: '1px solid #C9D3BE',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: '#3A5A40',
                  marginBottom: 4,
                }}
              >
                3 · Log everything
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#4F5A50', lineHeight: 1.5 }}>
                Books, lessons, field trips, anything counts. Tag subjects for your annual review.
                Export anytime.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Greeting */}
      <section className="pb-7 mb-8" style={{ borderBottom: '1px solid #E5E0D2' }}>
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div className="flex-1 min-w-0">
            <Eyebrow>{formatLongDate(now)}</Eyebrow>
            <h1
              className="dashboard-greeting"
              style={{
                margin: '12px 0 0',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 56,
                lineHeight: 1,
                color: '#3A5A40',
                letterSpacing: '-.005em',
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
                fontSize: 16,
                color: '#4F5A50',
                maxWidth: 580,
                lineHeight: 1.55,
              }}
            >
              {focusedKid
                ? autoAgeRange
                  ? `Showing activities tuned to ${focusedKid.name} (age ${autoAgeRange.min === autoAgeRange.max ? autoAgeRange.min : `${autoAgeRange.min}-${autoAgeRange.max}`}). Recommender uses only ${focusedKid.name}'s history.`
                  : `Showing activities and coverage just for ${focusedKid.name}.`
                : familyMode
                ? 'Finding one activity everyone can do together. Tap a kid above to focus on just them instead.'
                : autoAgeRange
                ? `Showing activities tuned to ages ${autoAgeRange.min}-${autoAgeRange.max}. Filter below to narrow further.`
                : 'Pick something to do today, plan ahead, or log what you have already done.'}
            </p>
            <button
              type="button"
              onClick={() => onJumpToTab('log')}
              className="inline-flex items-center gap-3 mt-5"
              style={{
                background: '#FFFDF7',
                border: '1px solid #E5E0D2',
                borderRadius: 999,
                padding: '10px 16px 10px 12px',
                cursor: 'pointer',
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#E6EBDF',
                  color: '#3A5A40',
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 14,
                }}
              >
                {completedThisYear}
              </span>
              <span style={{ fontSize: 13.5, color: '#4F5A50' }}>
                Your family has logged{' '}
                <strong style={{ color: '#2D3A2E', fontWeight: 600 }}>
                  {completedThisYear} {completedThisYear === 1 ? 'activity' : 'activities'}
                </strong>{' '}
                this year ·{' '}
                <span
                  style={{
                    color: '#3A5A40',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(58,90,64,.25)',
                  }}
                >
                  see the log →
                </span>
              </span>
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
            background: '#FFFDF7',
            border: '1px solid #E5E0D2',
            borderLeft: '4px solid #588157',
            borderRadius: 12,
            padding: '12px 16px',
          }}
        >
          <span aria-hidden style={{ fontSize: 20, lineHeight: '24px', flexShrink: 0 }}>
            👋
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, color: '#2D3A2E', lineHeight: 1.45 }}>
              <strong>Add your kids first.</strong> Recommendations get tuned to
              their actual ages, and you can tag who did what with one click.
            </div>
            <button
              type="button"
              onClick={onOpenFamilySetup}
              style={{
                marginTop: 6,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: '#3A5A40',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 13,
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Set up your family →
            </button>
          </div>
        </div>
      )}

      {/* Smart picker card */}
      <div
        className="mb-8"
        style={{
          background: '#FAF9F6',
          border: '1px solid #E5E0D2',
          borderRadius: 18,
          boxShadow:
            '0 1px 0 rgba(255,255,255,.5) inset, 0 18px 36px -24px rgba(45,58,46,.18)',
          padding: 24,
        }}
      >
        <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
          <h2
            style={{
              margin: 0,
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 32,
              color: '#2D3A2E',
              lineHeight: 1,
            }}
          >
            What should we do?
            <HelpHint title="How this picks">
              Considers your kids&apos; ages, what you have already logged this month, which
              subjects are under-covered, and any filters you set. Each pick explains why.
            </HelpHint>
          </h2>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 12.5, color: '#7B8378' }}>
              {matchCount} of {totalActivities} match
            </span>
          </div>
        </div>

        {/* Primary recommendation. In Family Activity mode it's one thing the
            whole family can do together (age-spanning + together-friendly).
            When a kid is focused, it's tuned to that kid. */}
        {recommendation ? (
          <div
            className="recommendation-card today-pick-grid"
            style={{
              background: '#E6EBDF',
              border: '1px solid #C9D3BE',
              borderRadius: 14,
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
            <div style={{ paddingTop: 18, paddingBottom: 18 }}>
              <Eyebrow>{familyMode ? 'Family activity for today' : 'Top pick for today'}</Eyebrow>
              <h3
                style={{
                  margin: '8px 0 0',
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 26,
                  lineHeight: 1.12,
                  letterSpacing: '-.012em',
                  color: '#2D3A2E',
                  textWrap: 'balance',
                }}
              >
                {recommendation.activity.product.name}
              </h3>
              {recommendation.reasons.length > 0 && (
                <p
                  style={{
                    margin: '6px 0 10px',
                    fontSize: 13,
                    color: '#3A5A40',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  Why this: {recommendation.reasons.join(' · ')}
                </p>
              )}
              <p
                style={{
                  margin: '4px 0 12px',
                  fontSize: 13.5,
                  color: '#4F5A50',
                  lineHeight: 1.5,
                  maxWidth: 520,
                }}
              >
                {recommendation.activity.product.shortDescription}
              </p>
              <div className="flex gap-2 items-center mb-3.5 flex-wrap">
                <CategoryTag category={recommendation.activity.product.category} />
                <span style={{ fontSize: 12.5, color: '#7B8378' }}>
                  {recommendation.activity.product.ageRange} · {SETTING_LABEL[recommendation.activity.setting]} · {PREP_LABEL[recommendation.activity.prepLevel]}
                </span>
              </div>
              {/* Primary actions: one clear next step (open the activity) plus
                  one secondary (mark done). Everything else is demoted to the
                  subordinate "more ways" row below so the hierarchy stays clear. */}
              <div className="flex gap-2 flex-wrap items-center">
                <a
                  href={`/api/download/activity/${recommendation.activity.product.slug}?view=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <PrimaryButton>Start this activity →</PrimaryButton>
                </a>
                <GhostButton onClick={() => handleQuickLog(recommendation.activity.product.slug)}>
                  ✓ Mark done
                </GhostButton>
              </div>
              {/* Demoted secondary actions: smaller, lighter text links so they
                  read as "more ways to use this" rather than competing CTAs. */}
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5"
                style={{ fontFamily: '"DM Sans"' }}
              >
                <button
                  type="button"
                  onClick={() => handleAddToCalendar(recommendation.activity.product.slug)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    color: '#7B8378',
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '2px 0',
                  }}
                >
                  Plan it for later
                </button>
                {ranked.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleRecommendation}
                    style={{
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      color: '#7B8378',
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
                    color: '#7B8378',
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
                border: '1px solid #C9D3BE',
                // aspect-ratio is set by the scoped style block above so it can
                // switch between mobile (4/3) and sm+ (4/5) at the right breakpoint.
                borderRadius: 12,
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
        ) : (
          <div
            style={{
              background: '#FFFDF7',
              border: '1px dashed #E5E0D2',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              color: '#7B8378',
              fontSize: 14,
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
                  color: '#3A5A40',
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'underline',
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
        <div style={{ marginTop: 18, borderTop: '1px solid #E5E0D2', paddingTop: 16 }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: '#3A5A40',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 13,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <span style={{ fontSize: 11 }}>{filtersOpen ? '▾' : '▸'}</span>
              Refine picks
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: '#588157',
                    color: '#FFFDF7',
                    fontSize: 11,
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  color: '#7B8378',
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 12.5,
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {filtersOpen && (
            <div style={{ marginTop: 16 }}>
              {/* Subjects */}
              <div className="mb-3">
                <div
                  style={{
                    fontFamily: '"DM Sans"',
                    fontWeight: 500,
                    fontSize: 10.5,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: '#7B8378',
                    marginBottom: 8,
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
                      color={s.color}
                      active={selectedSubjects.has(s.id)}
                      onClick={() => toggleSubject(s.id)}
                    >
                      {s.label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <div
                  style={{
                    fontFamily: '"DM Sans"',
                    fontWeight: 500,
                    fontSize: 10.5,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: '#7B8378',
                    marginBottom: 8,
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
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setShowAllFilters((v) => !v)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    color: '#3A5A40',
                    fontFamily: '"DM Sans"',
                    fontWeight: 600,
                    fontSize: 12.5,
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {showAllFilters ? '− Hide' : '+ More'} options
                </button>
                <label
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: '"DM Sans"',
                    fontSize: 12.5,
                    color: hideRecent ? '#3A5A40' : '#7B8378',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hideRecent}
                    onChange={(e) => setHideRecent(e.target.checked)}
                    style={{ accentColor: '#588157', cursor: 'pointer' }}
                  />
                  Hide ones we did this week
                </label>
              </div>

              {showAllFilters && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div
                      style={{
                        fontFamily: '"DM Sans"',
                        fontWeight: 500,
                        fontSize: 10.5,
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        color: '#7B8378',
                        marginBottom: 6,
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
                        fontFamily: '"DM Sans"',
                        fontWeight: 500,
                        fontSize: 10.5,
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        color: '#7B8378',
                        marginBottom: 6,
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

      {/* Coverage + alternates side by side */}
      {logSummaries.length > 0 && (
        <section className="mb-8">
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: 'minmax(280px, 360px) 1fr' }}
          >
            <CoverageStripe coverage={coverage} customSubjects={customSubjects} />
            <div>
              <h2
                style={{
                  margin: '0 0 14px',
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 20,
                  color: '#2D3A2E',
                }}
              >
                Smart picks for you
                <HelpHint title="Smart picks">
                  A small sample of high-scoring alternatives across different categories, so you
                  always have variety to choose from.
                </HelpHint>
              </h2>
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
                <p style={{ fontSize: 13, color: '#7B8378', margin: 0 }}>
                  Adjust filters to see more.
                </p>
              )}
            </div>
          </div>
        </section>
      )}


      {/* Browse-everything fallback */}
      <div className="text-center mb-6">
        <Link
          href="/shop"
          style={{
            fontFamily: '"DM Sans"',
            fontWeight: 600,
            fontSize: 13.5,
            color: '#3A5A40',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(58,90,64,.25)',
            paddingBottom: 1,
          }}
        >
          Or browse the full library of {totalActivities} activities →
        </Link>
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
