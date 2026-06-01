'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SERIF,
  ALIcons,
  ALTokens,
  Dot,
  Eyebrow,
  PrimaryButton,
  GhostButton,
  HelpHint,
  tintForCategory,
} from './dashboard-shared';
import CalendarEventEditor from './CalendarEventEditor';
import {
  fetchCalendarEvents,
  fetchLogEntries,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  completeCalendarEvent,
} from './dashboard-api';
import type { CalendarEvent, LogEntry, Child } from './dashboard-types';

interface DashboardCalendarProps {
  onJumpToTab: (tab: 'today' | 'log') => void;
  children: Child[];
  /** Page-level kid focus. Filters monthEntries display to that kid when set.
   *  Calendar events don't yet have a per-kid column (schema follow-up), so
   *  events stay family-wide for now while logged entries respect the focus. */
  focusedKidId: string | null;
  onChildrenChange: (c: Child[]) => void;
  onOpenFamilySetup: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Certificate logic ───────────────────────────────────────────────────────

interface CertificateProgress {
  monthName: string;
  entriesCount: number;
  entriesTarget: number;
  subjectsCount: number;
  subjectsTarget: number;
  earned: boolean;
}

function computeCertificate(
  entries: LogEntry[],
  year: number,
  month: number
): CertificateProgress {
  const monthEntries = entries.filter((e) => {
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m - 1 === month;
  });
  const subjects = new Set<string>();
  for (const e of monthEntries) for (const s of e.subjects) subjects.add(s);

  const ENTRIES_TARGET = 10;
  const SUBJECTS_TARGET = 4;

  return {
    monthName: MONTHS[month],
    entriesCount: monthEntries.length,
    entriesTarget: ENTRIES_TARGET,
    subjectsCount: subjects.size,
    subjectsTarget: SUBJECTS_TARGET,
    earned:
      monthEntries.length >= ENTRIES_TARGET && subjects.size >= SUBJECTS_TARGET,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function DashboardCalendar({
  onJumpToTab,
  children: kids,
  focusedKidId,
  onChildrenChange: _onChildrenChange,
  onOpenFamilySetup: _onOpenFamilySetup,
}: DashboardCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [monthEntries, setMonthEntries] = useState<LogEntry[]>([]);
  // Filter logged entries by focused kid for the calendar's day cells +
  // certificate widget. Calendar events themselves don't carry a kid
  // attribution yet, so they stay family-wide for now.
  const focusedKid = focusedKidId ? kids.find((k) => k.id === focusedKidId) ?? null : null;
  const visibleMonthEntries = focusedKid
    ? monthEntries.filter((e) => e.childIds.includes(focusedKid.id))
    : monthEntries;
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [editorDefaults, setEditorDefaults] = useState<Partial<CalendarEvent> | null>(null);

  const monthStart = toISO(viewYear, viewMonth, 1);
  const monthEndDay = daysInMonth(viewYear, viewMonth);
  const monthEnd = toISO(viewYear, viewMonth, monthEndDay);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [evts, ents] = await Promise.all([
        fetchCalendarEvents({ from: monthStart, to: monthEnd }),
        fetchLogEntries({ from: monthStart, to: monthEnd }),
      ]);
      setEvents(evts);
      setMonthEntries(ents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    reload();
  }, [reload]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, LogEntry[]> = {};
    for (const e of visibleMonthEntries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [visibleMonthEntries]);

  const certificate = useMemo(
    () => computeCertificate(visibleMonthEntries, viewYear, viewMonth),
    [visibleMonthEntries, viewYear, viewMonth]
  );

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const openNew = (date: string) => {
    setEditing(null);
    setEditorDefaults({ date, type: 'custom' });
    setEditorOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    setEditorDefaults(null);
    setEditorOpen(true);
  };

  const handleSave = async (
    data: {
      date: string; title: string; type: string;
      category: string | null; productSlug: string | null; notes: string | null;
    }
  ) => {
    if (editing) {
      const updated = await updateCalendarEvent(editing.id, data);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const created = await createCalendarEvent(data);
      setEvents((prev) => [...prev, created]);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    await deleteCalendarEvent(editing.id);
    setEvents((prev) => prev.filter((e) => e.id !== editing.id));
  };

  const handleMarkEventDone = async (event: CalendarEvent) => {
    try {
      const { event: updated, entry } = await completeCalendarEvent(event.id);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setMonthEntries((prev) => [entry, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Could not mark as done');
    }
  };

  // Build calendar grid: 42 cells (6 rows × 7 days)
  const firstDay = firstWeekday(viewYear, viewMonth);
  const grid: Array<{
    date: string;
    day: number;
    inMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month tail
  const prevMonthDays = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    grid.push({
      date: toISO(prevYear, prevMonth, day),
      day,
      inMonth: false,
      isToday: false,
    });
  }
  // Current month
  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());
  for (let d = 1; d <= monthEndDay; d++) {
    const iso = toISO(viewYear, viewMonth, d);
    grid.push({ date: iso, day: d, inMonth: true, isToday: iso === todayISO });
  }
  // Next month head to fill 42 cells
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  let nextDay = 1;
  while (grid.length < 42) {
    grid.push({
      date: toISO(nextYear, nextMonth, nextDay),
      day: nextDay,
      inMonth: false,
      isToday: false,
    });
    nextDay++;
  }

  // Shared row renderer for both the desktop "Planned this month" list and the
  // mobile agenda. Keeps the Open / Done / Edit actions identical everywhere.
  const renderEventRow = (event: CalendarEvent) => {
    const tint = tintForCategory(event.category);
    const [, m, d] = event.date.split('-').map(Number);
    return (
      <div
        key={event.id}
        style={{
          background: ALTokens.color.paper,
          border: `1px solid ${ALTokens.color.line}`,
          borderLeft: `4px solid ${tint.dot}`,
          borderRadius: ALTokens.radius.md,
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: '62px 1fr auto',
          gap: 14,
          alignItems: 'center',
          boxShadow: ALTokens.shadow.xs,
          opacity: event.completed ? 0.65 : 1,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 10.5,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: ALTokens.color.goldDark,
            }}
          >
            {MONTHS[m - 1].slice(0, 3)}
          </div>
          <div
            style={{
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 24,
              color: ALTokens.color.ink,
              lineHeight: 1,
              marginTop: 3,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {d}
          </div>
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.015em',
              color: ALTokens.color.ink,
              textDecoration: event.completed ? 'line-through' : 'none',
            }}
          >
            {event.title}
          </h3>
          {event.notes && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12.5,
                color: ALTokens.color.muted,
                fontFamily: ALTokens.font,
                lineHeight: 1.5,
              }}
            >
              {event.notes.length > 100 ? event.notes.slice(0, 100) + '...' : event.notes}
            </p>
          )}
        </div>
        <div className="flex gap-1.5 items-center">
          {event.productSlug && (
            <a
              href={`/api/download/activity/${event.productSlug}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(88,129,87,0.10)',
                color: ALTokens.color.forest,
                border: `1px solid ${ALTokens.color.line}`,
                fontFamily: ALTokens.font,
                fontSize: 11.5,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: ALTokens.radius.sm,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              Open
              <ALIcons.Arrow size={11} color={ALTokens.color.forest} />
            </a>
          )}
          {!event.completed && (
            <button
              type="button"
              onClick={() => handleMarkEventDone(event)}
              title="Mark done"
              style={{
                background: ALTokens.color.forest,
                color: ALTokens.color.cream,
                border: 'none',
                cursor: 'pointer',
                fontFamily: ALTokens.font,
                fontWeight: 600,
                fontSize: 11.5,
                padding: '7px 12px',
                borderRadius: ALTokens.radius.sm,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ALIcons.Check size={12} color={ALTokens.color.cream} />
              Done
            </button>
          )}
          <button
            type="button"
            onClick={() => openEdit(event)}
            style={{
              background: 'transparent',
              color: ALTokens.color.forest,
              border: 0,
              cursor: 'pointer',
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontSize: 12,
              padding: '6px 8px',
            }}
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const upcomingEvents = events
    .filter((e) => !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group upcoming events by date for the mobile agenda (the month grid is
  // hidden under md, so phones get a readable day-by-day list instead).
  const agendaGroups: Array<{ date: string; events: CalendarEvent[] }> = [];
  for (const event of upcomingEvents) {
    const last = agendaGroups[agendaGroups.length - 1];
    if (last && last.date === event.date) last.events.push(event);
    else agendaGroups.push({ date: event.date, events: [event] });
  }
  const formatAgendaDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${DAYS[new Date(y, m - 1, d).getDay()]}, ${MONTHS[m - 1].slice(0, 3)} ${d}`;
  };

  const navBtnStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: ALTokens.color.paper,
    border: `1px solid ${ALTokens.color.line}`,
    cursor: 'pointer',
    color: ALTokens.color.forest,
    fontFamily: ALTokens.font,
    fontWeight: 600,
    fontSize: 13,
    padding: '9px 12px',
    borderRadius: ALTokens.radius.sm,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all 150ms ${ALTokens.ease}`,
    ...extra,
  });

  return (
    <div className="w-full">
      {/* Editorial header — eyebrow + h1 + supporting copy + month nav */}
      <section className="pb-6 mb-6" style={{ borderBottom: `1px solid ${ALTokens.color.line}` }}>
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <Eyebrow>Calendar · plan ahead</Eyebrow>
            <h1
              className="dashboard-greeting"
              style={{
                margin: '14px 0 0',
                fontFamily: ALTokens.font,
                fontWeight: 700,
                fontSize: 40,
                lineHeight: 1.05,
                color: ALTokens.color.ink,
                letterSpacing: '-0.02em',
              }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 15.5,
                color: ALTokens.color.body,
                maxWidth: 520,
                lineHeight: 1.6,
              }}
            >
              Click any day to plan something. Mark it done to log it.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous month"
              style={navBtnStyle({ width: 38, height: 38, padding: 0 })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToday}
              style={navBtnStyle({ padding: '9px 16px' })}
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next month"
              style={navBtnStyle({ width: 38, height: 38, padding: 0 })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <PrimaryButton onClick={() => openNew(todayISO)}>
              <ALIcons.Plus size={14} color={ALTokens.color.cream} />
              Plan something
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* Certificate progress — paper card with gold accent rule on earn */}
      <div
        className="mb-7"
        style={{
          background: certificate.earned ? 'rgba(212,163,115,0.10)' : ALTokens.color.paper,
          border: `1px solid ${certificate.earned ? ALTokens.color.gold : ALTokens.color.line}`,
          borderLeft: `4px solid ${certificate.earned ? ALTokens.color.gold : ALTokens.color.goldLight}`,
          borderRadius: ALTokens.radius.lg,
          padding: '18px 22px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div>
          <Eyebrow color={ALTokens.color.goldDark}>
            {certificate.earned ? 'Earned' : 'In progress'}
          </Eyebrow>
          <h3
            style={{
              margin: '8px 0 0',
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '-0.015em',
              color: ALTokens.color.ink,
              lineHeight: 1.2,
            }}
          >
            {certificate.earned
              ? `${certificate.monthName} certificate earned`
              : `Log ${Math.max(1, certificate.entriesTarget - certificate.entriesCount)} more to earn this month`}
            <HelpHint title="How it works">
              A monthly snapshot you can print for portfolio reviews. Logging variety (multiple
              subjects) matters more than logging volume. The cert proves balanced coverage,
              not busywork.
            </HelpHint>
          </h3>
          <p
            style={{
              margin: '8px 0 12px',
              fontSize: 13.5,
              color: ALTokens.color.body,
              fontFamily: ALTokens.font,
              lineHeight: 1.55,
            }}
          >
            Earned by logging <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>{certificate.entriesTarget} activities</strong> across{' '}
            <strong style={{ color: ALTokens.color.ink, fontWeight: 700 }}>{certificate.subjectsTarget} subjects</strong> this month.
          </p>
          <div
            className="flex flex-wrap gap-4"
            style={{ fontSize: 12.5, fontFamily: ALTokens.font }}
          >
            <span style={{ color: ALTokens.color.muted }}>
              Activities:{' '}
              <strong
                style={{
                  color: ALTokens.color.ink,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {certificate.entriesCount}/{certificate.entriesTarget}
              </strong>
            </span>
            <span style={{ color: ALTokens.color.muted }}>
              Subjects:{' '}
              <strong
                style={{
                  color: ALTokens.color.ink,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {certificate.subjectsCount}/{certificate.subjectsTarget}
              </strong>
            </span>
          </div>
          <div
            className="mt-3"
            style={{
              height: 5,
              background: ALTokens.color.sandDeep,
              borderRadius: ALTokens.radius.pill,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (certificate.entriesCount / certificate.entriesTarget) * 100)}%`,
                height: '100%',
                background: certificate.earned ? ALTokens.color.gold : ALTokens.color.forest,
                opacity: 0.85,
                transition: `width 300ms ${ALTokens.ease}`,
                borderRadius: ALTokens.radius.pill,
              }}
            />
          </div>
        </div>
        {certificate.earned ? (
          <PrimaryButton onClick={() => onJumpToTab('log')}>
            View portfolio
            <ALIcons.Arrow size={14} color={ALTokens.color.cream} />
          </PrimaryButton>
        ) : (
          <GhostButton onClick={() => onJumpToTab('today')}>
            Find activities
            <ALIcons.Arrow size={13} color={ALTokens.color.forest} />
          </GhostButton>
        )}
      </div>

      {/* Calendar grid (desktop / tablet only — too dense for phones) */}
      <div
        className="mb-8 hidden md:block"
        style={{
          background: ALTokens.color.paper,
          border: `1px solid ${ALTokens.color.line}`,
          borderRadius: ALTokens.radius.lg,
          overflow: 'hidden',
          opacity: loading ? 0.6 : 1,
          boxShadow: ALTokens.shadow.xs,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(7, 1fr)',
            background: ALTokens.color.sand,
            borderBottom: `1px solid ${ALTokens.color.line}`,
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                padding: '12px 12px',
                textAlign: 'center',
                fontFamily: ALTokens.font,
                fontWeight: 700,
                fontSize: 10.5,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: ALTokens.color.goldDark,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          className="grid calendar-grid"
          style={{
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0,
          }}
        >
          {grid.map((cell, idx) => {
            const eventsForDay = eventsByDate[cell.date] || [];
            const entriesForDay = entriesByDate[cell.date] || [];
            const dotCount = eventsForDay.length + entriesForDay.length;
            return (
              <button
                key={`${cell.date}-${idx}`}
                type="button"
                onClick={() => cell.inMonth && openNew(cell.date)}
                disabled={!cell.inMonth}
                style={{
                  appearance: 'none',
                  background: cell.inMonth ? ALTokens.color.paper : ALTokens.color.sand,
                  border: 'none',
                  borderRight: `1px solid ${ALTokens.color.line}`,
                  borderBottom: `1px solid ${ALTokens.color.line}`,
                  padding: '8px 9px',
                  textAlign: 'left',
                  cursor: cell.inMonth ? 'pointer' : 'default',
                  minHeight: 92,
                  fontFamily: ALTokens.font,
                  color: cell.inMonth ? ALTokens.color.ink : ALTokens.color.faint,
                  opacity: cell.inMonth ? 1 : 0.65,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  transition: `background 150ms ${ALTokens.ease}`,
                }}
              >
                <div className="flex items-center justify-between">
                  {cell.isToday ? (
                    <span
                      className="grid place-items-center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: ALTokens.color.gold,
                        color: '#fff',
                        fontFamily: ALTokens.font,
                        fontWeight: 700,
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {cell.day}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        fontFamily: ALTokens.font,
                        color: cell.inMonth ? ALTokens.color.body : ALTokens.color.faint,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {cell.day}
                    </span>
                  )}
                  {dotCount > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        color: ALTokens.color.muted,
                        fontFamily: ALTokens.font,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {dotCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1" style={{ overflow: 'hidden' }}>
                  {eventsForDay.slice(0, 2).map((e) => {
                    const tint = tintForCategory(e.category);
                    return (
                      <span
                        key={e.id}
                        className="calendar-event-pill"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openEdit(e);
                        }}
                        title={e.title}
                        style={{
                          background: ALTokens.color.paper,
                          color: ALTokens.color.ink,
                          borderLeft: `3px solid ${tint.dot}`,
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '3px 6px 3px 7px',
                          borderRadius: ALTokens.radius.sm,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: e.completed ? 'line-through' : 'none',
                          opacity: e.completed ? 0.55 : 1,
                          cursor: 'pointer',
                          display: 'block',
                          fontFamily: ALTokens.font,
                          border: `1px solid ${ALTokens.color.lineSoft}`,
                          borderLeftColor: tint.dot,
                          borderLeftWidth: 3,
                        }}
                      >
                        {e.title}
                      </span>
                    );
                  })}
                  {entriesForDay.slice(0, 1).map((e) => {
                    const tint = tintForCategory(e.category);
                    return (
                      <span
                        key={e.id}
                        className="calendar-event-pill"
                        title={`Logged: ${e.title}`}
                        style={{
                          background: 'rgba(88,129,87,0.07)',
                          color: ALTokens.color.forestInk,
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '3px 6px 3px 7px',
                          borderRadius: ALTokens.radius.sm,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          border: `1px solid ${ALTokens.color.line}`,
                          borderLeft: `3px solid ${tint.dot}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: ALTokens.font,
                        }}
                      >
                        <ALIcons.Check size={10} color={ALTokens.color.forest} />
                        {e.title}
                      </span>
                    );
                  })}
                  {dotCount > 3 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: ALTokens.color.muted,
                        fontFamily: ALTokens.font,
                        fontWeight: 600,
                      }}
                    >
                      +{dotCount - 3} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile agenda — shown instead of the dense grid under md */}
      <div className="mb-8 block md:hidden" style={{ opacity: loading ? 0.6 : 1 }}>
        {agendaGroups.length === 0 ? (
          <div
            style={{
              background: ALTokens.color.paper,
              border: `1px dashed ${ALTokens.color.line}`,
              borderRadius: ALTokens.radius.lg,
              padding: '28px 22px',
              textAlign: 'center',
              fontSize: 14,
              color: ALTokens.color.body,
              fontFamily: ALTokens.font,
              lineHeight: 1.55,
            }}
          >
            Your month is open. Drop in a museum trip, a library day, or anything already on your calendar.{' '}
            <button
              type="button"
              onClick={() => openNew(todayISO)}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: ALTokens.color.forest,
                fontWeight: 700,
                fontFamily: ALTokens.font,
              }}
            >
              Plan something.
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {agendaGroups.map((group) => (
              <div key={group.date}>
                <div
                  className="flex items-baseline gap-3 mb-2"
                  style={{
                    paddingBottom: 8,
                    borderBottom: `1px solid ${ALTokens.color.line}`,
                  }}
                >
                  <Dot color={ALTokens.color.gold} size={7} />
                  <span
                    style={{
                      fontFamily: ALTokens.font,
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '.04em',
                      color: ALTokens.color.ink,
                    }}
                  >
                    {formatAgendaDate(group.date)}
                  </span>
                </div>
                <div className="grid gap-2">
                  {group.events.map((event) => renderEventRow(event))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming events list (desktop only) */}
      <section className="mb-8 hidden md:block">
        <div
          className="flex items-baseline gap-3 mb-4"
          style={{
            paddingBottom: 10,
            borderBottom: `1px solid ${ALTokens.color.line}`,
          }}
        >
          <Eyebrow>Agenda</Eyebrow>
          <h2
            style={{
              margin: 0,
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 22,
              color: ALTokens.color.ink,
              letterSpacing: '-0.018em',
            }}
          >
            Planned this month
          </h2>
          <span
            style={{
              fontSize: 12,
              color: ALTokens.color.muted,
              fontFamily: ALTokens.font,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {upcomingEvents.length} upcoming
          </span>
        </div>
        {upcomingEvents.length === 0 ? (
          <div
            style={{
              background: ALTokens.color.paper,
              border: `1px dashed ${ALTokens.color.line}`,
              borderRadius: ALTokens.radius.lg,
              padding: '28px 22px',
              textAlign: 'center',
              fontSize: 14,
              color: ALTokens.color.body,
              fontFamily: ALTokens.font,
              lineHeight: 1.55,
            }}
          >
            Your month is open. Drop in a museum trip, a library day, or anything already on your calendar.{' '}
            <button
              type="button"
              onClick={() => openNew(todayISO)}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: ALTokens.color.forest,
                fontWeight: 700,
                fontFamily: ALTokens.font,
              }}
            >
              Plan something.
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            {upcomingEvents.map((event) => renderEventRow(event))}
          </div>
        )}
      </section>

      <CalendarEventEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        event={editing}
        defaults={editorDefaults ?? undefined}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
