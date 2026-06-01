'use client';

/**
 * Shared visual primitives used across all dashboard tabs.
 *
 * Houses the "Almanac" design language (ALTokens) plus all existing
 * primitives. Existing exports keep their signatures so callers don't
 * break; the implementations now lean on ALTokens for visual coherence.
 */

import { CSSProperties, ReactNode, useState } from 'react';
import { STANDARD_SUBJECTS, getSubjectById } from '@/lib/taxonomy';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { CustomSubject, Child } from './dashboard-types';
import { KID_AVATAR_IDS, KidAvatarSvg } from './kid-avatars';

export const SERIF = '"DM Serif Display", Georgia, serif';
export const SCRIPT = '"Dancing Script", cursive';

// ─── Almanac design tokens ───────────────────────────────────────────────────
//
// The shared visual language for the redesigned /discover dashboard. Mirrors
// `DTokens` from the design-system prototype. Use these constants directly
// in inline `style` props so colors and shapes stay coherent across files.
//
// Rule of thumb:
//   - surfaces / structure  -> ALTokens.color.cream / paper / sand / forest*
//   - one accent per view   -> ALTokens.color.gold (or gold-dark for text)
//   - category accents      -> only on tokens / dots / spines / chips,
//                              never on body or heading text
export const ALTokens = {
  color: {
    cream:     '#faf9f6',
    paper:     '#fffdf9',
    sand:      '#f3ede1',
    sandDeep:  '#ece4d4',
    forest:    '#588157',
    forestDark:'#3d5c3b',
    forestInk: '#2f4a2e',
    gold:      '#d4a373',
    goldLight: '#e8c99a',
    goldDark:  '#a9762f',
    // category accents (subjects only, never body/heading)
    nature:    '#6b8e6b',
    earthy:    '#8b7355',
    terracotta:'#c4836a',
    dustyRose: '#c47a8f',
    slate:     '#7b88a8',
    lavender:  '#7a6da8',
    river:     '#5b8fa8',
    warmGray:  '#f7f5f0',
    // text ramp
    ink:       '#2b2a26',
    body:      '#54524b',
    muted:     '#8a877e',
    faint:     '#b6b2a6',
    // forest-tinted hairlines (lean on these, not drop shadows)
    line:      'rgba(61,92,59,0.13)',
    lineSoft:  'rgba(61,92,59,0.07)',
  },
  radius: { sm: 10, md: 14, lg: 18, xl: 24, pill: 9999 },
  shadow: {
    xs: '0 1px 2px rgba(70,55,30,0.05)',
    sm: '0 2px 8px -3px rgba(70,55,30,0.10)',
    md: '0 8px 22px -10px rgba(70,55,30,0.16)',
    lg: '0 18px 40px -16px rgba(70,55,30,0.20)',
    focus: '0 0 0 4px rgba(88,129,87,0.16)',
  },
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  font: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

// Standard-subject id -> accent color. Use only for tokens / dots / spines
// on subject chips and goal-stepper rows. Falls back to forest.
export const AL_SUBJECT_ACCENT: Record<string, string> = {
  math:    ALTokens.color.earthy,
  science: ALTokens.color.nature,
  ela:     ALTokens.color.river,
  history: ALTokens.color.earthy,
  art:     ALTokens.color.dustyRose,
  pe:      ALTokens.color.terracotta,
  life:    ALTokens.color.gold,
};

export function accentForSubject(subjectId: string | null | undefined): string {
  if (!subjectId) return ALTokens.color.forest;
  return AL_SUBJECT_ACCENT[subjectId] || ALTokens.color.forest;
}

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

/**
 * Almanac eyebrow: 11px DM Sans, uppercase 0.18em, gold-dark on cream
 * (AA-safe). The leading hairline (18px wide, 0.5 opacity) is the visual
 * tell. Pass an explicit `color` only when an accent context demands it
 * (e.g. an accented hero panel).
 */
export function Eyebrow({
  children,
  color = ALTokens.color.goldDark,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      style={{
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: ALTokens.font,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 18,
          height: 1.5,
          background: 'currentColor',
          opacity: 0.5,
          borderRadius: 2,
          display: 'inline-block',
        }}
      />
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
//
// PrimaryButton: forest fill, cream text, lifts -1px on hover into a warmer
// shadow. GhostButton: forest text on a hairline border, fills with a
// translucent forest wash on hover or when `active` is set. Both keep their
// pre-redesign signatures so every consumer keeps working.

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  small,
  full,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  small?: boolean;
  full?: boolean;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const lifted = hover && !disabled;
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        appearance: 'none',
        border: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: lifted ? ALTokens.color.forestDark : ALTokens.color.forest,
        color: ALTokens.color.cream,
        fontFamily: ALTokens.font,
        fontWeight: 600,
        fontSize: small ? 13.5 : 15,
        padding: small ? '9px 16px' : '12px 22px',
        borderRadius: ALTokens.radius.md,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : 'auto',
        boxShadow: lifted ? ALTokens.shadow.md : ALTokens.shadow.sm,
        transform: lifted ? 'translateY(-1px)' : 'none',
        transition: `all 180ms ${ALTokens.ease}`,
        ...style,
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
  active,
  full,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  small?: boolean;
  active?: boolean;
  full?: boolean;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const on = active || hover;
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: on ? 'rgba(88,129,87,0.08)' : 'transparent',
        color: ALTokens.color.forest,
        border: `1px solid ${active ? ALTokens.color.forest : ALTokens.color.line}`,
        fontFamily: ALTokens.font,
        fontWeight: 600,
        fontSize: small ? 13 : 14,
        padding: small ? '7px 14px' : '10px 18px',
        borderRadius: ALTokens.radius.md,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        width: full ? '100%' : 'auto',
        transition: `all 180ms ${ALTokens.ease}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Stepper + Dot primitives ────────────────────────────────────────────────
//
// Stepper is a -/+ control around a tabular-nums count, used in the
// Build-it-yourself goal rows. Dot is a small filled circle used everywhere
// a category accent needs to "mean" something at a glance.

export function Stepper({
  value,
  onChange,
  accent,
  min = 0,
  max = 12,
  ariaLabel = 'count',
}: {
  value: number;
  onChange: (next: number) => void;
  accent?: string;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const Btn = ({
    dir,
    label,
    disabled,
  }: {
    dir: -1 | 1;
    label: string;
    disabled?: boolean;
  }) => {
    const [hover, setHover] = useState(false);
    const on = hover && !disabled;
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => onChange(Math.max(min, Math.min(max, value + dir)))}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={disabled}
        style={{
          width: 32,
          height: 32,
          borderRadius: ALTokens.radius.sm,
          border: `1px solid ${on ? ALTokens.color.forest : ALTokens.color.line}`,
          background: on
            ? 'rgba(88,129,87,0.06)'
            : disabled
              ? 'transparent'
              : ALTokens.color.paper,
          color: disabled ? ALTokens.color.faint : ALTokens.color.forest,
          fontSize: 17,
          lineHeight: 1,
          cursor: disabled ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: ALTokens.font,
          transition: `all 150ms ${ALTokens.ease}`,
          flexShrink: 0,
        }}
      >
        {dir < 0 ? '–' : '+'}
      </button>
    );
  };
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <Btn dir={-1} label={`decrease ${ariaLabel}`} disabled={value <= min} />
      <span
        style={{
          minWidth: 18,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color:
            value > 0
              ? accent || ALTokens.color.ink
              : ALTokens.color.faint,
          fontFamily: ALTokens.font,
        }}
      >
        {value}
      </span>
      <Btn dir={1} label={`increase ${ariaLabel}`} disabled={value >= max} />
    </div>
  );
}

export function Dot({
  color,
  size = 9,
  style,
}: {
  color: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        display: 'inline-block',
        ...style,
      }}
    />
  );
}

// ─── Line icons (1.6 stroke, rounded) ────────────────────────────────────────
//
// Light SVG icons for the Almanac top bar and sub-tab pills. Each accepts
// `size` and `color`; default color is `currentColor` so they inherit text
// color when set via a parent.

type IconProps = { size?: number; color?: string; style?: CSSProperties };

function makeIcon(paths: ReactNode, sw = 1.6) {
  const Icon = ({ size = 20, color = 'currentColor', style }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
  return Icon;
}

export const ALIcons = {
  Sun: makeIcon(
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </>,
  ),
  Path: makeIcon(
    <>
      <path d="M6 4v9a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1" />
      <circle cx="6" cy="4" r="2" />
      <circle cx="18" cy="20" r="2" />
    </>,
  ),
  Book: makeIcon(<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />),
  Cal: makeIcon(
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>,
  ),
  Chat: makeIcon(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  Sliders: makeIcon(
    <>
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
      <circle cx="16" cy="6" r="2" fill="none" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="13" cy="18" r="2" />
    </>,
  ),
  Grid: makeIcon(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>,
  ),
  Plus: makeIcon(<path d="M12 5v14M5 12h14" />, 2),
  Arrow: makeIcon(<path d="M5 12h14M13 6l6 6-6 6" />),
  Chevron: makeIcon(<path d="M6 9l6 6 6-6" />),
  Check: makeIcon(<path d="M4 12l5 5L20 6" />, 2.2),
  X: makeIcon(<path d="M6 6l12 12M18 6L6 18" />, 2),
  Leaf: makeIcon(
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13zM4 20c2-5 5-8 9-9" />,
  ),
};

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
