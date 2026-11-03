# `<bx-zoomable-frame>`

> Iframe with zoom controls.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixboards/core`   |
| **Category**        | Imagery             |
| **Tag**             | `bx-zoomable-frame` |
| **Status**          | Planned             |
| **Form-associated** | No                  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Iframe with zoom controls. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name               | Type              | Default            | Description |
| ------------------ | ----------------- | ------------------ | ----------- |
| `src`              | string            | ""                 | -           |
| `srcdoc`           | string            | ""                 | -           |
| `allow-fullscreen` | boolean           | false              | -           |
| `loading`          | "eager" \| "lazy" | "eager"            | -           |
| `referrerpolicy`   | string            | -                  | -           |
| `sandbox`          | string            | -                  | -           |
| `zoom`             | number            | 1                  | -           |
| `zoom-levels`      | string            | "0.25 0.5 1 1.5 2" | -           |

### Slots

| Slot            | Description |
| --------------- | ----------- |
| `zoom-in-icon`  | -           |
| `zoom-out-icon` | -           |

### Events

| Event   | Detail / notes |
| ------- | -------------- |
| `load`  | -              |
| `error` | -              |

### CSS parts

| Part              | Description                           |
| ----------------- | ------------------------------------- |
| `frame`           | The scaled box that holds the iframe. |
| `iframe`          | The `<iframe>` element.               |
| `controls`        | The wrapper around the zoom controls. |
| `zoom-in-button`  | The zoom-in button.                   |
| `zoom-out-button` | The zoom-out button.                  |
| `zoom-label`      | The current zoom percentage label.    |

### CSS custom properties

| Property                                        | Description                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--bx-zoomable-frame-frame-radius`              | Corner radius of the `frame` part. Default `var(--bx-radius-m)`.                                         |
| `--bx-zoomable-frame-frame-border-width`        | Border width of the `frame` part. Default `var(--bx-border-width)`.                                      |
| `--bx-zoomable-frame-frame-border-color`        | Border color of the `frame` part. Default `var(--bx-border-subtle)`.                                     |
| `--bx-zoomable-frame-controls-gap`              | Gap of the `controls` part. Default `var(--bx-space-2xs)`.                                               |
| `--bx-zoomable-frame-controls-padding`          | Padding of the `controls` part. Default `var(--bx-space-2xs)`.                                           |
| `--bx-zoomable-frame-controls-radius`           | Corner radius of the `controls` part. Default `var(--bx-radius-pill)`.                                   |
| `--bx-zoomable-frame-controls-bg`               | Background of the `controls` part. Default `var(--bx-surface-base)`.                                     |
| `--bx-zoomable-frame-controls-border-width`     | Border width of the `controls` part. Default `var(--bx-border-width)`.                                   |
| `--bx-zoomable-frame-controls-border-color`     | Border color of the `controls` part. Default `var(--bx-border-subtle)`.                                  |
| `--bx-zoomable-frame-controls-shadow`           | Box shadow of the `controls` part. Default `var(--bx-shadow-s)`.                                         |
| `--bx-zoomable-frame-button-size`               | Size (width and height) of the `button` element. Default `var(--bx-target-min)`.                         |
| `--bx-zoomable-frame-button-fg`                 | Text/icon color of the `button` element. Default `var(--bx-text-primary)`.                               |
| `--bx-zoomable-frame-menu-trigger-bg`           | Background of the `menu-trigger` element. Default `var(--bx-surface-base)`.                              |
| `--bx-zoomable-frame-menu-trigger-border-width` | Border width of the `menu-trigger` element. Default `var(--bx-border-width)`.                            |
| `--bx-zoomable-frame-menu-trigger-border-color` | Border color of the `menu-trigger` element. Default `var(--bx-border-subtle)`.                           |
| `--bx-zoomable-frame-menu-trigger-shadow`       | Box shadow of the `menu-trigger` element. Default `var(--bx-shadow-s)`.                                  |
| `--bx-zoomable-frame-button-hover-bg`           | Background of the `button` element (hover state). Default `var(--bx-surface-subtle)`.                    |
| `--bx-zoomable-frame-button-focus-ring-width`   | Focus ring width of the `button` element (focus state). Default `var(--bx-border-width-strong)`.         |
| `--bx-zoomable-frame-button-focus-ring-color`   | Focus ring color of the `button` element (focus state). Default `var(--bx-focus-ring)`.                  |
| `--bx-zoomable-frame-button-focus-ring-offset`  | Focus ring offset of the `button` element (focus state). Default `var(--bx-focus-ring-offset)`.          |
| `--bx-zoomable-frame-button-disabled-fg`        | Text/icon color of the `button` element (disabled state). Default `var(--bx-text-disabled)`.             |
| `--bx-zoomable-frame-zoom-label-min-width`      | Minimum width of the `zoom-label` part. Default `3.5ch`.                                                 |
| `--bx-zoomable-frame-zoom-label-fg`             | Text/icon color of the `zoom-label` part. Default `var(--bx-text-secondary)`.                            |
| `--bx-zoomable-frame-icon-size`                 | Size (width and height) of the icon inside the `svg` element. Default `1.1em`.                           |
| `--bx-zoomable-frame-font-family`               | Font family of the root surface. Default `var(--bx-type-body-family)`.                                   |
| `--bx-zoomable-frame-zoom-label-font-family`    | Font family of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-zoomable-frame-zoom-label-font-size`      | Font size of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-zoomable-frame-zoom-label-font-weight`    | Font weight of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-zoomable-frame-zoom-label-line-height`    | Line height of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-zoomable-frame-zoom-label-letter-spacing` | Letter spacing of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

### Methods

`zoomIn()`, `zoomOut()`

## 3. Functional requirements

- **FR-ZOOMABLE-FRAME-01** Scaling via CSS transform on the iframe; container size unchanged.
- **FR-ZOOMABLE-FRAME-02** Sandbox default is restrictive.

## 4. Fluid scaling

Controls scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Controls collapse to a single menu when narrow.

## 6. Accessibility

- Buttons labelled; iframe requires `title`.
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

- [ ] All FR-ZOOMABLE-FRAME-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
