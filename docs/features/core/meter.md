# `<bx-meter>`

> Scalar measurement within a known range (disk usage, score) with low/high/optimum bands.

|                     |                            |
| ------------------- | -------------------------- |
| **Package**         | `@bixboards/core`          |
| **Category**        | Feedback                   |
| **Tag**             | `bx-meter`                 |
| **Status**          | Proposed (not implemented) |
| **Form-associated** | No                         |
| **Depends on**      | _progress-bar_ (soft)      |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Scalar measurement within a known range (disk usage, score) with low/high/optimum bands. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                      | Default | Description                   |
| ------------ | ------------------------- | ------- | ----------------------------- |
| `value`      | number                    | 0       | -                             |
| `min`        | number                    | 0       | -                             |
| `max`        | number                    | 100     | -                             |
| `low`        | number                    | -       | Upper bound of the low band.  |
| `high`       | number                    | -       | Lower bound of the high band. |
| `optimum`    | number                    | -       | Preferred value.              |
| `label`      | string                    | ""      | -                             |
| `show-value` | boolean                   | false   | -                             |
| `size`       | s/m/l                     | "m"     | -                             |
| `format`     | Intl.NumberFormat options | -       | Value text.                   |

### Slots

| Name        | Description    |
| ----------- | -------------- |
| `(default)` | Overlay label. |

### Events

_None._

### CSS parts

| Part    | Description     |
| ------- | --------------- |
| `base`  | Track.          |
| `fill`  | Value bar.      |
| `label` | The label part. |

### CSS custom properties

| Property                  | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `--bx-meter-height`       | Track height.                                      |
| `--bx-meter-fill-good`    | Color in the optimum band.                         |
| `--bx-meter-fill-warning` | Color in the middle band.                          |
| `--bx-meter-fill-bad`     | Color in the worst band.                           |
| `--bx-meter-font-family`  | Font family. Default `var(--bx-font-family-sans)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-METER-01** Band semantics match native `<meter>`; use `bx-progress-bar` for task progress.
- **FR-METER-02** Band is communicated by text/icon as well as color.
- **FR-METER-03** Values are clamped to `min`/`max`.

## 4. Fluid scaling

Track height from the space ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Label wraps beneath the bar when narrow.

## 6. Accessibility

- `role="meter"` with `aria-valuemin/max/now` and `aria-valuetext`.
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

- [ ] All FR-METER-* requirements covered by unit/component tests (`meter.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
