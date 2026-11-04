# `<bx-toggle-button>`

> Button with a persistent pressed state, standalone or inside a group.

|                     |                                 |
| ------------------- | ------------------------------- |
| **Package**         | `@bixboards/core`               |
| **Category**        | Actions                         |
| **Tag**             | `bx-toggle-button`              |
| **Status**          | Implemented                     |
| **Form-associated** | Yes (ElementInternals)          |
| **Depends on**      | `button`, _button-group_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Button with a persistent pressed state, standalone or inside a group. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                  | Default     | Description                             |
| ------------ | --------------------- | ----------- | --------------------------------------- |
| `pressed`    | boolean               | false       | Reflected; drives `aria-pressed`.       |
| `value`      | string                | ""          | Submitted value when pressed and named. |
| `name`       | string                | ""          | Form field name.                        |
| `variant`    | role palette          | "secondary" | -                                       |
| `appearance` | filled/outlined/plain | "outlined"  | -                                       |
| `size`       | s/m/l                 | "m"         | -                                       |
| `disabled`   | boolean               | false       | -                                       |

### Slots

| Name        | Description    |
| ----------- | -------------- |
| `(default)` | Label.         |
| `start`     | Leading icon.  |
| `end`       | Trailing icon. |

### Events

| Event    | Detail / notes                     |
| -------- | ---------------------------------- |
| `change` | Pressed state changed by the user. |
| `input`  | Same as change, fired first.       |

### CSS parts

| Part   | Description         |
| ------ | ------------------- |
| `base` | The button surface. |

### CSS custom properties

| Property                            | Description                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `--bx-toggle-button-pressed-bg`     | Background when pressed. Default role solid color.                          |
| `--bx-toggle-button-pressed-fg`     | Foreground when pressed. Default role on-solid color.                       |
| `--bx-toggle-button-bg`             | Background when not pressed. Default derived from `appearance`.             |
| `--bx-toggle-button-gap`            | Gap between slots. Default `var(--bx-space-2xs)`.                           |
| `--bx-toggle-button-font-family`    | Font family of the root surface. Default `var(--bx-type-body-family)`.      |
| `--bx-toggle-button-font-size`      | Font size of the root surface. Default `var(--bx-type-body-size)`.          |
| `--bx-toggle-button-font-weight`    | Font weight of the root surface. Default `var(--bx-type-body-weight)`.      |
| `--bx-toggle-button-line-height`    | Line height of the root surface. Default `var(--bx-type-body-leading)`.     |
| `--bx-toggle-button-letter-spacing` | Letter spacing of the root surface. Default `var(--bx-type-body-tracking)`. |

### Methods

`focus()`, `blur()`, `click()`

## 3. Functional requirements

- **FR-TOGGLEBUTTON-01** Form-associated: submits `name=value` only while pressed.
- **FR-TOGGLEBUTTON-02** Inside `bx-button-group` with `selection="single|multiple"`, the group manages exclusivity.
- **FR-TOGGLEBUTTON-03** Pressed state is distinguishable without color (filled surface plus check or weight change).

## 4. Fluid scaling

Same ramp as `bx-button`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- `role="button"` with `aria-pressed`; Space/Enter toggle.
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

- [ ] All FR-TOGGLEBUTTON-* requirements covered by unit/component tests (`toggle-button.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
