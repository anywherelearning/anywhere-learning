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
import {
  ALIcons,
  ALTokens,
  ChildAvatar,
  Dot,
  Eyebrow,
  GhostButton,
  PrimaryButton,
  tintForCategory,
} from './dashboard-shared';
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
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(166deg, #fffdf9 0%, #f6f1e7 100%)',
        border: `1px solid ${ALTokens.color.line}`,
        borderRadius: ALTokens.radius.xl,
        padding: 'clamp(22px, 4vw, 34px)',
        boxShadow: ALTokens.shadow.sm,
        overflow: 'hidden',
      }}
    >
      {/* earthy accent rule */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: ALTokens.color.earthy,
          opacity: 0.85,
        }}
      />

      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: ALTokens.radius.sm,
            background: 'rgba(139,115,85,0.18)',
          }}
        >
          <ALIcons.Grid size={18} color={ALTokens.color.earthy} />
        </span>
        <Eyebrow>The library</Eyebrow>
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: ALTokens.font,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          color: ALTokens.color.ink,
          maxWidth: '18em',
        }}
      >
        Browse the shelf. Add what calls to you.
      </h2>
      <p
        style={{
          margin: '12px 0 24px',
          fontSize: 15.5,
          color: ALTokens.color.body,
          lineHeight: 1.6,
          maxWidth: '36em',
        }}
      >
        Every Anywhere Learning activity, filterable. Peek inside any one or drop it straight onto your week.
      </p>

      {/* Filters: search + category chips */}
      <div className="flex flex-col gap-3 mb-5">
        <div
          className="flex items-center gap-2"
          style={{
            background: ALTokens.color.paper,
            border: `1px solid ${ALTokens.color.line}`,
            borderRadius: ALTokens.radius.pill,
            padding: '2px 8px 2px 14px',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: ALTokens.font,
              fontSize: 14,
              color: ALTokens.color.ink,
              padding: '8px 0',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={category === 'all'} onClick={() => setCategory('all')} />
          {categoriesWithCounts.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              color={tintForCategory(c.value).dot}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            />
          ))}
        </div>
      </div>

      {/* Grid: paper cards with 3px category-accent left spine */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {results.map((a) => {
          const tint = tintForCategory(a.product.category);
          return (
            <div
              key={a.product.slug}
              className="flex flex-col overflow-hidden"
              style={{
                background: ALTokens.color.paper,
                border: `1px solid ${ALTokens.color.line}`,
                borderLeft: `3px solid ${tint.dot}`,
                borderRadius: ALTokens.radius.md,
                boxShadow: ALTokens.shadow.xs,
              }}
            >
              {a.product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.product.imageUrl}
                  alt={a.product.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    borderBottom: `1px solid ${ALTokens.color.lineSoft}`,
                  }}
                />
              )}
              <div className="flex grow flex-col gap-2 p-4">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontFamily: ALTokens.font,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: tint.dot,
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}
                >
                  <Dot color={tint.dot} size={6} />
                  {CATEGORY_LABELS[a.product.category] || 'Activity'}
                </span>
                <h4
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
                  {a.product.name}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontFamily: ALTokens.font,
                    fontSize: 12,
                    color: ALTokens.color.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {a.product.ageRange ?? 'All ages'} · {SETTING_LABEL[a.setting]} · {INDEPENDENCE_LABEL[a.independence]}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdding(a.product.slug)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: 'rgba(88,129,87,0.10)',
                      color: ALTokens.color.forest,
                      border: `1px solid ${ALTokens.color.line}`,
                      borderRadius: ALTokens.radius.sm,
                      padding: '8px 10px',
                      fontFamily: ALTokens.font,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: `all 150ms ${ALTokens.ease}`,
                    }}
                  >
                    <ALIcons.Plus size={13} color={ALTokens.color.forest} />
                    Add to week
                  </button>
                  <a
                    href={`/api/download/activity/${a.product.slug}?view=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: ALTokens.color.paper,
                      color: ALTokens.color.body,
                      border: `1px solid ${ALTokens.color.line}`,
                      borderRadius: ALTokens.radius.sm,
                      padding: '8px 12px',
                      fontFamily: ALTokens.font,
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {results.length === 0 && (
        <p
          className="py-10 text-center"
          style={{
            fontFamily: ALTokens.font,
            fontSize: 14,
            color: ALTokens.color.muted,
          }}
        >
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

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const accent = color || ALTokens.color.forest;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: ALTokens.font,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        background: active ? accent : ALTokens.color.paper,
        border: `1px solid ${active ? accent : ALTokens.color.line}`,
        color: active ? '#fff' : ALTokens.color.body,
        padding: '7px 14px',
        borderRadius: ALTokens.radius.pill,
        whiteSpace: 'nowrap',
        transition: `all 150ms ${ALTokens.ease}`,
      }}
    >
      {color && <Dot color={active ? '#fff' : accent} size={7} />}
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(45,58,46,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: ALTokens.color.cream,
          border: `1px solid ${ALTokens.color.line}`,
          borderRadius: ALTokens.radius.xl,
          padding: 26,
          boxShadow: ALTokens.shadow.lg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>Add to plan</Eyebrow>
        <h3
          style={{
            margin: '10px 0 0',
            fontFamily: ALTokens.font,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.018em',
            color: ALTokens.color.ink,
            lineHeight: 1.2,
          }}
        >
          {activityName}
        </h3>

        <label className="mt-5 block" style={{ fontFamily: ALTokens.font }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: ALTokens.color.goldDark,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Which day?
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              background: ALTokens.color.paper,
              border: `1px solid ${ALTokens.color.line}`,
              borderRadius: ALTokens.radius.sm,
              padding: '9px 12px',
              fontFamily: ALTokens.font,
              fontSize: 14,
              color: ALTokens.color.ink,
              outline: 'none',
            }}
          />
        </label>

        {kids.length > 0 && (
          <div className="mt-4" style={{ fontFamily: ALTokens.font }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: ALTokens.color.goldDark,
                display: 'block',
                marginBottom: 10,
              }}
            >
              For who? (optional)
            </span>
            <div className="flex flex-wrap gap-2">
              {kids.map((k) => {
                const on = selectedKids.includes(k.id);
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKid(k.id)}
                    className="flex items-center gap-2"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: on ? `${k.color}1A` : ALTokens.color.paper,
                      border: `1px solid ${on ? k.color : ALTokens.color.line}`,
                      color: on ? k.color : ALTokens.color.body,
                      padding: '5px 14px 5px 5px',
                      borderRadius: ALTokens.radius.pill,
                      fontFamily: ALTokens.font,
                      transition: `all 150ms ${ALTokens.ease}`,
                    }}
                  >
                    <ChildAvatar child={k} size={22} />
                    {k.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="mt-6 flex justify-end gap-2 items-center"
          style={{
            paddingTop: 16,
            borderTop: `1px solid ${ALTokens.color.line}`,
          }}
        >
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={add} disabled={saving}>
            {saving ? 'Adding...' : 'Add to plan'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
