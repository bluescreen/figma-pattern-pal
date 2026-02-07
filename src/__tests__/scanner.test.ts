import { describe, it, expect } from 'vitest';
import { scanPatterns, type RawContainer } from '../scanner';

describe('scanPatterns', () => {
  it('extracts patterns from containers with semantic roles', () => {
    const containers: RawContainer[] = [
      {
        id: 'f1',
        name: 'Login',
        role: 'container-form',
        intent: 'login',
        children: [
          { id: 'i1', name: 'Email', role: 'input' },
          { id: 'i2', name: 'Password', role: 'input' },
          { id: 'a1', name: 'Submit', role: 'action-primary' },
        ],
      },
    ];
    const result = scanPatterns(containers);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('form');
    expect(result[0].inputs).toHaveLength(2);
    expect(result[0].actions).toHaveLength(1);
  });

  it('uses fallback heuristics when roles are missing', () => {
    const containers: RawContainer[] = [
      {
        id: 'f2',
        name: 'Search',
        role: 'container-filter',
        children: [
          { id: 'i1', name: 'Text input' },
          { id: 'i2', name: 'Date field' },
          { id: 'a1', name: 'Apply button' },
          { id: 'a2', name: 'Cancel' },
        ],
      },
    ];
    const result = scanPatterns(containers);
    expect(result).toHaveLength(1);
    expect(result[0].inputs).toHaveLength(2);
    expect(result[0].actions).toHaveLength(2);
    expect(result[0].actions[0].role).toBe('action-primary');
    expect(result[0].actions[1].role).toBe('action-secondary');
  });

  it('filters out patterns with fewer than 2 inputs', () => {
    const containers: RawContainer[] = [
      {
        id: 'f3',
        name: 'Simple',
        role: 'container-form',
        children: [
          { id: 'i1', name: 'Only input', role: 'input' },
          { id: 'a1', name: 'Go', role: 'action-primary' },
        ],
      },
    ];
    expect(scanPatterns(containers)).toHaveLength(0);
  });

  it('filters out patterns without a primary action', () => {
    const containers: RawContainer[] = [
      {
        id: 'f4',
        name: 'NoPrimary',
        role: 'container-form',
        children: [
          { id: 'i1', name: 'A', role: 'input' },
          { id: 'i2', name: 'B', role: 'input' },
          { id: 'a1', name: 'Cancel', role: 'action-secondary' },
        ],
      },
    ];
    expect(scanPatterns(containers)).toHaveLength(0);
  });

  it('correctly identifies form vs filter type', () => {
    const containers: RawContainer[] = [
      {
        id: 'f5',
        name: 'Form',
        role: 'container-form',
        children: [
          { id: 'i1', name: 'A', role: 'input' },
          { id: 'i2', name: 'B', role: 'input' },
          { id: 'a1', name: 'Save', role: 'action-primary' },
        ],
      },
      {
        id: 'f6',
        name: 'Filter',
        role: 'container-filter',
        children: [
          { id: 'i3', name: 'C', role: 'input' },
          { id: 'i4', name: 'D', role: 'input' },
          { id: 'a2', name: 'Apply', role: 'action-primary' },
        ],
      },
    ];
    const result = scanPatterns(containers);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('form');
    expect(result[1].type).toBe('filter');
  });
});
