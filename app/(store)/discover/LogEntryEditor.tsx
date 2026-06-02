'use client';

import { useState, useEffect } from 'react';
import {
  STANDARD_SUBJECTS,
  LOG_ENTRY_TYPES,
  defaultSubjectsForCategory,
} from '@/lib/taxonomy';
import { CATEGORIES } from '@/lib/categories';
import { fallbackProducts } from '@/lib/fallback-products';
import {
  ModalShell,
  PrimaryButton,
  GhostButton,
  SubjectChip,
  ChildAvatar,
  HelpHint,
  resolveSubject,
  SERIF,
} from './dashboard-shared';
import { createCustomSubject } from './dashboard-api';
import { useToast } from './Toast';
import type { LogEntry, CustomSubject, Child } from './dashboard-types';

interface LogEntryEditorProps {
  open: boolean;
  onClose: () => void;
  /** Existing log entry to edit, or null for new entry */
  entry?: LogEntry | null;
  /** Defaults for a new entry */
  defaults?: Partial<LogEntry>;
  customSubjects: CustomSubject[];
  onCustomSubjectsChange: (subjects: CustomSubject[]) => void;
  childrenList: Child[];
  onOpenFamilySetup?: () => void;
  onSave: (data: Omit<LogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ACTIVITY_PRODUCTS = fallbackProducts.filter((p) => !p.isBundle && p.active);

export default function LogEntryEditor({
  open,
  onClose,
  entry,
  defaults,
  customSubjects,
  onCustomSubjectsChange,
  childrenList,
  onOpenFamilySetup,
  onSave,
}: LogEntryEditorProps) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<string>(entry?.type ?? defaults?.type ?? 'custom');
  const [date, setDate] = useState<string>(entry?.date ?? defaults?.date ?? todayISO);
  const [title, setTitle] = useState(entry?.title ?? defaults?.title ?? '');
  const [productSlug, setProductSlug] = useState<string | null>(
    entry?.productSlug ?? defaults?.productSlug ?? null
  );
  const [category, setCategory] = useState<string | null>(
    entry?.category ?? defaults?.category ?? null
  );
  const [subjects, setSubjects] = useState<string[]>(
    entry?.subjects ?? defaults?.subjects ?? []
  );
  const [childIds, setChildIds] = useState<string[]>(
    entry?.childIds ?? defaults?.childIds ?? []
  );
  const [notes, setNotes] = useState(entry?.notes ?? defaults?.notes ?? '');
  const [duration, setDuration] = useState<string>(
    entry?.durationMinutes != null
      ? String(entry.durationMinutes)
      : defaults?.durationMinutes != null
      ? String(defaults.durationMinutes)
      : ''
  );
  const [newSubjectLabel, setNewSubjectLabel] = useState('');
  // Photo capture is pulled until the private-storage V2 (signed URLs). We
  // still pass through any photos already on an entry so editing an older
  // entry never silently drops them, but there is no uploader UI.
  const photos: string[] = entry?.photos ?? defaults?.photos ?? [];
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setType(entry?.type ?? defaults?.type ?? 'custom');
    setDate(entry?.date ?? defaults?.date ?? todayISO);
    setTitle(entry?.title ?? defaults?.title ?? '');
    setProductSlug(entry?.productSlug ?? defaults?.productSlug ?? null);
    setCategory(entry?.category ?? defaults?.category ?? null);
    setSubjects(entry?.subjects ?? defaults?.subjects ?? []);
    setChildIds(entry?.childIds ?? defaults?.childIds ?? []);
    setNotes(entry?.notes ?? defaults?.notes ?? '');
    setDuration(
      entry?.durationMinutes != null
        ? String(entry.durationMinutes)
        : defaults?.durationMinutes != null
        ? String(defaults.durationMinutes)
        : ''
    );
    setNewSubjectLabel('');
    setSaving(false);
  }, [open, entry, defaults, todayISO]);

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
    if (subjects.length === 0) {
      setSubjects(defaultSubjectsForCategory(product.category));
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat || null);
    if (subjects.length === 0 && cat) {
      setSubjects(defaultSubjectsForCategory(cat));
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((s) => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleChild = (id: string) => {
    setChildIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddCustomSubject = async () => {
    const label = newSubjectLabel.trim();
    if (!label) return;
    try {
      const created = await createCustomSubject({ label });
      onCustomSubjectsChange([...customSubjects, created]);
      setSubjects([...subjects, created.slug]);
      setNewSubjectLabel('');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Could not create subject');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const childNamesSnapshot = childIds
        .map((id) => childrenList.find((c) => c.id === id)?.name)
        .filter((n): n is string => !!n);

      await onSave({
        date,
        title: title.trim(),
        type,
        category,
        productSlug,
        subjects,
        childIds,
        childNames: childNamesSnapshot,
        photos,
        notes: notes.trim() ? notes.trim() : null,
        durationMinutes: duration ? Number(duration) : null,
      });
      toast.success(entry ? 'Entry updated' : 'Entry saved');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
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
    <ModalShell open={open} onClose={onClose} title={entry ? 'Edit entry' : 'Log activity'}>
      <div className="grid gap-4">
        {/* Type selector */}
        <div>
          <label style={labelStyle}>
            Type
            <HelpHint title="What kind of learning?">
              Pick whatever fits. &ldquo;Activity&rdquo; for Anywhere Learning packs. &ldquo;Field trip&rdquo;,
              &ldquo;Book&rdquo;, &ldquo;Lesson&rdquo;, &ldquo;Documentary&rdquo; for everything else.
              Helps you sort the portfolio later.
            </HelpHint>
          </label>
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

        {/* Activity picker (only when type=activity) */}
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
          </div>
        )}

        {/* Title */}
        <div>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'book'
                ? 'e.g. Charlotte’s Web by E.B. White'
                : type === 'field-trip'
                ? 'e.g. Royal Tyrrell Museum visit'
                : type === 'lesson'
                ? 'e.g. Piano lesson with Mrs. Park'
                : 'Short description'
            }
            style={inputStyle}
            maxLength={200}
          />
        </div>

        {/* Date + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
              min={0}
              max={1440}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category (AL)</label>
          <select
            value={category ?? ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
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

        {/* Subjects */}
        <div>
          <label style={labelStyle}>
            Subjects (for portfolio)
            <HelpHint title="Why subjects?">
              These are the 7 standard homeschool subjects used in most reporting / annual reviews
              (Math, Science, ELA, History, Art, PE, Life Skills). Tag each entry with all that
              apply. Add custom ones (Spanish, Piano, Latin) below.
            </HelpHint>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {subjects.map((s) => {
              const resolved = resolveSubject(s, customSubjects);
              return (
                <SubjectChip
                  key={s}
                  subjectId={s}
                  customSubjects={customSubjects}
                  onRemove={() => toggleSubject(s)}
                />
              );
            })}
            {subjects.length === 0 && (
              <span style={{ fontSize: 13, color: '#7B8378' }}>None selected yet.</span>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-1.5">
              {STANDARD_SUBJECTS.filter((s) => !subjects.includes(s.id)).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    background: '#FFFDF7',
                    border: `1px dashed ${s.color}80`,
                    color: s.color,
                    fontFamily: '"DM Sans"',
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '4px 9px',
                    borderRadius: 999,
                  }}
                >
                  + {s.label}
                </button>
              ))}
              {customSubjects
                .filter((s) => !subjects.includes(s.slug))
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.slug)}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      background: '#FFFDF7',
                      border: `1px dashed ${s.color}80`,
                      color: s.color,
                      fontFamily: '"DM Sans"',
                      fontWeight: 600,
                      fontSize: 11,
                      padding: '4px 9px',
                      borderRadius: 999,
                    }}
                  >
                    + {s.label}
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubjectLabel}
                onChange={(e) => setNewSubjectLabel(e.target.value)}
                placeholder="Custom subject (e.g. Spanish, Piano)"
                style={{ ...inputStyle, fontSize: 13 }}
                maxLength={40}
              />
              <GhostButton small onClick={handleAddCustomSubject}>
                Add
              </GhostButton>
            </div>
          </div>
        </div>

        {/* Children */}
        <div>
          <label style={labelStyle}>Who did this?</label>
          {childrenList.length === 0 ? (
            <div
              style={{
                background: '#FFFDF7',
                border: '1px dashed #E5E0D2',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 13,
                color: '#7B8378',
              }}
            >
              No kids set up yet.{' '}
              {onOpenFamilySetup && (
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
                    fontSize: 13,
                    textDecoration: 'underline',
                  }}
                >
                  Add your kids →
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {childrenList.map((child) => {
                const active = childIds.includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      background: active ? `${child.color}1A` : '#FFFDF7',
                      border: `1px solid ${active ? child.color : '#E5E0D2'}`,
                      borderRadius: 999,
                      padding: '5px 12px 5px 5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: active ? child.color : '#4F5A50',
                      fontFamily: '"DM Sans"',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    <ChildAvatar child={child} size={22} />
                    {child.name}
                    {active && <span style={{ marginLeft: 2 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did they learn? What surprised you? What worked / didn't?"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            maxLength={2000}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid #E5E0D2' }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : entry ? 'Save changes' : 'Save entry'}
          </PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
}
