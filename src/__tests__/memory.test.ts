import type { Memory, StorageAdapter } from '../types';
import { loadMemory, saveMemory, updateMemory, evictMemory } from '../memory';

function mockStorage(initial: Record<string, unknown> = {}): StorageAdapter {
  const store: Record<string, unknown> = { ...initial };
  return {
    getAsync: async (key: string) => store[key],
    setAsync: async (key: string, value: unknown) => {
      store[key] = value;
    },
  };
}

describe('loadMemory', () => {
  it('returns empty object when storage is empty', async () => {
    const result = await loadMemory(mockStorage());
    expect(result).toEqual({});
  });

  it('returns stored memory', async () => {
    const mem: Memory = {
      fp1: { totalObservations: 3, behaviorCounts: { submit: 3 }, lastSeen: 1 },
    };
    const result = await loadMemory(mockStorage({ patternPalMemory: mem }));
    expect(result).toEqual(mem);
  });
});

describe('saveMemory', () => {
  it('persists to storage', async () => {
    const storage = mockStorage();
    const mem: Memory = {
      fp1: { totalObservations: 1, behaviorCounts: { submit: 1 }, lastSeen: 1 },
    };
    await saveMemory(storage, mem);
    expect(await storage.getAsync('patternPalMemory')).toEqual(mem);
  });
});

describe('updateMemory', () => {
  it('increments counts correctly', () => {
    const mem: Memory = {
      fp1: { totalObservations: 2, behaviorCounts: { submit: 2 }, lastSeen: 1 },
    };
    const result = updateMemory(mem, ['fp1'], ['submit']);
    expect(result.fp1.totalObservations).toBe(3);
    expect(result.fp1.behaviorCounts.submit).toBe(3);
    expect(result.fp1.lastSeen).toBeGreaterThan(1);
  });

  it('creates new entry for unknown fingerprint', () => {
    const result = updateMemory({}, ['fp_new'], ['reset']);
    expect(result.fp_new).toBeDefined();
    expect(result.fp_new.totalObservations).toBe(1);
    expect(result.fp_new.behaviorCounts.reset).toBe(1);
  });
});

describe('evictMemory', () => {
  it('removes least-recently-seen when over limit', () => {
    const mem: Memory = {
      old: { totalObservations: 1, behaviorCounts: {}, lastSeen: 1 },
      mid: { totalObservations: 1, behaviorCounts: {}, lastSeen: 50 },
      new: { totalObservations: 1, behaviorCounts: {}, lastSeen: 100 },
    };
    const result = evictMemory(mem, 2);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result.old).toBeUndefined();
    expect(result.mid).toBeDefined();
    expect(result.new).toBeDefined();
  });
});
