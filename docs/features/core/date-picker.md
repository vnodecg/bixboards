# `<bx-date-picker>`

> Date (or date range) field with typed entry and a `bx-calendar` popup.

|                     |                              |
| ------------------- | ---------------------------- |
| **Package**         | `@bixboards/core`            |
| **Category**        | Form                         |
| **Tag**             | `bx-date-picker`             |
| **Status**          | Implemented                  |
| **Form-associated** | Yes (ElementInternals)       |
| **Depends on**      | `calendar`, `popup`, `input` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Date (or date range) field with typed entry and a `bx-calendar` popup. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type         | Default      | Description                        |
| ------------- | ------------ | ------------ | ---------------------------------- |
| `label`       | string       | ""           | -                                  |
| `value`       | string       | ""           | ISO date or `start/end` for range. |
| `range`       | boolean      | false        | -                                  |
| `min`         | string       | ""           | -                                  |
| `max`         | string       | ""           | -                                  |
| `format`      | Intl options | locale short | Display format.                    |
| `placeholder` | string       | ""           | -                                  |
| `required`    | boolean      | false        | -                                  |
| `disabled`    | boolean      | false        | -                                  |
| `open`        | boolean      | false        | -                                  |
| `size`        | s/m/l        | "m"          | -                                  |
| `clearable`   | boolean      | false        | -                                  |

### Slots

| Name              | Description                |
| ----------------- | -------------------------- |
| `label`           | -                          |
| `hint`            | -                          |
| `calendar-footer` | Presets row, e.g. "Today". |

### Events

| Event               | Detail / notes   |
| ------------------- | ---------------- |
| `input`             | -                |
| `change`            | -                |
| `bx-show / bx-hide` | Popup lifecycle. |
| `bx-invalid`        | -                |

### CSS parts

| Part           | Description            |
| -------------- | ---------------------- |
| `form-control` | The form-control part. |
| `input`        | The text input.        |
| `trigger`      | The calendar button.   |
| `calendar`     | The `bx-calendar`.     |

### CSS custom properties

| Property                                | Description                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--bx-date-picker-bg`                   | Field background.                                                                                        |
| `--bx-date-picker-border-color`         | Field border color.                                                                                      |
| `--bx-date-picker-radius`               | Field radius.                                                                                            |
| `--bx-date-picker-font-family`          | Font family of the root surface. Default `var(--bx-type-field-family)`.                                  |
| `--bx-date-picker-font-size`            | Font size of the root surface. Default `var(--bx-type-field-size)`.                                      |
| `--bx-date-picker-font-weight`          | Font weight of the root surface. Default `var(--bx-type-field-weight)`.                                  |
| `--bx-date-picker-line-height`          | Line height of the root surface. Default `var(--bx-type-field-leading)`.                                 |
| `--bx-date-picker-letter-spacing`       | Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.                             |
| `--bx-date-picker-hint-font-family`     | Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.        |
| `--bx-date-picker-hint-font-size`       | Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.          |
| `--bx-date-picker-hint-font-weight`     | Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.      |
| `--bx-date-picker-hint-line-height`     | Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.     |
| `--bx-date-picker-hint-letter-spacing`  | Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`. |
| `--bx-date-picker-label-font-family`    | Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.           |
| `--bx-date-picker-label-font-size`      | Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.             |
| `--bx-date-picker-label-font-weight`    | Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.         |
| `--bx-date-picker-label-line-height`    | Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.        |
| `--bx-date-picker-label-letter-spacing` | Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.    |

### Methods

`focus()`, `show()`, `hide()`, `checkValidity()`, `reportValidity()`, `setCustomValidity()`

## 3. Functional requirements

- **FR-DATEPICKER-01** Form-associated; submits ISO value.
- **FR-DATEPICKER-02** Typed entry is segmented (day/month/year order from locale) and tolerant of paste.
- **FR-DATEPICKER-03** Invalid or out-of-range typed values set validity, never silently correct.
- **FR-DATEPICKER-04** Mobile: uses the same popup (no native picker) for consistency; opt-in `native` attribute defers to `<input type="date">`.

## 4. Fluid scaling

Same as `bx-input`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Popup becomes a full-width sheet in narrow containers.

## 6. Accessibility

- Input group with labelled segments; button opens a dialog containing the calendar; focus returns to the trigger on close.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; ships a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed component wrapper exposing props and callback events, and `bind:value`.

## 9. Acceptance criteria

- [ ] All FR-DATEPICKER-* requirements covered by unit/component tests (`date-picker.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
