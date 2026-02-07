# Algorithm — Pattern Pal

Technical reference for the pattern detection, clustering, and insight pipeline.

## Pipeline Overview

```
figmaTraversal  →  scanner  →  normalizer  →  clustering  →  insights
                                                           →  memory
                                                           →  formagotchi
```

Each stage is a pure function (except traversal and memory I/O), making the pipeline deterministic and independently testable.

## 1. Traversal (`figmaTraversal.ts`)

Recursive DFS over `figma.currentPage.children`.

**Node qualification:**
A node is a candidate if `node.type` is `FRAME`, `COMPONENT`, or `INSTANCE`.

**Container detection (two-pass):**
1. Read `node.getPluginData('role')` — match against `container-form` or `container-filter`.
2. Fallback heuristic: if no plugin data, infer from `node.name` (case-insensitive substring match for `form` or `filter`).

**Output:** `RawContainer[]` — each entry contains:
- `id`, `name`, `role` (resolved container type)
- `behavior`, `intent`, `context` (from plugin data, defaults to `'unknown'`/`'default'`)
- `children: RawNode[]` (flat list of immediate child nodes with `id`, `name`, `role`)

**Complexity:** O(N) where N = total nodes in page.

## 2. Scanner (`scanner.ts`)

Converts raw Figma data into typed `Pattern` objects.

**Role resolution per child node:**
1. Use `node.role` from plugin data if present.
2. Fallback: regex-based inference from `node.name`:
   - `/input|field|text/` → `input`
   - `/submit|save|apply|button/` → `action-primary`
   - `/cancel|reset|back/` → `action-secondary`
   - `/feedback|error|success|message/` → `feedback`

**Inclusion criteria (AND):**
- Container has a valid type (`container-form` → `'form'`, `container-filter` → `'filter'`)
- At least **2 inputs** (`role === 'input'`)
- At least **1 primary action** (`role === 'action-primary'`)

Containers that fail these checks are silently dropped — they represent incomplete or non-pattern frames.

**Output:** `Pattern[]` with `id`, `type`, `inputs`, `actions`, `behavior`, `intent`, `context`.

## 3. Normalizer (`normalizer.ts`)

Generates a compact fingerprint string for each pattern to enable grouping.

**Fingerprint format:**
```
{type}-{intent}-{fieldCountRange}-{context}
```

**Field count bucketing:**

| Input count | Range |
|-------------|-------|
| 1–3         | `1-3` |
| 4–6         | `4-6` |
| 7+          | `7+`  |

Bucketing absorbs minor field count differences so that a 2-field login and a 3-field login still cluster together.

**Example:**
A form with `intent=create`, 3 inputs, `context=page` → `form-create-1-3-page`

**Output:** `NormalizedPattern[]` with `patternId`, `fingerprint`, `type`, `fieldCountRange`, `behavior`, `intent`, `context`.

## 4. Clustering (`clustering.ts`)

Groups normalized patterns by fingerprint, then detects behavioral divergences within each group.

**Algorithm:**
1. Build a `Map<fingerprint, NormalizedPattern[]>` — single pass, O(P).
2. For each group:
   - Collect unique `behavior` values.
   - If `behaviors.length > 1` → push a divergence string: `"Mixed behaviors: X, Y"`.
3. Construct a human-readable label: `"{type} · {intent} · {fieldCountRange} fields · {context}"`.

**Divergence count:** Each cluster with mixed behaviors contributes exactly **1 divergence**. The total across all clusters drives the Formagotchi mood.

**Output:** `Cluster[]` with `label`, `fingerprint`, `patterns`, `divergences`.

## 5. Memory (`memory.ts`)

Persistent cross-file pattern memory using `figma.clientStorage`.

**Data structure:**
```typescript
Memory = {
  [fingerprint: string]: {
    totalObservations: number;       // cumulative scan count
    behaviorCounts: { [behavior: string]: number };  // frequency map
    lastSeen: number;                // timestamp (ms)
  }
}
```

**Operations:**

