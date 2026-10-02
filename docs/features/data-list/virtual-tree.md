# `<bx-virtual-tree>`

> Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixant/data-list` |
| **Category**        | Data                |
| **Tag**             | `bx-virtual-tree`   |
| **Status**          | Implemented         |
| **Form-associated** | No                  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

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

`base`, `node`, `indent`, `toggle`, `label`, `guide`

### CSS custom properties

`--bx-tree-indent`, `--bx-tree-row-height`

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
- Virtualization is built in and shares `VirtualizerController` from `@bixant/core`.

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
