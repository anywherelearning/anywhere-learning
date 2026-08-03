'use client';

import { useState } from 'react';
import { genChildId, saveProfile, type Child, type MemberProfile } from '@/lib/member-profile';
import { setWalkMode } from '@/lib/kid-roadmap';
import { TERRITORIES } from '@/lib/roadmap';
import { savePrefs, ALL_EFFORTS, EFFORT_LABEL } from '@/lib/plan-prefs';
import type { Effort } from '@/lib/activity-effort';

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
  const [justSaved, setJustSaved] = useState(false);

  // ─── family plan preferences (skip the whole block when editing kids) ───
  const [focusAll, setFocusAll] = useState(true);
  const [selTerritories, setSelTerritories] = useState<Set<string>>(new Set(TERRITORIES.map((t) => t.slug)));
  const [timeAll, setTimeAll] = useState(true);
  const [selEfforts, setSelEfforts] = useState<Set<Effort>>(new Set(ALL_EFFORTS));
  const [walk, setWalk] = useState<'family' | 'individual'>('family');

  const toggle = <T,>(set: Set<T>, v: T): Set<T> => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  };

  const valid = rows.length > 0 && rows.every((r) => r.name.trim() && r.mon && r.year);

  function setRowsDirty(updater: (prev: Row[]) => Row[]) {
    setJustSaved(false);
    setRows(updater);
  }

  function update(i: number, patch: Partial<Row>) {
    setRowsDirty((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function finish() {
    if (!valid) return;
    setSaving(true);
    // Assign ids once so the saved profile and the on-screen rows stay in sync.
    const withIds = rows.map((r) => ({ ...r, id: r.id || genChildId() }));
    const profile: MemberProfile = {
      children: withIds.map((r) => ({
        id: r.id,
        name: r.name.trim(),
        birthMonth: `${r.year}-${r.mon}`,
      })),
      completedAt: new Date().toISOString(),
      version: 1,
    };
    saveProfile(profile);
    if (!embedded) {
      // first-run only: capture the family plan preferences for the engine
      const territories = focusAll ? TERRITORIES.map((t) => t.slug) : [...selTerritories];
      const efforts = timeAll ? [...ALL_EFFORTS] : [...selEfforts];
      savePrefs({
        territories: territories.length ? territories : TERRITORIES.map((t) => t.slug),
        efforts: efforts.length ? efforts : [...ALL_EFFORTS],
      });
      setWalkMode(withIds.length > 1 ? walk : 'family');
    }
    setRows(withIds);
    onDone();
    setSaving(false);
    setJustSaved(true);
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
                  onClick={() => setRowsDirty((prev) => prev.filter((_, idx) => idx !== i))}
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
        onClick={() => setRowsDirty((prev) => [...prev, { name: '', mon: '', year: '' }])}
        className="mt-3 text-[14px] font-medium text-forest hover:text-forest-dark"
      >
        + Add another child
      </button>

      {!embedded && (
        <div className="mt-7 pt-6 border-t border-gold/15 space-y-6">
          <fieldset>
            <legend className="text-[15px] font-semibold text-forest-dark mb-2.5">What should we focus on?</legend>
            <div className="flex flex-wrap gap-2">
              <PrefPill on={focusAll} onClick={() => setFocusAll(true)}>All skill areas <span className="opacity-60">· recommended</span></PrefPill>
              <PrefPill on={!focusAll} onClick={() => setFocusAll(false)}>Choose areas</PrefPill>
            </div>
            {!focusAll && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {TERRITORIES.map((t) => (
                  <ChoiceChip key={t.slug} on={selTerritories.has(t.slug)} onClick={() => setSelTerritories((s) => toggle(s, t.slug))}>
                    {t.name}
                  </ChoiceChip>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-[15px] font-semibold text-forest-dark mb-2.5">How much time do you usually have?</legend>
            <div className="flex flex-wrap gap-2">
              <PrefPill on={timeAll} onClick={() => setTimeAll(true)}>Any length <span className="opacity-60">· recommended</span></PrefPill>
              <PrefPill on={!timeAll} onClick={() => setTimeAll(false)}>Just some</PrefPill>
            </div>
            {!timeAll && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ALL_EFFORTS.map((e) => (
                  <ChoiceChip key={e} on={selEfforts.has(e)} onClick={() => setSelEfforts((s) => toggle(s, e))}>
                    {EFFORT_LABEL[e]}
                  </ChoiceChip>
                ))}
              </div>
            )}
          </fieldset>

          {rows.length > 1 && (
            <fieldset>
              <legend className="text-[15px] font-semibold text-forest-dark mb-2.5">One trail for the family, or one per child?</legend>
              <div className="flex flex-wrap gap-2">
                <PrefPill on={walk === 'family'} onClick={() => setWalk('family')}>One family trail <span className="opacity-60">· recommended</span></PrefPill>
                <PrefPill on={walk === 'individual'} onClick={() => setWalk('individual')}>A trail per child</PrefPill>
              </div>
              <p className="text-[12.5px] text-gray-500 mt-2">
                {walk === 'family'
                  ? 'Everyone does the same activity together — simplest, and great for siblings.'
                  : 'Each child gets their own next activity, matched to their age.'}
              </p>
            </fieldset>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-4 mt-8">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[14px] text-gray-500 hover:text-ink">
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={finish}
          disabled={!valid || saving || justSaved}
          className={`inline-flex items-center gap-2 text-white text-[15px] font-medium px-7 py-2.5 rounded-full transition-colors disabled:cursor-default ${
            justSaved ? 'bg-forest-dark' : 'bg-forest hover:bg-forest-dark disabled:opacity-40'
          }`}
        >
          {justSaved && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12l5 5L20 6" />
            </svg>
          )}
          {saving ? 'Saving...' : justSaved ? 'Saved' : submitLabel}
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

function PrefPill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[13.5px] font-medium px-4 py-2 rounded-full border transition-colors ${
        on ? 'bg-forest text-white border-forest' : 'bg-white text-ink border-gray-200 hover:border-forest/40'
      }`}
    >
      {children}
    </button>
  );
}

function ChoiceChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
        on ? 'bg-[#E6EBDF] text-forest-dark border-[#C9D3BE]' : 'bg-white text-gray-500 border-gray-200 hover:border-forest/30'
      }`}
    >
      {children}
    </button>
  );
}
