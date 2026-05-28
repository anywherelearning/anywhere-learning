import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { logEntries, customSubjects as customSubjectsTable, children as childrenTable } from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import {
  STANDARD_SUBJECTS,
  getLogEntryTypeById,
  getSubjectById,
} from '@/lib/taxonomy';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { LogEntry, CustomSubject, Child } from '../(store)/discover/dashboard-types';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

interface SearchParams {
  from?: string;
  to?: string;
  type?: string;
  category?: string;
  subject?: string;
  child?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

async function loadData(params: SearchParams): Promise<{
  entries: LogEntry[];
  customSubjects: CustomSubject[];
  children: Child[];
  focusChild: Child | null;
}> {
  const userId = await getDashboardUserId();
  const filters = [eq(logEntries.userId, userId)];
  if (isIsoDate(params.from)) filters.push(gte(logEntries.date, params.from));
  if (isIsoDate(params.to)) filters.push(lte(logEntries.date, params.to));
  if (params.type) filters.push(eq(logEntries.type, params.type));
  if (params.category) filters.push(eq(logEntries.category, params.category));
  if (params.subject) {
    filters.push(sql`${logEntries.subjects} @> ${JSON.stringify([params.subject])}::jsonb`);
  }
  if (params.child) {
    filters.push(sql`${logEntries.childIds} @> ${JSON.stringify([params.child])}::jsonb`);
  }

  const [rows, customs, kids] = await Promise.all([
    db
      .select()
      .from(logEntries)
      .where(and(...filters))
      .orderBy(desc(logEntries.date), desc(logEntries.createdAt)),
    db
      .select()
      .from(customSubjectsTable)
      .where(eq(customSubjectsTable.userId, userId)),
    db
      .select()
      .from(childrenTable)
      .where(eq(childrenTable.userId, userId)),
  ]);

  const childrenList: Child[] = kids.map((c) => ({
    ...c,
    childNames: undefined as never,
    createdAt: c.createdAt.toISOString(),
  })) as unknown as Child[];

  return {
    entries: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      subjects: (r.subjects ?? []) as string[],
      childIds: (r.childIds ?? []) as string[],
      childNames: (r.childNames ?? []) as string[],
      photos: (r.photos ?? []) as string[],
    })),
    customSubjects: customs.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    children: childrenList,
    focusChild: params.child ? childrenList.find((c) => c.id === params.child) ?? null : null,
  };
}