| Function | Description |
|----------|-------------|
| `loadMemory(storage)` | Read from `clientStorage`, return `{}` if empty/corrupt |
| `updateMemory(memory, fingerprints, behaviors)` | Increment `totalObservations` and `behaviorCounts[behavior]` for each pattern. Immutable — returns new object |
| `evictMemory(memory, maxSize=200)` | If entries exceed `maxSize`, sort by `lastSeen` ascending, keep the most recent `maxSize` entries (LRU eviction) |
| `saveMemory(storage, memory)` | Persist to `clientStorage` |

**Eviction strategy:** LRU by `lastSeen` timestamp. Cap at 200 entries to prevent unbounded storage growth.

## 6. Insights (`insights.ts`)

Two insight generators run in parallel over clusters and memory.

### File-Level Insights

For each cluster:
1. Count occurrences of each `behavior` → find the **majority behavior** (highest count).
2. Compute `outlierCount = cluster.size - majorityCount`.
3. If `outlierCount > 0` → emit: `"Most {type}s use '{majorityBehavior}' — {outlierCount} differ"`.

Special case: if there is exactly 1 cluster with 0 divergences → `"All patterns are consistent!"`.

### Cross-File Insights

For each cluster:
1. Look up `memory[cluster.fingerprint]`.
2. Find the **historical majority behavior** from `behaviorCounts`.
3. For each current behavior that differs from the historical majority → emit: `"Across files, '{memoryMajority}' is most common for this pattern — this file uses '{currentBehavior}'"`.

**Output:** `InsightResult { fileInsights, crossFileInsights }`.

## 7. Formagotchi (`formagotchi.ts`)

Maps total divergence count to a mood tier.

| Divergences | Mood | Walk Speed | Pause Chance |
|-------------|------|------------|--------------|
| 0–2 | `calm` | slow (600–1400ms) | 25% |
| 3–4 | `confused` | medium (400–800ms) | 25% |
| 5–6 | `annoyed` | fast (350–650ms) | 12% |
| 7+ | `overstimulated` | frantic (250–450ms) | 8% |

Each mood has a pool of 3 one-liner strings; one is selected at random per scan.

**SVG animations per mood:**

| Mood | Idle Animation |
|------|---------------|
| `calm` | `tama-hop` (gentle bounce) + `tama-blink` (periodic blink) |
| `confused` | `tama-wobble` (side-to-side tilt) |
| `annoyed` | `tama-huff` (puff up/down) |
| `overstimulated` | `tama-shake` (rapid horizontal) + `tama-sweat` (dripping sweat drops) |

The walk engine runs independently: the character wanders left/right inside the LCD screen with random direction changes and pauses, speed governed by the mood tier.

## 8. Annotations (`annotations.ts`)

Optional canvas overlay that places Figma sticky notes on divergent patterns.

For each cluster with `divergences.length > 0`:
1. Resolve the original Figma node via `figma.getNodeById(pattern.patternId)`.
2. Create a `StickyNode` positioned to the right of the frame.
3. Color: `#FFD966` (file-level) or `#D9B3FF` (cross-file).
4. Text: cluster label + divergence messages.

Annotations are prefixed with `[Pattern Pal]` for cleanup via `removeAnnotations()`.

## Fingerprint Collision Analysis

The fingerprint `{type}-{intent}-{fieldCountRange}-{context}` has:
- 2 types × N intents × 3 ranges × M contexts possible values.

With typical values (5 intents, 4 contexts), this yields ~120 unique slots. Patterns that genuinely differ in structure (e.g., a 2-field form vs. a 10-field form) will never collide due to the field count bucketing. Patterns that are structurally similar but behaviorally different (the actual design inconsistency) will correctly cluster and produce divergences.

## Complexity Summary

| Stage | Time | Space |
|-------|------|-------|
| Traversal | O(N) nodes | O(C) containers |
| Scanner | O(C × K) children per container | O(P) patterns |
| Normalizer | O(P) | O(P) |
| Clustering | O(P) | O(P) |
| File insights | O(C × P) per cluster | O(I) insights |
| Cross-file insights | O(C) | O(I) insights |
| Memory update | O(P) | O(M) entries |
| Memory eviction | O(M log M) sort | O(M) |

Where N = total Figma nodes, C = containers, K = avg children, P = valid patterns, I = insights, M = memory entries (capped at 200).
