import type { Pattern, NormalizedPattern } from './types';

export function getFieldCountRange(count: number): string {
  if (count <= 3) return '1-3';
  if (count <= 6) return '4-6';
  return '7+';
}

export function normalizePattern(pattern: Pattern): NormalizedPattern {
  const fieldCountRange = getFieldCountRange(pattern.inputs.length);
  const fingerprint = `${pattern.type}-${pattern.intent}-${fieldCountRange}-${pattern.context}`;

  return {
    patternId: pattern.id,
    fingerprint,
    type: pattern.type,
    fieldCountRange,
    behavior: pattern.behavior,
    intent: pattern.intent,
    context: pattern.context,
  };
}

export function normalizePatterns(patterns: Pattern[]): NormalizedPattern[] {
  return patterns.map(normalizePattern);
}
