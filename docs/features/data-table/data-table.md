# `<bx-data-table>`

> Enterprise-grade virtualized table for 100k–1M+ rows: sorting, filtering, grouping, selection, pinning, resizing, reordering, inline editing, server-side data and export. Native-table accessibility.

|                     |                      |
| ------------------- | -------------------- |
| **Package**         | `@bixant/data-table` |
| **Category**        | Data                 |
| **Tag**             | `bx-data-table`      |
| **Status**          | Implemented          |
| **Form-associated** | No                   |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Enterprise-grade virtualized table for 100k–1M+ rows: sorting, filtering, grouping, selection, pinning, resizing, reordering, inline editing, server-side data and export. Native-table accessibility. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                      | Type                                     | Default       | Description                                                                                                    |
| ------------------------- | ---------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| `columns`                 | ColumnDef[]                              | []            | Column definitions (field, header, width, minWidth, flex, pinned, sortable, filter, render, editor, aggregate) |
| `data`                    | T[]                                      | []            | Client-side rows                                                                                               |
| `data-source`             | DataSource<T>                            | -             | Async/server-side source (`getRows({start,end,sort,filter,group})`)                                            |
| `row-key`                 | string \| ((row)=>Key)                   | "id"          | Stable identity                                                                                                |
| `row-height`              | number \| "auto"                         | fluid step    | Fixed height (fastest) or measured/estimated variable height                                                   |
| `overscan`                | number                                   | 6             | Extra rows rendered off-screen                                                                                 |
| `selection`               | "none" \| "single" \| "multiple"         | "none"        | -                                                                                                              |
| `selected-keys`           | Key[]                                    | []            | -                                                                                                              |
| `sort`                    | SortModel[]                              | []            | Multi-column                                                                                                   |
| `filters`                 | FilterModel                              | {}            | -                                                                                                              |
| `group-by`                | string[]                                 | []            | -                                                                                                              |
| `expanded-keys`           | Key[]                                    | []            | -                                                                                                              |
| `density`                 | "compact" \| "comfortable" \| "spacious" | "comfortable" | -                                                                                                              |
| `sticky-header`           | boolean                                  | true          | -                                                                                                              |
| `loading`                 | boolean                                  | false         | -                                                                                                              |
| `empty-label`             | string                                   | ""            | -                                                                                                              |
| `editable`                | boolean                                  | false         | -                                                                                                              |
| `resizable / reorderable` | boolean                                  | true          | -                                                                                                              |
| `virtualize-columns`      | boolean                                  | "auto"        | Enabled at > 50 columns                                                                                        |
| `responsive`              | "scroll" \| "priority" \| "cards"        | "priority"    | Narrow-container strategy                                                                                      |

### Slots

| Slot         | Description                      |
| ------------ | -------------------------------- |
| `toolbar`    | -                                |
| `empty`      | -                                |
| `loading`    | -                                |
| `row-detail` | -                                |
| `footer`     | -                                |
| `(default)`  | Declarative `bx-column` children |

### Events

| Event                 | Detail / notes               |
| --------------------- | ---------------------------- |
| `bx-sort-change`      | -                            |
| `bx-filter-change`    | -                            |
| `bx-selection-change` | -                            |
| `bx-row-click`        | -                            |
| `bx-row-dblclick`     | -                            |
| `bx-cell-edit-start`  | -                            |
| `bx-cell-edit-commit` | Cancelable, async validation |
| `bx-column-resize`    | -                            |
| `bx-column-reorder`   | -                            |
| `bx-column-pin`       | -                            |
| `bx-range-change`     | Visible row range            |
| `bx-data-request`     | Server-side fetch            |
| `bx-row-expand`       | -                            |

### CSS parts

`base`, `toolbar`, `header`, `header-cell`, `body`, `row`, `cell`, `cell-selected`, `group-row`, `detail`, `footer`, `resize-handle`, `loading-overlay`, `empty`

### CSS custom properties

`--bx-table-row-height`, `--bx-table-header-height`, `--bx-table-stripe`, `--bx-table-border`, `--bx-table-cell-padding-inline`

### Methods

`scrollToIndex(i, align)`, `scrollToKey(key)`, `setSort()`, `clearFilters()`, `selectAll()`, `getVisibleRange()`, `exportCsv() / exportXlsx()`, `autosizeColumns()`, `refresh()`, `invalidateRow(key)`

## 3. Functional requirements

