import { formatAnnotationText, getAnnotationName } from '../annotations';
import type { Cluster } from '../types';

const mkCluster = (overrides: Partial<Cluster> = {}): Cluster => ({
  label: 'form · login · 2-4 fields · modal',
  fingerprint: 'fp1',
  patterns: [
    { patternId: 'p1', fingerprint: 'fp1', type: 'form', fieldCountRange: '2-4', behavior: 'submit', intent: 'login', context: 'modal' },
  ],
  divergences: ['Mixed behaviors: submit, auto-save'],
  ...overrides,
});

describe('formatAnnotationText', () => {
  it('joins label and divergences with newlines', () => {
    const cluster = mkCluster({
      divergences: ['Mixed behaviors: submit, auto-save', 'Extra divergence'],
    });
    expect(formatAnnotationText(cluster)).toBe(
      'form · login · 2-4 fields · modal\nMixed behaviors: submit, auto-save\nExtra divergence',
    );
  });

  it('returns label with single divergence', () => {
    const text = formatAnnotationText(mkCluster());
    expect(text).toBe('form · login · 2-4 fields · modal\nMixed behaviors: submit, auto-save');
  });
});

describe('getAnnotationName', () => {
  it('prefixes with [Pattern Pal]', () => {
    expect(getAnnotationName('form · login')).toBe('[Pattern Pal] form · login');
  });

  it('handles empty label', () => {
    expect(getAnnotationName('')).toBe('[Pattern Pal] ');
  });
});
