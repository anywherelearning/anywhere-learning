'use client';

/**
 * Explorer avatar components, rendering the real storybook art from
 * lib/explorer-art.ts (ported from the Claude Design handoff). Same exported
 * API as before (ExplorerFigure, ExplorerHead + the builder's palette
 * constants) so ExplorerBuilder / WeekHome don't change.
 *
 *  - ExplorerFigure: full-body explorer wearing its earned gear. Fills its
 *    parent, so the caller sizes the container.
 *  - ExplorerHead: a head crop, for chips and the base picker.
 */

import { useId } from 'react';
import { explorerSVG, type ExplorerOpts } from '@/lib/explorer-art';

export const HUMAN_BASES = ['girl', 'boy'] as const;
export const ANIMAL_BASES = ['fox', 'owl', 'bear', 'rabbit', 'deer', 'frog'] as const;

export const SKIN_TONES = ['#f2d3b3', '#e5b48f', '#c98d5f', '#a9713f', '#7a4d28'];
export const HAIR_COLORS = ['#1c1917', '#3b2f27', '#6f4a2f', '#8a5a2b', '#c15d2e', '#c88f3f', '#dcb56a'];
export const HAIR_STYLES = ['short', 'bob', 'ponytail', 'curly', 'bun'] as const;
export const BODY_COLORS = ['#c4836a', '#588157', '#b5803e', '#7b88a8', '#8b7355', '#7fa05e'];

interface Av {
  base: string;
  color: string;
  skin?: string;
  hair?: string;
  hairStyle?: string;
}

function isHuman(base: string) {
  return base === 'girl' || base === 'boy';
}

function toOpts(a: Av, uid: string, crop: 'full' | 'head', gearIds?: string[]): ExplorerOpts {
  const human = isHuman(a.base);
  return {
    base: a.base,
    skin: a.skin,
    hair: a.hair,
    hairStyle: a.hairStyle,
    shirt: human ? a.color : undefined,
    body: human ? undefined : a.color,
    gearIds,
    uid,
    crop,
  };
}

/** Full-body explorer wearing its gear. Fills its parent (or `size` px). */
export function ExplorerFigure({ avatar, gear = [], size, fill = false }: { avatar: Av; gear?: string[]; size?: number; fill?: boolean }) {
  const rawId = useId().replace(/[^a-z0-9]/gi, '');
  const html = explorerSVG(toOpts(avatar, 'ef' + rawId, 'full', gear));
  const style: React.CSSProperties = fill || !size ? { width: '100%', height: '100%' } : { width: size, height: size };
  return <div style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Head crop, for chips and the base picker. */
export function ExplorerHead({ avatar, size = 34 }: { avatar: Av; size?: number }) {
  const rawId = useId().replace(/[^a-z0-9]/gi, '');
  const html = explorerSVG(toOpts(avatar, 'eh' + rawId, 'head'));
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />;
}
