# `<bx-callout>`

> Inline message block for info, warning and error with optional icon and dismiss.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Feedback       |
| **Tag**             | `bx-callout`   |
| **Status**          | Implemented    |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Inline message block for info, warning and error with optional icon and dismiss. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name          | Type                                                               | Default    | Description        |
| ------------- | ------------------------------------------------------------------ | ---------- | ------------------ |
| `variant`     | "default" \| "secondary" \| "tertiary" \| "error" \| "warning"     | "default"  | -                  |
| `appearance`  | "accent" \| "filled" \| "outlined" \| "plain" \| "filled outlined" | "outlined" | -                  |
| `size`        | "small" \| "medium" \| "large"                                     | "medium"   | -                  |
| `dismissible` | boolean                                                            | false      | Shows close button |
| `open`        | boolean                                                            | true       | -                  |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |
| `icon`      | -           |

### Events

| Event           | Detail / notes |
| --------------- | -------------- |
| `bx-hide`       | Cancelable     |
| `bx-after-hide` | -              |

### CSS parts

| Part           | Description                                     |
| -------------- | ----------------------------------------------- |
| `base`         | The outer wrapper (the animated grid row).      |
| `icon`         | The wrapper around the icon slot.               |
| `message`      | The wrapper around the default slot.            |
| `close-button` | The dismiss button, present with `dismissible`. |

### CSS custom properties

| Property                                      | Description                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--bx-callout-opacity`                        | Opacity of the root surface. Default `1`.                                                                         |
| `--bx-callout-gap`                            | Gap of the root surface. Default `var(--bx-space-s)`.                                                             |
| `--bx-callout-radius`                         | Corner radius of the root surface. Default `var(--bx-radius-m)`.                                                  |
| `--bx-callout-border-width`                   | Border width of the root surface. Default `var(--bx-border-width)`.                                               |
| `--bx-callout-border-color`                   | Border color of the root surface. Default `var(--bx-callout-variant-border)`.                                     |
| `--bx-callout-inline-start-border-width`      | Inline start border width of the root surface. Default `calc(var(--bx-border-width-strong) * 2)`.                 |
| `--bx-callout-inline-start-border-color`      | Inline start border color of the root surface. Default `var(--bx-callout-variant-solid)`.                         |
| `--bx-callout-padding`                        | Padding of the root surface. Default `var(--bx-space-xs) var(--bx-space-s)`.                                      |
| `--bx-callout-icon-size`                      | Size (width and height) of the `icon` part. Default `1.25em`.                                                     |
| `--bx-callout-icon-fg`                        | Text/icon color of the `icon` part. Default `var(--bx-callout-variant-fg)`.                                       |
| `--bx-callout-message-line-height`            | Line height of the `message` part. Default `var(--bx-type-body-m-leading)`.                                       |
| `--bx-callout-actions-gap`                    | Gap of the `actions` element. Default `var(--bx-space-xs)`.                                                       |
| `--bx-callout-close-button-size`              | Size (width and height) of the `close-button` part. Default `var(--bx-target-min)`.                               |
| `--bx-callout-close-button-radius`            | Corner radius of the `close-button` part. Default `var(--bx-radius-pill)`.                                        |
| `--bx-callout-close-button-hover-bg`          | Background of the `close-button` part (hover state). Default `color-mix(in srgb, currentColor 12%, transparent)`. |
| `--bx-callout-close-button-focus-ring-width`  | Focus ring width of the `close-button` part (focus state). Default `var(--bx-border-width-strong)`.               |
| `--bx-callout-close-button-focus-ring-color`  | Focus ring color of the `close-button` part (focus state). Default `var(--bx-focus-ring)`.                        |
| `--bx-callout-close-button-focus-ring-offset` | Focus ring offset of the `close-button` part (focus state). Default `var(--bx-focus-ring-offset)`.                |
| `--bx-callout-fg`                             | Text color. Default the variant's `fg` role color.                                                                |
| `--bx-callout-bg`                             | Background. Default the variant's `subtle` role color.                                                            |
| `--bx-callout-close-button-icon-size`         | Size (width and height) of the icon inside the `close-button` element. Default `1em`.                             |
| `--bx-callout-font-family`                    | Font family of the root surface. Default `var(--bx-type-body-family)`.                                            |
| `--bx-callout-font-family`                    | Font family of the root surface (text style `caption-s`). Default `var(--bx-type-caption-family)`.                |
| `--bx-callout-font-size`                      | Font size of the root surface (text style `caption-s`). Default `var(--bx-type-caption-s-size)`.                  |
| `--bx-callout-font-weight`                    | Font weight of the root surface (text style `caption-s`). Default `var(--bx-type-caption-s-weight)`.              |
| `--bx-callout-line-height`                    | Line height of the root surface (text style `caption-s`). Default `var(--bx-type-caption-s-leading)`.             |
| `--bx-callout-letter-spacing`                 | Letter spacing of the root surface (text style `caption-s`). Default `var(--bx-type-caption-s-tracking)`.         |

### Methods

`show()`, `hide()`

## 3. Functional requirements

- **FR-CALLOUT-01** Default icon per variant, replaceable.
- **FR-CALLOUT-02** Dismiss animates height to 0 to avoid jump; honors reduced motion.

## 4. Fluid scaling

Padding, icon and type scale together.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Icon moves above text and actions wrap under text when container < 24 fluid units.

## 6. Accessibility

- `role="alert"` for error/warning when inserted dynamically, `role="note"` otherwise.
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

- [ ] All FR-CALLOUT-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
