import type { Pattern, ComponentRef } from './types';

export interface RawNode {
  id: string;
  name: string;
  role?: string;
  children?: RawNode[];
}

export interface RawContainer {
  id: string;
  name: string;
  role?: string;
  behavior?: string;
  intent?: string;
  context?: string;
  children: RawNode[];
}

function inferRole(name: string): string {
  const lower = name.toLowerCase();
  if (/input|field|text/.test(lower)) return 'input';
  if (/submit|save|apply|button/.test(lower)) return 'action-primary';
  if (/cancel|reset|back/.test(lower)) return 'action-secondary';
  if (/feedback|error|success|message/.test(lower)) return 'feedback';
  return 'unknown';
}

function getContainerType(role?: string): 'form' | 'filter' | null {
  if (role === 'container-form') return 'form';
  if (role === 'container-filter') return 'filter';
  return null;
}

function toComponentRef(node: RawNode): ComponentRef {
  const role = node.role || inferRole(node.name);
  return { id: node.id, name: node.name, role };
}

export function scanPatterns(containers: RawContainer[]): Pattern[] {
  const patterns: Pattern[] = [];

  for (const container of containers) {
    const type = getContainerType(container.role);
    if (!type) continue;

    const refs = (container.children || []).map(toComponentRef);
    const inputs = refs.filter((r) => r.role === 'input');
    const actions = refs.filter(
      (r) => r.role === 'action-primary' || r.role === 'action-secondary',
    );
    const hasPrimary = actions.some((a) => a.role === 'action-primary');

    if (inputs.length < 2 || !hasPrimary) continue;

    const pattern: Pattern = {
      id: container.id,
      type,
      inputs,
      actions,
      behavior: container.behavior || 'unknown',
      intent: container.intent || 'unknown',
      context: container.context || 'default',
    };
    console.log('[scan]', container.id, container.name, `→ ${type}`, `inputs=${inputs.length}`, `actions=${actions.length}`);
    patterns.push(pattern);
  }

  return patterns;
}
