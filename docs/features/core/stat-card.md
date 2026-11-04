# `<bx-stat-card>`

> KPI tile with label, value, delta trend and optional sparkline.

|                     |                                                         |
| ------------------- | ------------------------------------------------------- |
| **Package**         | `@bixboards/core`                                       |
| **Category**        | Display                                                 |
| **Tag**             | `bx-stat-card`                                          |
| **Status**          | Implemented                                             |
| **Form-associated** | No                                                      |
| **Depends on**      | `card`, `format-number`, `skeleton`, _sparkline_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

KPI tile with label, value, delta trend and optional sparkline. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name            | Type                      | Default   | Description                           |
| --------------- | ------------------------- | --------- | ------------------------------------- |
| `label`         | string                    | ""        | -                                     |
| `value`         | string/number             | ""        | -                                     |
| `format`        | Intl.NumberFormat options | -         | Applied to numeric `value`.           |
| `delta`         | number                    | -         | Change since the previous period.     |
| `delta-format`  | percent/absolute          | "percent" | -                                     |
| `trend`         | up/down/flat              | derived   | -                                     |
| `trend-is-good` | up/down                   | "up"      | Inverts color semantics (e.g. churn). |
| `loading`       | boolean                   | false     | Skeleton state.                       |
| `href`          | string                    | ""        | Makes the card a link.                |

### Slots

| Name     | Description               |
| -------- | ------------------------- |
| `icon`   | -                         |
| `chart`  | Typically `bx-sparkline`. |
| `footer` | Period caption.           |

### Events

| Event   | Detail / notes            |
| ------- | ------------------------- |
| `click` | When `href` or clickable. |

### CSS parts

| Part    | Description     |
| ------- | --------------- |
| `base`  | The base part.  |
| `label` | The label part. |
| `value` | The value part. |
| `delta` | The delta part. |
| `chart` | The chart part. |

### CSS custom properties

| Property                          | Description                         |
| --------------------------------- | ----------------------------------- |
| `--bx-stat-card-value-font-size`  | Value font size.                    |
| `--bx-stat-card-delta-color-good` | Delta color when the trend is good. |
| `--bx-stat-card-delta-color-bad`  | Delta color when the trend is bad.  |

### Methods

_None._

## 3. Functional requirements

- **FR-STATCARD-01** Composes `bx-card`; value uses `bx-format-number`.
- **FR-STATCARD-02** Delta direction is shown with an arrow and sign, not color alone.
- **FR-STATCARD-03** Value animates (count-up) only when motion is allowed and the card enters view.

## 4. Fluid scaling

Value size from the type ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Chart slot moves below the value when narrow.

## 6. Accessibility

- Label/value association via `aria-labelledby`; delta text includes direction ("up 12%") for AT.
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

- [ ] All FR-STATCARD-* requirements covered by unit/component tests (`stat-card.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
