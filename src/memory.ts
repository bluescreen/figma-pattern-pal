import type { Memory, MemoryEntry, StorageAdapter } from './types';

const STORAGE_KEY = 'patternPalMemory';

export async function loadMemory(storage: StorageAdapter): Promise<Memory> {
  const data = await storage.getAsync(STORAGE_KEY);
  if (!data || typeof data !== 'object') return {};
  return data as Memory;
}

export async function saveMemory(
  storage: StorageAdapter,
  memory: Memory,
): Promise<void> {
  await storage.setAsync(STORAGE_KEY, memory);
}

export function updateMemory(
  memory: Memory,
  fingerprints: string[],
  behaviors: string[],
): Memory {
  const result: Memory = { ...memory };
  const now = Date.now();

  for (let i = 0; i < fingerprints.length; i++) {
    const fp = fingerprints[i];
    const behavior = behaviors[i];
    const existing: MemoryEntry = result[fp]
      ? { ...result[fp], behaviorCounts: { ...result[fp].behaviorCounts } }
      : { totalObservations: 0, behaviorCounts: {}, lastSeen: 0 };

    existing.totalObservations += 1;
    existing.behaviorCounts[behavior] =
      (existing.behaviorCounts[behavior] ?? 0) + 1;
    existing.lastSeen = now;
    result[fp] = existing;
  }

  return result;
}

export function evictMemory(memory: Memory, maxSize: number = 200): Memory {
  const keys = Object.keys(memory);
  if (keys.length <= maxSize) return { ...memory };

  const sorted = keys.sort((a, b) => memory[a].lastSeen - memory[b].lastSeen);
  const toKeep = sorted.slice(keys.length - maxSize);
  const result: Memory = {};
  for (const key of toKeep) {
    result[key] = memory[key];
  }
  return result;
}
