# `<bx-tooltip>`

> Short hover/focus hint anchored to any element via `for` or slot.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Feedback          |
| **Tag**             | `bx-tooltip`      |
| **Status**          | Planned           |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Short hover/focus hint anchored to any element via `for` or slot. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name            | Type                                 | Default       | Description                           |
| --------------- | ------------------------------------ | ------------- | ------------------------------------- |
| `for`           | string                               | ""            | Anchor id (works across shadow roots) |
| `placement`     | Placement                            | "top"         | -                                     |
| `disabled`      | boolean                              | false         | -                                     |
| `distance`      | number                               | 8             | -                                     |
| `skidding`      | number                               | 0             | -                                     |
| `open`          | boolean                              | false         | -                                     |
| `show-delay`    | number                               | 150           | -                                     |
| `hide-delay`    | number                               | 0             | -                                     |
| `trigger`       | "hover focus" \| "click" \| "manual" | "hover focus" | -                                     |
| `without-arrow` | boolean                              | false         | -                                     |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | Content     |

### Events

| Event           | Detail / notes |
| --------------- | -------------- |
| `bx-show`       | -              |
| `bx-after-show` | -              |
| `bx-hide`       | -              |
| `bx-after-hide` | -              |

### CSS parts

| Part    | Description                                |
| ------- | ------------------------------------------ |
| `base`  | The inner `bx-popup`.                      |
| `arrow` | The arrow, present unless `without-arrow`. |
| `body`  | The wrapper around the default slot.       |

### CSS custom properties

| Property                           | Description                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--bx-tooltip-max-width`           | Max width of the tooltip body. Default `20rem`.                                                    |
| `--bx-tooltip-body-padding-block`  | Padding block of the `body` part. Default `var(--bx-space-xs)`.                                    |
| `--bx-tooltip-body-padding-inline` | Padding inline of the `body` part. Default `var(--bx-space-s)`.                                    |
| `--bx-tooltip-body-radius`         | Corner radius of the `body` part. Default `var(--bx-radius-s)`.                                    |
| `--bx-tooltip-body-shadow`         | Box shadow of the `body` part. Default `var(--bx-shadow-m)`.                                       |
| `--bx-tooltip-bg`                  | Tooltip (and arrow) background. Default `--bx-surface-inverse`.                                    |
| `--bx-tooltip-fg`                  | Tooltip text color. Default `--bx-text-inverse`.                                                   |
| `--bx-tooltip-body-font-family`    | Font family of the `body` part (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-tooltip-body-font-size`      | Font size of the `body` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-tooltip-body-font-weight`    | Font weight of the `body` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-tooltip-body-line-height`    | Line height of the `body` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-tooltip-body-letter-spacing` | Letter spacing of the `body` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

### Methods

`show()`, `hide()`

## 3. Functional requirements

- **FR-TOOLTIP-01** Escape dismisses; hover-to-persist over tooltip body (WCAG 1.4.13).
- **FR-TOOLTIP-02** Shared singleton delay: moving between tooltips skips the show delay.
- **FR-TOOLTIP-03** Works on disabled controls via wrapper detection.

## 4. Fluid scaling

Max-width and padding scale; arrow size scales.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Never opens wider than the viewport; auto-size constrains width.

## 6. Accessibility

- `role="tooltip"`; anchor gets `aria-describedby`.
- Not used for essential info (docs guidance).
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

- [ ] All FR-TOOLTIP-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
