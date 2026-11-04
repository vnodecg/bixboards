# `<bx-timeline>`

> Chronological list of events with markers, connectors and alternating or one-sided layout.

|                     |                                        |
| ------------------- | -------------------------------------- |
| **Package**         | `@bixboards/core`                      |
| **Category**        | Display                                |
| **Tag**             | `bx-timeline`                          |
| **Status**          | Implemented                            |
| **Form-associated** | No                                     |
| **Depends on**      | `relative-time`, `format-date`, `icon` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Chronological list of events with markers, connectors and alternating or one-sided layout. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type                | Default    | Description |
| ------------- | ------------------- | ---------- | ----------- |
| `layout`      | start/alternate     | "start"    | -           |
| `orientation` | vertical/horizontal | "vertical" | -           |
| `size`        | s/m/l               | "m"        | -           |

### Slots

| Name        | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| `(default)` | `bx-timeline-item` children (time, title, description, status, icon). |

### Events

_None._

### CSS parts

| Part   | Description    |
| ------ | -------------- |
| `base` | The base part. |

### CSS custom properties

| Property                                   | Description                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `--bx-timeline-marker-size`                | Marker size.                                                                                              |
| `--bx-timeline-connector-color`            | Line color.                                                                                               |
| `--bx-timeline-font-family`                | Font family of the item text. Default `var(--bx-type-body-family)`.                                       |
| `--bx-timeline-time-font-family`           | Font family of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.         |
| `--bx-timeline-time-font-size`             | Font size of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.           |
| `--bx-timeline-time-font-weight`           | Font weight of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.       |
| `--bx-timeline-time-line-height`           | Line height of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.      |
| `--bx-timeline-time-letter-spacing`        | Letter spacing of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.  |
| `--bx-timeline-heading-font-family`        | Font family of the `heading` text (text style `label-l`). Default `var(--bx-type-label-family)`.          |
| `--bx-timeline-heading-font-size`          | Font size of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-size)`.            |
| `--bx-timeline-heading-font-weight`        | Font weight of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-weight)`.        |
| `--bx-timeline-heading-line-height`        | Line height of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-leading)`.       |
| `--bx-timeline-heading-letter-spacing`     | Letter spacing of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-tracking)`.   |
| `--bx-timeline-description-font-family`    | Font family of the `description` text (text style `body-m`). Default `var(--bx-type-body-family)`.        |
| `--bx-timeline-description-font-size`      | Font size of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-size)`.          |
| `--bx-timeline-description-font-weight`    | Font weight of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-weight)`.      |
| `--bx-timeline-description-line-height`    | Line height of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-leading)`.     |
| `--bx-timeline-description-letter-spacing` | Letter spacing of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-TIMELINE-01** Items render as an ordered list; `time` uses `bx-relative-time`/`bx-format-date`.
- **FR-TIMELINE-02** Alternate layout collapses to one-sided in narrow containers.
- **FR-TIMELINE-03** Long timelines can be virtualized by composing `bx-data-list` instead (documented pattern).

## 4. Fluid scaling

Spacing from the space ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Alternate to one-sided via container query.

## 6. Accessibility

- `<ol>` semantics; status communicated in text, not color alone.
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

- [ ] All FR-TIMELINE-* requirements covered by unit/component tests (`timeline.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
