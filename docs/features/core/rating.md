# `<bx-rating>`

> Star-style rating input/display with fractional precision.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-rating`            |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Star-style rating input/display with fractional precision. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name        | Type            | Default  | Description   |
| ----------- | --------------- | -------- | ------------- |
| `label`     | string          | ""       | -             |
| `value`     | number          | 0        | -             |
| `max`       | number          | 5        | -             |
| `precision` | number          | 1        | -             |
| `readonly`  | boolean         | false    | -             |
| `disabled`  | boolean         | false    | -             |
| `size`      | s/m/l           | "medium" | -             |
| `getSymbol` | (value)=>string | star     | Custom symbol |

### Slots

_None._

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |
| `bx-hover`     | detail.phase, detail.value                |

### CSS parts

| Part             | Description                              |
| ---------------- | ---------------------------------------- |
| `base`           | The outer interactive region.            |
| `symbol`         | A single track (dim) symbol.             |
| `symbol-partial` | The clipped overlay row of "on" symbols. |

### CSS custom properties

| Property                              | Description                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `--bx-rating-symbol-color`            | Track (unfilled) symbol color. Default `--bx-border-strong`.                                 |
| `--bx-rating-symbol-color-active`     | Filled symbol color. Default `--bx-role-accent`.                                             |
| `--bx-rating-symbol-spacing`          | Gap between symbols. Default `--bx-space-2xs`.                                               |
| `--bx-rating-min-height`              | Minimum height of the root surface. Default `var(--bx-target-min)`.                          |
| `--bx-rating-focus-ring-width`        | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-rating-focus-ring-color`        | Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-rating-focus-ring-offset`       | Focus ring offset of the root surface (focus state). Default `var(--bx-focus-ring-offset)`.  |
| `--bx-rating-symbol-line-height`      | Line height of the `symbol` part. Default `1`.                                               |
| `--bx-rating-symbol-disabled-opacity` | Opacity of the `symbol` part (disabled state). Default `0.5`.                                |
| `--bx-rating-symbol-size`             | Symbol size (width and height). Default `calc(var(--bx-unit) * 1.5)`, or per `size`.         |
| `--bx-rating-font-family`             | Font family of the root surface. Default `var(--bx-type-body-family)`.                       |

### Methods

`focus()`, `blur()`

## 3. Functional requirements

- **FR-RATING-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-RATING-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-RATING-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-RATING-04** Hover preview without re-rendering all symbols (CSS clip).
- **FR-RATING-05** RTL fills right-to-left.

## 4. Fluid scaling

Symbol size follows type scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Symbols shrink before wrapping.

## 6. Accessibility

- `role="slider"`; arrow keys change value; localized valuetext.
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

- [ ] All FR-RATING-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
