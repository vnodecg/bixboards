# `<bx-segmented-control>`

> Compact single-choice control rendered as connected segments with a sliding indicator.

|                     |                                  |
| ------------------- | -------------------------------- |
| **Package**         | `@bixboards/core`                |
| **Category**        | Form                             |
| **Tag**             | `bx-segmented-control`           |
| **Status**          | Implemented                      |
| **Form-associated** | Yes (ElementInternals)           |
| **Depends on**      | `radio-group`, `resize-observer` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Compact single-choice control rendered as connected segments with a sliding indicator. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type    | Default | Description                   |
| ------------ | ------- | ------- | ----------------------------- |
| `label`      | string  | ""      | -                             |
| `value`      | string  | ""      | Selected segment value.       |
| `name`       | string  | ""      | -                             |
| `size`       | s/m/l   | "m"     | -                             |
| `full-width` | boolean | false   | Segments share width equally. |
| `disabled`   | boolean | false   | -                             |
| `required`   | boolean | false   | -                             |

### Slots

| Name        | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `(default)` | `bx-segment` children (value, label, optional icon, disabled). |

### Events

| Event    | Detail / notes |
| -------- | -------------- |
| `input`  | -              |
| `change` | detail.value.  |

### CSS parts

| Part        | Description    |
| ----------- | -------------- |
| `base`      | Track.         |
| `indicator` | Sliding thumb. |
| `segment`   | A segment.     |

### CSS custom properties

| Property                                    | Description                             |
| ------------------------------------------- | --------------------------------------- |
| `--bx-segmented-control-bg`                 | Track background.                       |
| `--bx-segmented-control-indicator-bg`       | Thumb color.                            |
| `--bx-segmented-control-indicator-duration` | Slide duration; 0 under reduced motion. |

### Methods

`focus()`, `blur()`

## 3. Functional requirements

- **FR-SEGMENTEDCONTROL-01** Semantically a radio group (`role="radiogroup"` + radios) with roving tabindex; arrows move and select.
- **FR-SEGMENTEDCONTROL-02** Indicator animates with transform only; position recomputed through the shared ResizeObserver.
- **FR-SEGMENTEDCONTROL-03** Ships `bx-segment` as its child element (registered together).

## 4. Fluid scaling

Height from the control ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Falls back to icon-only segments when labels cannot fit.

## 6. Accessibility

- Radio group pattern; selected state not conveyed by color alone.
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

- [ ] All FR-SEGMENTEDCONTROL-* requirements covered by unit/component tests (`segmented-control.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
