# `<bx-data-list>`

> Virtualized list/grid of items for feeds, inboxes and galleries with dynamic heights, grouping, sticky headers, selection, reordering and infinite loading.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/data-list` |
| **Category**        | Data                   |
| **Tag**             | `bx-data-list`         |
| **Status**          | Implemented            |
| **Form-associated** | No                     |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Virtualized list/grid of items for feeds, inboxes and galleries with dynamic heights, grouping, sticky headers, selection, reordering and infinite loading. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                    | Type                             | Default  | Description                              |
| ----------------------- | -------------------------------- | -------- | ---------------------------------------- |
| `items`                 | T[]                              | []       | -                                        |
| `item-key`              | string \| ((item)=>Key)          | "id"     | -                                        |
| `layout`                | "list" \| "grid" \| "masonry"    | "list"   | Grid columns derive from container width |
| `min-item-width`        | css length                       | fluid    | Grid track minimum                       |
| `item-height`           | number \| "auto"                 | -        | Fixed or dynamic                         |
| `overscan`              | number                           | 4        | -                                        |
| `group-by`              | string \| ((item)=>string)       | -        | Sticky group headers                     |
| `selection`             | "none" \| "single" \| "multiple" | "none"   | -                                        |
| `reorderable`           | boolean                          | false    | Drag-and-drop with autoscroll            |
| `data-source`           | DataSource<T>                    | -        | Async paging                             |
| `direction`             | "normal" \| "reverse"            | "normal" | Reverse for chat, keeps bottom anchor    |
| `loading / empty-label` | -                                | -        | -                                        |

### Slots

| Slot           | Description                              |
| -------------- | ---------------------------------------- |
| `item`         | Item template (or `renderItem` property) |
| `group-header` | -                                        |
| `empty`        | -                                        |
| `loading`      | -                                        |
| `header`       | -                                        |
| `footer`       | -                                        |

### Events

| Event                 | Detail / notes |
| --------------------- | -------------- |
| `bx-item-click`       | -              |
| `bx-selection-change` | -              |
| `bx-reorder`          | -              |
| `bx-range-change`     | -              |
| `bx-load-more`        | -              |

### CSS parts

| Part           | Description            |
| -------------- | ---------------------- |
| `base`         | The outer container.   |
| `viewport`     | The scrolling element. |
| `item`         | An item.               |
| `group-header` | A group header row.    |
| `empty`        | The empty state.       |
| `loading`      | The loading state.     |

### CSS custom properties

| Property                                             | Description                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--bx-data-list-gap`                                 | Gap between items.                                                                                                         |
| `--bx-data-list-fg`                                  | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                                     |
| `--bx-data-list-min-height`                          | Minimum height of the root surface. Default `calc(var(--bx-unit) * 8)`.                                                    |
| `--bx-data-list-viewport-focus-ring-width`           | Focus ring width of the `viewport` part (focus state). Default `var(--bx-border-width-strong)`.                            |
| `--bx-data-list-viewport-focus-ring-color`           | Focus ring color of the `viewport` part (focus state). Default `var(--bx-focus-ring)`.                                     |
| `--bx-data-list-viewport-focus-ring-offset`          | Focus ring offset of the `viewport` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.                  |
| `--bx-data-list-item-radius`                         | Corner radius of the `item` part. Default `var(--bx-radius-m)`.                                                            |
| `--bx-data-list-item-selected-bg`                    | Background of the `item` part (selected state). Default `color-mix(in srgb, var(--bx-role-accent) 14%, transparent)`.      |
| `--bx-data-list-item-selected-shadow`                | Box shadow of the `item` part (selected state). Default `inset 0 0 0 var(--bx-border-width-strong) var(--bx-role-accent)`. |
| `--bx-data-list-item-dragging-ring-width`            | Focus ring width of the `item` part (dragging state). Default `var(--bx-border-width-strong)`.                             |
| `--bx-data-list-item-dragging-ring-color`            | Focus ring color of the `item` part (dragging state). Default `var(--bx-focus-ring)`.                                      |
| `--bx-data-list-item-dragging-outline-offset`        | Outline offset of the `item` part (dragging state). Default `calc(var(--bx-focus-ring-offset) * -1)`.                      |
| `--bx-data-list-item-dragging-opacity`               | Opacity of the `item` part (dragging state). Default `0.7`.                                                                |
| `--bx-data-list-item-dragging-shadow`                | Box shadow of the `item` part (dragging state). Default `var(--bx-shadow-m)`.                                              |
| `--bx-data-list-item-drop-indicator-height`          | Height of the drop indicator on the `item` part. Default `var(--bx-border-width-strong)`.                                  |
| `--bx-data-list-item-drop-indicator-bg`              | Background of the drop indicator on the `item` part. Default `var(--bx-role-accent)`.                                      |
| `--bx-data-list-group-header-padding`                | Padding of the `group-header` part. Default `var(--bx-space-xs) var(--bx-space-m)`.                                        |
| `--bx-data-list-group-header-bg`                     | Background of the `group-header` part. Default `var(--bx-surface-subtle)`.                                                 |
| `--bx-data-list-group-header-fg`                     | Text/icon color of the `group-header` part. Default `var(--bx-text-secondary)`.                                            |
| `--bx-data-list-group-header-block-end-border-width` | Block end border width of the `group-header` part. Default `var(--bx-border-width)`.                                       |
| `--bx-data-list-group-header-block-end-border-color` | Block end border color of the `group-header` part. Default `var(--bx-border-subtle)`.                                      |
| `--bx-data-list-loading-padding`                     | Padding of the `loading` part. Default `var(--bx-space-l)`.                                                                |
| `--bx-data-list-loading-fg`                          | Text/icon color of the `loading` part. Default `var(--bx-text-secondary)`.                                                 |
| `--bx-data-list-font-family`                         | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                     |
| `--bx-data-list-group-header-font-family`            | Font family of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-family)`.                      |
| `--bx-data-list-group-header-font-size`              | Font size of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                        |
| `--bx-data-list-group-header-font-weight`            | Font weight of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                    |
| `--bx-data-list-group-header-line-height`            | Line height of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                   |
| `--bx-data-list-group-header-letter-spacing`         | Letter spacing of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.               |

### Methods

`scrollToIndex()`, `scrollToKey()`, `refresh()`, `invalidateItem(key)`

## 3. Functional requirements

- **FR-DATA-LIST-01** Shares `VirtualizerController` with data-table; supports dynamic heights with scroll anchoring.
- **FR-DATA-LIST-02** Grid/masonry layout columns computed from container inline size (container-query-driven), items positioned by transform.
- **FR-DATA-LIST-03** Reverse (chat) mode keeps the viewport pinned to bottom when new items arrive unless user has scrolled up.
- **FR-DATA-LIST-04** Infinite loading with sentinel prefetch and abortable requests.
- **FR-DATA-LIST-05** Drag reorder uses pointer events, auto-scroll edges and keyboard alternative (Space, arrows, Space).

## 4. Fluid scaling

Gap, item min width and padding follow fluid tokens; grid recomputes on scale change.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Column count = floor(container width / min-item-width); list→grid→list without breakpoints.

## 6. Accessibility

- `role="list"`/`listitem` (or `listbox`/`option` when selectable) with `aria-setsize`/`aria-posinset`.
- Keyboard navigation and typeahead; live region announces loaded batches.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Budget: 500k items, 60 fps scroll, ≤ 100 nodes in DOM; item mount < 1 ms median.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.
- Virtualization is built in and shares `VirtualizerController` from `@bixboards/core`.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element, slots map to named children via `slot` attribute.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; form-associated components ship a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed action/component wrapper exposing props, `on:`/callback events and `bind:value` where applicable.
- Item templates: React render prop / Angular `ng-template` / Svelte snippet, using the same pooled-root strategy as data-table.

## 9. Acceptance criteria

- [ ] All FR-DATA-LIST-* requirements covered by unit/component tests (Web Test Runner, real browsers). All five are covered in Chromium. Firefox/WebKit run in CI only (not installed in every dev environment).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (plain, selectable, grouped and empty states, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. The key models are covered by tests and the Storybook stories; no recorded walkthrough yet.
- [ ] Benchmarks meet the stated budgets in CI (regression gate ±10%). The test renders 500k items and asserts fewer than 40 in the DOM (budget: ≤ 100); scroll fps and mount time are not benchmarked.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrappers are generated from the manifest; no per-component smoke test for this element yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- New component.
- Open: confirm final property names against the custom-elements manifest during implementation.
- `layout="masonry"` renders as `grid`: true column packing needs per-column virtualization, which the shared virtualizer does not do.
- The `item` and `group-header` slots are the `renderItem` / `renderGroupHeader` properties, since a slotted template cannot be instantiated per item.
- Focus stays on the viewport and the active item is exposed with `aria-activedescendant` (the item is pinned in the window so it survives scrolling).
