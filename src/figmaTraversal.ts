import type { RawContainer, RawNode } from './scanner';

const CONTAINER_ROLES = ['container-form', 'container-filter'] as const;

const INPUT_RE = /input|field|text/i;
const PRIMARY_RE = /submit|save|apply|button|sign|login|register|confirm|send/i;

function isContainerNode(
  node: SceneNode,
): node is FrameNode | ComponentNode | InstanceNode {
  return (
    node.type === 'FRAME' ||
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE'
  );
}

function inferContainerRole(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (lower.includes('form')) return 'container-form';
  if (lower.includes('filter')) return 'container-filter';
  return undefined;
}

export function buildRawNode(node: SceneNode): RawNode {
  return {
    id: node.id,
    name: node.name,
    role: node.getPluginData('role') || '',
  };
}

function collectAllNodes(node: SceneNode, out: RawNode[]): void {
  out.push(buildRawNode(node));
  if ('children' in node) {
    for (const child of (node as FrameNode).children) {
      collectAllNodes(child, out);
    }
  }
}

function hasFormShape(nodes: RawNode[]): boolean {
  let inputs = 0;
  let primary = 0;
  for (const n of nodes) {
    const role = n.role || n.name;
    if (INPUT_RE.test(role)) inputs++;
    if (PRIMARY_RE.test(role)) primary++;
  }
  return inputs >= 2 && primary >= 1;
}

export function walkTree(node: SceneNode, result: FrameNode[]): void {
  if (!isContainerNode(node)) return;

  const all: RawNode[] = [];
  collectAllNodes(node, all);
  if (hasFormShape(all)) {
    result.push(node as FrameNode);
    return;
  }

  if ('children' in node) {
    for (const child of node.children) {
      walkTree(child, result);
    }
  }
}

export function getPatternContainers(): RawContainer[] {
  const containerNodes: FrameNode[] = [];

  for (const child of figma.currentPage.children) {
    walkTree(child, containerNodes);
  }

  return containerNodes.map((node): RawContainer => {
    const pluginRole = node.getPluginData('role');
    const role =
      (CONTAINER_ROLES as readonly string[]).includes(pluginRole)
        ? pluginRole
        : inferContainerRole(node.name) ?? 'container-form';

    const leaves: RawNode[] = [];
    collectAllNodes(node, leaves);

    return {
      id: node.id,
      name: node.name,
      role,
      behavior: node.getPluginData('behavior') || 'unknown',
      intent: node.getPluginData('intent') || 'unknown',
      context: node.getPluginData('context') || 'unknown',
      children: leaves,
    };
  });
}
