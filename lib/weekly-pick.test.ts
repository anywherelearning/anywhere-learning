import { describe, expect, it } from 'vitest';
import { isWeeklyDue, monthRecap, pickWeekly } from './weekly-pick';

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

describe('isWeeklyDue', () => {
  const d = (s: string) => new Date(s);
  it('first email a week after they became a member, not before', () => {
    const memberSince = d('2026-12-04T15:00:00Z'); // a Friday
    expect(isWeeklyDue({ memberSince, now: d('2026-12-06T14:00:00Z') })).toBe(false); // that Sunday
    expect(isWeeklyDue({ memberSince, now: d('2026-12-10T14:00:00Z') })).toBe(false);
    expect(isWeeklyDue({ memberSince, now: d('2026-12-11T14:00:00Z') })).toBe(true); // next Friday
  });
  it('then every 7 days after the last one', () => {
    const memberSince = d('2026-10-01T00:00:00Z');
    const lastSent = d('2026-12-06T14:00:05Z');
    expect(isWeeklyDue({ memberSince, lastSent, now: d('2026-12-12T14:00:00Z') })).toBe(false);
    expect(isWeeklyDue({ memberSince, lastSent, now: d('2026-12-13T14:00:00Z') })).toBe(true);
  });
});

describe('quiet weeks', () => {
  it('quiet after 2+ emails with nothing marked in 14 days', () => {
    expect(pickWeekly({ ...base, recent: ['a', 'b'] })?.quiet).toBe(true);
  });
  it('not quiet on the first emails', () => {
    expect(pickWeekly({ ...base, recent: ['a'] })?.quiet).toBe(false);
  });
  it('not quiet when something was marked in the last 14 days', () => {
    const completions = [{ slug: 'nature-crafts', at: '2026-11-25T10:00:00Z' }];
    expect(pickWeekly({ ...base, recent: ['a', 'b'], completions })?.quiet).toBe(false);
  });
});

describe('monthRecap', () => {
  it('recaps last calendar month with its skills', () => {
    const r = monthRecap(
      [
        { slug: 'nature-crafts', at: '2026-11-05T10:00:00Z' },
        { slug: 'budget-challenge', at: '2026-11-20T10:00:00Z' },
        { slug: 'budget-challenge', at: '2026-11-21T10:00:00Z' },
        { slug: 'survival-base', at: '2026-10-30T10:00:00Z' },
        { slug: 'household-orchestra', at: '2026-12-02T10:00:00Z' },
      ],
      new Date('2026-12-06T14:00:00Z'),
    );
    expect(r?.month).toBe('November');
    expect(r?.activities.map((g) => g.slug)).toEqual(['budget-challenge', 'nature-crafts']);
    expect(r?.skills).toContain('Budgeting');
    expect(r?.skills).not.toContain('STEM');
  });
  it('no recap for a month with nothing marked', () => {
    expect(monthRecap([{ slug: 'nature-crafts', at: '2026-10-05T10:00:00Z' }], new Date('2026-12-06T14:00:00Z'))).toBeNull();
  });
});
