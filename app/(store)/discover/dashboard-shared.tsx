'use client';

/**
 * Shared visual primitives used across all three dashboard tabs.
 * Kept in one file so the design system stays internally consistent.
 */

import { ReactNode } from 'react';
import { STANDARD_SUBJECTS, getSubjectById } from '@/lib/taxonomy';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { CustomSubject, Child } from './dashboard-types';
import { KID_AVATAR_IDS, KidAvatarSvg } from './kid-avatars';

export const SERIF = '"DM Serif Display", Georgia, serif';
export const SCRIPT = '"Dancing Script", cursive';

// ─── Category / Subject color resolution ─────────────────────────────────────

export const CATEGORY_TINTS: Record<string, { bg: string; fg: string; dot: string }> = {
  'outdoor-learning':         { bg: '#E6EBDF', fg: '#3A5A40', dot: '#6B8E6B' },
  'creativity-maker':         { bg: '#F7EBE2', fg: '#7A3D24', dot: '#C4836A' },
  'real-world-math':          { bg: '#F2EFE4', fg: '#5A5240', dot: '#8B7355' },
  'planning-problem-solving': { bg: '#EBE7F0', fg: '#3D2D5A', dot: '#7A6DA8' },
  'ai-literacy':              { bg: '#E8EBF2', fg: '#3D4664', dot: '#7B88A8' },
  'entrepreneurship':         { bg: '#F7E8E9', fg: '#7A3D24', dot: '#C4836A' },
  'communication-writing':    { bg: '#E2ECF2', fg: '#2D4A5A', dot: '#5B8FA8' },
  'worldschooling':           { bg: '#E0EDED', fg: '#2D4F50', dot: '#5A9B9C' },
  'start-here':               { bg: '#F5E7D6', fg: '#7A5E1F', dot: '#D4A373' },
  'bundle':                   { bg: '#F5E7D6', fg: '#7A5E1F', dot: '#D4A373' },
};

export function tintForCategory(cat: string | null | undefined) {
  if (!cat) return CATEGORY_TINTS['outdoor-learning'];
  return CATEGORY_TINTS[cat] || CATEGORY_TINTS['outdoor-learning'];
}

// ─── Reusable atoms ──────────────────────────────────────────────────────────

export function Eyebrow({
  children,
  color = '#3A5A40',
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <p
      className="flex items-center gap-2.5"
      style={{
        margin: 0,
        fontFamily: '"DM Sans"',
        fontWeight: 500,
        fontSize: 11.5,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color,
      }}
    >
      <span style={{ width: 22, height: 1, background: color, display: 'inline-block' }} />
      {children}
    </p>
  );
}

export function CategoryTag({ category }: { category: string | null | undefined }) {
  const tint = tintForCategory(category);
  const label = (category && CATEGORY_LABELS[category]) || 'Activity';
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        background: tint.bg,
        color: tint.fg,
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: 11.5,
        letterSpacing: '.04em',
        padding: '5px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tint.dot }} />
      {label}
    </span>
  );
}

/**
 * Resolves a subject id to its colored chip data, looking up
 * both standard subjects and the user's custom ones.
 */
export function resolveSubject(
  subjectId: string,
  customSubjects: CustomSubject[],
): { label: string; color: string } {
  const std = getSubjectById(subjectId);
  if (std) return { label: std.label, color: std.color };
  const custom = customSubjects.find((s) => s.slug === subjectId || s.id === subjectId);
  if (custom) return { label: custom.label, color: custom.color };
  return { label: subjectId, color: '#7B8378' };
}

