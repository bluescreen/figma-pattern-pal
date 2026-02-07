import type { Cluster, Memory, Insight, InsightResult } from './types';

export function generateFileInsights(clusters: Cluster[]): Insight[] {
  if (
    clusters.length === 1 &&
    clusters[0].divergences.length === 0
  ) {
    return [{ source: 'this-file', message: 'All patterns are consistent!' }];
  }

  const insights: Insight[] = [];

  for (const cluster of clusters) {
    const counts = new Map<string, number>();
    for (const p of cluster.patterns) {
      counts.set(p.behavior, (counts.get(p.behavior) ?? 0) + 1);
    }

    let majorityBehavior = '';
    let majorityCount = 0;
    for (const [behavior, count] of counts) {
      if (count > majorityCount) {
        majorityBehavior = behavior;
        majorityCount = count;
      }
    }

    const outlierCount = cluster.patterns.length - majorityCount;
    if (outlierCount > 0) {
      insights.push({
        source: 'this-file',
        message: `Most ${cluster.patterns[0].type}s use '${majorityBehavior}' — ${outlierCount} differ`,
      });
    }
  }

  return insights;
}

export function generateCrossFileInsights(
  clusters: Cluster[],
  memory: Memory,
): Insight[] {
  const insights: Insight[] = [];

  for (const cluster of clusters) {
    const entry = memory[cluster.fingerprint];
    if (!entry) continue;

    let memoryMajority = '';
    let maxCount = 0;
    for (const [behavior, count] of Object.entries(entry.behaviorCounts)) {
      if (count > maxCount) {
        memoryMajority = behavior;
        maxCount = count;
      }
    }

    const currentBehaviors = [...new Set(cluster.patterns.map((p) => p.behavior))];
    for (const currentBehavior of currentBehaviors) {
      if (currentBehavior !== memoryMajority) {
        insights.push({
          source: 'across-files',
          message: `Across files, '${memoryMajority}' is most common for this pattern — this file uses '${currentBehavior}'`,
        });
      }
    }
  }

  return insights;
}

export function generateInsights(
  clusters: Cluster[],
  memory: Memory,
): InsightResult {
  return {
    fileInsights: generateFileInsights(clusters),
    crossFileInsights: generateCrossFileInsights(clusters, memory),
  };
}
