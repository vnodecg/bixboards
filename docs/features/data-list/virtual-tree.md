# `<bx-virtual-tree>`

> Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/data-list` |
| **Category**        | Data                   |
| **Tag**             | `bx-virtual-tree`      |
| **Status**          | Implemented            |
| **Form-associated** | No                     |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name            | Type                                       | Default | Description                        |
| --------------- | ------------------------------------------ | ------- | ---------------------------------- |
| `nodes`         | TreeNode<T>[]                              | []      | Nested or flat with parentId       |
| `data-source`   | TreeDataSource<T>                          | -       | Lazy `getChildren(key)`            |
| `node-key`      | string                                     | "id"    | -                                  |
| `expanded-keys` | Key[]                                      | []      | -                                  |
| `selection`     | "none" \| "single" \| "multiple" \| "leaf" | "none"  | -                                  |
| `filter`        | string \| ((node)=>boolean)                | -       | Keeps ancestors of matches visible |
| `row-height`    | number                                     | fluid   | -                                  |
| `indent`        | css length                                 | fluid   | -                                  |
| `show-guides`   | boolean                                    | true    | -                                  |

### Slots

| Slot            | Description   |
| --------------- | ------------- |
| `node`          | Node template |
| `expand-icon`   | -             |
| `collapse-icon` | -             |
| `empty`         | -             |

### Events

| Event                 | Detail / notes |
| --------------------- | -------------- |
| `bx-expand-change`    | -              |
| `bx-selection-change` | -              |
| `bx-node-click`       | -              |
| `bx-lazy-load`        | -              |
| `bx-range-change`     | -              |

### CSS parts

| Part     | Description                                |
| -------- | ------------------------------------------ |
| `base`   | The outer container.                       |
| `node`   | A row.                                     |
| `indent` | The indentation (and guide) area of a row. |
| `toggle` | The expand/collapse chevron.               |
| `label`  | The node label.                            |

### CSS custom properties

| Property                                       | Description                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--bx-virtual-tree-indent`                     | Indent per level.                                                                                                     |
| `--bx-virtual-tree-row-height`                 | Row height.                                                                                                           |
| `--bx-virtual-tree-fg`                         | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                                |
| `--bx-virtual-tree-min-height`                 | Minimum height of the root surface. Default `calc(var(--bx-unit) * 6)`.                                               |
| `--bx-virtual-tree-tree-focus-ring-width`      | Focus ring width of the `tree` element (focus state). Default `var(--bx-border-width-strong)`.                        |
| `--bx-virtual-tree-tree-focus-ring-color`      | Focus ring color of the `tree` element (focus state). Default `var(--bx-focus-ring)`.                                 |
| `--bx-virtual-tree-tree-focus-ring-offset`     | Focus ring offset of the `tree` element (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.              |
| `--bx-virtual-tree-node-gap`                   | Gap of the `node` part. Default `var(--bx-space-xs)`.                                                                 |
| `--bx-virtual-tree-node-padding-inline-end`    | Padding inline end of the `node` part. Default `var(--bx-space-s)`.                                                   |
| `--bx-virtual-tree-node-hover-bg`              | Background of the `node` part (hover state). Default `var(--bx-surface-subtle)`.                                      |
| `--bx-virtual-tree-node-ring-width`            | Focus ring width of the `node` part. Default `var(--bx-border-width-strong)`.                                         |
| `--bx-virtual-tree-node-ring-color`            | Focus ring color of the `node` part. Default `var(--bx-focus-ring)`.                                                  |
| `--bx-virtual-tree-node-outline-offset`        | Outline offset of the `node` part. Default `calc(var(--bx-focus-ring-offset) * -1)`.                                  |
| `--bx-virtual-tree-node-selected-bg`           | Background of the `node` part (selected state). Default `color-mix(in srgb, var(--bx-role-accent) 14%, transparent)`. |
| `--bx-virtual-tree-node-disabled-fg`           | Text/icon color of the `node` part (disabled state). Default `var(--bx-text-disabled)`.                               |
| `--bx-virtual-tree-toggle-size`                | Size (width and height) of the `toggle` part. Default `1.25em`.                                                       |
| `--bx-virtual-tree-toggle-fg`                  | Text/icon color of the `toggle` part. Default `var(--bx-text-secondary)`.                                             |
| `--bx-virtual-tree-check-size`                 | Size (width and height) of the `check` element. Default `1.1em`.                                                      |
| `--bx-virtual-tree-check-border-width`         | Border width of the `check` element. Default `var(--bx-border-width-strong)`.                                         |
| `--bx-virtual-tree-check-border-color`         | Border color of the `check` element. Default `var(--bx-border-strong)`.                                               |
| `--bx-virtual-tree-check-radius`               | Corner radius of the `check` element. Default `var(--bx-radius-s)`.                                                   |
| `--bx-virtual-tree-check-font-size`            | Font size of the `check` element. Default `0.8em`.                                                                    |
| `--bx-virtual-tree-check-line-height`          | Line height of the `check` element. Default `1`.                                                                      |
| `--bx-virtual-tree-check-bg`                   | Background of the `check` element. Default `var(--bx-surface-base)`.                                                  |
| `--bx-virtual-tree-check-fg`                   | Text/icon color of the `check` element. Default `var(--bx-on-accent)`.                                                |
| `--bx-virtual-tree-status-fg`                  | Text/icon color of the `status` element. Default `var(--bx-text-secondary)`.                                          |
| `--bx-virtual-tree-empty-padding`              | Padding of the `empty` element. Default `var(--bx-space-m)`.                                                          |
| `--bx-virtual-tree-empty-fg`                   | Text/icon color of the `empty` element. Default `var(--bx-text-secondary)`.                                           |
| `--bx-virtual-tree-toggle-icon-size`           | Size (width and height) of the icon inside the `toggle` element. Default `0.75em`.                                    |
| `--bx-virtual-tree-status-error-fg`            | Color of the status line when loading failed. Default `var(--bx-role-danger-fg)`.                                     |
| `--bx-virtual-tree-check-checked-bg`           | Background of a checked or mixed `check` box. Default `var(--bx-role-accent)`.                                        |
| `--bx-virtual-tree-check-checked-border-color` | Border color of a checked or mixed `check` box. Default `var(--bx-role-accent)`.                                      |
| `--bx-virtual-tree-font-family`                | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                |
| `--bx-virtual-tree-status-font-family`         | Font family of the `status` element (text style `body-s`). Default `var(--bx-type-body-family)`.                      |
| `--bx-virtual-tree-status-font-size`           | Font size of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.                        |
| `--bx-virtual-tree-status-font-weight`         | Font weight of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                    |
| `--bx-virtual-tree-status-line-height`         | Line height of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                   |
| `--bx-virtual-tree-status-letter-spacing`      | Letter spacing of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.               |

### Methods

`expand(key)`, `collapse(key)`, `expandAll(depth)`, `scrollToKey()`, `refresh()`

## 3. Functional requirements

- **FR-VIRTUAL-TREE-01** Tree is flattened to a visible-row array (incrementally updated on expand/collapse) and fed to the shared virtualizer.
- **FR-VIRTUAL-TREE-02** Filtering runs off-main-thread for large trees; ancestor paths auto-expand.
- **FR-VIRTUAL-TREE-03** Tri-state selection computed without visiting unrendered nodes (aggregate counts).
- **FR-VIRTUAL-TREE-04** Lazy loading with per-node error/retry state.

## 4. Fluid scaling

Indent per level and row height scale; indent capped at deep levels (compress after depth 8).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Labels truncate; secondary columns (tree-table mode) hide via priority, as in data-table.

## 6. Accessibility

- Full ARIA tree pattern with `aria-level/setsize/posinset` computed from data, not DOM.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Budget: 200k visible nodes, expand 10k children < 50 ms.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.
- Virtualization is built in and shares `VirtualizerController` from `@bixboards/core`.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element, slots map to named children via `slot` attribute.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; form-associated components ship a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed action/component wrapper exposing props, `on:`/callback events and `bind:value` where applicable.
- Same template strategy as data-list.

## 9. Acceptance criteria

- [ ] All FR-VIRTUAL-TREE-* requirements covered by unit/component tests (Web Test Runner, real browsers). All four are covered in Chromium, including the 200k-node and 100k-leaf-branch cases. Firefox/WebKit run in CI only (not installed in every dev environment).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (plain, expanded multiple-select and empty states, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. The key models are covered by tests and the Storybook stories; no recorded walkthrough yet.
- [ ] Benchmarks meet the stated budgets in CI (regression gate ±10%). The test renders a 200k-node window and asserts a 10k-child expand in < 150 ms (measured ~3 ms in Chromium; budget < 50 ms); neither is a CI regression gate.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrappers are generated from the manifest; no per-component smoke test for this element yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- New component.
- Open: confirm final property names against the custom-elements manifest during implementation.
- Filtering runs on the main thread in one linear pass over the pre-order index (no Worker), a few ms at 200k nodes; FR-VIRTUAL-TREE-02's "off-main-thread" is therefore not implemented.
- Tree-_table_ mode (secondary columns with priority hiding, §5) is not implemented. The `node` slot is the `renderNode` property, and the `expand-icon`/`collapse-icon` slots are not provided (the chevron is a CSS-rotated glyph).
- Focus stays on the tree element and the active node is exposed with `aria-activedescendant`, since the focused node may be outside the rendered window.
