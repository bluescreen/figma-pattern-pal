import type { Cluster, InsightResult } from './types';

const ANNOTATION_PREFIX = '[Pattern Pal]';
const FILE_COLOR = '#FFD966';
const CROSS_FILE_COLOR = '#D9B3FF';
const VERTICAL_OFFSET = 20;

export function formatAnnotationText(cluster: Cluster): string {
  return `${cluster.label}\n${cluster.divergences.join('\n')}`;
}

export function getAnnotationName(clusterLabel: string): string {
  return `${ANNOTATION_PREFIX} ${clusterLabel}`;
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace('#', '');
  return {
    r: parseInt(raw.substring(0, 2), 16) / 255,
    g: parseInt(raw.substring(2, 4), 16) / 255,
    b: parseInt(raw.substring(4, 6), 16) / 255,
  };
}

export function annotateCanvas(
  clusters: Cluster[],
  insights: InsightResult,
): void {
  const crossFileFingerprints = new Set(
    insights.crossFileInsights.map((i) => {
      for (const c of clusters) {
        if (i.message.includes(c.patterns[0]?.behavior)) return c.fingerprint;
      }
      return '';
    }),
  );

  let offsetIndex = 0;

  for (const cluster of clusters) {
    if (cluster.divergences.length === 0) continue;

    for (const pattern of cluster.patterns) {
      const node = figma.getNodeById(pattern.patternId);
      if (!node || !('x' in node)) continue;

      const sceneNode = node as SceneNode;
      const isCrossFile = crossFileFingerprints.has(cluster.fingerprint);
      const color = isCrossFile ? CROSS_FILE_COLOR : FILE_COLOR;

      const sticky = figma.createSticky();
      sticky.name = getAnnotationName(cluster.label);
      sticky.text.characters = formatAnnotationText(cluster);
      sticky.x = sceneNode.x + (sceneNode as FrameNode).width + 40;
      sticky.y = sceneNode.y + offsetIndex * VERTICAL_OFFSET;

      const rgb = hexToRGB(color);
      sticky.fills = [{ type: 'SOLID', color: rgb }];

      offsetIndex++;
    }
  }
}

export function removeAnnotations(): void {
  const toRemove: SceneNode[] = [];

  for (const child of figma.currentPage.children) {
    if (child.name.startsWith(ANNOTATION_PREFIX)) {
      toRemove.push(child);
    }
  }

  for (const node of toRemove) {
    node.remove();
  }
}

export function hasAnnotations(): boolean {
  return figma.currentPage.children.some((child) =>
    child.name.startsWith(ANNOTATION_PREFIX),
  );
}
