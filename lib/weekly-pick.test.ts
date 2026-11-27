import { describe, expect, it } from 'vitest';
import { pickWeekly } from './weekly-pick';

const now = new Date('2026-12-06T14:00:00Z');
const base = { views: {}, completions: [], weekSlugs: [], kids: [], recent: [], monthSlugs: [], now };

describe('pickWeekly', () => {
  it('prefers the stop on their trail', () => {
    const pick = pickWeekly({ ...base, weekSlugs: ['survival-base'], views: { 'nature-crafts': 5 } });
    expect(pick?.guide.slug).toBe('survival-base');
    expect(pick?.source).toBe('trail');
  });

  it('then a guide they opened recently but did not do', () => {
    const pick = pickWeekly({ ...base, views: { 'nature-crafts': 1, 'board-game-studio': 4 } });
    expect(pick?.guide.slug).toBe('board-game-studio');
    expect(pick?.source).toBe('opened');
  });

  it('then this month\'s theme', () => {
    const pick = pickWeekly({ ...base, monthSlugs: ['household-orchestra', 'nature-crafts'] });
    expect(pick?.guide.slug).toBe('household-orchestra');
    expect(pick?.source).toBe('month');
  });

  it('skips guides already done or suggested recently', () => {
    const pick = pickWeekly({
      ...base,
      weekSlugs: ['survival-base'],
      completions: [{ slug: 'survival-base', at: '2026-11-01T00:00:00Z' }],
      recent: ['household-orchestra'],
      monthSlugs: ['household-orchestra', 'nature-crafts'],
    });
    expect(pick?.guide.slug).toBe('nature-crafts');
  });

  it('falls back to a quick guide when nothing else fits', () => {
    const pick = pickWeekly(base);
    expect(pick?.source).toBe('quick');
    expect(pick?.guide.slug).toBeTruthy();
  });

  it('lists only activities done in the last 7 days', () => {
    const pick = pickWeekly({
      ...base,
      completions: [
        { slug: 'nature-crafts', at: '2026-12-04T10:00:00Z' },
        { slug: 'survival-base', at: '2026-11-10T10:00:00Z' },
      ],
    });
    expect(pick?.doneLastWeek.map((g) => g.slug)).toEqual(['nature-crafts']);
  });

  it('a suggestion can come back after eight weeks', () => {
    const recent = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'household-orchestra'];
    const pick = pickWeekly({ ...base, recent, monthSlugs: ['household-orchestra'] });
    expect(pick?.guide.slug).toBe('household-orchestra');
  });
});
