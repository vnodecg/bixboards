# `<bx-breadcrumb-item>`

> One crumb; link or button.

|                     |                      |
| ------------------- | -------------------- |
| **Package**         | `@bixboards/core`    |
| **Category**        | Organization         |
| **Tag**             | `bx-breadcrumb-item` |
| **Status**          | Planned              |
| **Form-associated** | No                   |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

One crumb; link or button. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name     | Type   | Default | Description |
| -------- | ------ | ------- | ----------- |
| `href`   | string | ""      | -           |
| `target` | string | -       | -           |
| `rel`    | string | -       | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |
| `start`     | -           |
| `end`       | -           |
| `separator` | -           |

### Events

_None._

### CSS parts

| Part        | Description                            |
| ----------- | -------------------------------------- |
| `label`     | The anchor/button/text label.          |
| `prefix`    | The wrapper around the start slot.     |
| `suffix`    | The wrapper around the end slot.       |
| `separator` | The wrapper around the separator slot. |

### CSS custom properties

| Property                                            | Description                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--bx-breadcrumb-item-gap`                          | Gap of the root surface. Default `var(--bx-space-2xs)`.                                               |
| `--bx-breadcrumb-item-label-gap`                    | Gap of the `label` part. Default `var(--bx-space-2xs)`.                                               |
| `--bx-breadcrumb-item-label-min-height`             | Minimum height of the `label` part. Default `var(--bx-target-min)`.                                   |
| `--bx-breadcrumb-item-label-focus-ring-width`       | Focus ring width of the `label` part (focus state). Default `var(--bx-border-width-strong)`.          |
| `--bx-breadcrumb-item-label-focus-ring-color`       | Focus ring color of the `label` part (focus state). Default `var(--bx-focus-ring)`.                   |
| `--bx-breadcrumb-item-label-focus-ring-offset`      | Focus ring offset of the `label` part (focus state). Default `var(--bx-focus-ring-offset)`.           |
| `--bx-breadcrumb-item-label-focus-radius`           | Corner radius of the `label` part (focus state). Default `var(--bx-radius-s)`.                        |
| `--bx-breadcrumb-item-label-current-fg`             | Text/icon color of the `label` part (current state). Default `var(--bx-text-primary)`.                |
| `--bx-breadcrumb-item-separator-fg`                 | Text/icon color of the `separator` part. Default `var(--bx-text-secondary)`.                          |
| `--bx-breadcrumb-item-link-fg`                      | Color of the label when the item is a link or button. Default `var(--bx-role-accent-fg)`.             |
| `--bx-breadcrumb-item-font-family`                  | Font family of the root surface (text style `body-s`). Default `var(--bx-type-body-family)`.          |
| `--bx-breadcrumb-item-font-size`                    | Font size of the root surface (text style `body-s`). Default `var(--bx-type-body-s-size)`.            |
| `--bx-breadcrumb-item-font-weight`                  | Font weight of the root surface (text style `body-s`). Default `var(--bx-type-body-s-weight)`.        |
| `--bx-breadcrumb-item-line-height`                  | Line height of the root surface (text style `body-s`). Default `var(--bx-type-body-s-leading)`.       |
| `--bx-breadcrumb-item-letter-spacing`               | Letter spacing of the root surface (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.   |
| `--bx-breadcrumb-item-label-current-font-family`    | Font family of the `label` part (text style `label-m`). Default `var(--bx-type-label-family)`.        |
| `--bx-breadcrumb-item-label-current-font-size`      | Font size of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-size)`.          |
| `--bx-breadcrumb-item-label-current-font-weight`    | Font weight of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-weight)`.      |
| `--bx-breadcrumb-item-label-current-line-height`    | Line height of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-leading)`.     |
| `--bx-breadcrumb-item-label-current-letter-spacing` | Letter spacing of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-BREADCRUMB-ITEM-01** Renders anchor if `href`, else button when interactive, else text.

## 4. Fluid scaling

-

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- `aria-current` on last.
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

- [ ] All FR-BREADCRUMB-ITEM-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
