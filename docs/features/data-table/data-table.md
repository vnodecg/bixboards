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

| Part              | Description                    |
| ----------------- | ------------------------------ |
| `base`            | The outer container.           |
| `toolbar`         | The toolbar region.            |
| `header`          | The header row.                |
| `header-cell`     | A header cell.                 |
| `body`            | The body spacer.               |
| `row`             | A data row.                    |
| `cell`            | A cell.                        |
| `cell-selected`   | A cell in the selected range.  |
| `group-row`       | A group row.                   |
| `detail`          | A row's detail panel.          |
| `footer`          | The footer region.             |
| `resize-handle`   | A header cell's resize handle. |
| `loading-overlay` | The loading indicator.         |
| `empty`           | The empty state.               |

### CSS custom properties

| Property                                           | Description                                                                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--bx-data-table-row-height`                       | Row height (density default).                                                                                                           |
| `--bx-data-table-header-height`                    | Header height.                                                                                                                          |
| `--bx-data-table-stripe`                           | Background of odd rows.                                                                                                                 |
| `--bx-data-table-border`                           | Border color.                                                                                                                           |
| `--bx-data-table-cell-padding-inline`              | Cell inline padding.                                                                                                                    |
| `--bx-data-table-fg`                               | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                                                  |
| `--bx-data-table-min-height`                       | Minimum height of the root surface. Default `calc(var(--bx-unit) * 10)`.                                                                |
| `--bx-data-table-scroller-border-width`            | Border width of the `scroller` element. Default `var(--bx-border-width)`.                                                               |
| `--bx-data-table-scroller-radius`                  | Corner radius of the `scroller` element. Default `var(--bx-radius-m)`.                                                                  |
| `--bx-data-table-scroller-bg`                      | Background of the `scroller` element. Default `var(--bx-surface-base)`.                                                                 |
| `--bx-data-table-header-bg`                        | Background of the `header` part. Default `var(--bx-surface-subtle)`.                                                                    |
| `--bx-data-table-header-block-end-border-width`    | Block end border width of the `header` part. Default `var(--bx-border-width)`.                                                          |
| `--bx-data-table-header-cell-gap`                  | Gap of the `header-cell` part. Default `var(--bx-space-xs)`.                                                                            |
| `--bx-data-table-sort-fg`                          | Text/icon color of the `sort` element. Default `var(--bx-text-secondary)`.                                                              |
| `--bx-data-table-sort-font-size`                   | Font size of the `sort` element. Default `0.8em`.                                                                                       |
| `--bx-data-table-resize-handle-width`              | Width of the `resize-handle` part. Default `calc(var(--bx-unit) * 0.5)`.                                                                |
| `--bx-data-table-resize-handle-hover-bg`           | Background of the `resize-handle` part (hover state). Default `var(--bx-role-accent)`.                                                  |
| `--bx-data-table-header-cell-pinned-bg`            | Background of the `header-cell` part (pinned state). Default `var(--bx-surface-base)`.                                                  |
| `--bx-data-table-header-cell-pinned-shadow`        | Box shadow of the `header-cell` part (pinned state). Default `inset calc(var(--bx-border-width) * -1) 0 0 var(--bx-border-subtle)`.     |
| `--bx-data-table-header-cell-focus-ring-width`     | Focus ring width of the `header-cell` part (focus state). Default `var(--bx-border-width-strong)`.                                      |
| `--bx-data-table-header-cell-focus-ring-color`     | Focus ring color of the `header-cell` part (focus state). Default `var(--bx-focus-ring)`.                                               |
| `--bx-data-table-header-cell-focus-ring-offset`    | Focus ring offset of the `header-cell` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.                            |
| `--bx-data-table-group-row-block-end-border-width` | Block end border width of the `group-row` part. Default `var(--bx-border-width)`.                                                       |
| `--bx-data-table-group-row-bg`                     | Background of the `group-row` part. Default `var(--bx-surface-base)`.                                                                   |
| `--bx-data-table-group-row-hover-bg`               | Background of the `group-row` part (hover state). Default `var(--bx-surface-subtle)`.                                                   |
| `--bx-data-table-group-row-selected-bg`            | Background of the `group-row` part (selected state). Default `color-mix( in srgb, var(--bx-role-accent) 14%, var(--bx-surface-base) )`. |
| `--bx-data-table-cell-bg`                          | Background of the `cell` part. Default `color-mix( in srgb, var(--bx-role-accent) 20%, var(--bx-surface-base) )`.                       |
| `--bx-data-table-skeleton-height`                  | Height of the `skeleton` element. Default `0.8em`.                                                                                      |
| `--bx-data-table-skeleton-radius`                  | Corner radius of the `skeleton` element. Default `var(--bx-radius-s)`.                                                                  |
| `--bx-data-table-skeleton-bg`                      | Background of the `skeleton` element. Default `var(--bx-surface-muted, var(--bx-surface-subtle))`.                                      |
| `--bx-data-table-input-padding`                    | Padding of the `input` element. Default `0.15em 0.3em`.                                                                                 |
| `--bx-data-table-input-border-width`               | Border width of the `input` element. Default `var(--bx-border-width-strong)`.                                                           |
| `--bx-data-table-input-border-color`               | Border color of the `input` element. Default `var(--bx-focus-ring)`.                                                                    |
| `--bx-data-table-input-radius`                     | Corner radius of the `input` element. Default `var(--bx-radius-s)`.                                                                     |
| `--bx-data-table-input-bg`                         | Background of the `input` element. Default `var(--bx-surface-base)`.                                                                    |
| `--bx-data-table-error-fg`                         | Text/icon color of the `error` element. Default `var(--bx-role-danger-fg)`.                                                             |
| `--bx-data-table-toggle-size`                      | Size (width and height) of the `toggle` element. Default `1.25em`.                                                                      |
| `--bx-data-table-toggle-fg`                        | Text/icon color of the `toggle` element. Default `var(--bx-text-secondary)`.                                                            |
| `--bx-data-table-check-size`                       | Size (width and height) of the `check` element. Default `1.1em`.                                                                        |
| `--bx-data-table-check-border-width`               | Border width of the `check` element. Default `var(--bx-border-width-strong)`.                                                           |
| `--bx-data-table-check-border-color`               | Border color of the `check` element. Default `var(--bx-border-strong)`.                                                                 |
| `--bx-data-table-check-radius`                     | Corner radius of the `check` element. Default `var(--bx-radius-s)`.                                                                     |
| `--bx-data-table-check-font-size`                  | Font size of the `check` element. Default `0.8em`.                                                                                      |
| `--bx-data-table-check-bg`                         | Background of the `check` element. Default `var(--bx-surface-base)`.                                                                    |
| `--bx-data-table-check-fg`                         | Text/icon color of the `check` element. Default `var(--bx-on-accent)`.                                                                  |
| `--bx-data-table-detail-padding`                   | Padding of the `detail` part. Default `var(--bx-space-s) var(--bx-space-m)`.                                                            |
| `--bx-data-table-detail-bg`                        | Background of the `detail` part. Default `var(--bx-surface-subtle)`.                                                                    |
| `--bx-data-table-empty-padding`                    | Padding of the `empty` part. Default `var(--bx-space-l)`.                                                                               |
| `--bx-data-table-empty-fg`                         | Text/icon color of the `empty` part. Default `var(--bx-text-secondary)`.                                                                |
| `--bx-data-table-loading-overlay-fg`               | Text/icon color of the `loading-overlay` part. Default `var(--bx-text-secondary)`.                                                      |
| `--bx-data-table-group-row-padding-block`          | Padding block of the `group-row` part. Default `var(--bx-space-xs)`.                                                                    |
| `--bx-data-table-cell-label-fg`                    | Text/icon color of the cell's data label (card layout). Default `var(--bx-text-secondary)`.                                             |
| `--bx-data-table-check-checked-bg`                 | Background of a checked or mixed selection checkbox. Default `var(--bx-role-accent)`.                                                   |
| `--bx-data-table-check-checked-border-color`       | Border color of a checked or mixed selection checkbox. Default `var(--bx-role-accent)`.                                                 |
| `--bx-data-table-font-family`                      | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                                  |
| `--bx-data-table-header-cell-font-family`          | Font family of the `header-cell` part (text style `label-s`). Default `var(--bx-type-label-family)`.                                    |
| `--bx-data-table-header-cell-font-size`            | Font size of the `header-cell` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                                      |
| `--bx-data-table-header-cell-font-weight`          | Font weight of the `header-cell` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                                  |
| `--bx-data-table-header-cell-line-height`          | Line height of the `header-cell` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                                 |
| `--bx-data-table-header-cell-letter-spacing`       | Letter spacing of the `header-cell` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                             |
| `--bx-data-table-group-row-font-family`            | Font family of the `group-row` part (text style `label-m`). Default `var(--bx-type-label-family)`.                                      |
| `--bx-data-table-group-row-font-size`              | Font size of the `group-row` part (text style `label-m`). Default `var(--bx-type-label-m-size)`.                                        |
| `--bx-data-table-group-row-font-weight`            | Font weight of the `group-row` part (text style `label-m`). Default `var(--bx-type-label-m-weight)`.                                    |
| `--bx-data-table-group-row-line-height`            | Line height of the `group-row` part (text style `label-m`). Default `var(--bx-type-label-m-leading)`.                                   |
| `--bx-data-table-group-row-letter-spacing`         | Letter spacing of the `group-row` part (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.                               |
| `--bx-data-table-error-font-family`                | Font family of the `error` element (text style `body-s`). Default `var(--bx-type-body-family)`.                                         |
| `--bx-data-table-error-font-size`                  | Font size of the `error` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                           |
| `--bx-data-table-error-font-weight`                | Font weight of the `error` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                       |
| `--bx-data-table-error-line-height`                | Line height of the `error` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                      |
| `--bx-data-table-error-letter-spacing`             | Letter spacing of the `error` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                  |
| `--bx-data-table-cell-label-font-family`           | Font family of the `cell` part (text style `label-m`). Default `var(--bx-type-label-family)`.                                           |
| `--bx-data-table-cell-label-font-size`             | Font size of the `cell` part (text style `label-m`). Default `var(--bx-type-label-m-size)`.                                             |
| `--bx-data-table-cell-label-font-weight`           | Font weight of the `cell` part (text style `label-m`). Default `var(--bx-type-label-m-weight)`.                                         |
| `--bx-data-table-cell-label-line-height`           | Line height of the `cell` part (text style `label-m`). Default `var(--bx-type-label-m-leading)`.                                        |
| `--bx-data-table-cell-label-letter-spacing`        | Letter spacing of the `cell` part (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.                                    |

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
