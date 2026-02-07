import type { RawContainer, RawNode } from './scanner';

const CONTAINER_ROLES = ['container-form', 'container-filter'] as const;

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

export function walkTree(node: SceneNode, result: FrameNode[]): void {
  if (!isContainerNode(node)) return;

  const role = node.getPluginData('role');
  const match =
    (CONTAINER_ROLES as readonly string[]).includes(role) ||
    inferContainerRole(node.name) !== undefined;

  if (match) {
    result.push(node as FrameNode);
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
        : inferContainerRole(node.name);

    const children: RawNode[] = ('children' in node
      ? Array.from(node.children)
      : []
    ).map(buildRawNode);

    return {
      id: node.id,
      name: node.name,
      role,
      behavior: node.getPluginData('behavior') || 'unknown',
      intent: node.getPluginData('intent') || 'unknown',
      context: node.getPluginData('context') || 'unknown',
      children,
    };
  });
}
