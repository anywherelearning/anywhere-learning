'use client';

import { useState, useEffect } from 'react';
import { LOG_ENTRY_TYPES } from '@/lib/taxonomy';
import { CATEGORIES } from '@/lib/categories';
import { fallbackProducts } from '@/lib/fallback-products';
import {
  ModalShell,
  PrimaryButton,
  GhostButton,
  HelpHint,
  SERIF,
} from './dashboard-shared';
import { useToast } from './Toast';
import type { CalendarEvent } from './dashboard-types';

interface CalendarEventEditorProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaults?: Partial<CalendarEvent>;
  onSave: (
    data: Omit<
      CalendarEvent,
      'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completed' | 'logEntryId' | 'isOccurrence' | 'seriesId'
    >
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const ACTIVITY_PRODUCTS = fallbackProducts.filter((p) => !p.isBundle && p.active);

const RECURRENCE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: 'none', label: 'One-time', description: 'Just this day.' },
  { value: 'weekly', label: 'Every week', description: 'Same day of the week, repeating.' },
  { value: 'biweekly', label: 'Every 2 weeks', description: 'Co-op or alternating schedule.' },
  { value: 'monthly', label: 'Monthly', description: 'Same date each month.' },
];

export default function CalendarEventEditor({
  open,
  onClose,
  event,
  defaults,
  onSave,
  onDelete,
}: CalendarEventEditorProps) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<string>(event?.type ?? defaults?.type ?? 'activity');
  const [date, setDate] = useState<string>(event?.date ?? defaults?.date ?? todayISO);
  const [title, setTitle] = useState(event?.title ?? defaults?.title ?? '');
  const [productSlug, setProductSlug] = useState<string | null>(
    event?.productSlug ?? defaults?.productSlug ?? null
  );
  const [category, setCategory] = useState<string | null>(
    event?.category ?? defaults?.category ?? null
  );
  const [notes, setNotes] = useState(event?.notes ?? defaults?.notes ?? '');
  const [recurrence, setRecurrence] = useState<string>(
    event?.recurrence ?? defaults?.recurrence ?? 'none'
  );
  const [recurrenceUntil, setRecurrenceUntil] = useState<string>(
    event?.recurrenceUntil ?? defaults?.recurrenceUntil ?? ''
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setType(event?.type ?? defaults?.type ?? 'activity');
    setDate(event?.date ?? defaults?.date ?? todayISO);
    setTitle(event?.title ?? defaults?.title ?? '');
    setProductSlug(event?.productSlug ?? defaults?.productSlug ?? null);
    setCategory(event?.category ?? defaults?.category ?? null);
    setNotes(event?.notes ?? defaults?.notes ?? '');
    setRecurrence(event?.recurrence ?? defaults?.recurrence ?? 'none');
    setRecurrenceUntil(event?.recurrenceUntil ?? defaults?.recurrenceUntil ?? '');
  }, [open, event, defaults, todayISO]);

  const handleProductChange = (slug: string) => {
    if (!slug) {
      setProductSlug(null);
      return;
    }
    const product = ACTIVITY_PRODUCTS.find((p) => p.slug === slug);
    if (!product) return;
    setProductSlug(slug);
    setTitle(product.name);
    setCategory(product.category);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        date,
        title: title.trim(),
        type,
        category,
        productSlug,
        notes: notes.trim() || null,
        recurrence,
        recurrenceUntil: recurrence !== 'none' && recurrenceUntil ? recurrenceUntil : null,
        childIds: event?.childIds ?? defaults?.childIds ?? [],
        childNames: event?.childNames ?? defaults?.childNames ?? [],
        mode: event?.mode ?? defaults?.mode ?? 'either',
        durationMinutes: event?.durationMinutes ?? defaults?.durationMinutes ?? null,
        generatedByPlannerAt: event?.generatedByPlannerAt ?? null,
        weeklyGoalId: event?.weeklyGoalId ?? null,
        customResourceId: event?.customResourceId ?? null,
        skipped: event?.skipped ?? false,
      });
      toast.success(event ? 'Event updated' : 'Added to calendar');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    toast.confirm({
      title: event?.recurrence && event.recurrence !== 'none'
        ? 'Remove the whole recurring series?'
        : 'Remove this from the calendar?',
      description: event?.recurrence && event.recurrence !== 'none'
        ? 'All future repeats will also be removed. Past completed occurrences stay in your log.'
        : 'This will not affect the activity log.',
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await onDelete();
          toast.success('Removed from calendar');
          onClose();
        } catch {
          toast.error('Could not remove event');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    fontSize: 11.5,
    letterSpacing: '.14em',
    textTransform: 'uppercase' as const,
    color: '#7B8378',
  };
  const inputStyle = {
    width: '100%',
    background: '#FFFDF7',
    border: '1px solid #E5E0D2',
    borderRadius: 10,
    padding: '10px 12px',
    fontFamily: '"DM Sans"',
    fontSize: 14,
    color: '#2D3A2E',
    outline: 'none',
  };

  return (
    <ModalShell open={open} onClose={onClose} title={event ? 'Edit event' : 'Add to calendar'}>
      <div className="grid gap-4">
        <div>
          <label style={labelStyle}>Type</label>
          <div className="flex gap-2 flex-wrap">
            {LOG_ENTRY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  background: type === t.id ? '#E6EBDF' : '#FFFDF7',
                  border: `1px solid ${type === t.id ? '#588157' : '#E5E0D2'}`,
                  color: type === t.id ? '#2D3A2E' : '#4F5A50',
                  fontFamily: '"DM Sans"',
                  fontWeight: type === t.id ? 600 : 500,
                  fontSize: 12.5,
                  padding: '7px 12px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontFamily: SERIF, color: '#3A5A40' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {type === 'activity' && (
          <div>
            <label style={labelStyle}>Anywhere Learning activity</label>
            <select
              value={productSlug ?? ''}
              onChange={(e) => handleProductChange(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select an activity…</option>
              {ACTIVITY_PRODUCTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            {productSlug && (
              <a
                href={`/api/download/activity/${productSlug}?view=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 hover:opacity-90"
                style={{
                  fontFamily: '"DM Sans"',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#588157',
                }}
              >
                Open this activity ↗
              </a>
            )}
          </div>
        )}

        <div>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's planned?"
            style={inputStyle}
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>{recurrence === 'none' ? 'Date' : 'Start date'}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value || null)}
              style={inputStyle}
            >
              <option value="">No category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label style={labelStyle}>
            Repeat
            <HelpHint title="Recurring events">
              Use this for piano lessons every Tuesday, co-op every other Thursday, monthly
              meetups, anything that repeats. Mark each occurrence done individually — past
              completions stay in your log even if you remove the series later.
            </HelpHint>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {RECURRENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecurrence(opt.value)}
                title={opt.description}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  background: recurrence === opt.value ? '#E6EBDF' : '#FFFDF7',
                  border: `1px solid ${recurrence === opt.value ? '#588157' : '#E5E0D2'}`,
                  color: recurrence === opt.value ? '#2D3A2E' : '#4F5A50',
                  fontFamily: '"DM Sans"',
                  fontWeight: recurrence === opt.value ? 600 : 500,
                  fontSize: 12.5,
                  padding: '7px 12px',
                  borderRadius: 999,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {recurrence !== 'none' && (
            <div className="mt-3">
              <label
                style={{ ...labelStyle, fontSize: 10, letterSpacing: '.12em' }}
              >
                Repeat until (optional)
              </label>
              <input
                type="date"
                value={recurrenceUntil}
                onChange={(e) => setRecurrenceUntil(e.target.value)}
                style={{ ...inputStyle, maxWidth: 240 }}
                placeholder="Forever if blank"
                min={date}
              />
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional. What to bring, where to go, prep needed."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
            maxLength={2000}
          />
        </div>

        <div className="flex justify-between gap-2 pt-2" style={{ borderTop: '1px solid #E5E0D2' }}>
          <div>
            {event && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
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
                {deleting ? 'Removing…' : 'Remove from calendar'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : event ? 'Save changes' : 'Add to calendar'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
