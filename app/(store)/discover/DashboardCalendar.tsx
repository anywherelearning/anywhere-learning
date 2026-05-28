'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SERIF,
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
          background: '#FAF9F6',
          border: '1px solid #E5E0D2',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'grid',
          gridTemplateColumns: '60px 1fr auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: '"DM Sans"',
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: tint.fg,
            }}
          >
            {MONTHS[m - 1].slice(0, 3)}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: '#3A5A40',
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            {d}
          </div>
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 16,
              color: '#2D3A2E',
            }}
          >
            {event.title}
          </h3>
          {event.notes && (
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#7B8378' }}>
              {event.notes.length > 100 ? event.notes.slice(0, 100) + '…' : event.notes}
            </p>
          )}
        </div>
        <div className="flex gap-1.5 items-center">
          {event.productSlug && (
            <a
              href={`/api/download/activity/${event.productSlug}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-2.5 py-1 hover:opacity-90"
              style={{ background: '#588157', color: '#FAF9F6', fontFamily: '"DM Sans"', fontSize: 11.5, fontWeight: 600 }}
            >
              Open ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => handleMarkEventDone(event)}
            title="Mark done"
            style={{
              background: '#E6EBDF',
              color: '#3A5A40',
              border: '1px solid #C9D3BE',
              cursor: 'pointer',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 11.5,
              padding: '6px 10px',
              borderRadius: 8,
            }}
          >
            ✓ Done
          </button>
          <button
            type="button"
            onClick={() => openEdit(event)}
            style={{
              background: 'transparent',
              color: '#3A5A40',
              border: 0,
              cursor: 'pointer',
              fontFamily: '"DM Sans"',
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

  return (
    <div className="w-full">
      {/* Header */}
      <section className="mb-6">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <Eyebrow>Calendar · plan ahead</Eyebrow>
            <h1
              style={{
                margin: '10px 0 0',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 48,
                lineHeight: 1,
                color: '#3A5A40',
              }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#7B8378' }}>
              Click any day to plan something. Mark done to log it.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous month"
              style={{
                background: '#FFFDF7',
                border: '1px solid #E5E0D2',
                cursor: 'pointer',
                color: '#3A5A40',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToday}
              style={{
                background: '#FFFDF7',
                border: '1px solid #E5E0D2',
                cursor: 'pointer',
                color: '#3A5A40',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 12.5,
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next month"
              style={{
                background: '#FFFDF7',
                border: '1px solid #E5E0D2',
                cursor: 'pointer',
                color: '#3A5A40',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              →
            </button>
            <PrimaryButton onClick={() => openNew(todayISO)}>+ Plan something</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Certificate progress widget */}
      <div
        className="mb-6"
        style={{
          background: certificate.earned ? '#E6EBDF' : '#FFFDF7',
          border: `1px solid ${certificate.earned ? '#588157' : '#E5E0D2'}`,
          borderRadius: 14,
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: '#3A5A40', fontSize: 18 }}>
              {certificate.earned ? '★' : '☆'}
            </span>
            <h3
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 17,
                color: '#2D3A2E',
              }}
            >
              {certificate.earned
                ? `${certificate.monthName} certificate earned`
                : `Log ${Math.max(1, certificate.entriesTarget - certificate.entriesCount)} more to earn this month's certificate`}
              <HelpHint title="How it works">
                A monthly snapshot you can print for portfolio reviews. Logging variety (multiple
                subjects) matters more than logging volume. The cert proves balanced coverage,
                not busywork.
              </HelpHint>
            </h3>
          </div>
          <p style={{ margin: '4px 0 8px', fontSize: 12.5, color: '#4F5A50' }}>
            Earned by logging <strong>{certificate.entriesTarget} activities</strong> across{' '}
            <strong>{certificate.subjectsTarget} subjects</strong> this month.
          </p>
          <div className="flex flex-wrap gap-3" style={{ fontSize: 12.5 }}>
            <span style={{ color: '#7B8378' }}>
              Activities:{' '}
              <strong style={{ color: '#2D3A2E' }}>
                {certificate.entriesCount}/{certificate.entriesTarget}
              </strong>
            </span>
            <span style={{ color: '#7B8378' }}>
              Subjects:{' '}
              <strong style={{ color: '#2D3A2E' }}>
                {certificate.subjectsCount}/{certificate.subjectsTarget}
              </strong>
            </span>
          </div>
          <div className="mt-2" style={{ height: 4, background: '#E5E0D2', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (certificate.entriesCount / certificate.entriesTarget) * 100)}%`,
                height: '100%',
                background: certificate.earned ? '#588157' : '#C9D3BE',
              }}
            />
          </div>
        </div>
        {certificate.earned ? (
          <PrimaryButton onClick={() => onJumpToTab('log')}>View portfolio</PrimaryButton>
        ) : (
          <GhostButton onClick={() => onJumpToTab('today')}>Find activities →</GhostButton>
        )}
      </div>

      {/* Calendar grid (desktop / tablet only — too dense for phones) */}
      <div
        className="mb-8 hidden md:block"
        style={{
          background: '#FAF9F6',
          border: '1px solid #E5E0D2',
          borderRadius: 14,
          overflow: 'hidden',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(7, 1fr)',
            background: '#FFFDF7',
            borderBottom: '1px solid #E5E0D2',
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontFamily: '"DM Sans"',
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: '#7B8378',
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
                  background: cell.isToday
                    ? '#E6EBDF'
                    : cell.inMonth
                    ? '#FAF9F6'
                    : '#F5F2E9',
                  border: 'none',
                  borderRight: '1px solid #E5E0D2',
                  borderBottom: '1px solid #E5E0D2',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: cell.inMonth ? 'pointer' : 'default',
                  minHeight: 80,
                  fontFamily: 'inherit',
                  color: cell.inMonth ? '#2D3A2E' : '#B5B1A3',
                  opacity: cell.inMonth ? 1 : 0.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ fontSize: 12, fontWeight: cell.isToday ? 700 : 500 }}
                >
                  <span style={{ color: cell.isToday ? '#3A5A40' : 'inherit' }}>
                    {cell.day}
                  </span>
                  {dotCount > 0 && (
                    <span
                      style={{
                        fontSize: 9.5,
                        color: '#7B8378',
                        background: '#FFFDF7',
                        padding: '1px 5px',
                        borderRadius: 999,
                        border: '1px solid #E5E0D2',
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
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openEdit(e);
                        }}
                        title={e.title}
                        style={{
                          background: tint.bg,
                          color: tint.fg,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '2px 5px',
                          borderRadius: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: e.completed ? 'line-through' : 'none',
                          opacity: e.completed ? 0.6 : 1,
                          cursor: 'pointer',
                          display: 'block',
                        }}
                      >
                        {e.completed && '✓ '}
                        {e.title}
                      </span>
                    );
                  })}
                  {entriesForDay.slice(0, 1).map((e) => {
                    const tint = tintForCategory(e.category);
                    return (
                      <span
                        key={e.id}
                        title={`Logged: ${e.title}`}
                        style={{
                          background: '#FFFDF7',
                          color: tint.fg,
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '2px 5px',
                          borderRadius: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          border: `1px dashed ${tint.dot}`,
                          display: 'block',
                        }}
                      >
                        ✓ {e.title}
                      </span>
                    );
                  })}
                  {dotCount > 3 && (
                    <span style={{ fontSize: 10, color: '#7B8378' }}>
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
              background: '#FFFDF7',
              border: '1px dashed #E5E0D2',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              fontSize: 14,
              color: '#7B8378',
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
                color: '#3A5A40',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Plan something
            </button>
            .
          </div>
        ) : (
          <div className="grid gap-4">
            {agendaGroups.map((group) => (
              <div key={group.date}>
                <div
                  style={{
                    fontFamily: '"DM Sans"',
                    fontWeight: 600,
                    fontSize: 11.5,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: '#7B8378',
                    margin: '0 0 8px',
                  }}
                >
                  {formatAgendaDate(group.date)}
                </div>
                <div className="grid gap-2">
                  {group.events.map((event) => renderEventRow(event))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming events list */}
      <section className="mb-8 hidden md:block">
        <h2
          style={{
            margin: '0 0 14px',
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 20,
            color: '#2D3A2E',
          }}
        >
          Planned this month
          <span style={{ marginLeft: 10, fontSize: 13, color: '#7B8378' }}>
            {upcomingEvents.length} upcoming
          </span>
        </h2>
        {upcomingEvents.length === 0 ? (
          <div
            style={{
              background: '#FFFDF7',
              border: '1px dashed #E5E0D2',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              fontSize: 14,
              color: '#7B8378',
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
                color: '#3A5A40',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Plan something
            </button>
            .
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
