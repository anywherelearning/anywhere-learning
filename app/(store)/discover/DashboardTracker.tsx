'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { STANDARD_SUBJECTS, LOG_ENTRY_TYPES, getLogEntryTypeById } from '@/lib/taxonomy';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import {
  SERIF,
  Eyebrow,
  CategoryTag,
  SubjectChip,
  ChildChip,
  ChildAvatar,
  PrimaryButton,
  GhostButton,
  HelpHint,
  resolveSubject,
} from './dashboard-shared';
import LogEntryEditor from './LogEntryEditor';
import EntryDetailModal from './EntryDetailModal';
import YearHeatmap from './YearHeatmap';
import { useToast } from './Toast';
import {
  fetchCustomSubjects,
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  searchLogEntries,
} from './dashboard-api';
import Image from 'next/image';
import type { LogEntry, CustomSubject, Child } from './dashboard-types';

interface DashboardTrackerProps {
  onJumpToTab: (tab: 'today' | 'calendar') => void;
  children: Child[];
  /** Currently-focused kid id (page-level). When set, this tab filters to that kid. */
  focusedKidId: string | null;
  /** Bubble up changes to the page-level focus when the user clicks a kid pill / changes the filter. */
  onFocusedKidChange: (id: string | null) => void;
  onChildrenChange: (c: Child[]) => void;
  onOpenFamilySetup: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatEntryDate(iso: string): { month: number; year: number } {
  const [y, m] = iso.split('-').map(Number);
  return { month: m - 1, year: y };
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function entriesToCsv(
  entries: LogEntry[],
  customSubjects: CustomSubject[],
  childrenList: Child[]
): string {
  const header = [
    'Date',
    'Title',
    'Type',
    'Category',
    'Subjects',
    'Children',
    'Duration (min)',
    'Notes',
  ];
  const rows = entries.map((e) => {
    const subjects = e.subjects
      .map((s) => resolveSubject(s, customSubjects).label)
      .join('; ');
    const childNames = e.childIds
      .map((id) => childrenList.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .concat(e.childNames.filter((n) => !childrenList.some((c) => c.name === n)))
      .join('; ');
    return [
      e.date,
      e.title,
      getLogEntryTypeById(e.type)?.label || e.type,
      (e.category && CATEGORY_LABELS[e.category]) || '',
      subjects,
      childNames || e.childNames.join('; '),
      e.durationMinutes != null ? String(e.durationMinutes) : '',
      e.notes || '',
    ].map((v) => escapeCsv(String(v))).join(',');
  });
  return [header.join(','), ...rows].join('\n');
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  subjectsHit: number;
  topSubject: { id: string; label: string; color: string; count: number } | null;
  totalMinutes: number;
}

function computeStats(entries: LogEntry[], customSubjects: CustomSubject[]): Stats {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStartISO = toISO(weekStart);
  const monthStartISO = toISO(monthStart);

  let thisWeek = 0;
  let thisMonth = 0;
  let totalMinutes = 0;
  const subjectCounts: Record<string, number> = {};

  for (const e of entries) {
    if (e.date >= weekStartISO) thisWeek++;
    if (e.date >= monthStartISO) thisMonth++;
    if (e.durationMinutes) totalMinutes += e.durationMinutes;
    for (const s of e.subjects) {
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }
  }

  const subjectsHit = Object.keys(subjectCounts).length;
  let topSubject: Stats['topSubject'] = null;
  let topCount = 0;
  for (const [id, count] of Object.entries(subjectCounts)) {
    if (count > topCount) {
      topCount = count;
      const { label, color } = resolveSubject(id, customSubjects);
      topSubject = { id, label, color, count };
    }
  }

  return {
    total: entries.length,
    thisWeek,
    thisMonth,
    subjectsHit,
    topSubject,
    totalMinutes,
  };
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: '#FFFDF7',
        border: '1px solid #E5E0D2',
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
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
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: accent || '#2D3A2E',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {hint && <div style={{ fontSize: 11.5, color: '#7B8378', marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

// ─── Entry row ───────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  customSubjects,
  childrenList,
  onClick,
  onEdit,
  onDelete,
}: {
  entry: LogEntry;
  customSubjects: CustomSubject[];
  childrenList: Child[];
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeInfo = getLogEntryTypeById(entry.type);
  const hasPhotos = entry.photos.length > 0;
  return (
    <div
      onClick={(e) => {
        // Don't trigger row click when user clicked an action button
        if ((e.target as HTMLElement).closest('[data-row-action]')) return;
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        background: '#FAF9F6',
        border: '1px solid #E5E0D2',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'grid',
        gridTemplateColumns: hasPhotos ? '60px auto 1fr auto' : '60px 1fr auto',
        gap: 14,
        alignItems: 'start',
        cursor: 'pointer',
        transition: 'border-color .12s, background .12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#C9D3BE';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E0D2';
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
            color: '#7B8378',
          }}
        >
          {MONTHS[Number(entry.date.split('-')[1]) - 1].slice(0, 3)}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 24,
            color: '#3A5A40',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {Number(entry.date.split('-')[2])}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            color: '#3A5A40',
            fontSize: 14,
            fontStyle: 'italic',
          }}
        >
          {typeInfo?.icon || '·'}
        </div>
      </div>

      {hasPhotos && (
        <div
          className="relative"
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid #E5E0D2',
            background: '#FFFDF7',
            flexShrink: 0,
          }}
        >
          <Image
            src={entry.photos[0]}
            alt=""
            fill
            sizes="72px"
            style={{ objectFit: 'cover' }}
          />
          {entry.photos.length > 1 && (
            <span
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                background: 'rgba(45,58,46,.85)',
                color: '#FAF9F6',
                fontFamily: '"DM Sans"',
                fontWeight: 600,
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 999,
              }}
            >
              +{entry.photos.length - 1}
            </span>
          )}
        </div>
      )}

      <div className="min-w-0">
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.3,
            color: '#2D3A2E',
          }}
        >
          {entry.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.category && <CategoryTag category={entry.category} />}
          {entry.subjects.map((s) => (
            <SubjectChip key={s} subjectId={s} customSubjects={customSubjects} />
          ))}
        </div>
        {entry.notes && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 13,
              color: '#4F5A50',
              lineHeight: 1.5,
              maxWidth: 640,
            }}
          >
            {entry.notes.length > 240 ? entry.notes.slice(0, 240) + '…' : entry.notes}
          </p>
        )}
        {(entry.childIds.length > 0 || entry.childNames.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {entry.childIds.map((id) => {
              const child = childrenList.find((c) => c.id === id);
              if (child) return <ChildChip key={id} child={child} small />;
              const fallbackName = entry.childNames.find((n) => !!n);
              if (fallbackName) {
                return (
                  <ChildChip
                    key={id}
                    small
                    child={{ name: fallbackName, color: '#7B8378', emoji: null }}
                  />
                );
              }
              return null;
            })}
            {entry.childIds.length === 0 &&
              entry.childNames.map((name) => (
                <ChildChip
                  key={name}
                  small
                  child={{ name, color: '#7B8378', emoji: null }}
                />
              ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2" style={{ fontSize: 12, color: '#7B8378' }}>
          {entry.durationMinutes != null && <span>{entry.durationMinutes} min</span>}
          {entry.type && <span>{typeInfo?.label || entry.type}</span>}
          {entry.productSlug && (
            <a
              href={`/api/download/activity/${entry.productSlug}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              data-row-action
              onClick={(e) => e.stopPropagation()}
              className="rounded-md px-2.5 py-1 hover:opacity-90"
              style={{ background: '#588157', color: '#FAF9F6', fontFamily: '"DM Sans"', fontSize: 11.5, fontWeight: 600 }}
            >
              Open ↗
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1" data-row-action>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: '#3A5A40',
            fontFamily: '"DM Sans"',
            fontWeight: 600,
            fontSize: 12,
            padding: '4px 8px',
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: '#A65456',
            fontFamily: '"DM Sans"',
            fontWeight: 600,
            fontSize: 12,
            padding: '4px 8px',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function DashboardTracker({
  onJumpToTab,
  children: kids,
  focusedKidId,
  onFocusedKidChange,
  onChildrenChange: _onChildrenChange,
  onOpenFamilySetup,
}: DashboardTrackerProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [customSubjects, setCustomSubjects] = useState<CustomSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  // The kid filter is sourced from the page-level `focusedKidId` so the
  // selection survives tab switches. The internal "filter by kid" controls
  // (per-kid breakdown cards + dropdown) write back via onFocusedKidChange,
  // keeping the page-level state and the tab-local UI in sync.
  const filterChildId = focusedKidId ?? '';
  const setFilterChildId = (id: string) => onFocusedKidChange(id || null);

  const [searchQ, setSearchQ] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<LogEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<LogEntry | null>(null);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moreStatsOpen, setMoreStatsOpen] = useState(false);
  const toast = useToast();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesData, subjectsData] = await Promise.all([
        searchLogEntries({
          from: fromDate || undefined,
          to: toDate || undefined,
          type: filterType || undefined,
          category: filterCategory || undefined,
          subject: filterSubject || undefined,
          child: filterChildId || undefined,
          q: searchQ.trim() || undefined,
        }),
        fetchCustomSubjects(),
      ]);
      setEntries(entriesData);
      setCustomSubjects(subjectsData);
    } catch (err) {
      console.error(err);
      toast.error('Could not load entries');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, filterType, filterCategory, filterSubject, filterChildId, searchQ, toast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const stats = useMemo(() => computeStats(entries, customSubjects), [entries, customSubjects]);

  const grouped = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    for (const e of entries) {
      const { month, year } = formatEntryDate(e.date);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [y, m] = key.split('-').map(Number);
        return { key, label: `${MONTHS[m]} ${y}`, items };
      });
  }, [entries]);

  const handleSave = async (
    data: Omit<LogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editing) {
      const updated = await updateLogEntry(editing.id, data);
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const created = await createLogEntry(data);
      setEntries((prev) => [created, ...prev]);
    }
  };

  const handleDelete = (entry: LogEntry) => {
    // Optimistic delete with undo
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setDetailEntry(null);
    let undone = false;
    toast.undoable({
      title: 'Entry deleted',
      description: entry.title,
      onUndo: async () => {
        undone = true;
        // Recreate via API so the recovered entry has a real id
        try {
          const recreated = await createLogEntry({
            date: entry.date,
            title: entry.title,
            type: entry.type,
            category: entry.category,
            productSlug: entry.productSlug,
            subjects: entry.subjects,
            childIds: entry.childIds,
            childNames: entry.childNames,
            photos: entry.photos,
            notes: entry.notes,
            durationMinutes: entry.durationMinutes,
          });
          setEntries((prev) => [recreated, ...prev]);
          toast.success('Entry restored');
        } catch {
          toast.error('Could not restore entry');
        }
      },
    });
    // Actually delete on server after a beat - the optimistic UI already removed it
    setTimeout(() => {
      if (undone) return;
      void deleteLogEntry(entry.id).catch(() => toast.error('Server delete failed'));
    }, 6500);
  };

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (entry: LogEntry) => {
    setEditing(entry);
    setEditorOpen(true);
  };

  const exportCsv = () => {
    const csv = entriesToCsv(entries, customSubjects, kids);
    const filename = `homeschool-log-${toISO(new Date())}.csv`;
    downloadCsv(filename, csv);
  };

  const openPrintable = (childId?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (filterSubject) params.set('subject', filterSubject);
    if (filterCategory) params.set('category', filterCategory);
    if (filterType) params.set('type', filterType);
    const cid = childId ?? filterChildId;
    if (cid) params.set('child', cid);
    window.open(`/portfolio?${params.toString()}`, '_blank');
  };

  const seedDemoData = async () => {
    setSeedingDemo(true);
    const today = new Date();
    const isoOffset = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString().slice(0, 10);
    };
    const samples: Array<Omit<LogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
      {
        date: isoOffset(0), title: 'Backyard bug hunt', type: 'custom',
        category: 'outdoor-learning', productSlug: null,
        subjects: ['science', 'pe'], childIds: [], childNames: [],
        photos: [], notes: 'Found 4 different insects, kid sketched each one.', durationMinutes: 45,
      },
      {
        date: isoOffset(1), title: 'Read: Charlotte’s Web', type: 'book',
        category: null, productSlug: null,
        subjects: ['ela'], childIds: [], childNames: [],
        photos: [], notes: 'Two chapters. Talked about friendship.', durationMinutes: 30,
      },
      {
        date: isoOffset(2), title: 'Kitchen fractions (cookies)', type: 'custom',
        category: 'real-world-math', productSlug: null,
        subjects: ['math', 'life'], childIds: [], childNames: [],
        photos: [], notes: null, durationMinutes: 60,
      },
      {
        date: isoOffset(4), title: 'Royal Tyrrell Museum field trip', type: 'field-trip',
        category: null, productSlug: null,
        subjects: ['science', 'history'], childIds: [], childNames: [],
        photos: [], notes: 'Spent 3 hours. Loved the T-rex.', durationMinutes: 180,
      },
      {
        date: isoOffset(7), title: 'Documentary: My Octopus Teacher', type: 'documentary',
        category: null, productSlug: null,
        subjects: ['science'], childIds: [], childNames: [],
        photos: [], notes: null, durationMinutes: 85,
      },
      {
        date: isoOffset(9), title: 'Piano lesson with Mrs. Park', type: 'lesson',
        category: null, productSlug: null,
        subjects: ['art'], childIds: [], childNames: [],
        photos: [], notes: 'Working on Twinkle Twinkle.', durationMinutes: 30,
      },
      {
        date: isoOffset(12), title: 'Family debate: best season?', type: 'custom',
        category: 'communication-writing', productSlug: null,
        subjects: ['ela', 'life'], childIds: [], childNames: [],
        photos: [], notes: null, durationMinutes: 25,
      },
      {
        date: isoOffset(14), title: 'Build a Backyard Wind Chime', type: 'activity',
        category: 'creativity-maker', productSlug: 'rube-goldberg-machine',
        subjects: ['art', 'science'], childIds: [], childNames: [],
        photos: [], notes: null, durationMinutes: 90,
      },
      {
        date: isoOffset(18), title: 'Lemonade stand', type: 'custom',
        category: 'entrepreneurship', productSlug: null,
        subjects: ['math', 'life'], childIds: [], childNames: [],
        photos: [], notes: 'Made $14. Calculated cost per cup.', durationMinutes: 120,
      },
      {
        date: isoOffset(22), title: 'Local history walk', type: 'field-trip',
        category: 'worldschooling', productSlug: null,
        subjects: ['history', 'pe'], childIds: [], childNames: [],
        photos: [], notes: null, durationMinutes: 90,
      },
    ];
    try {
      const created: LogEntry[] = [];
      for (const s of samples) {
        const row = await createLogEntry(s);
        created.push(row);
      }
      setEntries((prev) => [...created, ...prev]);
      toast.success(`Added ${created.length} sample entries`, 'You can edit or delete any of them.');
    } catch (err) {
      console.error(err);
      toast.error('Could not seed demo data');
    } finally {
      setSeedingDemo(false);
    }
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setFilterType('');
    setFilterCategory('');
    setFilterSubject('');
    setFilterChildId('');
    setSearchQ('');
  };

  const hasActiveFilters =
    fromDate || toDate || filterType || filterCategory || filterSubject || filterChildId || searchQ;

  // Count of filters tucked behind the "Filters" toggle (Search stays separate/visible).
  const advancedFilterCount = [
    fromDate,
    toDate,
    filterType,
    filterCategory,
    filterSubject,
    filterChildId,
  ].filter(Boolean).length;

  // Per-kid breakdown
  const perKidStats = useMemo(() => {
    return kids.map((child) => {
      let count = 0;
      const subjectCounts: Record<string, number> = {};
      for (const e of entries) {
        if (e.childIds.includes(child.id)) {
          count++;
          for (const s of e.subjects) subjectCounts[s] = (subjectCounts[s] || 0) + 1;
        }
      }
      let topSubject: { label: string; color: string; count: number } | null = null;
      let topCount = 0;
      for (const [id, c] of Object.entries(subjectCounts)) {
        if (c > topCount) {
          topCount = c;
          const r = resolveSubject(id, customSubjects);
          topSubject = { label: r.label, color: r.color, count: c };
        }
      }
      return { child, count, topSubject };
    });
  }, [kids, entries, customSubjects]);

  const filterFieldStyle = {
    background: '#FFFDF7',
    border: '1px solid #E5E0D2',
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 13,
    color: '#2D3A2E',
  };

  const filterLabelStyle = {
    display: 'block' as const,
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    fontSize: 10.5,
    letterSpacing: '.14em',
    textTransform: 'uppercase' as const,
    color: '#7B8378',
    marginBottom: 4,
  };

  return (
    <div className="w-full">
      <section className="mb-8">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-2">
          <div>
            <Eyebrow>Activity Log · portfolio</Eyebrow>
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
              The story so far
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 14, color: '#7B8378' }}>
              Everything your kids have done, classified for reporting.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={exportCsv}>Export CSV</GhostButton>
            <GhostButton onClick={() => openPrintable()}>
              {filterChildId
                ? `Print ${kids.find((c) => c.id === filterChildId)?.name}'s portfolio →`
                : 'Print portfolio →'}
            </GhostButton>
            <PrimaryButton onClick={openNew}>+ Log activity</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Year-at-a-glance heatmap - hidden when no entries */}
      {entries.length > 0 && !hasActiveFilters && (
        <section className="mb-6">
          <YearHeatmap entries={entries} />
        </section>
      )}

      <section className="mb-6">
        <div
          className="grid gap-3 grid-stats"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
        >
          <StatCard label="Total entries" value={stats.total} hint="All time" />
          <StatCard label="This week" value={stats.thisWeek} />
          <StatCard
            label="Most common"
            value={stats.topSubject ? stats.topSubject.label : 'None yet'}
            hint={stats.topSubject ? `${stats.topSubject.count} entries` : 'Log to see'}
            accent={stats.topSubject?.color}
          />
          {moreStatsOpen && (
            <>
              <StatCard label="This month" value={stats.thisMonth} hint="So far" />
              <StatCard
                label="Subjects covered"
                value={stats.subjectsHit}
                hint={`${stats.subjectsHit}/${STANDARD_SUBJECTS.length} standard`}
              />
              <StatCard
                label="Total minutes"
                value={stats.totalMinutes > 0 ? stats.totalMinutes.toLocaleString() : '0'}
                hint={
                  stats.totalMinutes > 0
                    ? `${Math.round(stats.totalMinutes / 60)} hours`
                    : 'Track duration for this'
                }
              />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMoreStatsOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: '#3A5A40',
            fontFamily: '"DM Sans"',
            fontWeight: 600,
            fontSize: 12.5,
            textDecoration: 'underline',
            marginTop: 10,
            padding: 0,
          }}
        >
          {moreStatsOpen ? 'Fewer stats' : 'More stats'}
        </button>
      </section>

      {/* Per-kid breakdown */}
      {kids.length > 0 && (
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 18,
                color: '#2D3A2E',
              }}
            >
              By kid
              <HelpHint title="By kid">
                Click any kid&apos;s card to filter the log to just their entries.
              </HelpHint>
            </h2>
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
                fontSize: 12.5,
                textDecoration: 'underline',
              }}
            >
              Family setup →
            </button>
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {perKidStats.map(({ child, count, topSubject }) => {
              const isActive = filterChildId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setFilterChildId(isActive ? '' : child.id)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isActive ? `${child.color}1A` : '#FFFDF7',
                    border: `1px solid ${isActive ? child.color : '#E5E0D2'}`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <ChildAvatar child={child} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 17,
                        color: '#2D3A2E',
                        lineHeight: 1.2,
                      }}
                    >
                      {child.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#7B8378',
                        marginTop: 2,
                      }}
                    >
                      {count > 0
                        ? `${count} ${count === 1 ? 'entry' : 'entries'}${
                            topSubject ? ` · top: ${topSubject.label}` : ''
                          }`
                        : 'No entries yet'}
                    </div>
                  </div>
                  {isActive && (
                    <span
                      style={{
                        color: child.color,
                        fontFamily: '"DM Sans"',
                        fontWeight: 600,
                        fontSize: 11.5,
                      }}
                    >
                      Filtering ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section
        className="mb-8"
        style={{
          background: '#FAF9F6',
          border: '1px solid #E5E0D2',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div className="flex flex-wrap items-end gap-3 filter-row">
          <div data-full-row style={{ flex: '1 1 220px', minWidth: 200 }}>
            <label style={filterLabelStyle}>Search</label>
            <div className="relative">
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Title or notes…"
                style={{ ...filterFieldStyle, width: '100%', paddingLeft: 28 }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7B8378',
                  fontSize: 13,
                }}
              >
                ⌕
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            style={{
              background: filtersOpen || advancedFilterCount > 0 ? '#588157' : '#FFFDF7',
              border: `1px solid ${filtersOpen || advancedFilterCount > 0 ? '#588157' : '#E5E0D2'}`,
              borderRadius: 8,
              cursor: 'pointer',
              color: filtersOpen || advancedFilterCount > 0 ? '#FAF9F6' : '#3A5A40',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 13,
              padding: '7px 12px',
            }}
          >
            {advancedFilterCount > 0 ? `Filters (${advancedFilterCount})` : 'Filters'} {filtersOpen ? '▾' : '▸'}
          </button>
        </div>

        {filtersOpen && (
          <div
            className="flex flex-wrap items-end gap-3 filter-row"
            style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E5E0D2' }}
          >
            <div>
              <label style={filterLabelStyle}>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={filterFieldStyle}
            />
          </div>
          <div>
            <label style={filterLabelStyle}>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={filterFieldStyle}
            />
          </div>
          <div>
            <label style={filterLabelStyle}>Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{ ...filterFieldStyle, minWidth: 130 }}
            >
              <option value="">All subjects</option>
              {STANDARD_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
              {customSubjects.map((s) => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
          </div>
          {kids.length > 0 && (
            <div>
              <label style={filterLabelStyle}>Child</label>
              <select
                value={filterChildId}
                onChange={(e) => setFilterChildId(e.target.value)}
                style={{ ...filterFieldStyle, minWidth: 130 }}
              >
                <option value="">All kids</option>
                {kids.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label style={filterLabelStyle}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ ...filterFieldStyle, minWidth: 150 }}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={filterLabelStyle}>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ ...filterFieldStyle, minWidth: 130 }}
            >
              <option value="">All types</option>
              {LOG_ENTRY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
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
                fontSize: 12.5,
                textDecoration: 'underline',
                padding: '8px 0',
              }}
            >
              Clear filters
            </button>
          )}
          </div>
        )}
      </section>

      {loading ? (
        <div className="grid gap-2" aria-busy="true" aria-label="Loading entries">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 64,
                background: '#EFEDE4',
                border: '1px solid #E5E0D2',
                borderRadius: 14,
              }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            background: '#FFFDF7',
            border: '1px dashed #E5E0D2',
            borderRadius: 14,
            padding: hasActiveFilters ? '60px 32px' : '36px 32px 32px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 30,
              color: '#3A5A40',
              lineHeight: 1.1,
            }}
          >
            {hasActiveFilters ? 'Nothing matches yet.' : 'Start your log.'}
          </h2>
          <p
            style={{
              margin: '12px auto 18px',
              fontSize: 14,
              color: '#4F5A50',
              maxWidth: 520,
              lineHeight: 1.55,
            }}
          >
            {hasActiveFilters
              ? 'No entries match these filters.'
              : 'Log anything your kids learn, not just Anywhere Learning activities. The point is to build a portfolio you can hand in at year-end.'}
          </p>

          {!hasActiveFilters && (
            <div
              className="grid gap-2 mt-2 mb-5 mx-auto"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                maxWidth: 640,
                textAlign: 'left',
              }}
            >
              {[
                { icon: '◧', label: 'A book you read together', hint: 'Tag ELA + history' },
                { icon: '⌗', label: 'A museum or zoo trip', hint: 'Tag science + art' },
                { icon: '◆', label: 'A piano or sport lesson', hint: 'Add a custom subject' },
                { icon: '◐', label: 'A documentary you watched', hint: 'Quick win' },
              ].map((idea) => (
                <div
                  key={idea.label}
                  style={{
                    background: '#FAF9F6',
                    border: '1px solid #E5E0D2',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontFamily: SERIF, color: '#3A5A40', fontSize: 18 }}>{idea.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#2D3A2E', fontWeight: 600 }}>
                      {idea.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#7B8378' }}>{idea.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2 flex-wrap">
            {hasActiveFilters ? (
              <GhostButton onClick={clearFilters}>Clear filters</GhostButton>
            ) : (
              <>
                <GhostButton onClick={() => onJumpToTab('today')}>
                  Browse activities →
                </GhostButton>
                <PrimaryButton onClick={openNew}>+ Log something</PrimaryButton>
              </>
            )}
          </div>
          {!hasActiveFilters && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed #E5E0D2' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#7B8378' }}>
                Want to see what the dashboard looks like full?
              </p>
              <button
                type="button"
                onClick={seedDemoData}
                disabled={seedingDemo}
                style={{
                  appearance: 'none',
                  cursor: seedingDemo ? 'wait' : 'pointer',
                  background: 'transparent',
                  border: '1px dashed #C9D3BE',
                  color: '#3A5A40',
                  fontFamily: '"DM Sans"',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '8px 14px',
                  borderRadius: 8,
                }}
              >
                {seedingDemo ? 'Adding sample entries…' : '✨ Try with sample data (10 entries)'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-8">
          {grouped.map((group) => (
            <section key={group.key}>
              <h2
                style={{
                  margin: '0 0 14px',
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 22,
                  color: '#2D3A2E',
                  letterSpacing: '-.008em',
                }}
              >
                {group.label}
                <span style={{ marginLeft: 10, fontSize: 13, color: '#7B8378' }}>
                  {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>
              <div className="grid gap-2">
                {group.items.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    customSubjects={customSubjects}
                    childrenList={kids}
                    onClick={() => setDetailEntry(entry)}
                    onEdit={() => openEdit(entry)}
                    onDelete={() => handleDelete(entry)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <LogEntryEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        entry={editing}
        customSubjects={customSubjects}
        onCustomSubjectsChange={setCustomSubjects}
        childrenList={kids}
        onOpenFamilySetup={onOpenFamilySetup}
        onSave={handleSave}
      />

      <EntryDetailModal
        open={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        entry={detailEntry}
        allEntries={entries}
        childrenList={kids}
        customSubjects={customSubjects}
        onEdit={(e) => {
          setDetailEntry(null);
          openEdit(e);
        }}
        onDelete={(e) => handleDelete(e)}
        onSelect={(e) => setDetailEntry(e)}
      />
    </div>
  );
}
