import { describe, it, expect } from 'vitest';
import { looksLikeBot, MIN_FORM_MS } from './spam-guard';

describe('looksLikeBot', () => {
  it('passes a normal signup', () => {
    expect(looksLikeBot({ elapsedMs: 12000 })).toBe(false);
  });

  it('passes an old form that sends neither field', () => {
    expect(looksLikeBot({})).toBe(false);
  });

  it('catches a filled honeypot', () => {
    expect(looksLikeBot({ website: 'http://spam.example', elapsedMs: 12000 })).toBe(true);
  });

  it('ignores a whitespace-only honeypot', () => {
    expect(looksLikeBot({ website: '   ', elapsedMs: 12000 })).toBe(false);
  });

  it('catches a submit faster than a person can type', () => {
    expect(looksLikeBot({ elapsedMs: 300 })).toBe(true);
    expect(looksLikeBot({ elapsedMs: MIN_FORM_MS - 1 })).toBe(true);
    expect(looksLikeBot({ elapsedMs: MIN_FORM_MS })).toBe(false);
  });

  it('does not trust a non-number elapsedMs', () => {
    expect(looksLikeBot({ elapsedMs: '5' })).toBe(false);
  });
});
