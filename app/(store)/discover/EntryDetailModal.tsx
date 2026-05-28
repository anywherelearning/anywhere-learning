'use client';

/**
 * Full-screen detail view for a single log entry.
 *
 * Shows full notes, all photos (gallery), full subject and child chips,
 * category, type, date, duration. Includes Edit / Delete actions.
 *
 * Surfaces "related entries" (same category or shares ≥1 subject) so the
 * portfolio feels like a connected memory book rather than a flat list.
 */

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLogEntryTypeById } from '@/lib/taxonomy';
import { CATEGORY_LABELS } from '@/lib/categories';
import {
  ModalShell,
  PrimaryButton,
  GhostButton,
  SubjectChip,
  CategoryTag,
  ChildChip,
  SERIF,
} from './dashboard-shared';
import type { LogEntry, CustomSubject, Child } from './dashboard-types';

interface EntryDetailModalProps {
  open: boolean;
  onClose: () => void;
  entry: LogEntry | null;
  allEntries: LogEntry[];
  childrenList: Child[];
  customSubjects: CustomSubject[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
  onSelect: (entry: LogEntry) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatFullDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${DAYS[date.getUTCDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

function findRelated(entry: LogEntry, all: LogEntry[]): LogEntry[] {
  const subjects = new Set(entry.subjects);
  const scored = all
    .filter((e) => e.id !== entry.id)
    .map((e) => {
      let score = 0;
      if (e.category && e.category === entry.category) score += 3;
      const sharedSubjects = e.subjects.filter((s) => subjects.has(s)).length;
      score += sharedSubjects * 2;
      if (e.productSlug && e.productSlug === entry.productSlug) score += 5;
      return { entry: e, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date));
  return scored.slice(0, 4).map((s) => s.entry);
}

export default function EntryDetailModal({
  open,
  onClose,
  entry,
  allEntries,
  childrenList,
  customSubjects,
  onEdit,
  onDelete,
  onSelect,
}: EntryDetailModalProps) {
  const related = useMemo(
    () => (entry ? findRelated(entry, allEntries) : []),
    [entry, allEntries]
  );

  if (!entry) return null;
  const typeInfo = getLogEntryTypeById(entry.type);
  const taggedKids = entry.childIds
    .map((id) => childrenList.find((c) => c.id === id))
    .filter((c): c is Child => !!c);

  return (
    <ModalShell open={open} onClose={onClose} title="" maxWidth={780}>
      <div className="grid gap-5">
        {/* Header */}
        <div>
          <div
            className="flex items-center gap-2 mb-2"
            style={{ fontSize: 12, color: '#7B8378', fontWeight: 500, letterSpacing: '.04em' }}
          >
            <span style={{ fontFamily: SERIF, color: '#3A5A40', fontStyle: 'italic', fontSize: 16 }}>
              {typeInfo?.icon || '·'}
            </span>
            {typeInfo?.label || entry.type}
            <span aria-hidden>·</span>
            {formatFullDate(entry.date)}
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 36,
              lineHeight: 1.05,
              color: '#3A5A40',
              letterSpacing: '-.005em',
            }}
          >
            {entry.title}
          </h2>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.category && <CategoryTag category={entry.category} />}
            {entry.subjects.map((s) => (
              <SubjectChip key={s} subjectId={s} customSubjects={customSubjects} />
            ))}
            {taggedKids.map((c) => (
              <ChildChip key={c.id} child={c} />
            ))}
          </div>
          {(entry.durationMinutes != null || entry.productSlug) && (
            <div
              className="flex flex-wrap gap-4 mt-2.5"
              style={{ fontSize: 12.5, color: '#7B8378' }}
            >
              {entry.durationMinutes != null && (
                <span>
                  Duration: <strong style={{ color: '#2D3A2E' }}>{entry.durationMinutes} min</strong>
                </span>
              )}
              {entry.productSlug && (
                <Link
                  href={`/shop/${entry.productSlug}`}
                  style={{
                    color: '#3A5A40',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(58,90,64,.25)',
                  }}
                >
                  Open activity →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Photos */}
        {entry.photos.length > 0 && (
          <div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns:
                  entry.photos.length === 1
                    ? '1fr'
                    : 'repeat(auto-fill, minmax(160px, 1fr))',
              }}
            >
              {entry.photos.map((url) => (
                <div
                  key={url}
                  className="relative"
                  style={{
                    aspectRatio: entry.photos.length === 1 ? '4/3' : '1/1',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #E5E0D2',
                    background: '#FFFDF7',
                  }}
                >
                  <Image
                    src={url}
                    alt={`Photo from ${entry.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes ? (
          <div
            style={{
              background: '#FFFDF7',
              border: '1px solid #E5E0D2',
              borderRadius: 12,
              padding: '14px 18px',
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
                marginBottom: 6,
              }}
            >
              Notes
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.6,
                color: '#2D3A2E',
                whiteSpace: 'pre-wrap',
              }}
            >
              {entry.notes}
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#7B8378', fontStyle: 'italic', margin: 0 }}>
            No notes saved for this one.
          </p>
        )}

        {/* Related entries */}
        {related.length > 0 && (
          <div>
            <h3
              style={{
                margin: '0 0 10px',
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 16,
                color: '#2D3A2E',
              }}
            >
              Related entries
            </h3>
            <div className="grid gap-2">
              {related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelect(r)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: '#FAF9F6',
                    border: '1px solid #E5E0D2',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: '#2D3A2E',
                        lineHeight: 1.3,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: '#7B8378',
                        marginTop: 2,
                      }}
                    >
                      {formatFullDate(r.date)}
                    </div>
                  </div>
                  <span style={{ color: '#3A5A40', fontSize: 13 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="flex justify-between gap-2 pt-3"
          style={{ borderTop: '1px solid #E5E0D2' }}
        >
          <button
            type="button"
            onClick={() => onDelete(entry)}
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: '#A65456',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Delete entry
          </button>
          <div className="flex gap-2">
            <GhostButton onClick={onClose}>Close</GhostButton>
            <PrimaryButton onClick={() => onEdit(entry)}>Edit</PrimaryButton>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
