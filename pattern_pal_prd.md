# Pattern Pal – Product Requirements Document (PRD)

---

## 1. Product Overview

**Name (Working):** Pattern Pal  
**Type:** Figma plugin (hackathon MVP)  
**Tagline:** "A playful teammate that observes your design patterns and suggests alignment—without judging."

**High-Level Vision:**  
Design systems are well-documented, but usage diverges as multiple teams build in parallel. Pattern Pal scans design files, detects forms and filters, clusters similar patterns, surfaces behavioral divergences, and provides non-judgmental, playful insights. It remembers patterns across files, giving designers cross-file intelligence without enforcing rules.

---

## 2. Problem Statement

- Designers are building forms and filters inconsistently across multiple files and teams.  
- Guidelines exist but are rarely read or followed.  
- Overlapping patterns behave differently across pages, causing inconsistent UX.  
- Detecting and aligning these inconsistencies manually is time-consuming.

---

## 3. Goals

- Provide designers with **pattern visibility** across files.  
- Detect and highlight **behavioral divergence** in forms/filters.  
- Suggest **alignment possibilities** based on precedent, never prescribing.  
- Deliver insights in a **playful, low-friction UX**.  
- Support **cross-file/project intelligence** via a memory layer.

---

## 4. Target Users

- **Primary:** Product designers working with design systems.  
- **Secondary:** Design leads and system maintainers.  

**User Needs:**

- Quickly see similar patterns in current file.  
- Understand divergences in behavior or labels.  
- Compare current patterns to **historical precedent** (cross-file).  
- Receive insights in a fun, digestible format.

---

## 5. Key Features (MVP)

### 5.1 File-Level Pattern Analysis

- Detects forms and filters in the current file.  
- Uses semantic roles (`role=input`, `role=action-primary`, `role=container-form`, etc.).  
- Clusters similar patterns and highlights divergences.  
- Generates human-readable insights:
  - File-local majority behavior  
  - Outliers  
  - Label inconsistencies

### 5.2 Cross-File Memory

- Stores normalized fingerprints in local storage (`figma.clientStorage`).  
- Tracks observed behaviors across multiple files.  
- Provides **project-level insight** without scanning all files automatically.  
- Insights labeled as “Across files”:
  - Majority behavior  
  - Rare/uncommon behaviors

### 5.3 Formagotchi Playful Layer

- Small animated character reacts to pattern analysis:
  - Calm (few divergences)  
  - Confused (some divergences)  
  - Overstimulated (many divergences)  
- Reacts to both file-level and cross-file insights.  
- Provides short, playful commentary on alignment.

### 5.4 Annotations Mode (Optional)

- Places sticky-note style annotations on frames with divergences.  
- File-level insights vs cross-file insights displayed differently.  
- Fully optional; removable at any time.

---

## 6. Non-Goals (Out of Scope)

- Enforcing rules or fixing patterns.  
- Real-time monitoring.  
- Detailed pixel-level linting.  
- Automatically scanning all files in a project via Figma API (platform limitation).

---

## 7. Technical Overview

### 7.1 Stack

- **Figma Make:** Plugin UI, pattern and insight display, Formagotchi animations.  
- **Figma MCP:** Extracts semantic component metadata, component instances, and frame structure.  
- **Cursor:** Implements scanning, normalization, clustering, cross-file memory, and insight generation.

### 7.2 Pattern Model

- Pattern object includes:
  - Type (`form` | `filter`)  
  - Inputs & Actions  
  - Behavior (`autoApply`, `confirm`, `inline-validation`)  
  - Intent (`create`, `update`, `filter`, etc.)  
  - Context (`modal`, `page`, `panel`)  
- Normalized pattern → fingerprint for clustering & memory.

### 7.3 Memory Layer

- Stores aggregated behavioral statistics per fingerprint.  
- Used to generate “Across files” insights.  
- Eviction strategy: least recently seen patterns if memory exceeds limit (~200).

---

## 8. UX / Interaction Flow

1. User opens Figma file → clicks **Scan Patterns**.  
2. MCP extracts frame/component metadata.  
3. Cursor:
   - Scans & normalizes patterns  
   - Updates memory  
   - Clusters patterns  
   - Generates file-local & cross-file insights  
4. Make UI displays:
   - Clusters and divergences  
   - File-level insights  
   - Cross-file insights (“Across files…”)  
   - Formagotchi reaction  
5. Optional: User clicks **Annotate Canvas** → sticky-note style annotations appear.

---

## 9. Success Metrics (Hackathon-Focused)

- Detects ≥80% of obvious forms/filters in a demo file.  
- Produces ≥3 meaningful insights per file.  
- Users understand insights without prior explanation.  
- Cross-file memory provides visible, credible precedent comparisons.  
- Formagotchi reactions are noticeable, playful, and understandable.

---

## 10. Semantic Role Guidelines

| Role | Meaning |
|------|---------|
| input | User-provided data fields |
| action-primary | Main action button (submit/apply) |
| action-secondary | Cancel/reset buttons |
| container-form | Groups inputs + actions |
| container-filter | Filter-specific grouping |
| feedback | Errors, hints, validation messages |

Optional properties:

| Property | Values | Meaning |
|----------|--------|--------|
| behavior | auto-apply, confirm, inline-validation, submit-validation | User interaction behavior |
| intent | create, update, search, filter, confirm | Purpose of the pattern |
| context | modal, page, panel | Layout context |

---

## 11. Risks / Mitigation

| Risk | Mitigation |
|------|------------|
| MCP cannot read semantic roles | Provide fallback heuristics based on names |
| Memory grows too large | Cap fingerprints (~200), remove least recently seen |
| Insights feel judgmental | Pre-approved prompt phrasing: “observational, suggestive, playful” |
| Users confused by cross-file insights | Tag insights clearly: `This file` vs `Across files` |

---

## 12. Hackathon MVP Scope

- File-level scan & clustering ✅  
- Cross-file memory with “Across files” insights ✅  
- Formagotchi reactions ✅  
- Make UI: cluster & insight view ✅  
- Optional annotation mode ✅

Everything else (real-time monitoring, multi-file auto-scan) is explicitly **out of scope**.

