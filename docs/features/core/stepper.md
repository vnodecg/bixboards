# `<bx-stepper>`

> Multi-step progress indicator and wizard navigation, horizontal or vertical.

|                     |                    |
| ------------------- | ------------------ |
| **Package**         | `@bixboards/core`  |
| **Category**        | Feedback           |
| **Tag**             | `bx-stepper`       |
| **Status**          | Implemented        |
| **Form-associated** | No                 |
| **Depends on**      | _tab-group_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Multi-step progress indicator and wizard navigation, horizontal or vertical. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type                | Default      | Description                |
| ------------- | ------------------- | ------------ | -------------------------- |
| `current`     | number              | 0            | Active step index.         |
| `orientation` | horizontal/vertical | "horizontal" | -                          |
| `linear`      | boolean             | false        | Block jumping ahead.       |
| `clickable`   | boolean             | true         | Completed steps navigable. |
| `size`        | s/m/l               | "m"          | -                          |

### Slots

| Name        | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `(default)` | `bx-step` children (label, description, status: complete/current/upcoming/error/skipped). |

### Events

| Event            | Detail / notes                      |
| ---------------- | ----------------------------------- |
| `bx-step-change` | Cancelable; detail.from, detail.to. |

### CSS parts

| Part      | Description                       |
| --------- | --------------------------------- |
| `base`    | The base part.                    |
| `summary` | The collapsed "Step N of M" text. |

### CSS custom properties

| Property                                  | Description                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `--bx-stepper-indicator-size`             | Indicator size.                                                                                                 |
| `--bx-stepper-connector-color`            | Line color.                                                                                                     |
| `--bx-stepper-connector-color-complete`   | Completed line color.                                                                                           |
| `--bx-stepper-summary-font-family`        | Font family of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.            |
| `--bx-stepper-summary-font-size`          | Font size of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.              |
| `--bx-stepper-summary-font-weight`        | Font weight of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.          |
| `--bx-stepper-summary-line-height`        | Line height of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.         |
| `--bx-stepper-summary-letter-spacing`     | Letter spacing of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.     |
| `--bx-stepper-font-family`                | Font family of the item text. Default `var(--bx-type-label-family)`.                                            |
| `--bx-stepper-indicator-font-family`      | Font family of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-family)`.              |
| `--bx-stepper-indicator-font-size`        | Font size of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-size)`.                |
| `--bx-stepper-indicator-font-weight`      | Font weight of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-weight)`.            |
| `--bx-stepper-indicator-line-height`      | Line height of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-leading)`.           |
| `--bx-stepper-indicator-letter-spacing`   | Letter spacing of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.       |
| `--bx-stepper-font-family`                | Font family of the item text (text style `label-m`). Default `var(--bx-type-label-family)`.                     |
| `--bx-stepper-font-size`                  | Font size of the item text (text style `label-m`). Default `var(--bx-type-label-m-size)`.                       |
| `--bx-stepper-font-weight`                | Font weight of the item text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.                   |
| `--bx-stepper-line-height`                | Line height of the item text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.                  |
| `--bx-stepper-letter-spacing`             | Letter spacing of the item text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.              |
| `--bx-stepper-description-font-family`    | Font family of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.        |
| `--bx-stepper-description-font-size`      | Font size of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.          |
| `--bx-stepper-description-font-weight`    | Font weight of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.      |
| `--bx-stepper-description-line-height`    | Line height of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.     |
| `--bx-stepper-description-letter-spacing` | Letter spacing of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`. |
| `--bx-stepper-focus-ring-width`           | Focus ring width of the steps (focus state). Default `var(--bx-border-width-strong)`.                           |
| `--bx-stepper-focus-ring-color`           | Focus ring color of the steps (focus state). Default `var(--bx-focus-ring)`.                                    |

### Methods

`next()`, `previous()`, `goTo(index)`

## 3. Functional requirements

- **FR-STEPPER-01** Navigation only: it does not own the step content (pair with `bx-tab-panel` or app routing).
- **FR-STEPPER-02** Collapses to "Step 2 of 5" when the container is too narrow.
- **FR-STEPPER-03** Status is conveyed by glyph and text, not color alone.

## 4. Fluid scaling

Indicator size from the control ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Horizontal to compact summary via container query.

## 6. Accessibility

- `<ol>` list with `aria-current="step"`; clickable steps are buttons; state announced in the accessible name.
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
- Angular: standalone directive/component wrapper with `@Input`/`@Output`.
- Svelte: typed component wrapper exposing props and callback events.

## 9. Acceptance criteria

- [ ] All FR-STEPPER-* requirements covered by unit/component tests (`stepper.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
