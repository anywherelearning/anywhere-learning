'use client';

/**
 * The Library sub-tab: browse the full Anywhere Learning catalog and add any
 * activity straight to the plan. A parent can consult what exists, filter by
 * category, and drop one onto a specific day for a specific kid.
 *
 * "Open" hits the membership-aware activity endpoint (opens the PDF for
 * members, routes others to join). "Add to plan" creates a calendar event.
 */

import { useMemo, useState } from 'react';
import { ENRICHED_ACTIVITIES, SETTING_LABEL, INDEPENDENCE_LABEL } from '@/lib/activity-metadata';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import { CategoryTag, ChildAvatar, Eyebrow, GhostButton, PrimaryButton } from './dashboard-shared';
import { createCalendarEvent } from './dashboard-api';
import { useToast } from './Toast';
import type { Child } from './dashboard-types';

function isoMonday(input: string): string {
  const d = new Date(`${input}T00:00:00Z`);
  const dow = d.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return new Date(d.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
}

export default function PlanLibrary({
  kids,
  weekStart,
  onAdded,
}: {
  kids: Child[];
  weekStart: string;
  onAdded: () => void | Promise<void>;
}) {
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState<string | null>(null); // slug being added

  // Only categories that actually have activities, plus an "All".
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of ENRICHED_ACTIVITIES) {
      counts[a.product.category] = (counts[a.product.category] ?? 0) + 1;
    }
    return CATEGORIES.filter((c) => counts[c.value] > 0).map((c) => ({
      value: c.value,
      label: CATEGORY_LABELS[c.value] ?? c.label,
      count: counts[c.value],
    }));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENRICHED_ACTIVITIES.filter((a) => {
      if (category !== 'all' && a.product.category !== category) return false;
      if (q && !a.product.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query]);

  const activeAdding = adding ? ENRICHED_ACTIVITIES.find((a) => a.product.slug === adding) : null;

  return (
    <section>
      <div className="mb-3">
        <Eyebrow>The library</Eyebrow>
        <h2 className="mt-2 text-lg text-forest" style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}>
          Browse activities and add them
        </h2>
        <p className="mt-0.5 text-sm text-forest/65" style={{ fontFamily: '"DM Sans"' }}>
          Every Anywhere Learning activity. Filter, peek inside, and drop any one onto your week.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities..."
          className="w-full rounded-full border border-forest/15 bg-white px-4 py-2"
          style={{ fontFamily: '"DM Sans"', fontSize: 14, color: '#2D3A2E', outline: 'none' }}
        />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={category === 'all'} onClick={() => setCategory('all')} />
          {categoriesWithCounts.map((c) => (
            <FilterChip
              key={c.value}
              label={`${c.label}`}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {results.map((a) => (
          <div
            key={a.product.slug}
            className="flex flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white"
          >
            {a.product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.product.imageUrl}
                alt={a.product.name}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
              />
            )}
            <div className="flex grow flex-col gap-2 p-3">
              <CategoryTag category={a.product.category} />
              <p
                className="text-forest"
                style={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 14, lineHeight: 1.25 }}
              >
                {a.product.name}
              </p>
              <p className="text-forest/55" style={{ fontFamily: '"DM Sans"', fontSize: 11.5 }}>
                {a.product.ageRange ?? 'All ages'} · {SETTING_LABEL[a.setting]} · {INDEPENDENCE_LABEL[a.independence]}
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAdding(a.product.slug)}
                  className="flex-1 rounded-md px-2 py-1.5 hover:opacity-90 cursor-pointer"
                  style={{ background: '#588157', color: '#FAF9F6', fontFamily: '"DM Sans"', fontSize: 12, fontWeight: 600 }}
                >
                  Add to plan
                </button>
                <a
                  href={`/api/download/activity/${a.product.slug}?view=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-forest/20 px-2 py-1.5 text-forest/80 hover:bg-forest/5"
                  style={{ fontFamily: '"DM Sans"', fontSize: 12, fontWeight: 600 }}
                >
                  Open
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="py-10 text-center text-forest/55" style={{ fontFamily: '"DM Sans"', fontSize: 14 }}>
          No activities match. Try another category or search.
        </p>
      )}

      {activeAdding && (
        <AddToPlanDialog
          activitySlug={activeAdding.product.slug}
          activityName={activeAdding.product.name}
          category={activeAdding.product.category}
          mode={activeAdding.independence}
          durationMinutes={activeAdding.durationMinutes}
          kids={kids}
          defaultDate={isoMonday(weekStart)}
          onClose={() => setAdding(null)}
          onAdded={async () => {
            setAdding(null);
            await onAdded();
          }}
        />
      )}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5"
      style={{
        fontFamily: '"DM Sans"',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        background: active ? '#588157' : '#FFFFFF',
        border: `1px solid ${active ? '#588157' : '#E5E0D2'}`,
        color: active ? '#FAF9F6' : '#4F5A50',
      }}
    >
      {label}
    </button>
  );
}

function AddToPlanDialog({
  activitySlug,
  activityName,
  category,
  mode,
  durationMinutes,
  kids,
  defaultDate,
  onClose,
  onAdded,
}: {
  activitySlug: string;
  activityName: string;
  category: string;
  mode: 'independent' | 'together' | 'either';
  durationMinutes: number;
  kids: Child[];
  defaultDate: string;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
}) {
  const toast = useToast();
  const [date, setDate] = useState(defaultDate);
  const [selectedKids, setSelectedKids] = useState<string[]>(kids.length === 1 ? [kids[0].id] : []);
  const [saving, setSaving] = useState(false);

  const toggleKid = (id: string) =>
    setSelectedKids((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const add = async () => {
    setSaving(true);
    try {
      const chosen = kids.filter((k) => selectedKids.includes(k.id));
      await createCalendarEvent({
        date,
        title: activityName,
        type: 'activity',
        category,
        productSlug: activitySlug,
        childIds: chosen.map((k) => k.id),
        childNames: chosen.map((k) => k.name),
        mode,
        durationMinutes,
      });
      toast.success(`Added ${activityName} to ${date}.`);
      await onAdded();
    } catch (err) {
      console.error(err);
      toast.error('Could not add it. Try again?');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>Add to plan</Eyebrow>
        <h3 className="mt-2 text-lg text-forest" style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}>
          {activityName}
        </h3>

        <label className="mt-4 block text-sm" style={{ fontFamily: '"DM Sans"' }}>
          <span className="text-forest/70">Which day?</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-forest/15 px-2 py-1.5"
          />
        </label>

        {kids.length > 0 && (
          <div className="mt-3 text-sm" style={{ fontFamily: '"DM Sans"' }}>
            <span className="text-forest/70">For who? (optional)</span>
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
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={add} disabled={saving}>
            {saving ? 'Adding...' : 'Add to plan'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
