import type { NormalizedPattern, Cluster } from './types';

export function clusterPatterns(patterns: NormalizedPattern[]): Cluster[] {
  const groups = new Map<string, NormalizedPattern[]>();

  for (const p of patterns) {
    const list = groups.get(p.fingerprint) ?? [];
    list.push(p);
    groups.set(p.fingerprint, list);
  }

  const clusters: Cluster[] = [];

  for (const [fingerprint, group] of groups) {
    const first = group[0];
    const label = `${first.type} · ${first.intent} · ${first.fieldCountRange} fields · ${first.context}`;

    const divergences: string[] = [];
    const behaviors = [...new Set(group.map((p) => p.behavior))];
    if (behaviors.length > 1) {
      divergences.push(`Mixed behaviors: ${behaviors.join(', ')}`);
    }

    clusters.push({ label, fingerprint, patterns: group, divergences });
  }

  return clusters;
}
