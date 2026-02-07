# Pattern Pal – Technical Design Document (TDD)

---

## 1. Overview

**Project Name:** Pattern Pal  
**Type:** Figma plugin (hackathon MVP)  
**Purpose:** Technical blueprint to implement scanning, normalization, clustering, memory, and insights generation in the Figma plugin using Make, MCP, and Cursor.

---

## 2. Architecture

```
Figma Make UI
      │
      ▼
Plugin Entry (code.ts)
      │
      ▼
Cursor Logic
  ├─ Scanner
  ├─ Normalizer
  ├─ Clustering
  ├─ Memory Manager
  └─ Insight Engine
      │
      ▼
Figma MCP → Provides structured component/frame data
      │
      ▼
Make UI renders insights & Formagotchi reactions
```

**Explanation:**
- Make: UI and user interactions
- MCP: Extracts semantic component metadata
- Cursor: Processes data and generates insights

---

## 3. Module Definitions

### 3.1 Make UI
- File: `ui.html`
- Responsibilities:
  - Render Scan button, clusters, insights, and Formagotchi
  - Send `SCAN_PATTERNS` message to plugin code
  - Receive `SHOW_INSIGHTS` messages and display content
- Elements:
  - Button: `#scanBtn`
  - Insights container: `#insights`
  - Formagotchi container: `#formagotchi`

### 3.2 Plugin Entry
- File: `code.ts`
- Responsibilities:
  - Load UI: `figma.showUI(__html__, { width: 300, height: 400 })`
  - Import Cursor logic: `import './cursorLogic.ts'`
  - Relay messages between UI and Cursor logic

### 3.3 Cursor Logic
- File: `cursorLogic.ts`
- Modules:
  1. **Scanner**
     - Input: MCP JSON
     - Output: Filtered patterns (inputs >=2 and at least one primary action)
  2. **Normalizer**
     - Input: Pattern objects
     - Output: Fingerprint for each pattern
     - Logic: `type-intent-fieldRange-context`
  3. **Clustering**
     - Group normalized patterns by fingerprint similarity
     - Output: Cluster objects with patterns and divergences
  4. **Memory Manager**
     - Load/save memory using `figma.clientStorage`
     - Track counts, lastSeen timestamps, and behavioral statistics
  5. **Insight Engine**
     - Generate file-level insights
     - Generate cross-file insights using memory
     - Output messages for UI
  6. **Formagotchi Engine**
     - Determine mood and playful line based on divergences and memory size

### 3.4 MCP Queries
- File: `mcpQueries.json`
- Queries:
  - `patternContainers` → Frames with `role=container-form` or `role=container-filter`
  - `inputs` → Descendants with `role=input`
  - `actions` → Descendants with `role=action-primary|action-secondary`
  - `behaviorIntentContext` → Extract `behavior`, `intent`, `context`, `name`

---

## 4. Data Models

### 4.1 Pattern Object
```ts
Pattern {
  id: string
  type: 'form' | 'filter'
  inputs: ComponentRef[]
  actions: ComponentRef[]
  behavior: string
  intent: string
  context: string
}
```

### 4.2 Normalized Pattern
```ts
NormalizedPattern {
  fingerprint: string
  type: 'form' | 'filter'
  fieldCountRange: string
  behavior: string
  intent: string
  context: string
}
```

### 4.3 Cluster Object
```ts
Cluster {
  label: string
  patterns: NormalizedPattern[]
  divergences: string[]
}
```

### 4.4 Memory Object
```ts
Memory {
  [fingerprint: string]: {
    totalObservations: number
    behaviorCounts: { [behavior: string]: number }
    lastSeen: number
  }
}
```

---

## 5. Workflow Steps

1. User clicks **Scan Patterns** in Make UI
2. Plugin sends `SCAN_PATTERNS` message to Cursor logic
3. Cursor queries MCP for all `patternContainers`
4. For each container:
   - Extract `inputs`, `actions`, `behavior`, `intent`, `context`
   - Create Pattern objects
5. Filter patterns (inputs>=2 and primary action exists)
6. Normalize patterns to create fingerprints
7. Cluster normalized patterns
8. Load memory from `figma.clientStorage`
9. Update memory with new fingerprints
10. Generate file-level and cross-file insights
11. Generate Formagotchi mood/line
12. Send `SHOW_INSIGHTS` message back to Make UI
13. Optional: annotate frames with divergences

---

## 6. Messages Between UI and Plugin

| From | To | Message | Payload |
|------|----|---------|--------|
| Make UI | Plugin | SCAN_PATTERNS | {} |
| Plugin | UI | SHOW_INSIGHTS | { insights: string[], formagotchi: string } |

---

## 7. File Structure

```
pattern-pal-plugin/
  ├─ code.ts
  ├─ cursorLogic.ts
  ├─ ui.html
  ├─ mcpQueries.json
  └─ manifest.json
```

---

## 8. Testing Guidelines

- Verify file-level scan detects forms/filters correctly
- Verify fingerprints are consistent across similar patterns
- Verify memory updates correctly after scanning multiple files
- Verify insights display correctly in UI
- Verify Formagotchi reactions match divergence intensity
- Optional: test annotations mode visually in Figma

---

## 9. Notes

- Ensure all design system components have semantic roles
- Keep fingerprints simple to avoid memory overflow
- Formagotchi lines should be short, playful, and non-judgmental
- All logic must trust MCP output; fallback heuristics only if missing

---

**End of TDD**

