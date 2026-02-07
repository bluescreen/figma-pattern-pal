import { describe, it, expect } from 'vitest';
import { scanPatterns } from '../scanner';
import { normalizePatterns } from '../normalizer';
import { clusterPatterns } from '../clustering';
import { generateInsights } from '../insights';
import { getFormagotchiState } from '../formagotchi';
import {
  auth01Containers,
  auth02Containers,
  auth03Containers,
  buildHistoricalMemory,
} from './fixtures';

function runPipeline(containers: Parameters<typeof scanPatterns>[0]) {
  const patterns = scanPatterns(containers);
  const normalized = normalizePatterns(patterns);
  const clusters = clusterPatterns(normalized);
  const divergenceCount = clusters.reduce(
    (sum, c) => sum + c.divergences.length,
    0,
  );
  const fingerprints = normalized.map((n) => n.fingerprint);
  const memory = buildHistoricalMemory(fingerprints);
  const insights = generateInsights(clusters, memory);
  const formagotchi = getFormagotchiState(
    divergenceCount,
    Object.keys(memory).length,
  );
  return { patterns, normalized, clusters, divergenceCount, insights, formagotchi };
}

describe('auth01 — simple login card', () => {
  const result = runPipeline(auth01Containers);

  it('scans 1 pattern with 2 inputs', () => {
    expect(result.patterns).toHaveLength(1);
    expect(result.patterns[0].inputs).toHaveLength(2);
  });

  it('identifies Email and Password fields', () => {
    const names = result.patterns[0].inputs.map((i) => i.name);
    expect(names).toEqual(['Email', 'Password']);
  });

  it('has Sign in as primary action', () => {
    const primary = result.patterns[0].actions.find((a) => a.role === 'action-primary');
    expect(primary?.name).toBe('Sign in');
  });

  it('has no secondary action', () => {
    const secondary = result.patterns[0].actions.find((a) => a.role === 'action-secondary');
    expect(secondary).toBeUndefined();
  });

  it('produces 0 divergences alone', () => {
    expect(result.divergenceCount).toBe(0);
  });

  it('yields calm mood', () => {
    expect(result.formagotchi.mood).toBe('calm');
  });
});

describe('auth02 — login with Google', () => {
  const result = runPipeline(auth02Containers);

  it('scans 1 pattern with 2 inputs', () => {
    expect(result.patterns).toHaveLength(1);
    expect(result.patterns[0].inputs).toHaveLength(2);
  });

  it('has Login as primary action', () => {
    const primary = result.patterns[0].actions.find((a) => a.role === 'action-primary');
    expect(primary?.name).toBe('Login');
  });

  it('has Login with Google as secondary action', () => {
    const secondary = result.patterns[0].actions.find((a) => a.role === 'action-secondary');
    expect(secondary?.name).toBe('Login with Google');
  });

  it('produces 0 divergences alone', () => {
    expect(result.divergenceCount).toBe(0);
  });
});

describe('auth03 — split-screen login', () => {
  const result = runPipeline(auth03Containers);

  it('scans 1 pattern with 2 inputs', () => {
    expect(result.patterns).toHaveLength(1);
    expect(result.patterns[0].inputs).toHaveLength(2);
  });

  it('has Login as primary and Login with Google as secondary', () => {
    const primary = result.patterns[0].actions.find((a) => a.role === 'action-primary');
    const secondary = result.patterns[0].actions.find((a) => a.role === 'action-secondary');
    expect(primary?.name).toBe('Login');
    expect(secondary?.name).toBe('Login with Google');
  });
});

describe('auth01 + auth02 + auth03 — combined consistency', () => {
  const combined = [...auth01Containers, ...auth02Containers, ...auth03Containers];
  const result = runPipeline(combined);

  it('scans 3 patterns total', () => {
    expect(result.patterns).toHaveLength(3);
  });

  it('all share the same fingerprint', () => {
    const fps = new Set(result.normalized.map((n) => n.fingerprint));
    expect(fps.size).toBe(1);
  });

  it('produces 0 divergences (same behavior)', () => {
    expect(result.divergenceCount).toBe(0);
  });

  it('yields calm mood', () => {
    expect(result.formagotchi.mood).toBe('calm');
  });
});
