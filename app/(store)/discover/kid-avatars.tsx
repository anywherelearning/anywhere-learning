'use client';

/**
 * Illustrated kid avatars.
 *
 * A curated set of flat, friendly animal illustrations parents can pick for
 * each child, replacing the old color-circle + emoji avatar. On-brand
 * (nature-themed, warm palette), no photo uploads, no privacy surface.
 *
 * Each avatar is a self-contained 64x64 SVG including its own soft background
 * circle, so it reads as a complete sticker at any size. `KidAvatarSvg`
 * renders one by id; `ChildAvatar` (in dashboard-shared) falls back to the
 * legacy color+initial when a child has no avatar set.
 */

import type { ReactNode } from 'react';

export interface KidAvatarDef {
  id: string;
  label: string;
  render: () => ReactNode;
}

// Shared little helpers for consistent eyes/cheeks across animals.
function Eyes({ cx1, cx2, cy, r = 2.6 }: { cx1: number; cx2: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx1} cy={cy} r={r} fill="#2D3A2E" />
      <circle cx={cx2} cy={cy} r={r} fill="#2D3A2E" />
      <circle cx={cx1 + 0.9} cy={cy - 0.9} r={r * 0.34} fill="#fff" />
      <circle cx={cx2 + 0.9} cy={cy - 0.9} r={r * 0.34} fill="#fff" />
    </>
  );
}

