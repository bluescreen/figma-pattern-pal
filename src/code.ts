import type { StorageAdapter } from './types';
import { getPatternContainers } from './figmaTraversal';
import { scanPatterns } from './scanner';
import { normalizePatterns } from './normalizer';
import { clusterPatterns } from './clustering';
import { loadMemory, updateMemory, evictMemory, saveMemory } from './memory';
import { generateInsights } from './insights';
import { getFormagotchiState } from './formagotchi';

figma.showUI(__html__, { width: 360, height: 520 });

const storage: StorageAdapter = {
  getAsync: (key: string) => figma.clientStorage.getAsync(key),
  setAsync: (key: string, value: unknown) =>
    figma.clientStorage.setAsync(key, value as string),
};

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === 'SCAN_PATTERNS') {
    try {
      const containers = getPatternContainers();
      const patterns = scanPatterns(containers);
      const normalized = normalizePatterns(patterns);
      const clusters = clusterPatterns(normalized);

      const memory = await loadMemory(storage);
      const fingerprints = normalized.map((p) => p.fingerprint);
      const behaviors = normalized.map((p) => p.behavior);
      const updated = updateMemory(memory, fingerprints, behaviors);
      const evicted = evictMemory(updated);
      await saveMemory(storage, evicted);

      const insights = generateInsights(clusters, evicted);

      const divergenceCount = clusters.reduce(
        (sum, c) => sum + c.divergences.length,
        0,
      );
      const memorySize = Object.keys(evicted).length;
      const formagotchi = getFormagotchiState(divergenceCount, memorySize);

      figma.ui.postMessage({
        type: 'SHOW_INSIGHTS',
        payload: { insights, formagotchi, clusters },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({
        type: 'SCAN_ERROR',
        payload: { error: message },
      });
    }
  } else if (msg.type === 'ANNOTATE_CANVAS') {
    console.log('Annotations mode not yet implemented');
  } else if (msg.type === 'CLOSE') {
    figma.closePlugin();
  }
};
