# `<bx-tree-item>`

> A node in `bx-tree`, with lazy children.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Organization   |
| **Tag**             | `bx-tree-item` |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

A node in `bx-tree`, with lazy children. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name       | Type    | Default | Description                                          |
| ---------- | ------- | ------- | ---------------------------------------------------- |
| `expanded` | boolean | false   | -                                                    |
| `selected` | boolean | false   | -                                                    |
| `disabled` | boolean | false   | -                                                    |
| `lazy`     | boolean | false   | Load children on first expand (emits `bx-lazy-load`) |

### Slots

| Slot            | Description |
| --------------- | ----------- |
| `(default)`     | -           |
| `expand-icon`   | -           |
| `collapse-icon` | -           |

### Events

| Event               | Detail / notes |
| ------------------- | -------------- |
| `bx-expand`         | -              |
| `bx-after-expand`   | -              |
| `bx-collapse`       | -              |
| `bx-after-collapse` | -              |
| `bx-lazy-load`      | -              |
| `bx-lazy-change`    | -              |

### CSS parts

| Part            | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| `item`          | The row (indentation + controls + label).                                     |
| `indentation`   | The depth-based spacer before the row's controls.                             |
| `expand-button` | The expand/collapse control. Present when the item has children or is `lazy`. |
| `spinner`       | The loading spinner shown in place of the chevron while `loading`.            |
| `checkbox`      | The selection checkbox. Present when `with-checkbox` is set.                  |
| `label`         | The wrapper around the default slot.                                          |
| `children`      | The wrapper around the children slot; `hidden` while collapsed.               |

### CSS custom properties

| Property                                         | Description                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `--bx-tree-item-item-gap`                        | Gap of the `item` part. Default `var(--bx-space-2xs)`.                                                            |
| `--bx-tree-item-item-min-height`                 | Minimum height of the `item` part. Default `var(--bx-target-min)`.                                                |
| `--bx-tree-item-item-padding-inline-end`         | Padding inline end of the `item` part. Default `var(--bx-space-xs)`.                                              |
| `--bx-tree-item-item-radius`                     | Corner radius of the `item` part. Default `var(--bx-radius-s)`.                                                   |
| `--bx-tree-item-item-fg`                         | Text/icon color of the `item` part. Default `var(--bx-text-primary)`.                                             |
| `--bx-tree-item-item-hover-bg`                   | Background of the `item` part (hover state). Default `var(--bx-surface-subtle)`.                                  |
| `--bx-tree-item-item-selected-bg`                | Background of the `item` part (selected state). Default `var(--bx-role-accent-subtle, var(--bx-surface-subtle))`. |
| `--bx-tree-item-item-selected-fg`                | Text/icon color of the `item` part (selected state). Default `var(--bx-role-accent-fg, var(--bx-text-primary))`.  |
| `--bx-tree-item-item-disabled-fg`                | Text/icon color of the `item` part (disabled state). Default `var(--bx-text-disabled)`.                           |
| `--bx-tree-item-expand-button-size`              | Size (width and height) of the `expand-button` part. Default `var(--bx-target-min)`.                              |
| `--bx-tree-item-expand-button-fg`                | Text/icon color of the `expand-button` part. Default `var(--bx-text-secondary)`.                                  |
| `--bx-tree-item-expand-button-focus-ring-width`  | Focus ring width of the `expand-button` part (focus state). Default `var(--bx-border-width-strong)`.              |
| `--bx-tree-item-expand-button-focus-ring-color`  | Focus ring color of the `expand-button` part (focus state). Default `var(--bx-focus-ring)`.                       |
| `--bx-tree-item-expand-button-focus-ring-offset` | Focus ring offset of the `expand-button` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.    |
| `--bx-tree-item-spinner-size`                    | Size (width and height) of the `spinner` part. Default `0.9em`.                                                   |
| `--bx-tree-item-checkbox-size`                   | Size (width and height) of the `checkbox` part. Default `calc(var(--bx-unit) * 1.25)`.                            |
| `--bx-tree-item-checkbox-border-width`           | Border width of the `checkbox` part. Default `var(--bx-border-width-strong)`.                                     |
| `--bx-tree-item-checkbox-border-color`           | Border color of the `checkbox` part. Default `var(--bx-border-strong)`.                                           |
| `--bx-tree-item-checkbox-radius`                 | Corner radius of the `checkbox` part. Default `var(--bx-radius-s)`.                                               |
| `--bx-tree-item-checkbox-bg`                     | Background of the `checkbox` part. Default `var(--bx-surface-base)`.                                              |
| `--bx-tree-item-checkbox-selected-border-color`  | Border color of the `checkbox` part (selected state). Default `var(--bx-role-accent)`.                            |
| `--bx-tree-item-checkbox-selected-bg`            | Background of the `checkbox` part (selected state). Default `var(--bx-role-accent)`.                              |
| `--bx-tree-item-checkbox-focus-ring-width`       | Focus ring width of the `checkbox` part (focus state). Default `var(--bx-border-width-strong)`.                   |
| `--bx-tree-item-checkbox-focus-ring-color`       | Focus ring color of the `checkbox` part (focus state). Default `var(--bx-focus-ring)`.                            |
| `--bx-tree-item-checkbox-focus-ring-offset`      | Focus ring offset of the `checkbox` part (focus state). Default `var(--bx-focus-ring-offset)`.                    |
| `--bx-tree-item-expand-button-icon-size`         | Size (width and height) of the icon inside the `expand-button` element. Default `0.75em`.                         |
| `--bx-tree-item-expand-button-error-fg`          | Color of the expand button after a lazy load failed. Default `var(--bx-role-danger-fg)`.                          |
| `--bx-tree-item-font-family`                     | Font family of the root surface. Default `var(--bx-type-body-family)`.                                            |

### Methods

_None._

## 3. Functional requirements

- **FR-TREE-ITEM-01** Lazy loading shows spinner and handles failure with retry.

## 4. Fluid scaling

-

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- ARIA tree attributes managed by parent tree.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Hard budget: ≤ 1 ms median first render, ≤ 2 KB gzip incremental JS (excluding shared base).
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element, slots map to named children via `slot` attribute.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; form-associated components ship a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed action/component wrapper exposing props, `on:`/callback events and `bind:value` where applicable.

## 9. Acceptance criteria

- [ ] All FR-TREE-ITEM-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