export const KID_AVATARS: KidAvatarDef[] = [
  {
    id: 'fox',
    label: 'Fox',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#F4E4D4" />
        <path d="M14 22 L24 30 L18 38 Z" fill="#E08A4F" />
        <path d="M50 22 L40 30 L46 38 Z" fill="#E08A4F" />
        <path d="M32 18 C44 18 47 30 44 40 C41 48 36 50 32 50 C28 50 23 48 20 40 C17 30 20 18 32 18 Z" fill="#E8915B" />
        <path d="M32 34 C38 34 41 40 40 44 C39 48 35 50 32 50 C29 50 25 48 24 44 C23 40 26 34 32 34 Z" fill="#FBF4EC" />
        <Eyes cx1={26} cx2={38} cy={32} />
        <path d="M32 41 L29.5 38 L34.5 38 Z" fill="#2D3A2E" />
      </>
    ),
  },
  {
    id: 'bear',
    label: 'Bear',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#EFE6DA" />
        <circle cx="20" cy="20" r="7" fill="#A6815E" />
        <circle cx="44" cy="20" r="7" fill="#A6815E" />
        <circle cx="20" cy="20" r="3.4" fill="#C9A982" />
        <circle cx="44" cy="20" r="3.4" fill="#C9A982" />
        <circle cx="32" cy="34" r="18" fill="#B58E68" />
        <ellipse cx="32" cy="40" rx="9" ry="7.5" fill="#EADbC8" />
        <Eyes cx1={26} cx2={38} cy={31} />
        <ellipse cx="32" cy="37" rx="3" ry="2.2" fill="#2D3A2E" />
        <path d="M32 39 L32 43" stroke="#2D3A2E" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'bunny',
    label: 'Bunny',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#EDE9F0" />
        <ellipse cx="25" cy="15" rx="4.5" ry="13" fill="#D9D2CC" />
        <ellipse cx="39" cy="15" rx="4.5" ry="13" fill="#D9D2CC" />
        <ellipse cx="25" cy="15" rx="2" ry="9" fill="#E7B9C4" />
        <ellipse cx="39" cy="15" rx="2" ry="9" fill="#E7B9C4" />
        <circle cx="32" cy="38" r="16" fill="#E4DED8" />
        <Eyes cx1={26} cx2={38} cy={36} />
        <path d="M32 42 L30 40 L34 40 Z" fill="#D98BA0" />
        <path d="M32 43 L32 45 M32 45 C30 45 29 46 28 46 M32 45 C34 45 35 46 36 46" stroke="#B9B2AA" strokeWidth="1" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  {
    id: 'owl',
    label: 'Owl',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#E7EBDF" />
        <path d="M16 22 C16 14 22 12 24 18 Z" fill="#8B7355" />
        <path d="M48 22 C48 14 42 12 40 18 Z" fill="#8B7355" />
        <ellipse cx="32" cy="34" rx="18" ry="19" fill="#9D8364" />
        <ellipse cx="32" cy="40" rx="13" ry="13" fill="#BCA585" />
        <circle cx="24" cy="30" r="8" fill="#FBF7F0" />
        <circle cx="40" cy="30" r="8" fill="#FBF7F0" />
        <circle cx="24" cy="30" r="3.6" fill="#2D3A2E" />
        <circle cx="40" cy="30" r="3.6" fill="#2D3A2E" />
        <circle cx="25.2" cy="28.8" r="1.2" fill="#fff" />
        <circle cx="41.2" cy="28.8" r="1.2" fill="#fff" />
        <path d="M32 34 L29 38 L35 38 Z" fill="#E0A45B" />
      </>
    ),
  },
  {
    id: 'cat',
    label: 'Cat',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#E8E6E2" />
        <path d="M16 18 L24 28 L14 30 Z" fill="#8A94A0" />
        <path d="M48 18 L40 28 L50 30 Z" fill="#8A94A0" />
        <circle cx="32" cy="34" r="18" fill="#9AA4B0" />
        <Eyes cx1={25} cx2={39} cy={32} r={3} />
        <path d="M32 40 L30 38 L34 38 Z" fill="#E79AA8" />
        <path d="M32 41 L32 43" stroke="#3A4450" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M20 36 L13 34 M20 39 L13 39 M44 36 L51 34 M44 39 L51 39" stroke="#7A8490" strokeWidth="1" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'frog',
    label: 'Frog',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#E2EEDD" />
        <circle cx="22" cy="20" r="8" fill="#7BAE6B" />
        <circle cx="42" cy="20" r="8" fill="#7BAE6B" />
        <circle cx="22" cy="19" r="3.6" fill="#fff" />
        <circle cx="42" cy="19" r="3.6" fill="#fff" />
        <circle cx="22" cy="19.5" r="1.8" fill="#2D3A2E" />
        <circle cx="42" cy="19.5" r="1.8" fill="#2D3A2E" />
        <path d="M14 32 C14 24 22 24 32 24 C42 24 50 24 50 32 C50 44 42 48 32 48 C22 48 14 44 14 32 Z" fill="#82B870" />
        <path d="M22 38 C26 43 38 43 42 38" stroke="#3F6B36" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="38" r="2.4" fill="#A7CE98" />
        <circle cx="44" cy="38" r="2.4" fill="#A7CE98" />
      </>
    ),
  },
  {
    id: 'bee',
    label: 'Bee',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#FBF1D6" />
        <ellipse cx="18" cy="28" rx="9" ry="7" fill="#FFFFFF" opacity="0.85" />
        <ellipse cx="46" cy="28" rx="9" ry="7" fill="#FFFFFF" opacity="0.85" />
        <ellipse cx="32" cy="36" rx="15" ry="16" fill="#EBC25A" />
        <path d="M21 30 C24 28 40 28 43 30 L42 34 C38 32 26 32 22 34 Z" fill="#3A3329" />
        <path d="M19 40 C24 44 40 44 45 40 L43 44 C38 47 26 47 21 44 Z" fill="#3A3329" />
        <Eyes cx1={27} cx2={37} cy={27} r={2.4} />
        <path d="M28 16 C26 12 23 12 22 14 M36 16 C38 12 41 12 42 14" stroke="#3A3329" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="13.5" r="1.6" fill="#3A3329" />
        <circle cx="42" cy="13.5" r="1.6" fill="#3A3329" />
      </>
    ),
  },
  {
    id: 'deer',
    label: 'Deer',
    render: () => (
      <>
        <circle cx="32" cy="32" r="32" fill="#F1E8DD" />
        <path d="M22 16 C20 10 16 10 15 12 M22 16 C18 14 14 16 14 18" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M42 16 C44 10 48 10 49 12 M42 16 C46 14 50 16 50 18" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="20" cy="24" rx="4" ry="6" fill="#C79B6E" />
        <ellipse cx="44" cy="24" rx="4" ry="6" fill="#C79B6E" />
        <path d="M32 20 C42 20 44 30 42 38 C40 46 36 50 32 50 C28 50 24 46 22 38 C20 30 22 20 32 20 Z" fill="#C9A074" />
        <ellipse cx="32" cy="42" rx="8" ry="7" fill="#EAD9C2" />
        <Eyes cx1={26} cx2={38} cy={32} />
        <ellipse cx="32" cy="40" rx="3" ry="2.4" fill="#2D3A2E" />
        <circle cx="26" cy="22" r="1.4" fill="#EAD9C2" />
        <circle cx="38" cy="22" r="1.4" fill="#EAD9C2" />
      </>
    ),
  },
];

export const KID_AVATAR_IDS = new Set(KID_AVATARS.map((a) => a.id));

export function getKidAvatar(id: string | null | undefined): KidAvatarDef | undefined {
  if (!id) return undefined;
  return KID_AVATARS.find((a) => a.id === id);
}

/**
 * Renders one illustrated avatar by id at the given pixel size. Optionally
 * draws a colored ring (the kid's identity color) around it. Returns null if
 * the id is unknown so callers can fall back to the legacy avatar.
 */
export function KidAvatarSvg({
  id,
  size = 40,
  ring,
}: {
  id: string;
  size?: number;
  ring?: string;
}) {
  const def = getKidAvatar(id);
  if (!def) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={def.label}
      style={{
        display: 'block',
        borderRadius: '50%',
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
        flexShrink: 0,
      }}
    >
      {def.render()}
    </svg>
  );
}
