export interface ComponentRef {
  id: string;
  name: string;
  role: string;
  type?: string;
}

export interface Pattern {
  id: string;
  type: 'form' | 'filter';
  inputs: ComponentRef[];
  actions: ComponentRef[];
  behavior: string;
  intent: string;
  context: string;
}

export interface NormalizedPattern {
  patternId: string;
  fingerprint: string;
  type: 'form' | 'filter';
  fieldCountRange: string;
  behavior: string;
  intent: string;
  context: string;
}

export interface Cluster {
  label: string;
  fingerprint: string;
  patterns: NormalizedPattern[];
  divergences: string[];
}

export interface MemoryEntry {
  totalObservations: number;
  behaviorCounts: Record<string, number>;
  lastSeen: number;
}

export type Memory = Record<string, MemoryEntry>;

export type InsightSource = 'this-file' | 'across-files';

export interface Insight {
  source: InsightSource;
  message: string;
}

export interface InsightResult {
  fileInsights: Insight[];
  crossFileInsights: Insight[];
}

export type FormagotchiMood = 'calm' | 'confused' | 'annoyed' | 'overstimulated';

export interface FormagotchiState {
  mood: FormagotchiMood;
  line: string;
}

export interface StorageAdapter {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}
