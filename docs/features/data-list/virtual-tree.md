# `<bx-virtual-tree>`

> Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixant/data-list` |
| **Category**        | Data                |
| **Tag**             | `bx-virtual-tree`   |
| **Status**          | Planned             |
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

- [ ] All FR-VIRTUAL-TREE-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Benchmarks meet the stated budgets in CI (regression gate ±10%).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- New component.
- Open: confirm final property names against the custom-elements manifest during implementation.
