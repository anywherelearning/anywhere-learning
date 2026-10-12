import { describe, expect, it } from 'vitest';
import { kidsPhrase, pickMidpoint } from './trial-midpoint';

const base = { views: {}, completed: [], weekSlugs: [], kids: [] };

describe('pickMidpoint', () => {
  it('celebrates a finished activity and suggests a different next one', () => {
    const pick = pickMidpoint({ ...base, completed: ['survival-base'], weekSlugs: ['survival-base'] });
    expect(pick?.variant).toBe('doing');
    expect(pick?.guide.slug).toBe('survival-base');
    expect(pick?.next?.slug).toBeTruthy();
    expect(pick?.next?.slug).not.toBe('survival-base');
  });

  it('lists every distinct finished activity, most recent first', () => {
    const pick = pickMidpoint({
      ...base,
      completed: ['survival-base', 'my-review-column', 'survival-base', 'nature-journal-walks'],
    });
    expect(pick?.done?.map((g) => g.slug)).toEqual([
      'nature-journal-walks',
      'survival-base',
      'my-review-column',
    ]);
    expect(pick?.next?.slug).not.toBe('my-review-column');
  });

  it('prefers the map pick as the next one when it is not done yet', () => {
    const pick = pickMidpoint({
      ...base,
      completed: ['survival-base'],
      weekSlugs: ['family-electricity-audit'],
    });
    expect(pick?.next?.slug).toBe('family-electricity-audit');
    expect(pick?.fromTrail).toBe(true);
  });

  it('browsing: pushes the map pick when they opened it', () => {
    const pick = pickMidpoint({
      ...base,
      views: { 'my-review-column': 9, 'family-electricity-audit': 3 },
      weekSlugs: ['family-electricity-audit'],
    });
    expect(pick?.variant).toBe('browsing');
    expect(pick?.guide.slug).toBe('family-electricity-audit');
  });

  it('browsing: otherwise the most-opened guide', () => {
    const pick = pickMidpoint({
      ...base,
      views: { 'my-review-column': 9, 'family-electricity-audit': 3 },
    });
    expect(pick?.guide.slug).toBe('my-review-column');
  });

  it('not started: hands them their map pick', () => {
    const pick = pickMidpoint({ ...base, weekSlugs: ['survival-base'] });
    expect(pick?.variant).toBe('not-started');
    expect(pick?.guide.slug).toBe('survival-base');
    expect(pick?.fromTrail).toBe(true);
  });

  it('not started with no map pick: falls back to a quick default', () => {
    const pick = pickMidpoint(base);
    expect(pick?.variant).toBe('not-started');
    expect(pick?.guide.timeRange).toBe('30 min to 1 hour');
    expect(pick?.fromTrail).toBe(false);
  });

  it('ignores slugs that are not real activity guides', () => {
    const pick = pickMidpoint({ ...base, views: { 'not-a-guide': 50 } });
    expect(pick?.variant).toBe('not-started');
  });
});

describe('kidsPhrase', () => {
  it('names one kid with age, two or more by name', () => {
    expect(kidsPhrase([{ name: 'Kirin', age: 6 }])).toBe('Kirin (6)');
    expect(kidsPhrase([{ name: 'Elijah' }, { name: 'Indie' }])).toBe('Elijah and Indie');
    expect(kidsPhrase([{ name: 'A' }, { name: 'B' }, { name: 'C' }])).toBe('A, B and C');
    expect(kidsPhrase([{ name: 'Eva Vieira', age: 11 }])).toBe('Eva (11)');
    expect(kidsPhrase([])).toBe('');
  });
});
