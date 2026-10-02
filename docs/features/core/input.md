# `<bx-input>`

> Single-line text field with all native input types, clearable, password toggle and prefix/suffix.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-input`             |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Single-line text field with all native input types, clearable, password toggle and prefix/suffix. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                     | Type                                                                                     | Default    | Description                    |
| ------------------------ | ---------------------------------------------------------------------------------------- | ---------- | ------------------------------ |
| `name`                   | string                                                                                   | ""         | Form field name                |
| `value`                  | string                                                                                   | ""         | Current value                  |
| `disabled`               | boolean                                                                                  | false      | -                              |
| `required`               | boolean                                                                                  | false      | -                              |
| `form`                   | string                                                                                   | ""         | Associate with form by id      |
| `hint`                   | string                                                                                   | ""         | Help text (also `hint` slot)   |
| `label`                  | string                                                                                   | ""         | Label (also `label` slot)      |
| `size`                   | "small" \| "medium" \| "large"                                                           | "medium"   | -                              |
| `with-label / with-hint` | boolean                                                                                  | false      | Opt into slot-based label/hint |
| `type`                   | text, email, number, password, search, tel, url, date, datetime-local, time, month, week | "text"     | -                              |
| `placeholder`            | string                                                                                   | ""         | -                              |
| `clearable`              | boolean                                                                                  | false      | -                              |
| `password-toggle`        | boolean                                                                                  | false      | -                              |
| `readonly`               | boolean                                                                                  | false      | -                              |
| `pattern`                | string                                                                                   | ""         | -                              |
| `minlength / maxlength`  | number                                                                                   | -          | -                              |
| `min / max / step`       | number \| string                                                                         | -          | -                              |
| `autocomplete`           | string                                                                                   | ""         | -                              |
| `inputmode`              | string                                                                                   | ""         | -                              |
| `spellcheck`             | boolean                                                                                  | true       | -                              |
| `appearance`             | "outlined" \| "filled" \| "filled outlined"                                              | "outlined" | -                              |
| `pill`                   | boolean                                                                                  | false      | -                              |

### Slots

| Slot                 | Description |
| -------------------- | ----------- |
| `label`              | -           |
| `hint`               | -           |
| `start`              | -           |
| `end`                | -           |
| `clear-icon`         | -           |
| `show-password-icon` | -           |
| `hide-password-icon` | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |
| `bx-clear`     | -                                         |

### CSS parts

| Part                     | Description                              |
| ------------------------ | ---------------------------------------- |
| `form-control`           | The outer wrapper (label + base + hint). |
| `label`                  | The label element.                       |
| `hint`                   | The wrapper around the hint slot.        |
| `base`                   | The wrapper around start/input/end.      |
| `input`                  | The native `<input>`.                    |
| `start`                  | The wrapper around the start slot.       |
| `end`                    | The wrapper around the end slot.         |
| `clear-button`           | The clear button.                        |
| `password-toggle-button` | The password-reveal toggle button.       |

### CSS custom properties

| Property                                    | Description                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--bx-input-height`                         | Control height. Default derived from `size`.                                                                                                                       |
| `--bx-input-padding-inline`                 | Horizontal padding. Default `--bx-space-s`.                                                                                                                        |
| `--bx-input-form-control-gap`               | Gap of the `form-control` part. Default `var(--bx-space-xs)`.                                                                                                      |
| `--bx-input-label-fg`                       | Text/icon color of the `label` part. Default `var(--bx-text-primary)`.                                                                                             |
| `--bx-input-gap`                            | Gap of the root surface. Default `var(--bx-space-xs)`.                                                                                                             |
| `--bx-input-radius`                         | Corner radius of the root surface. Default `var(--bx-radius-m)`.                                                                                                   |
| `--bx-input-border-width`                   | Border width of the root surface. Default `var(--bx-border-width)`.                                                                                                |
| `--bx-input-border-color`                   | Border color of the root surface. Default `var(--bx-border-subtle)`.                                                                                               |
| `--bx-input-bg`                             | Background of the root surface. Default `var(--bx-surface-base)`.                                                                                                  |
| `--bx-input-hover-border-color`             | Border color of the root surface (hover state). Default `var(--bx-border-strong)`.                                                                                 |
| `--bx-input-focus-border-color`             | Border color of the root surface (focus state). Default `var(--bx-focus-ring)`.                                                                                    |
| `--bx-input-focus-shadow`                   | Box shadow of the root surface (focus state). Default `0 0 0 calc(var(--bx-border-width-strong) * 1.5) color-mix(in srgb, var(--bx-focus-ring) 22%, transparent)`. |
| `--bx-input-focus-ring-width`               | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.                                                                       |
| `--bx-input-hover-bg`                       | Background of the root surface (hover state). Default `var(--bx-surface-muted)`.                                                                                   |
| `--bx-input-focus-bg`                       | Background of the root surface (focus state). Default `var(--bx-surface-base)`.                                                                                    |
| `--bx-input-disabled-bg`                    | Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.                                                                               |
| `--bx-input-disabled-border-color`          | Border color of the root surface (disabled state). Default `var(--bx-border-subtle)`.                                                                              |
| `--bx-input-disabled-fg`                    | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.                                                                           |
| `--bx-input-invalid-border-color`           | Border color of the root surface (invalid state). Default `var(--bx-role-danger-border)`.                                                                          |
| `--bx-input-invalid-focus-shadow`           | Box shadow of the root surface (invalid + focus state). Default `0 0 0 3px color-mix(in srgb, var(--bx-role-danger-border) 22%, transparent)`.                     |
| `--bx-input-placeholder-fg`                 | Text/icon color of the `::placeholder`. Default `var(--bx-text-hint)`.                                                                                             |
| `--bx-input-placeholder-opacity`            | Opacity of the `::placeholder`. Default `1`.                                                                                                                       |
| `--bx-input-start-fg`                       | Text/icon color of the `start` part. Default `var(--bx-text-hint)`.                                                                                                |
| `--bx-input-start-focus-fg`                 | Text/icon color of the `start` part (focus state). Default `var(--bx-text-secondary)`.                                                                             |
| `--bx-input-clear-button-size`              | Size (width and height) of the `clear-button` part. Default `1.5em`.                                                                                               |
| `--bx-input-clear-button-radius`            | Corner radius of the `clear-button` part. Default `var(--bx-radius-pill)`.                                                                                         |
| `--bx-input-clear-button-fg`                | Text/icon color of the `clear-button` part. Default `var(--bx-text-hint)`.                                                                                         |
| `--bx-input-clear-button-hover-fg`          | Text/icon color of the `clear-button` part (hover state). Default `var(--bx-text-primary)`.                                                                        |
| `--bx-input-clear-button-focus-ring-width`  | Focus ring width of the `clear-button` part (focus state). Default `var(--bx-border-width-strong)`.                                                                |
| `--bx-input-clear-button-focus-ring-color`  | Focus ring color of the `clear-button` part (focus state). Default `var(--bx-focus-ring)`.                                                                         |
| `--bx-input-clear-button-focus-ring-offset` | Focus ring offset of the `clear-button` part (focus state). Default `var(--bx-focus-ring-offset)`.                                                                 |
| `--bx-input-hint-fg`                        | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                                                                                            |
| `--bx-input-hint-invalid-fg`                | Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.                                                                            |
| `--bx-input-clear-button-icon-size`         | Size (width and height) of the icon inside the `clear-button` element. Default `1em`.                                                                              |
| `--bx-input-font-family`                    | Font family of the root surface. Default `var(--bx-type-field-family)`.                                                                                            |
| `--bx-input-label-font-family`              | Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.                                                                     |
| `--bx-input-label-font-size`                | Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                                                                       |
| `--bx-input-label-font-weight`              | Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                                                                   |
| `--bx-input-label-line-height`              | Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                                                                  |
| `--bx-input-label-letter-spacing`           | Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                                                              |
| `--bx-input-font-family`                    | Font family of the root surface (text style `field-m`). Default `var(--bx-type-field-family)`.                                                                     |
| `--bx-input-font-size`                      | Font size of the root surface (text style `field-m`). Default `var(--bx-type-field-m-size)`.                                                                       |
| `--bx-input-font-weight`                    | Font weight of the root surface (text style `field-m`). Default `var(--bx-type-field-m-weight)`.                                                                   |
| `--bx-input-line-height`                    | Line height of the root surface (text style `field-m`). Default `var(--bx-type-field-m-leading)`.                                                                  |
| `--bx-input-letter-spacing`                 | Letter spacing of the root surface (text style `field-m`). Default `var(--bx-type-field-m-tracking)`.                                                              |
| `--bx-input-hint-font-family`               | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.                                                                        |
| `--bx-input-hint-font-size`                 | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                                                          |
| `--bx-input-hint-font-weight`               | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                                                      |
| `--bx-input-hint-line-height`               | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                                                     |
| `--bx-input-hint-letter-spacing`            | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                                                 |

### Methods

`focus()`, `select()`, `setSelectionRange()`, `setRangeText()`, `showPicker()`, `stepUp()`, `stepDown()`

## 3. Functional requirements

- **FR-INPUT-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-INPUT-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-INPUT-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-INPUT-04** Password toggle never persists the revealed value in attributes.
- **FR-INPUT-05** Maintains caret position on programmatic `value` updates.
- **FR-INPUT-06** Debounce helper attribute `debounce` (ms) for `input` events used by large-data filters.

## 4. Fluid scaling

Control height, padding, font and radius scale; font never below 16 px equivalent on touch devices (prevents iOS zoom).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Label position switches from inline (side) to stacked when the field container is < 28 fluid units (`label-position="auto"`).

## 6. Accessibility

- Label association via ARIA across shadow boundary (`ariaLabelledByElements` with fallback).
- Errors linked with `aria-describedby`; `aria-invalid` synced.
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

- [ ] All FR-INPUT-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds `debounce` and auto label-position.
- Open: confirm final property names against the custom-elements manifest during implementation.
