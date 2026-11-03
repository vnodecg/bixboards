# `<bx-comparison>`

> Before/after image comparison with draggable divider.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Imagery           |
| **Tag**             | `bx-comparison`   |
| **Status**          | Planned           |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Before/after image comparison with draggable divider. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name       | Type   | Default | Description     |
| ---------- | ------ | ------- | --------------- |
| `position` | number | 50      | Divider percent |

### Slots

| Slot     | Description |
| -------- | ----------- |
| `before` | -           |
| `after`  | -           |
| `handle` | -           |

### Events

| Event    | Detail / notes |
| -------- | -------------- |
| `change` | -              |

### CSS parts

| Part      | Description                          |
| --------- | ------------------------------------ |
| `before`  | The wrapper around the before slot.  |
| `after`   | The wrapper around the after slot.   |
| `divider` | The draggable divider line + handle. |
| `handle`  | The handle knob.                     |

### CSS custom properties

| Property                                        | Description                                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--bx-comparison-divider-width`                 | Divider line thickness. Default `--bx-border-width-strong`.                                                                |
| `--bx-comparison-handle-size`                   | Handle knob diameter. Default `calc(var(--bx-unit) * 2)`.                                                                  |
| `--bx-comparison-divider-bg`                    | Background of the `divider` part. Default `var(--bx-surface-base)`.                                                        |
| `--bx-comparison-divider-shadow`                | Box shadow of the `divider` part. Default `0 0 0 var(--bx-border-width) var(--bx-border-strong)`.                          |
| `--bx-comparison-handle-knob-bg`                | Background of the `handle` part's knob. Default `var(--bx-surface-base)`.                                                  |
| `--bx-comparison-handle-knob-border-width`      | Border width of the `handle` part's knob. Default `var(--bx-border-width)`.                                                |
| `--bx-comparison-handle-knob-border-color`      | Border color of the `handle` part's knob. Default `var(--bx-border-strong)`.                                               |
| `--bx-comparison-handle-knob-shadow`            | Box shadow of the `handle` part's knob. Default `var(--bx-shadow-s)`.                                                      |
| `--bx-comparison-handle-knob-focus-ring-width`  | Focus ring width of the `handle` part's knob (focus state). Default `var(--bx-border-width-strong)`.                       |
| `--bx-comparison-handle-knob-focus-ring-color`  | Focus ring color of the `handle` part's knob (focus state). Default `var(--bx-focus-ring)`.                                |
| `--bx-comparison-handle-knob-focus-ring-offset` | Focus ring offset of the `handle` part's knob (focus state). Default `var(--bx-focus-ring-offset)`.                        |
| `--bx-comparison-aspect-ratio`                  | Aspect ratio of the comparison area. Default `16 / 9`.                                                                     |
| `--bx-comparison-handle-icon-size`              | Size (width and height) of the icon inside the `handle` element. Default `0.85em`.                                         |
| `--bx-comparison-handle-hit-size`               | Size of the handle's pointer hit area (the visible knob is `--bx-comparison-handle-size`). Default `var(--bx-target-min)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-COMPARISON-01** Clip via `clip-path`; pointer capture; keyboard arrows move 1%, Shift 10%.

## 4. Fluid scaling

Handle and divider scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Aspect ratio preserved by container width.

## 6. Accessibility

- Divider is `role="slider"` with valuetext.
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

- [ ] All FR-COMPARISON-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