function resolveSubject(
  subjectId: string,
  customs: CustomSubject[]
): { label: string; color: string } {
  const std = getSubjectById(subjectId);
  if (std) return { label: std.label, color: std.color };
  const custom = customs.find((s) => s.slug === subjectId);
  if (custom) return { label: custom.label, color: custom.color };
  return { label: subjectId, color: '#7B8378' };
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { entries, customSubjects, focusChild } = await loadData(params);

  const subjectTotals: Record<string, number> = {};
  let totalMinutes = 0;
  const allChildren = new Set<string>();

  for (const e of entries) {
    for (const s of e.subjects) subjectTotals[s] = (subjectTotals[s] || 0) + 1;
    if (e.durationMinutes) totalMinutes += e.durationMinutes;
    for (const c of e.childNames) allChildren.add(c);
  }

  const allSubjectsCovered = STANDARD_SUBJECTS.filter((s) => subjectTotals[s.id] > 0);
  const allCustomCovered = customSubjects.filter((s) => subjectTotals[s.slug] > 0);

  const groups: Record<string, LogEntry[]> = {};
  for (const e of entries) {
    const [y, m] = e.date.split('-').map(Number);
    const key = `${y}-${String(m - 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  const sortedGroups = Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([k, items]) => {
      const [y, m] = k.split('-').map(Number);
      return { key: k, label: `${MONTHS[m]} ${y}`, items };
    });

  const today = new Date();
  const dateRangeLabel =
    params.from && params.to
      ? `${formatDateLong(params.from)} - ${formatDateLong(params.to)}`
      : params.from
      ? `from ${formatDateLong(params.from)}`
      : params.to
      ? `through ${formatDateLong(params.to)}`
      : 'All time';

  return (
    <div className="portfolio-root">
      <style>{`
        .portfolio-root {
          background: #FAF9F6; color: #2D3A2E; padding: 32px;
          font-family: 'DM Sans', -apple-system, sans-serif; font-size: 13px; line-height: 1.5;
          min-height: 100vh;
        }
        .portfolio-wrap { max-width: 760px; margin: 0 auto; }
        .portfolio-root h1 { font-family: Georgia, serif; font-weight: 400; font-size: 36px; margin: 0 0 8px; color: #3A5A40; letter-spacing: -.01em; }
        .portfolio-root h2 { font-family: Georgia, serif; font-weight: 400; font-size: 22px; margin: 32px 0 12px; color: #2D3A2E; }
        .portfolio-root .eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #3A5A40; font-weight: 500; }
        .portfolio-root .meta { font-size: 12px; color: #7B8378; margin-top: 8px; }
        .portfolio-root .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0 8px; }
        .portfolio-root .summary-card { border: 1px solid #E5E0D2; background: #FFFDF7; border-radius: 10px; padding: 12px 14px; }
        .portfolio-root .summary-label { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #7B8378; }
        .portfolio-root .summary-value { font-family: Georgia, serif; font-size: 24px; color: #2D3A2E; margin-top: 4px; }
        .portfolio-root .chip-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .portfolio-root .chip {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px;
          border: 1px solid currentColor; background: white;
        }
        .portfolio-root .chip .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .portfolio-root .entry { border: 1px solid #E5E0D2; background: #FAF9F6; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; page-break-inside: avoid; }
        .portfolio-root .entry-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
        .portfolio-root .entry-date { font-size: 11px; color: #7B8378; font-weight: 500; }
        .portfolio-root .entry-title { font-family: Georgia, serif; font-size: 15px; color: #2D3A2E; margin: 2px 0 6px; }
        .portfolio-root .entry-notes { font-size: 12px; color: #4F5A50; margin: 6px 0 0; line-height: 1.5; }
        .portfolio-root .entry-meta { font-size: 11px; color: #7B8378; margin-top: 6px; display: flex; gap: 10px; flex-wrap: wrap; }
        .portfolio-root .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E0D2; font-size: 11px; color: #7B8378; text-align: center; }
        @page { size: letter; margin: 0.6in; }
        @media print {
          .portfolio-root { padding: 0; background: white; min-height: auto; }
          .no-print, .sale-banner, .cart-drawer, .mobile-tab-bar { display: none !important; }
        }
      `}</style>
      <div className="portfolio-wrap">
        <PrintButton />
        <div className="eyebrow">
          {focusChild ? `${focusChild.name}'s portfolio` : 'Homeschool portfolio'} · {dateRangeLabel}
        </div>
        <h1>{focusChild ? `${focusChild.name}'s story` : 'The story so far'}</h1>
        <div className="meta">
          Generated {today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {focusChild && focusChild.birthYear && ` · age ${today.getFullYear() - focusChild.birthYear}`}
          {!focusChild && allChildren.size > 0 && ` · ${Array.from(allChildren).join(', ')}`}
        </div>

        {entries.length === 0 ? (
          <p style={{ marginTop: 40, color: '#7B8378' }}>
            No entries found for these filters.
          </p>
        ) : (
          <>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Total entries</div>
                <div className="summary-value">{entries.length}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Subjects covered</div>
                <div className="summary-value">
                  {allSubjectsCovered.length + allCustomCovered.length}
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Hours of learning</div>
                <div className="summary-value">
                  {totalMinutes > 0 ? Math.round(totalMinutes / 60) : '0'}
                </div>
              </div>
            </div>

            <h2>Subjects breakdown</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E0D2', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', color: '#7B8378', fontWeight: 500, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>Subject</th>
                  <th style={{ padding: '6px 8px', color: '#7B8378', fontWeight: 500, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>Entries</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...allSubjectsCovered.map((s) => ({
                    id: s.id, label: s.label, color: s.color, count: subjectTotals[s.id],
                  })),
                  ...allCustomCovered.map((s) => ({
                    id: s.slug, label: s.label, color: s.color, count: subjectTotals[s.slug],
                  })),
                ]
                  .sort((a, b) => b.count - a.count)
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F1EDDF' }}>
                      <td style={{ padding: '6px 8px' }}>
                        <span className="chip" style={{ color: row.color }}>
                          <span className="dot" style={{ background: row.color }} />
                          {row.label}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', fontFamily: 'Georgia, serif', fontSize: 14 }}>
                        {row.count}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {sortedGroups.map((group) => (
              <section key={group.key}>
                <h2>{group.label}</h2>
                {group.items.map((entry) => {
                  const typeInfo = getLogEntryTypeById(entry.type);
                  return (
                    <div key={entry.id} className="entry">
                      <div className="entry-head">
                        <span className="entry-date">{formatDateLong(entry.date)}</span>
                        <span className="entry-date">{typeInfo?.label || entry.type}</span>
                      </div>
                      <div className="entry-title">{entry.title}</div>
                      <div className="chip-list">
                        {entry.category && (
                          <span className="chip" style={{ color: '#3A5A40' }}>
                            <span className="dot" />
                            {CATEGORY_LABELS[entry.category] || entry.category}
                          </span>
                        )}
                        {entry.subjects.map((s) => {
                          const r = resolveSubject(s, customSubjects);
                          return (
                            <span key={s} className="chip" style={{ color: r.color }}>
                              <span className="dot" style={{ background: r.color }} />
                              {r.label}
                            </span>
                          );
                        })}
                      </div>
                      {entry.photos.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: entry.photos.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: 6,
                            marginTop: 8,
                          }}
                        >
                          {entry.photos.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={url}
                              src={url}
                              alt=""
                              style={{
                                width: '100%',
                                aspectRatio: entry.photos.length === 1 ? '16/10' : '1/1',
                                objectFit: 'cover',
                                borderRadius: 8,
                                border: '1px solid #E5E0D2',
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {entry.notes && <p className="entry-notes">{entry.notes}</p>}
                      <div className="entry-meta">
                        {entry.childNames.length > 0 && <span>With: {entry.childNames.join(', ')}</span>}
                        {entry.durationMinutes != null && <span>Duration: {entry.durationMinutes} min</span>}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}

            <div className="footer">
              Anywhere Learning · anywherelearning.co · Homeschool portfolio export
            </div>
          </>
        )}
      </div>
    </div>
  );
}
