# `<bx-number-input>`

> Numeric field with steppers, locale-aware parsing and min/max clamping.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-number-input`      |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Numeric field with steppers, locale-aware parsing and min/max clamping. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                     | Type                           | Default       | Description                           |
| ------------------------ | ------------------------------ | ------------- | ------------------------------------- |
| `name`                   | string                         | ""            | Form field name                       |
| `value`                  | string                         | ""            | Current value                         |
| `disabled`               | boolean                        | false         | -                                     |
| `required`               | boolean                        | false         | -                                     |
| `form`                   | string                         | ""            | Associate with form by id             |
| `hint`                   | string                         | ""            | Help text (also `hint` slot)          |
| `label`                  | string                         | ""            | Label (also `label` slot)             |
| `size`                   | "small" \| "medium" \| "large" | "medium"      | -                                     |
| `with-label / with-hint` | boolean                        | false         | Opt into slot-based label/hint        |
| `min / max`              | number                         | -             | -                                     |
| `step`                   | number                         | 1             | -                                     |
| `locale`                 | string                         | document lang | Number formatting locale              |
| `format`                 | Intl.NumberFormatOptions       | -             | Display format (currency, percent…)   |
| `without-steppers`       | boolean                        | false         | -                                     |
| `wheel`                  | boolean                        | false         | Adjust with mouse wheel while focused |

### Slots

| Slot             | Description |
| ---------------- | ----------- |
| `label`          | -           |
| `hint`           | -           |
| `start`          | -           |
| `end`            | -           |
| `increment-icon` | -           |
| `decrement-icon` | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

| Part           | Description                                  |
| -------------- | -------------------------------------------- |
| `start`        | The wrapper around the start slot.           |
| `end`          | The wrapper around the end slot.             |
| `form-control` | The outer wrapper (label + base + hint).     |
| `label`        | The label element.                           |
| `hint`         | The wrapper around the hint slot.            |
| `base`         | The wrapper around start/input/end/steppers. |
| `input`        | The native `<input>`.                        |
| `stepper-up`   | The increment button.                        |
| `stepper-down` | The decrement button.                        |

### CSS custom properties

| Property                                      | Description                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `--bx-number-input-form-control-gap`          | Gap of the `form-control` part. Default `var(--bx-space-xs)`.                                                 |
| `--bx-number-input-label-fg`                  | Text/icon color of the `label` part. Default `var(--bx-text-primary)`.                                        |
| `--bx-number-input-gap`                       | Gap of the root surface. Default `var(--bx-space-xs)`.                                                        |
| `--bx-number-input-radius`                    | Corner radius of the root surface. Default `var(--bx-radius-m)`.                                              |
| `--bx-number-input-border-width`              | Border width of the root surface. Default `var(--bx-border-width)`.                                           |
| `--bx-number-input-border-color`              | Border color of the root surface. Default `var(--bx-border-subtle)`.                                          |
| `--bx-number-input-bg`                        | Background of the root surface. Default `var(--bx-surface-base)`.                                             |
| `--bx-number-input-focus-ring-width`          | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.                  |
| `--bx-number-input-disabled-bg`               | Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.                          |
| `--bx-number-input-disabled-fg`               | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.                      |
| `--bx-number-input-invalid-border-color`      | Border color of the root surface (invalid state). Default `var(--bx-role-danger-border)`.                     |
| `--bx-number-input-start-fg`                  | Text/icon color of the `start` part. Default `var(--bx-text-secondary)`.                                      |
| `--bx-number-input-stepper-width`             | Width of the `stepper-down` part. Default `calc(var(--bx-target-min) * 0.6)`.                                 |
| `--bx-number-input-stepper-height`            | Height of the `stepper-down` part. Default `calc(var(--bx-target-min) * 0.5)`.                                |
| `--bx-number-input-stepper-fg`                | Text/icon color of the `stepper-down` part. Default `var(--bx-text-secondary)`.                               |
| `--bx-number-input-stepper-disabled-bg`       | Background of the `stepper-down` part (disabled state). Default `var(--bx-surface-subtle)`.                   |
| `--bx-number-input-stepper-disabled-fg`       | Text/icon color of the `stepper-down` part (disabled state). Default `var(--bx-text-primary)`.                |
| `--bx-number-input-stepper-focus-ring-width`  | Focus ring width of the `stepper-down` part (focus state). Default `var(--bx-border-width-strong)`.           |
| `--bx-number-input-stepper-focus-ring-color`  | Focus ring color of the `stepper-down` part (focus state). Default `var(--bx-focus-ring)`.                    |
| `--bx-number-input-stepper-focus-ring-offset` | Focus ring offset of the `stepper-down` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`. |
| `--bx-number-input-stepper-disabled-opacity`  | Opacity of the `stepper-down` part (disabled state). Default `0.4`.                                           |
| `--bx-number-input-hint-fg`                   | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                                       |
| `--bx-number-input-hint-invalid-fg`           | Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.                       |
| `--bx-number-input-height`                    | Control height. Default derived from `size`.                                                                  |
| `--bx-number-input-padding-inline`            | Horizontal padding. Default `--bx-space-s`.                                                                   |
| `--bx-number-input-stepper-icon-size`         | Size (width and height) of the icon inside the `stepper-down` element. Default `0.7em`.                       |
| `--bx-number-input-hover-border-color`        | Border color while hovered. Default `var(--bx-border-strong)`.                                                |
| `--bx-number-input-focus-border-color`        | Border color while focused. Default `var(--bx-focus-ring)`.                                                   |
| `--bx-number-input-focus-shadow`              | Soft halo around the field while focused. Default a translucent `--bx-focus-ring` ring.                       |
| `--bx-number-input-hover-bg`                  | Background of a `filled` field while hovered. Default `var(--bx-surface-muted)`.                              |
| `--bx-number-input-focus-bg`                  | Background of a `filled` field while focused. Default `var(--bx-surface-base)`.                               |
| `--bx-number-input-disabled-border-color`     | Border color when disabled. Default `var(--bx-border-subtle)`.                                                |
| `--bx-number-input-invalid-focus-shadow`      | Halo while focused and invalid. Default a translucent `--bx-role-danger-border` ring.                         |
| `--bx-number-input-font-family`               | Font family of the root surface. Default `var(--bx-type-body-family)`.                                        |
| `--bx-number-input-label-font-family`         | Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.                |
| `--bx-number-input-label-font-size`           | Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                  |
| `--bx-number-input-label-font-weight`         | Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.              |
| `--bx-number-input-label-line-height`         | Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.             |
| `--bx-number-input-label-letter-spacing`      | Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.         |
| `--bx-number-input-input-font-family`         | Font family of the `input` part (text style `field-m`). Default `var(--bx-type-field-family)`.                |
| `--bx-number-input-input-font-size`           | Font size of the `input` part (text style `field-m`). Default `var(--bx-type-field-m-size)`.                  |
| `--bx-number-input-input-font-weight`         | Font weight of the `input` part (text style `field-m`). Default `var(--bx-type-field-m-weight)`.              |
| `--bx-number-input-input-line-height`         | Line height of the `input` part (text style `field-m`). Default `var(--bx-type-field-m-leading)`.             |
| `--bx-number-input-input-letter-spacing`      | Letter spacing of the `input` part (text style `field-m`). Default `var(--bx-type-field-m-tracking)`.         |
| `--bx-number-input-hint-font-family`          | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.                   |
| `--bx-number-input-hint-font-size`            | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                     |
| `--bx-number-input-hint-font-weight`          | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                 |
| `--bx-number-input-hint-line-height`          | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                |
| `--bx-number-input-hint-letter-spacing`       | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.            |

### Methods

`stepUp()`, `stepDown()`, `focus()`

## 3. Functional requirements

- **FR-NUMBER-INPUT-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-NUMBER-INPUT-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-NUMBER-INPUT-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-NUMBER-INPUT-04** `value` is a number; display string is formatted, editing string is locale-parsed.
- **FR-NUMBER-INPUT-05** Hold-to-repeat steppers with acceleration; ArrowUp/Down and PageUp/Down step.
- **FR-NUMBER-INPUT-06** Floating-point-safe stepping (decimal arithmetic).

## 4. Fluid scaling

As `bx-input`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Steppers move inside/outside based on width.

## 6. Accessibility

- `role="spinbutton"` with valuenow/min/max and localized `aria-valuetext`.
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

- [ ] All FR-NUMBER-INPUT-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
