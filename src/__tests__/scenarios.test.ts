import { describe, it, expect } from 'vitest';
import { scanPatterns } from '../scanner';
import { normalizePatterns } from '../normalizer';
import { clusterPatterns } from '../clustering';
import { generateInsights } from '../insights';
import { getFormagotchiState } from '../formagotchi';
import type { FormagotchiMood } from '../types';
import {
  calmContainers,
  confusedContainers,
  annoyedContainers,
  overstimulatedContainers,
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

describe('scenario: calm — clean design system', () => {
  const result = runPipeline(calmContainers);

  it('scans all patterns', () => {
    expect(result.patterns).toHaveLength(4);
  });

  it('produces 0 divergences', () => {
    expect(result.divergenceCount).toBe(0);
  });

  it('yields calm mood', () => {
    expect(result.formagotchi.mood).toBe('calm');
  });

  it('reports no divergence insights', () => {
    const divergenceInsights = result.insights.fileInsights.filter((i) =>
      i.message.includes('differ'),
    );
    expect(divergenceInsights).toHaveLength(0);
  });
});

describe('scenario: confused — growing inconsistency', () => {
  const result = runPipeline(confusedContainers);

  it('scans all patterns', () => {
    expect(result.patterns).toHaveLength(6);
  });

  it('produces 3-4 divergences', () => {
    expect(result.divergenceCount).toBeGreaterThanOrEqual(3);
    expect(result.divergenceCount).toBeLessThanOrEqual(4);
  });

  it('yields confused mood', () => {
    expect(result.formagotchi.mood).toBe('confused');
  });

  it('generates file insights about mixed behaviors', () => {
    expect(result.insights.fileInsights.length).toBeGreaterThan(0);
    const msgs = result.insights.fileInsights.map((i) => i.message).join(' ');
    expect(msgs).toContain('differ');
  });
});

describe('scenario: annoyed — design debt', () => {
  const result = runPipeline(annoyedContainers);

  it('scans all patterns', () => {
    expect(result.patterns).toHaveLength(12);
  });

  it('produces 5-6 divergences', () => {
    expect(result.divergenceCount).toBeGreaterThanOrEqual(5);
    expect(result.divergenceCount).toBeLessThanOrEqual(6);
  });

  it('yields annoyed mood', () => {
    expect(result.formagotchi.mood).toBe('annoyed');
  });

  it('generates cross-file insights', () => {
    expect(result.insights.crossFileInsights.length).toBeGreaterThan(0);
  });
});

describe('scenario: overstimulated — pattern chaos', () => {
  const result = runPipeline(overstimulatedContainers);

  it('scans all patterns', () => {
    expect(result.patterns).toHaveLength(16);
  });

  it('produces 7+ divergences', () => {
    expect(result.divergenceCount).toBeGreaterThanOrEqual(7);
  });

  it('yields overstimulated mood', () => {
    expect(result.formagotchi.mood).toBe('overstimulated');
  });

  it('generates insights for every mood level', () => {
    const moods: FormagotchiMood[] = ['calm', 'confused', 'annoyed', 'overstimulated'];
    const fixtures = [calmContainers, confusedContainers, annoyedContainers, overstimulatedContainers];
    for (let i = 0; i < moods.length; i++) {
      const r = runPipeline(fixtures[i]);
      expect(r.formagotchi.mood).toBe(moods[i]);
      expect(r.formagotchi.line.length).toBeGreaterThan(0);
    }
  });
});
