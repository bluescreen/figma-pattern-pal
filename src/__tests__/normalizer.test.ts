import { describe, it, expect } from 'vitest';
import { normalizePattern, normalizePatterns, getFieldCountRange } from '../normalizer';
import type { Pattern } from '../types';

const makePattern = (overrides: Partial<Pattern> = {}): Pattern => ({
  id: 'p1',
  type: 'form',
  inputs: [
    { id: 'i1', name: 'A', role: 'input' },
    { id: 'i2', name: 'B', role: 'input' },
  ],
  actions: [{ id: 'a1', name: 'Submit', role: 'action-primary' }],
  behavior: 'submit',
  intent: 'login',
  context: 'auth',
  ...overrides,
});

describe('getFieldCountRange', () => {
  it('returns correct buckets', () => {
    expect(getFieldCountRange(1)).toBe('1-3');
    expect(getFieldCountRange(3)).toBe('1-3');
    expect(getFieldCountRange(4)).toBe('4-6');
    expect(getFieldCountRange(6)).toBe('4-6');
    expect(getFieldCountRange(7)).toBe('7+');
    expect(getFieldCountRange(20)).toBe('7+');
  });
});

describe('normalizePattern', () => {
  it('generates correct fingerprint format', () => {
    const result = normalizePattern(makePattern());
    expect(result.fingerprint).toBe('form-login-1-3-auth');
    expect(result.patternId).toBe('p1');
    expect(result.type).toBe('form');
    expect(result.fieldCountRange).toBe('1-3');
  });
});

describe('normalizePatterns', () => {
  it('handles an array of patterns', () => {
    const patterns = [makePattern(), makePattern({ id: 'p2', type: 'filter' })];
    const result = normalizePatterns(patterns);
    expect(result).toHaveLength(2);
    expect(result[1].fingerprint).toBe('filter-login-1-3-auth');
  });
});
