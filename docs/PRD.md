# Bixboards — Product Requirements Document

|                  |                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Status**       | Draft v0.1                                                                                         |
| **Date**         | 2026-09-28                                                                                         |
| **Owner**        | Vinod C G                                                                                          |
| **Working name** | Bixboards (`@bixboards/*`, tag prefix `bx-`) — name and scope are assumptions, confirm before publishing |

## 1. Summary

Bixboards is a Lit-based web component library that scales automatically. A single design token (`--bx-scale`) drives spacing, type and radii through `clamp()`, so there are no breakpoints. Container queries reflow component internals based on the space they actually get. It is built for enterprise apps: virtualization is built in and data-heavy components (table, list, tree) stay fast and correct with very large datasets.

## 2. Problem

- Component libraries size with breakpoints and fixed px, so they break in embedded, split-pane, dashboard and micro-frontend layouts where viewport ≠ available space.
- Most libraries are presentational. Enterprise apps hit performance and layout failures once a table has 100k rows, a select has 50k options or a tree has 200k nodes.
- Teams use multiple frameworks; framework-specific libraries duplicate effort and diverge.

## 3. Goals

1. **Fluid by default** — one token scales the whole UI; no breakpoints in component code.
2. **Container-aware** — layout reflow via container queries, so components adapt to their slot.
3. **Enterprise data volumes** — built-in virtualization; 1M-row table, 500k-item list, 200k-node tree remain interactive.
4. **Modular** — `core` plus opt-in `data-table` and `data-list`; pay only for what you import.
5. **Framework-neutral** — native custom elements plus thin React, Angular and Svelte adapters (no reimplementation).
6. **Performance and reliability** — explicit budgets, CI benchmarks, leak tests, error isolation.
7. **Accessible** — WCAG 2.2 AA, including virtualized structures.
8. **A complete general-purpose component catalog** (see §6), specified for this token system.

## 4. Non-goals

- Not a fork of, or drop-in replacement for, an existing library; APIs are our own.
- No charting, rich-text editor or date-range scheduler in v1.
- No framework-specific reimplementations of components.
- No server component / backend data layer (only a `DataSource` interface).

## 5. Users and use cases

| Persona                        | Need                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| Enterprise app developer       | Data grids, filters, forms that stay fast at scale and look right in any container |
| Design-system team             | Themeable primitives distributable to React/Angular/Svelte apps from one source    |
| Micro-frontend / widget author | Components that adapt to host layout, not host viewport                            |
| Accessibility owner            | Predictable ARIA, keyboard and forced-colors behavior, including virtualized views |

Key scenarios: operational dashboard with resizable panels and a 500k-row table; admin form with a 50k-option async select; file/asset tree with lazy children; inbox/feed with dynamic-height items; the same widget embedded in a 320 px sidebar and a full page.

## 6. Scope

### 6.1 Packages

