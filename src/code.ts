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
      console.log('[PatternPal] Raw containers:', containers.length);
      console.log('[PatternPal] Containers:', JSON.stringify(containers.map((c) => ({
        id: c.id, name: c.name, role: c.role, behavior: c.behavior,
        intent: c.intent, context: c.context, children: c.children.length,
      })), null, 2));

      const patterns = scanPatterns(containers);
      console.log('[PatternPal] Patterns after scan:', patterns.length);
      console.log('[PatternPal] Patterns:', JSON.stringify(patterns.map((p) => ({
        id: p.id, type: p.type, inputs: p.inputs.length, actions: p.actions.length,
        behavior: p.behavior, intent: p.intent, context: p.context,
      })), null, 2));

      const normalized = normalizePatterns(patterns);
      console.log('[PatternPal] Normalized:', JSON.stringify(normalized.map((n) => ({
        patternId: n.patternId, fingerprint: n.fingerprint, behavior: n.behavior,
      })), null, 2));

      const clusters = clusterPatterns(normalized);
      console.log('[PatternPal] Clusters:', clusters.length);
      for (const c of clusters) {
        console.log(`[PatternPal]   ${c.fingerprint} → ${c.patterns.length} patterns, ${c.divergences.length} divergences`);
        if (c.divergences.length > 0) {
          console.log(`[PatternPal]     ${c.divergences.join('; ')}`);
        }
      }

      const memory = await loadMemory(storage);
      console.log('[PatternPal] Memory entries loaded:', Object.keys(memory).length);

      const fingerprints = normalized.map((p) => p.fingerprint);
      const behaviors = normalized.map((p) => p.behavior);
      const updated = updateMemory(memory, fingerprints, behaviors);
      const evicted = evictMemory(updated);
      await saveMemory(storage, evicted);
      console.log('[PatternPal] Memory entries after update:', Object.keys(evicted).length);

      const insights = generateInsights(clusters, evicted);
      console.log('[PatternPal] File insights:', insights.fileInsights.length);
      for (const i of insights.fileInsights) {
        console.log(`[PatternPal]   [file] ${i.message}`);
      }
      console.log('[PatternPal] Cross-file insights:', insights.crossFileInsights.length);
      for (const i of insights.crossFileInsights) {
        console.log(`[PatternPal]   [xfile] ${i.message}`);
      }

      const divergenceCount = clusters.reduce(
        (sum, c) => sum + c.divergences.length,
        0,
      );
      const memorySize = Object.keys(evicted).length;
      const formagotchi = getFormagotchiState(divergenceCount, memorySize);
      console.log(`[PatternPal] Divergences: ${divergenceCount}, Memory: ${memorySize}, Mood: ${formagotchi.mood}`);
      console.log(`[PatternPal] Line: "${formagotchi.line}"`);

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
