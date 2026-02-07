import { describe, it, expect } from 'vitest';
import { clusterPatterns } from '../clustering';
import type { NormalizedPattern } from '../types';

const mkPattern = (overrides: Partial<NormalizedPattern> = {}): NormalizedPattern => ({
  patternId: 'p1',
  fingerprint: 'fp1',
  type: 'form',
  fieldCountRange: '2-4',
  behavior: 'submit',
  intent: 'login',
  context: 'modal',
  ...overrides,
});

describe('clusterPatterns', () => {
  it('groups patterns with same fingerprint into one cluster', () => {
    const patterns = [mkPattern(), mkPattern({ patternId: 'p2' })];
    const clusters = clusterPatterns(patterns);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].patterns).toHaveLength(2);
  });

  it('patterns with different fingerprints create separate clusters', () => {
    const patterns = [mkPattern(), mkPattern({ patternId: 'p2', fingerprint: 'fp2' })];
    const clusters = clusterPatterns(patterns);
    expect(clusters).toHaveLength(2);
  });

  it('detects mixed behaviors as divergence', () => {
    const patterns = [
      mkPattern({ behavior: 'submit' }),
      mkPattern({ patternId: 'p2', behavior: 'auto-save' }),
    ];
    const clusters = clusterPatterns(patterns);
    expect(clusters[0].divergences).toEqual(['Mixed behaviors: submit, auto-save']);
  });

  it('single-pattern cluster has no divergences', () => {
    const clusters = clusterPatterns([mkPattern()]);
    expect(clusters[0].divergences).toHaveLength(0);
  });

  it('cluster label format is correct', () => {
    const clusters = clusterPatterns([mkPattern()]);
    expect(clusters[0].label).toBe('form · login · 2-4 fields · modal');
  });
});
