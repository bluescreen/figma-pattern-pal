import { describe, it, expect } from 'vitest';
import { scanPatterns, type RawContainer } from '../scanner';
import { normalizePatterns } from '../normalizer';
import { clusterPatterns } from '../clustering';
import { updateMemory, evictMemory } from '../memory';
import { generateInsights } from '../insights';
import { getFormagotchiState } from '../formagotchi';
import type { Memory } from '../types';

const mockContainers: RawContainer[] = [
  {
    id: 'login-form',
    name: 'Login Form',
    role: 'container-form',
    behavior: 'submit-validation',
    intent: 'create',
    context: 'page',
    children: [
      { id: 'l-email', name: 'Email', role: 'input' },
      { id: 'l-password', name: 'Password', role: 'input' },
      { id: 'l-remember', name: 'Remember Me', role: 'input' },
      { id: 'l-submit', name: 'Login', role: 'action-primary' },
    ],
  },
  {
    id: 'registration-form',
    name: 'Registration Form',
    role: 'container-form',
    behavior: 'inline-validation',
    intent: 'create',
    context: 'page',
    children: [
      { id: 'r-name', name: 'Name', role: 'input' },
      { id: 'r-email', name: 'Email', role: 'input' },
      { id: 'r-password', name: 'Password', role: 'input' },
      { id: 'r-confirm', name: 'Confirm Password', role: 'input' },
      { id: 'r-terms', name: 'Terms', role: 'input' },
      { id: 'r-submit', name: 'Register', role: 'action-primary' },
      { id: 'r-cancel', name: 'Cancel', role: 'action-secondary' },
    ],
  },
  {
    id: 'search-filter',
    name: 'Search Filter',
    role: 'container-filter',
    behavior: 'auto-apply',
    intent: 'filter',
    context: 'panel',
    children: [
      { id: 's-keyword', name: 'Keyword', role: 'input' },
      { id: 's-category', name: 'Category', role: 'input' },
      { id: 's-apply', name: 'Apply', role: 'action-primary' },
    ],
  },
  {
    id: 'advanced-filter',
    name: 'Advanced Filter',
    role: 'container-filter',
    behavior: 'confirm',
    intent: 'filter',
    context: 'panel',
    children: [
      { id: 'af-keyword', name: 'Keyword', role: 'input' },
      { id: 'af-category', name: 'Category', role: 'input' },
      { id: 'af-date-from', name: 'Date From', role: 'input' },
      { id: 'af-date-to', name: 'Date To', role: 'input' },
      { id: 'af-apply', name: 'Apply', role: 'action-primary' },
      { id: 'af-reset', name: 'Reset', role: 'action-secondary' },
    ],
  },
  {
    id: 'edit-profile',
    name: 'Edit Profile Form',
    role: 'container-form',
    behavior: 'submit-validation',
    intent: 'update',
    context: 'modal',
    children: [
      { id: 'ep-name', name: 'Name', role: 'input' },
      { id: 'ep-bio', name: 'Bio', role: 'input' },
      { id: 'ep-avatar', name: 'Avatar', role: 'input' },
      { id: 'ep-save', name: 'Save', role: 'action-primary' },
    ],
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    role: 'container-form',
    behavior: 'submit-validation',
    intent: 'create',
    context: 'modal',
    children: [
      { id: 'c-email', name: 'Email', role: 'input' },
      { id: 'c-message', name: 'Message', role: 'input' },
      { id: 'c-send', name: 'Send', role: 'action-primary' },
    ],
  },
];

describe('e2e pipeline', () => {
  it('processes mock data through full pipeline', () => {
    // 1. Scan
    const patterns = scanPatterns(mockContainers);
    expect(patterns).toHaveLength(6);

    // 2. Normalize
    const normalized = normalizePatterns(patterns);
    expect(normalized).toHaveLength(6);

    // 3. Cluster
    const clusters = clusterPatterns(normalized);
    expect(clusters.length).toBeGreaterThanOrEqual(2);

    // 4. Build memory simulating previous scans with different behaviors
    const memory: Memory = {};
    for (const cluster of clusters) {
      memory[cluster.fingerprint] = {
        totalObservations: 10,
        behaviorCounts: { 'different-behavior': 8, 'other-behavior': 2 },
        lastSeen: Date.now() - 86400000,
      };
    }

    // 5. Insights
    const insights = generateInsights(clusters, memory);
    const totalInsights =
      insights.fileInsights.length + insights.crossFileInsights.length;
    expect(totalInsights).toBeGreaterThanOrEqual(3);

    for (const ins of [...insights.fileInsights, ...insights.crossFileInsights]) {
      expect(ins.message).toBeTruthy();
    }

    // 6. Formagotchi
    const divergenceCount = clusters.reduce(
      (sum, c) => sum + c.divergences.length,
      0,
    );
    const state = getFormagotchiState(divergenceCount, Object.keys(memory).length);
    expect(['calm', 'confused', 'annoyed', 'overstimulated']).toContain(state.mood);
    expect(state.line.length).toBeGreaterThan(0);
  });

  it('handles memory update and eviction', () => {
    // 1. Empty memory
    let memory: Memory = {};

    // 2. Run pipeline, update memory
    const patterns = scanPatterns(mockContainers);
    const normalized = normalizePatterns(patterns);
    const fingerprints = normalized.map((n) => n.fingerprint);
    const behaviors = normalized.map((n) => n.behavior);

    memory = updateMemory(memory, fingerprints, behaviors);
    expect(Object.keys(memory).length).toBeGreaterThan(0);

    // Each entry should have totalObservations >= 1
    for (const entry of Object.values(memory)) {
      expect(entry.totalObservations).toBeGreaterThanOrEqual(1);
    }

    // 3. Evict with small maxSize
    const evicted = evictMemory(memory, 2);
    expect(Object.keys(evicted).length).toBeLessThanOrEqual(2);
  });

  it('detects behavioral divergences in similar patterns', () => {
    // Two filter containers with same field count range so they cluster together
    const filterContainers: RawContainer[] = [
      {
        id: 'filter-a',
        name: 'Filter A',
        role: 'container-filter',
        behavior: 'auto-apply',
        intent: 'filter',
        context: 'panel',
        children: [
          { id: 'fa-1', name: 'Keyword', role: 'input' },
          { id: 'fa-2', name: 'Category', role: 'input' },
          { id: 'fa-3', name: 'Apply', role: 'action-primary' },
        ],
      },
      {
        id: 'filter-b',
        name: 'Filter B',
        role: 'container-filter',
        behavior: 'confirm',
        intent: 'filter',
        context: 'panel',
        children: [
          { id: 'fb-1', name: 'Keyword', role: 'input' },
          { id: 'fb-2', name: 'Category', role: 'input' },
          { id: 'fb-3', name: 'Status', role: 'input' },
          { id: 'fb-4', name: 'Apply', role: 'action-primary' },
          { id: 'fb-5', name: 'Reset', role: 'action-secondary' },
        ],
      },
    ];

    const patterns = scanPatterns(filterContainers);
    expect(patterns).toHaveLength(2);

    const normalized = normalizePatterns(patterns);
    // Both should share the same fingerprint (filter-filter-1-3-panel)
    expect(normalized[0].fingerprint).toBe(normalized[1].fingerprint);

    const clusters = clusterPatterns(normalized);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].divergences.length).toBeGreaterThan(0);
    expect(clusters[0].divergences[0]).toContain('auto-apply');
    expect(clusters[0].divergences[0]).toContain('confirm');
  });
});
