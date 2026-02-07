import { generateFileInsights, generateCrossFileInsights, generateInsights } from '../insights';
import type { Cluster, Memory } from '../types';

const mkCluster = (overrides: Partial<Cluster> = {}): Cluster => ({
  label: 'form · login · 2-4 fields · modal',
  fingerprint: 'fp1',
  patterns: [
    { patternId: 'p1', fingerprint: 'fp1', type: 'form', fieldCountRange: '2-4', behavior: 'submit', intent: 'login', context: 'modal' },
  ],
  divergences: [],
  ...overrides,
});

describe('generateFileInsights', () => {
  it('reports consistent patterns when single cluster with no divergences', () => {
    const insights = generateFileInsights([mkCluster()]);
    expect(insights).toEqual([{ source: 'this-file', message: 'All patterns are consistent!' }]);
  });

  it('flags outlier behaviors', () => {
    const cluster = mkCluster({
      patterns: [
        { patternId: 'p1', fingerprint: 'fp1', type: 'form', fieldCountRange: '2-4', behavior: 'submit', intent: 'login', context: 'modal' },
        { patternId: 'p2', fingerprint: 'fp1', type: 'form', fieldCountRange: '2-4', behavior: 'submit', intent: 'login', context: 'modal' },
        { patternId: 'p3', fingerprint: 'fp1', type: 'form', fieldCountRange: '2-4', behavior: 'auto-save', intent: 'login', context: 'modal' },
      ],
      divergences: ['Mixed behaviors: submit, auto-save'],
    });
    const insights = generateFileInsights([cluster, mkCluster({ fingerprint: 'fp2' })]);
    expect(insights).toContainEqual({
      source: 'this-file',
      message: "Most forms use 'submit' — 1 differ",
    });
  });
});

describe('generateCrossFileInsights', () => {
  it('returns empty when no memory match', () => {
    const insights = generateCrossFileInsights([mkCluster()], {});
    expect(insights).toEqual([]);
  });

  it('flags behavior mismatch with memory', () => {
    const memory: Memory = {
      fp1: { totalObservations: 10, behaviorCounts: { 'auto-save': 8, submit: 2 }, lastSeen: 0 },
    };
    const insights = generateCrossFileInsights([mkCluster()], memory);
    expect(insights).toEqual([
      { source: 'across-files', message: "Across files, 'auto-save' is most common for this pattern — this file uses 'submit'" },
    ]);
  });
});

describe('generateInsights', () => {
  it('combines file and cross-file insights', () => {
    const memory: Memory = {
      fp1: { totalObservations: 5, behaviorCounts: { 'auto-save': 4, submit: 1 }, lastSeen: 0 },
    };
    const result = generateInsights([mkCluster()], memory);
    expect(result.fileInsights).toHaveLength(1);
    expect(result.fileInsights[0].source).toBe('this-file');
    expect(result.crossFileInsights).toHaveLength(1);
    expect(result.crossFileInsights[0].source).toBe('across-files');
  });
});
