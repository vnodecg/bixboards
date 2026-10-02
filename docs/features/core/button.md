# `<bx-button>`

> Triggers an action or navigates. Supports variants, appearances, sizes, loading state, link mode and form submission.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Actions        |
| **Tag**             | `bx-button`    |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Triggers an action or navigates. Supports variants, appearances, sizes, loading state, link mode and form submission. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name           | Type                                                               | Default   | Description                                      |
| -------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------ |
| `variant`      | "default" \| "secondary" \| "tertiary" \| "error" \| "warning"     | "default" | Semantic color role                              |
| `appearance`   | "accent" \| "filled" \| "outlined" \| "plain" \| "filled outlined" | "accent"  | Visual emphasis                                  |
| `size`         | "small" \| "medium" \| "large"                                     | "medium"  | Maps to a fluid size step, not fixed px          |
| `pill`         | boolean                                                            | false     | Fully rounded ends                               |
| `loading`      | boolean                                                            | false     | Shows spinner, sets aria-busy, blocks activation |
| `disabled`     | boolean                                                            | false     | Blocks activation and removes from tab order     |
| `href`         | string                                                             | ""        | Renders an inner <a>; with target/rel/download   |
| `type`         | "button" \| "submit" \| "reset"                                    | "button"  | Form behavior (form-associated)                  |
| `name / value` | string                                                             | ""        | Submitted with form when type=submit             |
| `form`         | string                                                             | ""        | Associate with a form by id                      |
| `with-caret`   | boolean                                                            | false     | Adds dropdown caret                              |

### Slots

| Slot        | Description           |
| ----------- | --------------------- |
| `(default)` | Label                 |
| `start`     | Leading icon/content  |
| `end`       | Trailing icon/content |

### Events

| Event          | Detail / notes                                            |
| -------------- | --------------------------------------------------------- |
| `click`        | Native; suppressed when disabled/loading                  |
| `focus / blur` | Re-dispatched from inner control                          |
| `bx-invalid`   | Fired on failed constraint validation when used as submit |

### CSS parts

| Part      | Description                                           |
| --------- | ----------------------------------------------------- |
| `base`    | The inner `<button>`/`<a>`.                           |
| `start`   | The wrapper around the start slot.                    |
| `label`   | The wrapper around the default slot.                  |
| `end`     | The wrapper around the end slot.                      |
| `caret`   | The dropdown caret, present when `with-caret` is set. |
| `spinner` | The loading spinner, present when `loading`.          |

### CSS custom properties

| Property                              | Description                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--bx-button-bg`                      | Background color. Defaults to a role/appearance combination.                                          |
| `--bx-button-fg`                      | Text/icon color. Defaults to a role/appearance combination.                                           |
| `--bx-button-border`                  | Border color. Defaults to a role/appearance combination.                                              |
| `--bx-button-min-height`              | Control height. Default derived from `size`.                                                          |
| `--bx-button-padding-inline`          | Horizontal padding. Default derived from `size`.                                                      |
| `--bx-button-radius`                  | Corner radius (any `border-radius` value). Used by `bx-button-group` to square inner corners.         |
| `--bx-button-truncate`                | Label `white-space` value; set to `nowrap` to truncate.                                               |
| `--bx-button-gap`                     | Gap of the root surface. Default `var(--bx-space-2xs)`.                                               |
| `--bx-button-border-width`            | Border width of the root surface. Default `var(--bx-border-width)`.                                   |
| `--bx-button-basenot-disabled-shadow` | Box shadow of the `basenot` element (disabled state). Default `var(--bx-shadow-s)`.                   |
| `--bx-button-focus-ring-width`        | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.          |
| `--bx-button-focus-ring-color`        | Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.                   |
| `--bx-button-focus-ring-offset`       | Focus ring offset of the root surface (focus state). Default `var(--bx-focus-ring-offset)`.           |
| `--bx-button-disabled-opacity`        | Opacity of the root surface (disabled state). Default `0.5`.                                          |
| `--bx-button-spinner-font-size`       | Font size of the `spinner` part. Default `1.1em`.                                                     |
| `--bx-button-icon-size`               | Size (width and height) of the start, end and caret icons. Default `1em`.                             |
| `--bx-button-font-family`             | Font family of the root surface. Default `var(--bx-type-body-family)`.                                |
| `--bx-button-font-family`             | Font family of the root surface (text style `label-m`). Default `var(--bx-type-label-family)`.        |
| `--bx-button-font-size`               | Font size of the root surface (text style `label-m`). Default `var(--bx-type-label-m-size)`.          |
| `--bx-button-font-weight`             | Font weight of the root surface (text style `label-m`). Default `var(--bx-type-label-m-weight)`.      |
| `--bx-button-line-height`             | Line height of the root surface (text style `label-m`). Default `var(--bx-type-label-m-leading)`.     |
| `--bx-button-letter-spacing`          | Letter spacing of the root surface (text style `label-m`). Default `var(--bx-type-label-m-tracking)`. |

### Methods

`click()`, `focus()`, `blur()`

## 3. Functional requirements

- **FR-BUTTON-01** Submit/reset buttons act on the associated form via ElementInternals (no light-DOM proxy button).
- **FR-BUTTON-02** Link mode renders `<a>` and supports Ctrl/Cmd-click, middle-click and `download`.
- **FR-BUTTON-03** Loading keeps width stable (label hidden, not removed) to avoid layout shift.
- **FR-BUTTON-04** Icon-only usage requires an accessible name; dev-mode warning if absent.
- **FR-BUTTON-05** Long labels truncate with ellipsis when `--bx-button-truncate` is set, otherwise wrap.
- **FR-BUTTON-06** `disabled` must not swallow events silently in a way that breaks tooltips (see `bx-tooltip` disabled-trigger pattern).

## 4. Fluid scaling

Height, inline padding, font-size, icon size and radius derive from the size step × `--bx-scale`. Touch target never falls below 44 CSS px at any scale (enforced via `min-block-size` floor).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Inside a `bx-button-group` or toolbar, labels may collapse to icon-only when the container is narrower than `--bx-button-collapse-at` (opt-in `collapse` attribute).

## 6. Accessibility

- Native button/anchor semantics; Space/Enter activation.
- `aria-busy` and `aria-disabled` reflect state; disabled links get `role="link" aria-disabled`.
- Focus ring uses `:focus-visible`, meets 3:1 contrast.
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

- [ ] All FR-BUTTON-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds opt-in responsive `collapse` for icon-only reflow.
- Open: confirm final property names against the custom-elements manifest during implementation.