| Package                                              | Contents                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@bixboards/design-system`                              | Tokens and theming only: JSON-defined themes (seed-color palettes, contrast-derived roles), fluid foundation tokens, compiled to CSS custom properties by the `bixboards-ds` CLI; runtime theming API; DTCG/Figma exports; contrast report; JSON Schemas; custom themes via `extends`. Components are out of its scope and built after it. Eva-style, see [package README](../packages/design-system/README.md) |
| `@bixboards/core`                                       | Base classes, `VirtualizerController`, all general components (below), utilities; consumes design-system CSS                                                                                                                                                                                                                                                                                                 |
| `@bixboards/data-table`                                 | `bx-data-table` + column/editor/exporter modules                                                                                                                                                                                                                                                                                                                                                             |
| `@bixboards/data-list`                                  | `bx-data-list`, `bx-virtual-tree`                                                                                                                                                                                                                                                                                                                                                                            |
| `@bixboards/react`, `@bixboards/angular`, `@bixboards/svelte` | Generated wrappers for all of the above                                                                                                                                                                                                                                                                                                                                                                      |

### 6.2 Components (61)

Each has a detailed feature document in [docs/features](features/README.md).

- **Actions**: button, button-group, copy-button, dropdown, dropdown-item
- **Feedback**: badge, callout, progress-bar, progress-ring, skeleton, spinner, tooltip
- **Overlays**: popover, dialog, drawer, popup
- **Form**: input, number-input, textarea, checkbox, switch, radio, radio-group, select, option, slider, rating, color-picker
- **Imagery**: animated-image, avatar, carousel, carousel-item, comparison, icon, qr-code, zoomable-frame
- **Organization**: breadcrumb, breadcrumb-item, card, details, divider, scroller, split-panel, tab-group, tab, tab-panel, tree, tree-item, page
- **Utilities**: animation, format-bytes, format-date, format-number, relative-time, include, intersection-observer, mutation-observer, resize-observer
- **Data** (opt-in packages): data-table, data-list, virtual-tree

### 6.3 Distinctive capabilities

Virtualized/remote-search `select`, overflow-collapsing `breadcrumb`/`button-group`, container-based `carousel` slides-per-page, responsive `split-panel`, sanitized-by-default `include`, and the three data components.

## 7. Functional requirements (product level)

| ID    | Requirement                                                                                    | Priority |
| ----- | ---------------------------------------------------------------------------------------------- | -------- |
| PR-1  | `--bx-scale` and fluid tokens drive all sizes; overriding on any element rescales its subtree  | P0       |
| PR-2  | No `@media` in component styles; reflow uses `@container`                                      | P0       |
| PR-3  | `VirtualizerController` shared by select, dropdown, data-list, virtual-tree, data-table        | P0       |
| PR-4  | Data-table: sort, filter, group, select, pin, resize, reorder, edit, export, server-side model | P0       |
| PR-5  | Worker-backed sort/filter for large client datasets with main-thread fallback                  | P1       |
| PR-6  | Form-associated components via ElementInternals with native-equivalent validation              | P0       |
| PR-7  | Per-component entry points, tree-shakable, scoped `sideEffects`                                | P0       |
| PR-8  | CEM-generated wrappers with typed props/events; Angular CVA for form controls                  | P0       |
| PR-9  | Light/dark/forced-colors theming; RTL/logical properties                                       | P0       |
| PR-10 | SSR (declarative shadow DOM) for non-data components; data components hydrate                  | P1       |
| PR-11 | Localization registry for built-in strings                                                     | P1       |
| PR-12 | Documentation site with live, resizable-container demos (scale and container width sliders)    | P1       |

## 8. Non-functional requirements and budgets

| Area              | Target                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data-table scroll | 1M rows, 60 fps on a mid-range laptop; ≤ ~200 row DOM nodes                                                                                                        |
| Data-table ops    | Sort 1M numeric rows < 1 s off-main-thread; first render after data set < 100 ms                                                                                   |
| Data-list         | 500k items, 60 fps, ≤ 100 nodes                                                                                                                                    |
| Virtual-tree      | 200k visible nodes; expand 10k children < 50 ms                                                                                                                    |
| Select            | Open 100k options < 50 ms                                                                                                                                          |
| Bundle size       | `core` base (tokens + base class + virtualizer) ≤ 8 KB gzip; typical simple component ≤ 2 KB incremental; `data-table` ≤ 35 KB gzip (excl. optional worker/export) |
| Interaction       | INP p75 < 200 ms in reference apps                                                                                                                                 |
| Reliability       | Zero leaked listeners/observers in leak tests; renderer/data-source errors isolated                                                                                |
| Accessibility     | WCAG 2.2 AA, axe-clean, manual SR passes for form, overlay, tabs, tree, grid                                                                                       |
| Browsers          | Latest 2 evergreen Chrome/Edge/Firefox/Safari; progressive enhancement for Anchor Positioning, `field-sizing`, `interpolate-size`                                  |

Budgets are provisional and validated by the benchmark harness in the first data-table milestone.

## 9. Architecture

- **Tech**: Lit 3, TypeScript, Nx monorepo (pnpm), Vite/esbuild builds, ESM only, constructable stylesheets.
- **Layout of repo**: `packages/core`, `packages/data-table`, `packages/data-list`, `packages/react`, `packages/angular`, `packages/svelte`, `apps/docs`, `apps/bench`, `tools/wrapper-gen`.
- **Tokens**: CSS custom properties, layered (`@layer bx.tokens, bx.base, bx.components`), themeable without rebuild.
- **Wrappers**: generated from Custom Elements Manifest by `tools/wrapper-gen`; hand-written code limited to Angular CVAs and template-bridging adapters.
- **Data**: `DataSource<T>` interface (`getRows`, `getChildren`, `count`); client implementation with Worker engine; server implementation is the app's.
- **Testing**: Web Test Runner + Playwright browsers, axe-core, visual regression matrix (scale × container width × theme), benchmark app with CI gates.

Details: [features/_conventions.md](features/_conventions.md).

## 10. Legal / licensing

All code, icons and design assets must be original or under a license that permits reuse with attribution. Do not copy source, icons or design assets from proprietary libraries, and do not use other products' names or trademarks in the product. Legal review is required before any direct code reuse.

## 11. Milestones

| Milestone          | Scope                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| M0 Foundations     | Nx workspace, tokens, base classes, `VirtualizerController`, build/test/lint/CEM pipeline, docs skeleton          |
| M1 Core primitives | Actions, feedback, form controls, popup/overlays                                                                  |
| M2 Core layout     | Organization, imagery, utilities, `page`                                                                          |
| M3 Wrappers        | React, Angular, Svelte generated adapters + CVAs                                                                  |
| M4 Data            | `data-list`, `virtual-tree`, then `data-table` (rows → sort/filter → selection → editing → server model → export) |
| M5 Hardening       | Benchmarks, a11y audit, SSR, size budgets, docs, 1.0                                                              |

## 12. Success metrics

- Benchmarks meet §8 budgets in CI.
- 100% of components have feature-doc acceptance criteria satisfied.
- Zero axe violations; documented SR verification.
- A reference app using all three frameworks shares one set of elements with < 5% wrapper hand-written code.
- Adoption: time to embed a component in a fixed-width sidebar with no CSS overrides < 5 min.

## 13. Risks

| Risk                                                          | Mitigation                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Virtualization vs accessibility (find-in-page, SR navigation) | ARIA index metadata, jump-to-row, print/non-virtual mode, early SR testing        |
| Shadow DOM cost for millions of cells                         | Renderer functions and pooled cells, light-DOM-like fast path for text formatting |
| Browser support gaps (Anchor Positioning, container units)    | Fallback implementations, feature detection, documented support matrix            |
| Framework template bridging in cells                          | Adapter-managed pooled roots; benchmarked per framework                           |
| Scope size (61 components + 3 data)                           | Milestone order above; data-table starts after shared virtualizer is proven       |
| Licensing of copied material                                  | §10                                                                               |

## 14. Open questions

1. Final product name, npm scope and tag prefix.
2. Icon set: bundle an open-license set or require a registry?
3. Is SSR required for data components at 1.0?
4. Angular minimum version (signals-first vs broad support)?
5. Pivot tables / charting in a later phase?
