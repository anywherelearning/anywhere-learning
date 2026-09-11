import { describe, it, expect } from 'vitest';
import { computeDownloadAllowance } from './activity-events';
import { DOWNLOAD_CAP_PER_WINDOW, DOWNLOAD_CAP_WINDOW_DAYS } from './membership';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-09-11T12:00:00Z');

function rows(n: number, startDaysAgo = 10) {
  return Array.from({ length: n }, (_, i) => ({
    slug: `guide-${i}`,
    firstAt: new Date(now.getTime() - (startDaysAgo - i * 0.1) * DAY),
  }));
}

describe('computeDownloadAllowance', () => {
  it('allows a fresh member with nothing downloaded', () => {
    const a = computeDownloadAllowance([], 'guide-x', now);
    expect(a.allowed).toBe(true);
    expect(a.used).toBe(0);
    expect(a.resetsAt).toBeNull();
  });

  it('allows a new guide while under the cap', () => {
    const a = computeDownloadAllowance(rows(DOWNLOAD_CAP_PER_WINDOW - 1), 'guide-new', now);
    expect(a.allowed).toBe(true);
    expect(a.used).toBe(DOWNLOAD_CAP_PER_WINDOW - 1);
  });

  it('blocks a new guide once the cap is reached', () => {
    const a = computeDownloadAllowance(rows(DOWNLOAD_CAP_PER_WINDOW), 'guide-new', now);
    expect(a.allowed).toBe(false);
    expect(a.used).toBe(DOWNLOAD_CAP_PER_WINDOW);
  });

  it('still allows re-downloading a guide already taken in the window', () => {
    const a = computeDownloadAllowance(rows(DOWNLOAD_CAP_PER_WINDOW), 'guide-0', now);
    expect(a.allowed).toBe(true);
    expect(a.alreadyDownloaded).toBe(true);
  });

  it('reports when the oldest download ages out', () => {
    const a = computeDownloadAllowance(rows(3, 10), 'guide-new', now);
    const oldest = new Date(now.getTime() - 10 * DAY);
    expect(a.resetsAt?.getTime()).toBe(oldest.getTime() + DOWNLOAD_CAP_WINDOW_DAYS * DAY);
  });
});
