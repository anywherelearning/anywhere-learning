'use client';

import { useState } from 'react';
import { genChildId, saveProfile, type Child, type MemberProfile } from '@/lib/member-profile';

const MONTHS: [string, string][] = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];
const NOW = new Date();
const YEARS = Array.from({ length: 19 }, (_, k) => String(NOW.getFullYear() - k));

interface Row {
  id?: string;
  name: string;
  mon: string;
  year: string;
}

function ageFrom(year: string, mon: string): number | null {
  if (!year || !mon) return null;
  let a = NOW.getFullYear() - Number(year);
  if (NOW.getMonth() + 1 < Number(mon)) a -= 1;
  return a >= 0 ? a : null;
}

function toRow(c: Child): Row {
  const [y, m] = (c.birthMonth ?? '').split('-');
  return { id: c.id, name: c.name, mon: m || '', year: y || '' };
}

/**
 * Captures or edits the kids: name (required) and a birth month + year, so age
 * stays current as years pass. Full-screen for onboarding, embedded in a modal
 * for editing later (add / remove / change a child).
 */
export default function KidsSetup({
  onDone,
  onSkip,
  onCancel,
  initialChildren,
  embedded = false,
  title = 'Who are we planning for?',
  submitLabel = 'Go to my library',
}: {
  onDone: () => void;
  onSkip?: () => void;
  onCancel?: () => void;
  initialChildren?: Child[];
  embedded?: boolean;
  title?: string;
  submitLabel?: string;
}) {
  const [rows, setRows] = useState<Row[]>(
    initialChildren && initialChildren.length
      ? initialChildren.map(toRow)
      : [{ name: '', mon: '', year: '' }],
  );
  const [saving, setSaving] = useState(false);

  const valid = rows.length > 0 && rows.every((r) => r.name.trim() && r.mon && r.year);

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function finish() {
    if (!valid) return;
    setSaving(true);
    const profile: MemberProfile = {
      children: rows.map((r) => ({
        id: r.id || genChildId(),
        name: r.name.trim(),
        birthMonth: `${r.year}-${r.mon}`,
      })),
      completedAt: new Date().toISOString(),
      version: 1,
    };
    saveProfile(profile);
    onDone();
  }

  const selectClass =
    'h-11 rounded-xl border border-gray-200 bg-white px-2.5 text-[14px] text-ink focus:border-forest focus:outline-none cursor-pointer';

  const card = (
    <div className="bg-white rounded-2xl border border-gold/20 p-6 sm:p-8">
      <p className="font-display italic text-[13px] text-gold-dark mb-1">
        {embedded ? 'Your kids' : 'Welcome to your library'}
      </p>
      <h1 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.1] text-forest-dark mb-5">
        {title}
      </h1>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const age = ageFrom(r.year, r.mon);
          return (
            <div key={i} className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                value={r.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                className="flex-1 min-w-[140px] h-11 rounded-xl border border-gray-200 px-3.5 text-[15px] text-ink placeholder:text-gray-400 focus:border-forest focus:outline-none"
              />
              <select
                value={r.mon}
                onChange={(e) => update(i, { mon: e.target.value })}
                aria-label="Birth month"
                className={selectClass}
              >
                <option value="">Month</option>
                {MONTHS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={r.year}
                onChange={(e) => update(i, { year: e.target.value })}
                aria-label="Birth year"
                className={selectClass}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="w-14 shrink-0 text-[13px] text-gray-500 text-center">
                {age != null ? `age ${age}` : ''}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove child"
                  className="h-11 w-9 grid place-items-center text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { name: '', mon: '', year: '' }])}
        className="mt-3 text-[14px] font-medium text-forest hover:text-forest-dark"
      >
        + Add another child
      </button>

      <div className="flex items-center justify-end gap-4 mt-8">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[14px] text-gray-500 hover:text-ink">
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={finish}
          disabled={!valid || saving}
          className="bg-forest text-white text-[15px] font-medium px-7 py-2.5 rounded-full hover:bg-forest-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </div>
  );

  if (embedded) return card;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {card}
        {onSkip && (
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={onSkip}
              className="text-[13.5px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
