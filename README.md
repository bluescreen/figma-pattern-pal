# Pattern Pal

> A playful teammate that observes your design patterns and suggests alignment — without judging.

Pattern Pal is a Figma plugin that scans design files, detects forms and filters, clusters similar patterns, surfaces behavioral divergences, and provides non-judgmental, playful insights. It remembers patterns across files, giving designers cross-file intelligence without enforcing rules.

## Features

- **File-Level Pattern Analysis** — Detects forms and filters using semantic roles, clusters similar patterns, and highlights divergences
- **Cross-File Memory** — Stores pattern fingerprints in local storage, tracks behaviors across files, and surfaces "Across files" insights
- **Formagotchi** — Animated character that reacts to pattern health (calm / confused / overstimulated)
- **Canvas Annotations** — Optional sticky-note style annotations on frames with divergences

## Getting Started

```bash
npm install
npm run dev      # Start dev server (watch mode)
npm run build    # Build for production
```

### Load in Figma

1. Run `npm run build`
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from the project root

## Usage

1. Open a Figma file with forms/filters that use semantic roles
2. Run Pattern Pal → click **Scan Patterns**
3. Review insights, clusters, and Formagotchi reactions
4. Optionally click **Annotate Canvas** to place sticky notes on divergent frames

## Semantic Roles

Add these as plugin data on your Figma components:

| Role | Meaning |
|------|---------|
| `input` | User-provided data fields |
| `action-primary` | Main action button (submit/apply) |
| `action-secondary` | Cancel/reset buttons |
| `container-form` | Groups inputs + actions (form) |
| `container-filter` | Filter-specific grouping |
| `feedback` | Errors, hints, validation messages |

Optional properties: `behavior`, `intent`, `context` — see [PRD](pattern_pal_prd.md) for details.

## Architecture

```
src/
├── types.ts           # Shared type definitions
├── scanner.ts         # Extract patterns from MCP data
├── normalizer.ts      # Generate fingerprints
├── clustering.ts      # Group patterns, detect divergences
├── memory.ts          # Cross-file memory (figma.clientStorage)
├── insights.ts        # File-level & cross-file insights
├── formagotchi.ts     # Mood & playful commentary
├── mcpQueries.ts      # Figma node traversal
├── annotations.ts     # Canvas sticky-note annotations
├── code.ts            # Plugin entry point
├── ui.html            # Plugin UI
└── __tests__/         # Unit & integration tests
```

## Development

```bash
npm test             # Run tests (watch mode)
npm run test:run     # Run tests once
npm run lint         # ESLint
npm run format       # Prettier
```

## License

ISC
