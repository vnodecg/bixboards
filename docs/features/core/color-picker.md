# `<bx-color-picker>`

> Color selection with saturation area, hue/alpha sliders, swatches, eyedropper and format switching.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-color-picker`      |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Color selection with saturation area, hue/alpha sliders, swatches, eyedropper and format switching. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name               | Type                     | Default  | Description   |
| ------------------ | ------------------------ | -------- | ------------- |
| `value`            | string                   | ""       | -             |
| `format`           | hex \| rgb \| hsl \| hsv | "hex"    | -             |
| `opacity`          | boolean                  | false    | -             |
| `uppercase`        | boolean                  | false    | -             |
| `swatches`         | string[]                 | -        | Preset colors |
| `inline`           | boolean                  | false    | -             |
| `size`             | s/m/l                    | "medium" | -             |
| `no-format-toggle` | boolean                  | false    | -             |
| `name`             | string                   | ""       | -             |
| `disabled`         | boolean                  | false    | -             |
| `required`         | boolean                  | false    | -             |

### Slots

| Slot    | Description |
| ------- | ----------- |
| `label` | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |
| `bx-show`      | -                                         |
| `bx-hide`      | -                                         |

### CSS parts

| Part                | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `base`              | The outer wrapper.                                                 |
| `trigger`           | The swatch button that opens the panel (non-`inline` mode).        |
| `presets`           | The wrapper around preset swatches.                                |
| `swatch`            | A single preset swatch button.                                     |
| `custom-toggle`     | The tile that shows/hides the custom picker (grid + hue slider).   |
| `custom`            | The custom picker section.                                         |
| `grid`              | The saturation/value `role="application"` area.                    |
| `grid-handle`       | The grid's drag handle.                                            |
| `slider`            | Either hue/opacity slider track.                                   |
| `hue-slider`        | The hue slider track.                                              |
| `opacity-slider`    | The opacity slider track, present when `opacity` is set.           |
| `input`             | The text field showing/accepting the formatted value.              |
| `opacity-input`     | The numeric opacity (%) field, present unless `no-opacity` is set. |
| `eyedropper-button` | The eyedropper button, present when `window.EyeDropper` exists.    |
| `format-select`     | The format `<select>`, present unless `no-format-toggle` is set.   |

### CSS custom properties

| Property                                                  | Description                                                                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--bx-color-picker-grid-width`                            | Saturation/value grid width. Default `calc(var(--bx-unit) * 16)`.                                                                                                                          |
| `--bx-color-picker-grid-height`                           | Saturation/value grid height. Default `calc(var(--bx-unit) * 10)`.                                                                                                                         |
| `--bx-color-picker-swatch-radius`                         | Corner radius of preset boxes, grid and trigger. Default `--bx-radius-m`.                                                                                                                  |
| `--bx-color-picker-swatch-size`                           | Minimum preset box size. Default `calc(var(--bx-unit) * 1.75)`.                                                                                                                            |
| `--bx-color-picker-gap`                                   | Gap of the root surface. Default `var(--bx-space-s)`.                                                                                                                                      |
| `--bx-color-picker-trigger-size`                          | Size (width and height) of the `trigger` part. Default `var(--bx-target-min)`.                                                                                                             |
| `--bx-color-picker-trigger-border-width`                  | Border width of the `trigger` part. Default `var(--bx-border-width)`.                                                                                                                      |
| `--bx-color-picker-trigger-border-color`                  | Border color of the `trigger` part. Default `var(--bx-border-subtle)`.                                                                                                                     |
| `--bx-color-picker-trigger-focus-ring-width`              | Focus ring width of the `trigger` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                             |
| `--bx-color-picker-trigger-focus-ring-color`              | Focus ring color of the `trigger` part (focus state). Default `var(--bx-focus-ring)`.                                                                                                      |
| `--bx-color-picker-trigger-focus-ring-offset`             | Focus ring offset of the `trigger` part (focus state). Default `var(--bx-focus-ring-offset)`.                                                                                              |
| `--bx-color-picker-panel-gap`                             | Gap of the `panel` element. Default `var(--bx-space-s)`.                                                                                                                                   |
| `--bx-color-picker-panel-padding`                         | Padding of the `panel` element. Default `var(--bx-space-s)`.                                                                                                                               |
| `--bx-color-picker-grid-handle-size`                      | Size (width and height) of the `grid-handle` part. Default `var(--bx-space-m)`.                                                                                                            |
| `--bx-color-picker-grid-handle-border-width`              | Border width of the `grid-handle` part. Default `var(--bx-border-width-strong)`.                                                                                                           |
| `--bx-color-picker-slider-height`                         | Height of the `slider` part. Default `var(--bx-space-m)`.                                                                                                                                  |
| `--bx-color-picker-slider-radius`                         | Corner radius of the `slider` part. Default `var(--bx-radius-pill)`.                                                                                                                       |
| `--bx-color-picker-slider-handle-size`                    | Size (width and height) of the `slider-handle` element. Default `var(--bx-space-m)`.                                                                                                       |
| `--bx-color-picker-slider-handle-border-width`            | Border width of the `slider-handle` element. Default `var(--bx-border-width-strong)`.                                                                                                      |
| `--bx-color-picker-row-gap`                               | Gap of the `row` element. Default `var(--bx-space-xs)`.                                                                                                                                    |
| `--bx-color-picker-opacity-input-padding`                 | Padding of the `opacity-input` part. Default `var(--bx-space-2xs) var(--bx-space-xs)`.                                                                                                     |
| `--bx-color-picker-opacity-input-border-width`            | Border width of the `opacity-input` part. Default `var(--bx-border-width)`.                                                                                                                |
| `--bx-color-picker-opacity-input-border-color`            | Border color of the `opacity-input` part. Default `var(--bx-border-subtle)`.                                                                                                               |
| `--bx-color-picker-opacity-input-radius`                  | Corner radius of the `opacity-input` part. Default `var(--bx-radius-s)`.                                                                                                                   |
| `--bx-color-picker-eyedropper-button-size`                | Size (width and height) of the `eyedropper-button` part. Default `var(--bx-target-min)`.                                                                                                   |
| `--bx-color-picker-eyedropper-button-radius`              | Corner radius of the `eyedropper-button` part. Default `var(--bx-radius-s)`.                                                                                                               |
| `--bx-color-picker-eyedropper-button-fg`                  | Text/icon color of the `eyedropper-button` part. Default `var(--bx-text-secondary)`.                                                                                                       |
| `--bx-color-picker-eyedropper-button-hover-bg`            | Background of the `eyedropper-button` part (hover state). Default `var(--bx-surface-subtle)`.                                                                                              |
| `--bx-color-picker-eyedropper-button-focus-ring-width`    | Focus ring width of the `eyedropper-button` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                   |
| `--bx-color-picker-eyedropper-button-focus-ring-color`    | Focus ring color of the `eyedropper-button` part (focus state). Default `var(--bx-focus-ring)`.                                                                                            |
| `--bx-color-picker-eyedropper-button-focus-ring-offset`   | Focus ring offset of the `eyedropper-button` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.                                                                         |
| `--bx-color-picker-presets-gap`                           | Gap of the `presets` part. Default `var(--bx-space-xs)`.                                                                                                                                   |
| `--bx-color-picker-custom-gap`                            | Gap of the `custom` part. Default `var(--bx-space-s)`.                                                                                                                                     |
| `--bx-color-picker-format-select-padding`                 | Padding of the `format-select` part. Default `var(--bx-space-2xs) var(--bx-space-xs)`.                                                                                                     |
| `--bx-color-picker-format-select-border-width`            | Border width of the `format-select` part. Default `var(--bx-border-width)`.                                                                                                                |
| `--bx-color-picker-format-select-border-color`            | Border color of the `format-select` part. Default `var(--bx-border-subtle)`.                                                                                                               |
| `--bx-color-picker-format-select-radius`                  | Corner radius of the `format-select` part. Default `var(--bx-radius-s)`.                                                                                                                   |
| `--bx-color-picker-format-select-focus-ring-width`        | Focus ring width of the `format-select` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                       |
| `--bx-color-picker-format-select-focus-ring-color`        | Focus ring color of the `format-select` part (focus state). Default `var(--bx-focus-ring)`.                                                                                                |
| `--bx-color-picker-format-select-focus-ring-offset`       | Focus ring offset of the `format-select` part (focus state). Default `var(--bx-focus-ring-offset)`.                                                                                        |
| `--bx-color-picker-opacity-input-width`                   | Width of the `opacity-input` part. Default `calc(var(--bx-unit) * 4.5)`.                                                                                                                   |
| `--bx-color-picker-swatch-bg`                             | Background of the `swatch` part. Default `conic-gradient(red, #ff0, #0f0, #0ff, #00f, #f0f, red)`.                                                                                         |
| `--bx-color-picker-custom-toggle-expanded-ring-width`     | Focus ring width of the `custom-toggle` element (expanded state). Default `var(--bx-border-width-strong)`.                                                                                 |
| `--bx-color-picker-custom-toggle-expanded-ring-color`     | Focus ring color of the `custom-toggle` element (expanded state). Default `var(--bx-focus-ring)`.                                                                                          |
| `--bx-color-picker-custom-toggle-expanded-outline-offset` | Outline offset of the `custom-toggle` element (expanded state). Default `var(--bx-focus-ring-offset)`.                                                                                     |
| `--bx-color-picker-swatch-border-width`                   | Border width of the `swatch` part. Default `var(--bx-border-width)`.                                                                                                                       |
| `--bx-color-picker-swatch-border-color`                   | Border color of the `swatch` part. Default `var(--bx-border-subtle)`.                                                                                                                      |
| `--bx-color-picker-swatch-pressed-shadow`                 | Box shadow of the `swatch` part (pressed state). Default `0 0 0 var(--bx-border-width-strong) var(--bx-surface-base), 0 0 0 calc(var(--bx-border-width-strong) * 2) var(--bx-focus-ring)`. |
| `--bx-color-picker-swatch-focus-ring-width`               | Focus ring width of the `swatch` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                              |
| `--bx-color-picker-swatch-focus-ring-color`               | Focus ring color of the `swatch` part (focus state). Default `var(--bx-focus-ring)`.                                                                                                       |
| `--bx-color-picker-swatch-focus-ring-offset`              | Focus ring offset of the `swatch` part (focus state). Default `var(--bx-focus-ring-offset)`.                                                                                               |
| `--bx-color-picker-grid-disabled-opacity`                 | Opacity of the `grid` part (disabled state). Default `0.5`.                                                                                                                                |
| `--bx-color-picker-checker-size`                          | Edge length of one transparency-checkerboard square. Default `calc(var(--bx-unit) * 0.5)`.                                                                                                 |
| `--bx-color-picker-checker-color`                         | Color of the darker checkerboard squares. Default `--bx-surface-muted`.                                                                                                                    |
| `--bx-color-picker-handle-border`                         | Ring color of the grid and slider handles; stays light by default so the handle reads on any picked color. Default `white`.                                                                |
| `--bx-color-picker-handle-shadow`                         | Outer outline color of the grid and slider handles. Default `rgb(0 0 0 / 30%)`.                                                                                                            |
| `--bx-color-picker-font-family`                           | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                                                                                     |
| `--bx-color-picker-opacity-input-font-family`             | Font family of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-family)`.                                                                                       |
| `--bx-color-picker-opacity-input-font-size`               | Font size of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                                                                         |
| `--bx-color-picker-opacity-input-font-weight`             | Font weight of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                                                                     |
| `--bx-color-picker-opacity-input-line-height`             | Line height of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                                                                    |
| `--bx-color-picker-opacity-input-letter-spacing`          | Letter spacing of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                                                                |
| `--bx-color-picker-format-select-font-family`             | Font family of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-family)`.                                                                                       |
| `--bx-color-picker-format-select-font-size`               | Font size of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                                                                         |
| `--bx-color-picker-format-select-font-weight`             | Font weight of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                                                                     |
| `--bx-color-picker-format-select-line-height`             | Line height of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                                                                    |
| `--bx-color-picker-format-select-letter-spacing`          | Letter spacing of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                                                                |

### Methods

`focus()`, `blur()`, `getFormattedValue(format)`, `reportValidity()`

## 3. Functional requirements

- **FR-COLOR-PICKER-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-COLOR-PICKER-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-COLOR-PICKER-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-COLOR-PICKER-04** Native `EyeDropper` API when available, hidden otherwise.
- **FR-COLOR-PICKER-05** Dragging updates via rAF-coalesced pointer events.
- **FR-COLOR-PICKER-06** Internal color math is pure and unit-tested; no dependency on a color library unless tree-shakable.

## 4. Fluid scaling

Grid area and sliders scale to fluid units, capped for readability.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Inline mode fills container width; swatch grid reflows columns via container query.

## 6. Accessibility

- Grid exposes `role="application"` with arrow-key movement; sliders are `role="slider"`; announce color name/values.
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

- [ ] All FR-COLOR-PICKER-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
