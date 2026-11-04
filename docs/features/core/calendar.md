# `<bx-calendar>`

> Month grid for navigating and picking a date, range or multiple dates.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Form              |
| **Tag**             | `bx-calendar`     |
| **Status**          | Implemented       |
| **Form-associated** | No                |
| **Depends on**      | `button`          |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Month grid for navigating and picking a date, range or multiple dates. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name                | Type                       | Default  | Description                    |
| ------------------- | -------------------------- | -------- | ------------------------------ |
| `mode`              | single/range/multiple      | "single" | -                              |
| `value`             | string/string[]            | ""       | ISO date(s).                   |
| `min`               | string                     | ""       | -                              |
| `max`               | string                     | ""       | -                              |
| `locale`            | string                     | ""       | Defaults to document language. |
| `first-day-of-week` | 0-6                        | locale   | -                              |
| `disabled-dates`    | (date)=>boolean (property) | -        | -                              |
| `month`             | string                     | today    | Visible month (`YYYY-MM`).     |
| `months`            | number                     | 1        | Months shown side by side.     |
| `show-week-numbers` | boolean                    | false    | -                              |
| `events`            | Map (property)             | -        | Optional per-day indicators.   |

### Slots

| Name     | Description               |
| -------- | ------------------------- |
| `day`    | Custom day cell template. |
| `header` | -                         |

### Events

| Event             | Detail / notes                    |
| ----------------- | --------------------------------- |
| `change`          | Selection changed (detail.value). |
| `bx-month-change` | Visible month changed.            |
| `bx-day-hover`    | detail.date.                      |

### CSS parts

| Part         | Description     |
| ------------ | --------------- |
| `header`     | Month/year row. |
| `grid`       | Day grid.       |
| `weekday`    | Column heading. |
| `day`        | A day cell.     |
| `nav-button` | Prev/next.      |

### CSS custom properties

| Property                        | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `--bx-calendar-day-size`        | Day cell size. Default `var(--bx-target-min)`. |
| `--bx-calendar-day-bg-selected` | Selected day background.                       |
| `--bx-calendar-range-bg`        | In-range band.                                 |

### Methods

`focus()`, `goToMonth(month)`, `today()`

## 3. Functional requirements

- **FR-CALENDAR-01** Locale and calendar system come from `Intl`; no date library dependency.
- **FR-CALENDAR-02** Dates are plain ISO strings in the API; no timezone shifting.
- **FR-CALENDAR-03** Range mode previews the range on hover and keyboard.
- **FR-CALENDAR-04** Disabled days remain focusable-skipped but announced as unavailable.

## 4. Fluid scaling

Day size from the target-size tokens.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Multiple months stack when the container is narrow.

## 6. Accessibility

- ARIA grid pattern; arrows move by day, PageUp/PageDown by month, Shift+PageUp/Down by year, Home/End by week; selected and today exposed textually.
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

- [ ] All FR-CALENDAR-* requirements covered by unit/component tests (`calendar.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
