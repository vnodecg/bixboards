# `<bx-data-list>`

> Virtualized list/grid of items for feeds, inboxes and galleries with dynamic heights, grouping, sticky headers, selection, reordering and infinite loading.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixant/data-list` |
| **Category**        | Data                |
| **Tag**             | `bx-data-list`      |
| **Status**          | Implemented         |
| **Form-associated** | No                  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Virtualized list/grid of items for feeds, inboxes and galleries with dynamic heights, grouping, sticky headers, selection, reordering and infinite loading. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

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

`base`, `viewport`, `item`, `group-header`, `empty`, `loading`

### CSS custom properties

`--bx-list-gap`, `--bx-list-item-min-width`, `--bx-list-item-height`

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
- Virtualization is built in and shares `VirtualizerController` from `@bixant/core`.

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
