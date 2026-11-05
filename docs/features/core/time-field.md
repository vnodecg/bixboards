# `<bx-time-field>`

> Segmented time entry (hours, minutes, optional seconds, AM/PM) with locale-aware 12/24h.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-time-field`        |
| **Status**          | Implemented            |
| **Form-associated** | Yes (ElementInternals) |
| **Depends on**      | _date-picker_ (soft)   |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Segmented time entry (hours, minutes, optional seconds, AM/PM) with locale-aware 12/24h. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type               | Default  | Description              |
| ------------- | ------------------ | -------- | ------------------------ |
| `label`       | string             | ""       | -                        |
| `value`       | string             | ""       | `HH:mm[:ss]`.            |
| `hour-cycle`  | h12/h23/auto       | "auto"   | -                        |
| `granularity` | hour/minute/second | "minute" | -                        |
| `min`         | string             | ""       | -                        |
| `max`         | string             | ""       | -                        |
| `step`        | number             | 1        | Minutes step for arrows. |
| `required`    | boolean            | false    | -                        |
| `disabled`    | boolean            | false    | -                        |
| `size`        | s/m/l              | "m"      | -                        |

### Slots

| Name    | Description |
| ------- | ----------- |
| `label` | -           |
| `hint`  | -           |

### Events

| Event        | Detail / notes |
| ------------ | -------------- |
| `input`      | -              |
| `change`     | -              |
| `bx-invalid` | -              |

### CSS parts

| Part           | Description            |
| -------------- | ---------------------- |
| `form-control` | The form-control part. |
| `segment`      | One editable segment.  |

### CSS custom properties

| Property                               | Description                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--bx-time-field-bg`                   | Field background.                                                                                        |
| `--bx-time-field-border-color`         | Field border color.                                                                                      |
| `--bx-time-field-radius`               | Field radius.                                                                                            |
| `--bx-time-field-font-family`          | Font family of the root surface. Default `var(--bx-type-field-family)`.                                  |
| `--bx-time-field-font-size`            | Font size of the root surface. Default `var(--bx-type-field-size)`.                                      |
| `--bx-time-field-font-weight`          | Font weight of the root surface. Default `var(--bx-type-field-weight)`.                                  |
| `--bx-time-field-line-height`          | Line height of the root surface. Default `var(--bx-type-field-leading)`.                                 |
| `--bx-time-field-letter-spacing`       | Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.                             |
| `--bx-time-field-hint-font-family`     | Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.        |
| `--bx-time-field-hint-font-size`       | Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.          |
| `--bx-time-field-hint-font-weight`     | Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.      |
| `--bx-time-field-hint-line-height`     | Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.     |
| `--bx-time-field-hint-letter-spacing`  | Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`. |
| `--bx-time-field-label-font-family`    | Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.           |
| `--bx-time-field-label-font-size`      | Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.             |
| `--bx-time-field-label-font-weight`    | Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.         |
| `--bx-time-field-label-line-height`    | Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.        |
| `--bx-time-field-label-letter-spacing` | Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.    |

### Methods

`focus()`, `blur()`, `checkValidity()`, `reportValidity()`

## 3. Functional requirements

- **FR-TIMEFIELD-01** Form-associated; value is always 24h `HH:mm[:ss]`.
- **FR-TIMEFIELD-02** Segments accept typing with auto-advance; ArrowUp/Down increments with wrap.
- **FR-TIMEFIELD-03** Segment order and separators come from `Intl.DateTimeFormat.formatToParts`.

## 4. Fluid scaling

As `bx-input`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- Group of spinbutton segments, each with `aria-label`, `aria-valuenow`, `aria-valuetext`.
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

- [ ] All FR-TIMEFIELD-* requirements covered by unit/component tests (`time-field.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
