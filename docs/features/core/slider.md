# `<bx-slider>`

> Single or range slider with ticks, markers and tooltip.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-slider`            |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Single or range slider with ticks, markers and tooltip. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                | Type                   | Default      | Description                         |
| ------------------- | ---------------------- | ------------ | ----------------------------------- |
| `name`              | string                 | ""           | -                                   |
| `value`             | number                 | 0            | -                                   |
| `min / max`         | number                 | 0 / 100      | -                                   |
| `step`              | number                 | 1            | -                                   |
| `range`             | boolean                | false        | Two thumbs; `min-value`/`max-value` |
| `orientation`       | horizontal \| vertical | "horizontal" | -                                   |
| `indicator-offset`  | number                 | -            | -                                   |
| `with-markers`      | boolean                | false        | -                                   |
| `with-tooltip`      | boolean                | false        | -                                   |
| `tooltip-placement` | Placement              | "top"        | -                                   |
| `disabled`          | boolean                | false        | -                                   |
| `readonly`          | boolean                | false        | -                                   |
| `required`          | boolean                | false        | -                                   |
| `size`              | s/m/l                  | "medium"     | -                                   |

### Slots

| Slot        | Description   |
| ----------- | ------------- |
| `label`     | -             |
| `hint`      | -             |
| `reference` | Marker labels |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

| Part           | Description                                             |
| -------------- | ------------------------------------------------------- |
| `form-control` | The outer layout wrapper around label, slider and hint. |
| `label`        | The wrapper around the label slot.                      |
| `hint`         | The wrapper around the hint slot.                       |
| `slider`       | The outer interactive region (track + thumbs).          |
| `track`        | The background track.                                   |
| `indicator`    | The filled portion of the track.                        |
| `markers`      | The wrapper around tick marks.                          |
| `marker`       | A single tick mark.                                     |
| `thumb`        | A single thumb (non-range mode).                        |
| `thumb-min`    | The low thumb (range mode).                             |
| `thumb-max`    | The high thumb (range mode).                            |
| `tooltip`      | The value tooltip shown while `with-tooltip` is set.    |

### CSS custom properties

| Property                                       | Description                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--bx-slider-track-size`                       | Track thickness. Default `--bx-space-xs`.                                                                            |
| `--bx-slider-thumb-size`                       | Thumb diameter. Default `calc(var(--bx-unit) * 1.25)`.                                                               |
| `--bx-slider-marker-width`                     | Tick mark width. Default `--bx-border-width-strong`.                                                                 |
| `--bx-slider-marker-height`                    | Tick mark height. Default `--bx-space-xs`.                                                                           |
| `--bx-slider-form-control-gap`                 | Gap of the `form-control` part. Default `var(--bx-space-s)`.                                                         |
| `--bx-slider-label-fg`                         | Text/icon color of the `label` part. Default `var(--bx-text-primary)`.                                               |
| `--bx-slider-hint-fg`                          | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                                              |
| `--bx-slider-height`                           | Height of the root surface. Default `var(--bx-target-min)`.                                                          |
| `--bx-slider-width`                            | Width of the root surface. Default `var(--bx-target-min)`.                                                           |
| `--bx-slider-disabled-opacity`                 | Opacity of the root surface (disabled state). Default `0.6`.                                                         |
| `--bx-slider-track-radius`                     | Corner radius of the `track` part. Default `var(--bx-radius-pill)`.                                                  |
| `--bx-slider-track-bg`                         | Background of the `track` part. Default `var(--bx-surface-subtle)`.                                                  |
| `--bx-slider-indicator-bg`                     | Background of the `indicator` part. Default `var(--bx-role-accent)`.                                                 |
| `--bx-slider-indicator-disabled-bg`            | Background of the `indicator` part (disabled state). Default `var(--bx-border-strong)`.                              |
| `--bx-slider-marker-bg`                        | Background of the `marker` part. Default `var(--bx-border-strong)`.                                                  |
| `--bx-slider-thumb-knob-border-width`          | Border width of the `thumb` part's knob. Default `var(--bx-border-width-strong)`.                                    |
| `--bx-slider-thumb-knob-border-color`          | Border color of the `thumb` part's knob. Default `var(--bx-role-accent)`.                                            |
| `--bx-slider-thumb-knob-bg`                    | Background of the `thumb` part's knob. Default `var(--bx-surface-base)`.                                             |
| `--bx-slider-thumb-knob-focus-ring-width`      | Focus ring width of the `thumb` part's knob (focus state). Default `var(--bx-border-width-strong)`.                  |
| `--bx-slider-thumb-knob-focus-ring-color`      | Focus ring color of the `thumb` part's knob (focus state). Default `var(--bx-focus-ring)`.                           |
| `--bx-slider-thumb-knob-focus-ring-offset`     | Focus ring offset of the `thumb` part's knob (focus state). Default `var(--bx-focus-ring-offset)`.                   |
| `--bx-slider-thumb-knob-disabled-border-color` | Border color of the `thumb` part's knob (disabled state). Default `var(--bx-border-strong)`.                         |
| `--bx-slider-tooltip-padding`                  | Padding of the `tooltip` part. Default `var(--bx-space-2xs) var(--bx-space-xs)`.                                     |
| `--bx-slider-tooltip-radius`                   | Corner radius of the `tooltip` part. Default `var(--bx-radius-s)`.                                                   |
| `--bx-slider-tooltip-bg`                       | Background of the `tooltip` part. Default `var(--bx-surface-inverse, var(--bx-text-primary))`.                       |
| `--bx-slider-tooltip-fg`                       | Text/icon color of the `tooltip` part. Default `var(--bx-on-accent, var(--bx-surface-base))`.                        |
| `--bx-slider-thumb-hit-size`                   | Size of the thumb's pointer hit area (the visible knob is `--bx-slider-thumb-size`). Default `var(--bx-target-min)`. |
| `--bx-slider-font-family`                      | Font family of the root surface. Default `var(--bx-type-body-family)`.                                               |
| `--bx-slider-label-font-family`                | Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.                       |
| `--bx-slider-label-font-size`                  | Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                         |
| `--bx-slider-label-font-weight`                | Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                     |
| `--bx-slider-label-line-height`                | Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                    |
| `--bx-slider-label-letter-spacing`             | Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                |
| `--bx-slider-hint-font-family`                 | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.                          |
| `--bx-slider-hint-font-size`                   | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                            |
| `--bx-slider-hint-font-weight`                 | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                        |
| `--bx-slider-hint-line-height`                 | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                       |
| `--bx-slider-hint-letter-spacing`              | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                   |
| `--bx-slider-tooltip-font-family`              | Font family of the `tooltip` part (text style `caption-s`). Default `var(--bx-type-caption-family)`.                 |
| `--bx-slider-tooltip-font-size`                | Font size of the `tooltip` part (text style `caption-s`). Default `var(--bx-type-caption-s-size)`.                   |
| `--bx-slider-tooltip-font-weight`              | Font weight of the `tooltip` part (text style `caption-s`). Default `var(--bx-type-caption-s-weight)`.               |
| `--bx-slider-tooltip-line-height`              | Line height of the `tooltip` part (text style `caption-s`). Default `var(--bx-type-caption-s-leading)`.              |
| `--bx-slider-tooltip-letter-spacing`           | Letter spacing of the `tooltip` part (text style `caption-s`). Default `var(--bx-type-caption-s-tracking)`.          |

### Methods

`focus()`, `blur()`, `stepUp()`, `stepDown()`

## 3. Functional requirements

- **FR-SLIDER-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-SLIDER-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-SLIDER-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-SLIDER-04** Pointer capture; touch scrolling not blocked on the off-axis.
- **FR-SLIDER-05** Range thumbs cannot cross; keyboard step with PageUp/Down = 10×.

## 4. Fluid scaling

Thumb and track scale; thumb ≥ 24 px hit area.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Marker labels thin out automatically to avoid overlap.

## 6. Accessibility

- `role="slider"` per thumb with `aria-valuetext`.
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

- [ ] All FR-SLIDER-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