- **FR-DATA-TABLE-01** **Virtualization is built in**: only visible rows and columns are in the DOM (+overscan); DOM node count independent of dataset size (target ≤ 200 row nodes).
- **FR-DATA-TABLE-02** Row recycling via keyed pool; cell renderers are functions returning Lit templates or primitives, not custom elements per cell.
- **FR-DATA-TABLE-03** Variable row heights use an estimated-height Fenwick/prefix-sum index with measurement correction and scroll anchoring (no jump when rows above are measured).
- **FR-DATA-TABLE-04** Sorting/filtering/grouping of large client data runs in a Worker (transferable typed columns), with main-thread fallback; UI stays responsive with cancellable jobs.
- **FR-DATA-TABLE-05** Server-side row model: block cache, request de-duplication, infinite scroll and full-range selection with "select all matching".
- **FR-DATA-TABLE-06** Column pinning (start/end) via `position: sticky`; header sticky; group rows with aggregations; tree data mode.
- **FR-DATA-TABLE-07** Cell selection ranges and clipboard copy (TSV) with virtualized-aware range math.
- **FR-DATA-TABLE-08** Inline editing with pluggable editors (`bx-input`, `bx-select`, custom), keyboard-first: Enter/F2/Escape/Tab.
- **FR-DATA-TABLE-09** Column resize by drag/keyboard, reorder by drag, show/hide menu, persistent layout state (`getState()/setState()`).
- **FR-DATA-TABLE-10** Column defs are serializable except renderers; state export for saved views.
- **FR-DATA-TABLE-11** Export respects sort/filter and streams to avoid memory spikes.
- **FR-DATA-TABLE-12** Sticky column/row shadows use compositing-friendly layers; scrolling never triggers synchronous layout reads.
- **FR-DATA-TABLE-13** Graceful failure: renderer exceptions are isolated per cell (error placeholder); data-source errors surface `bx-data-error` with retry.

## 4. Fluid scaling

Row height, header height, cell padding, font and control sizes derive from the fluid density token; virtualizer recomputes offsets when `--bx-scale` changes (observed via ResizeObserver on a probe element) and preserves the anchor row.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Table is a container-query root. `responsive="priority"` hides columns by `priority` ranking as width shrinks; `responsive="cards"` re-lays each row as a labelled card list; toolbar wraps and overflows into a menu.

## 6. Accessibility

- Native grid semantics: `role="grid"`, `row`, `columnheader`, `gridcell`, `aria-rowcount`, `aria-rowindex`, `aria-colcount`, `aria-colindex`, `aria-sort`, `aria-selected`.
- Roving tabindex with full keyboard model (arrows, Home/End, Ctrl+Home/End, PageUp/Down, Space select, Shift-range).
- Rows scrolled out of DOM keep correct `aria-rowindex`; screen-reader "find" limitations documented with an accessible "jump to row" and optional non-virtual print mode.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Budget: 1M rows client-side, scroll at 60 fps on mid-range laptop; initial render < 100 ms after data set; sort of 1M numeric rows < 1 s off-main-thread.
- Memory: constant DOM; data held as provided (no deep cloning); optional columnar mode.
- Benchmarks in CI with regression thresholds (see PRD).
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.
- Virtualization is built in and shares `VirtualizerController` from `@bixant/core`.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element, slots map to named children via `slot` attribute.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; form-associated components ship a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed action/component wrapper exposing props, `on:`/callback events and `bind:value` where applicable.
- Column renderers accept framework templates: React render-props/portals, Angular `TemplateRef`, Svelte snippets — rendered into pooled cells via adapter-managed roots (created lazily, destroyed on recycle).
- `data`, `columns`, `dataSource` are property-bound, never serialized to attributes.
- Typed generics on `DataTable<T>` in every wrapper.

## 9. Acceptance criteria

- [ ] All FR-DATA-TABLE-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-DATA-TABLE-04 (Worker) and the tree-data part of -06 are not implemented; the rest are covered in Chromium. Firefox/WebKit run in CI only (not installed in every dev environment).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (plain, multiple-select, grouped and editing states, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. The key models are covered by tests and the Storybook stories; no recorded walkthrough yet.
- [ ] Benchmarks meet the stated budgets in CI (regression gate ±10%). The test file asserts a small DOM for 1M rows and sorts 200k rows on the main thread in < 1.5 s (~80 ms in Chromium); the 1M-row sort < 1 s off-main-thread budget, scroll fps and render time are not measured.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrappers are generated from the manifest; no per-component smoke test for this element yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Open: confirm final property names against the custom-elements manifest during implementation.
- Sorting, filtering and grouping run on the main thread (no Worker), over typed-array-backed index arrays; FR-DATA-TABLE-04's Worker path is therefore not implemented.
- Not implemented: tree-data mode, the column show/hide menu UI (use `setColumnVisible()`), drag-to-pin UI (use `setColumnPinned()`), the toolbar overflow menu, and serializing renderers in `columns`. `row-detail` is the `renderDetail` property; server-side mode does not group (`group` is passed to the data source).
- The built-in editors (`text`, `number`, `checkbox`, `select`) render native `<input>`/`<select>` to keep per-cell cost low; FR-DATA-TABLE-08's `bx-input`/`bx-select` editors are supplied as a function `editor`.
- `exportXlsx()` writes a single-sheet, uncompressed (stored) workbook.
