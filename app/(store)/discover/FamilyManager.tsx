'use client';

import { useState } from 'react';
import {
  ModalShell,
  PrimaryButton,
  GhostButton,
  SERIF,
  ChildAvatar,
} from './dashboard-shared';
import { createChild, updateChild, deleteChild } from './dashboard-api';
import { KID_AVATARS, KidAvatarSvg } from './kid-avatars';
import type { Child } from './dashboard-types';

interface FamilyManagerProps {
  open: boolean;
  onClose: () => void;
  children: Child[];
  onChange: (children: Child[]) => void;
}

const KID_PALETTE = ['#588157', '#C4836A', '#5B8FA8', '#C47A8F', '#D4A373', '#7B88A8', '#8B7355', '#5A9B9C'];

function currentAge(birthYear: number | null): string {
  if (!birthYear) return '';
  const age = new Date().getFullYear() - birthYear;
  return age >= 0 && age <= 25 ? `${age} yrs` : '';
}

interface EditState {
  id: string | null;
  name: string;
  birthYear: string;
  color: string;
  emoji: string | null;
  avatar: string | null;
}

const EMPTY_EDIT: EditState = {
  id: null,
  name: '',
  birthYear: '',
  color: KID_PALETTE[0],
  emoji: null,
  avatar: KID_AVATARS[0].id,
};

export default function FamilyManager({ open, onClose, children, onChange }: FamilyManagerProps) {
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputStyle = {
    width: '100%',
    background: '#FFFDF7',
    border: '1px solid #E5E0D2',
    borderRadius: 10,
    padding: '9px 12px',
    fontFamily: '"DM Sans"',
    fontSize: 14,
    color: '#2D3A2E',
    outline: 'none',
  };
  const labelStyle = {
    display: 'block' as const,
    marginBottom: 6,
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    fontSize: 10.5,
    letterSpacing: '.14em',
    textTransform: 'uppercase' as const,
    color: '#7B8378',
  };

  const startNew = () => {
    const usedColors = new Set(children.map((c) => c.color));
    const nextColor = KID_PALETTE.find((c) => !usedColors.has(c)) ?? KID_PALETTE[children.length % KID_PALETTE.length];
    setEdit({ ...EMPTY_EDIT, color: nextColor });
    setShowForm(true);
  };

  const startEdit = (child: Child) => {
    setEdit({
      id: child.id,
      name: child.name,
      birthYear: child.birthYear ? String(child.birthYear) : '',
      color: child.color,
      emoji: child.emoji,
      avatar: child.avatar ?? null,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!edit.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: edit.name.trim(),
        birthYear: edit.birthYear ? Number(edit.birthYear) : null,
        color: edit.color,
        emoji: edit.emoji,
        avatar: edit.avatar,
      };
      if (edit.id) {
        const updated = await updateChild(edit.id, payload);
        onChange(children.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createChild(payload);
        onChange([...children, created]);
      }
      setShowForm(false);
      setEdit(EMPTY_EDIT);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (child: Child) => {
    if (
      !confirm(
        `Remove ${child.name} from your family setup? Old log entries will keep their snapshot name.`
      )
    )
      return;
    try {
      await deleteChild(child.id);
      onChange(children.filter((c) => c.id !== child.id));
      if (edit.id === child.id) {
        setShowForm(false);
        setEdit(EMPTY_EDIT);
      }
    } catch (err) {
      console.error(err);
      alert('Could not remove child');
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Family setup" maxWidth={600}>
      <div className="grid gap-4">
        <p style={{ margin: 0, fontSize: 13.5, color: '#4F5A50', lineHeight: 1.5 }}>
          Add each kid once. After that, you&apos;ll pick who did the activity with a single click,
          no more typing names. Each kid has their own color so you can spot them in the calendar
          and log.
        </p>

        {/* Kid list */}
        {children.length > 0 && (
          <div className="grid gap-2">
            {children.map((child) => (
              <div
                key={child.id}
                style={{
                  background: '#FFFDF7',
                  border: '1px solid #E5E0D2',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <ChildAvatar child={child} size={38} />
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
                  <div style={{ fontSize: 12, color: '#7B8378', marginTop: 2 }}>
                    {currentAge(child.birthYear) || 'No age set'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(child)}
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
                  onClick={() => handleDelete(child)}
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
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {children.length === 0 && !showForm && (
          <div
            style={{
              background: '#FFFDF7',
              border: '1px dashed #E5E0D2',
              borderRadius: 12,
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: 13.5,
              color: '#7B8378',
            }}
          >
            No kids set up yet. Add your first below.
          </div>
        )}

        {/* Add/edit form */}
        {showForm ? (
          <div
            style={{
              background: '#FAF9F6',
              border: '1px solid #E5E0D2',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              gap: 14,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 17,
                color: '#2D3A2E',
              }}
            >
              {edit.id ? 'Edit kid' : 'Add a kid'}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={edit.name}
                  onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Emma"
                  style={inputStyle}
                  maxLength={40}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Birth year (optional)</label>
                <input
                  type="number"
                  value={edit.birthYear}
                  onChange={(e) => setEdit((s) => ({ ...s, birthYear: e.target.value }))}
                  placeholder="e.g. 2017"
                  min={1990}
                  max={new Date().getFullYear()}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Color</label>
              <div className="flex flex-wrap gap-2">
                {KID_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEdit((s) => ({ ...s, color: c }))}
                    aria-label={`Color ${c}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: edit.color === c ? '3px solid #2D3A2E' : '2px solid #FFFDF7',
                      boxShadow: '0 0 0 1px #E5E0D2',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Pick a character</label>
              <div className="flex flex-wrap gap-2.5">
                {KID_AVATARS.map((av) => {
                  const selected = edit.avatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEdit((s) => ({ ...s, avatar: av.id }))}
                      aria-label={av.label}
                      aria-pressed={selected}
                      title={av.label}
                      style={{
                        padding: 3,
                        borderRadius: '50%',
                        background: selected ? '#E6EBDF' : 'transparent',
                        border: `2px solid ${selected ? '#588157' : 'transparent'}`,
                        cursor: 'pointer',
                        lineHeight: 0,
                      }}
                    >
                      <KidAvatarSvg id={av.id} size={44} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <GhostButton onClick={() => { setShowForm(false); setEdit(EMPTY_EDIT); }}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !edit.name.trim()}>
                {saving ? 'Saving…' : edit.id ? 'Save changes' : 'Add to family'}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="flex justify-end pt-1">
            <PrimaryButton onClick={startNew}>+ Add a kid</PrimaryButton>
          </div>
        )}

        <div className="flex justify-end pt-3" style={{ borderTop: '1px solid #E5E0D2' }}>
          <GhostButton onClick={onClose}>Done</GhostButton>
        </div>
      </div>
    </ModalShell>
  );
}
