# `<bx-radio-group>`

> Manages a set of radios: single value, roving tabindex, validation.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-radio-group`       |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Manages a set of radios: single value, roving tabindex, validation. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name          | Type                   | Default    | Description |
| ------------- | ---------------------- | ---------- | ----------- |
| `label`       | string                 | ""         | -           |
| `hint`        | string                 | ""         | -           |
| `name`        | string                 | ""         | -           |
| `value`       | string                 | ""         | -           |
| `orientation` | horizontal \| vertical | "vertical" | -           |
| `size`        | s/m/l                  | "medium"   | -           |
| `required`    | boolean                | false      | -           |
| `disabled`    | boolean                | false      | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |
| `label`     | -           |
| `hint`      | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

| Part           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `form-control` | The outer wrapper (label + radio-group + hint).          |
| `label`        | The label element.                                       |
| `hint`         | The wrapper around the hint slot.                        |
| `radio-group`  | The `role="radiogroup"` wrapper around the default slot. |

### CSS custom properties

| Property                                | Description                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--bx-radio-group-gap`                  | Gap of the root surface. Default `var(--bx-space-s)`.                                                 |
| `--bx-radio-group-hint-fg`              | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                               |
| `--bx-radio-group-hint-invalid-fg`      | Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.               |
| `--bx-radio-group-font-family`          | Font family of the root surface. Default `var(--bx-type-body-family)`.                                |
| `--bx-radio-group-label-font-family`    | Font family of the `label` part (text style `label-m`). Default `var(--bx-type-label-family)`.        |
| `--bx-radio-group-label-font-size`      | Font size of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-size)`.          |
| `--bx-radio-group-label-font-weight`    | Font weight of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-weight)`.      |
| `--bx-radio-group-label-line-height`    | Line height of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-leading)`.     |
| `--bx-radio-group-label-letter-spacing` | Letter spacing of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-tracking)`. |
| `--bx-radio-group-hint-font-family`     | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.           |
| `--bx-radio-group-hint-font-size`       | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.             |
| `--bx-radio-group-hint-font-weight`     | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.         |
| `--bx-radio-group-hint-line-height`     | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.        |
| `--bx-radio-group-hint-letter-spacing`  | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.    |

### Methods

`focus()`

## 3. Functional requirements

- **FR-RADIO-GROUP-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-RADIO-GROUP-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-RADIO-GROUP-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-RADIO-GROUP-04** Arrow keys move and select; Home/End supported; skips disabled.
- **FR-RADIO-GROUP-05** Button-style radios render as a segmented control sharing borders.

## 4. Fluid scaling

Gap scales.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Horizontal layout wraps or stacks when container is narrow.

## 6. Accessibility

- `role="radiogroup"` with label; group-level `aria-required` and error.
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

- [ ] All FR-RADIO-GROUP-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