export function SubjectChip({
  subjectId,
  customSubjects,
  onRemove,
}: {
  subjectId: string;
  customSubjects: CustomSubject[];
  onRemove?: () => void;
}) {
  const { label, color } = resolveSubject(subjectId, customSubjects);
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        background: `${color}1A`,
        color,
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: '.04em',
        padding: '4px 9px',
        borderRadius: 999,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          style={{
            marginLeft: 2,
            color,
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: 'none',
        border: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: '#588157',
        color: '#FAF9F6',
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: small ? 13 : 14.5,
        padding: small ? '8px 14px' : '12px 20px',
        borderRadius: 11,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        opacity: disabled ? 0.5 : 1,
        boxShadow:
          '0 1px 0 rgba(255,255,255,.18) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 12px 26px -14px rgba(58,90,64,.55)',
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = 'button',
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  small?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: 'transparent',
        color: '#3A5A40',
        border: '1px solid #C9D3BE',
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: small ? 12.5 : 13.5,
        padding: small ? '7px 12px' : '9px 14px',
        borderRadius: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

export function ModalShell({
  open,
  onClose,
  title,
  children,
  maxWidth = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="dashboard-modal-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dashboard-modal-card"
        style={
          {
            // CSS var consumed by .dashboard-modal-card@media query
            ['--modal-max-width' as string]: `${maxWidth}px`,
          } as React.CSSProperties
        }
      >
        <div
          className="flex items-center justify-between dashboard-modal-header"
        >
          {title ? (
            <h3
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 20,
                color: '#2D3A2E',
              }}
            >
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              color: '#7B8378',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div className="dashboard-modal-body">{children}</div>
      </div>
      <style>{`
        .dashboard-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(45,58,46,.55);
          backdrop-filter: blur(2px);
          display: grid;
          place-items: center;
          padding: 16px;
        }
        .dashboard-modal-card {
          background: #FAF9F6;
          border: 1px solid #E5E0D2;
          border-radius: 18px;
          width: 100%;
          max-width: var(--modal-max-width, 560px);
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 30px 80px -20px rgba(45,58,46,.4);
        }
        .dashboard-modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid #E5E0D2;
          position: sticky;
          top: 0;
          background: #FAF9F6;
          z-index: 1;
        }
        .dashboard-modal-body {
          padding: 20px 22px;
        }
        /* Bottom-sheet on mobile */
        @media (max-width: 640px) {
          .dashboard-modal-backdrop {
            place-items: end stretch;
            padding: 0;
          }
          .dashboard-modal-card {
            max-width: 100% !important;
            max-height: 92vh;
            border-radius: 18px 18px 0 0;
            border-left: 0;
            border-right: 0;
            border-bottom: 0;
            animation: sheet-up .22s cubic-bezier(.2,.7,.2,1);
          }
          .dashboard-modal-header {
            padding: 14px 18px 12px;
          }
          .dashboard-modal-body {
            padding: 16px 18px 24px;
          }
        }
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export const ALL_SUBJECTS_DESCRIPTIONS = STANDARD_SUBJECTS;

// ─── Child avatar + chip ─────────────────────────────────────────────────────

export function ChildAvatar({
  child,
  size = 24,
}: {
  child: Pick<Child, 'name' | 'color' | 'emoji'> & { avatar?: string | null };
  size?: number;
}) {
  // Preferred: illustrated avatar. Falls back to legacy emoji/initial.
  if (child.avatar && KID_AVATAR_IDS.has(child.avatar)) {
    return <KidAvatarSvg id={child.avatar} size={size} ring={child.color} />;
  }
  return (
    <span
      className="grid place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: child.color,
        color: '#FAF9F6',
        fontFamily: child.emoji ? 'inherit' : SERIF,
        fontSize: child.emoji ? Math.round(size * 0.55) : Math.max(10, Math.round(size * 0.42)),
        lineHeight: 1,
        flexShrink: 0,
        fontWeight: 600,
      }}
    >
      {child.emoji || child.name[0]?.toUpperCase()}
    </span>
  );
}

// ─── Help icon with tooltip on hover ─────────────────────────────────────────

export function HelpHint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <span className="relative inline-block group" style={{ verticalAlign: 'middle' }}>
      <span
        tabIndex={0}
        role="img"
        aria-label="More info"
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 16,
          height: 16,
          marginLeft: 6,
          borderRadius: '50%',
          background: '#E5E0D2',
          color: '#7B8378',
          fontSize: 10,
          fontWeight: 700,
          fontFamily: '"DM Sans"',
          cursor: 'help',
          userSelect: 'none',
        }}
      >
        ?
      </span>
      <span
        className="pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100"
        role="tooltip"
        style={{
          opacity: 0,
          transition: 'opacity .15s ease',
          position: 'absolute',
          left: 0,
          top: 'calc(100% + 6px)',
          zIndex: 50,
          background: '#2D3A2E',
          color: '#FAF9F6',
          fontSize: 12,
          lineHeight: 1.45,
          fontWeight: 400,
          fontFamily: '"DM Sans"',
          padding: '8px 12px',
          borderRadius: 8,
          maxWidth: 280,
          minWidth: 200,
          boxShadow: '0 12px 28px -10px rgba(45,58,46,.4)',
          textTransform: 'none',
          letterSpacing: 0,
          whiteSpace: 'normal',
        }}
      >
        <strong style={{ display: 'block', marginBottom: 2, color: '#FAF9F6' }}>{title}</strong>
        {children}
      </span>
    </span>
  );
}

export function ChildChip({
  child,
  onRemove,
  small,
}: {
  child: Pick<Child, 'name' | 'color' | 'emoji'>;
  onRemove?: () => void;
  small?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        background: `${child.color}1A`,
        color: child.color,
        fontFamily: '"DM Sans"',
        fontWeight: 600,
        fontSize: small ? 11 : 12,
        padding: small ? '3px 8px 3px 4px' : '4px 9px 4px 5px',
        borderRadius: 999,
        border: `1px solid ${child.color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <ChildAvatar child={child} size={small ? 16 : 18} />
      {child.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${child.name}`}
          style={{
            marginLeft: 1,
            color: child.color,
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
