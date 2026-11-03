# `<bx-input-otp>`

> Segmented one-time-code entry with paste, autofill and auto-advance.

|                     |                            |
| ------------------- | -------------------------- |
| **Package**         | `@bixboards/core`          |
| **Category**        | Form                       |
| **Tag**             | `bx-input-otp`             |
| **Status**          | Proposed (not implemented) |
| **Form-associated** | Yes (ElementInternals)     |
| **Depends on**      | `input`                    |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Segmented one-time-code entry with paste, autofill and auto-advance. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                      | Default   | Description                           |
| ------------ | ------------------------- | --------- | ------------------------------------- |
| `length`     | number                    | 6         | Number of cells.                      |
| `value`      | string                    | ""        | -                                     |
| `type`       | numeric/alphanumeric/text | "numeric" | Allowed characters and keyboard hint. |
| `mask`       | boolean                   | false     | Hide entered characters.              |
| `group-size` | number                    | 0         | Visual grouping (e.g. 3 → 123 456).   |
| `label`      | string                    | ""        | -                                     |
| `invalid`    | boolean                   | false     | -                                     |
| `disabled`   | boolean                   | false     | -                                     |
| `required`   | boolean                   | false     | -                                     |
| `autofocus`  | boolean                   | false     | -                                     |

### Slots

| Name        | Description     |
| ----------- | --------------- |
| `label`     | -               |
| `hint`      | -               |
| `separator` | Between groups. |

### Events

| Event         | Detail / notes                   |
| ------------- | -------------------------------- |
| `input`       | Any cell changed.                |
| `change`      | Value committed.                 |
| `bx-complete` | All cells filled (detail.value). |

### CSS parts

| Part        | Description              |
| ----------- | ------------------------ |
| `group`     | A visual group of cells. |
| `cell`      | A single character cell. |
| `separator` | The separator part.      |

### CSS custom properties

| Property                          | Description                                                              |
| --------------------------------- | ------------------------------------------------------------------------ |
| `--bx-input-otp-cell-size`        | Cell width and height. Default `calc(var(--bx-unit) * 2.75)`.            |
| `--bx-input-otp-gap`              | Gap between cells.                                                       |
| `--bx-input-otp-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-input-otp-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-input-otp-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`focus()`, `blur()`, `clear()`, `checkValidity()`, `reportValidity()`

## 3. Functional requirements

- **FR-INPUTOTP-01** Implemented with one real hidden `<input autocomplete="one-time-code" inputmode>` so OS autofill and password managers work; cells are presentational.
- **FR-INPUTOTP-02** Paste distributes characters; Backspace moves back; arrows move between cells.
- **FR-INPUTOTP-03** Form-associated; `required` is satisfied only when all cells are filled.
- **FR-INPUTOTP-04** RTL keeps digit order left-to-right (`dir="ltr"` on the cell row).

## 4. Fluid scaling

Cell size from the control ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Cells shrink, then groups wrap, to fit.

## 6. Accessibility

- Single labelled input exposed to AT with `aria-label` "Verification code, N characters"; cells are `aria-hidden`; completion announced politely.
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

- [ ] All FR-INPUTOTP-* requirements covered by unit/component tests (`input-otp.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
