# `<bx-empty-state>`

> Illustrated placeholder for empty lists, search with no results and errors, with a primary action.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Feedback          |
| **Tag**             | `bx-empty-state`  |
| **Status**          | Implemented       |
| **Form-associated** | No                |
| **Depends on**      | `icon`, `button`  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Illustrated placeholder for empty lists, search with no results and errors, with a primary action. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type                                     | Default | Description                    |
| ------------- | ---------------------------------------- | ------- | ------------------------------ |
| `heading`     | string                                   | ""      | -                              |
| `description` | string                                   | ""      | -                              |
| `variant`     | empty/no-results/error/offline/forbidden | "empty" | Selects default icon and copy. |
| `size`        | s/m/l                                    | "m"     | -                              |

### Slots

| Name        | Description           |
| ----------- | --------------------- |
| `media`     | Illustration or icon. |
| `(default)` | Extra content.        |
| `actions`   | Buttons.              |

### Events

_None._

### CSS parts

| Part          | Description           |
| ------------- | --------------------- |
| `base`        | The base part.        |
| `media`       | The media part.       |
| `heading`     | The heading part.     |
| `description` | The description part. |
| `actions`     | The actions part.     |

### CSS custom properties

| Property                                      | Description                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `--bx-empty-state-max-width`                  | Content width.                                                                                              |
| `--bx-empty-state-media-size`                 | Illustration size.                                                                                          |
| `--bx-empty-state-font-family`                | Font family of the root surface. Default `var(--bx-type-body-family)`.                                      |
| `--bx-empty-state-description-font-family`    | Font family of the `description` text (text style `body-m`). Default `var(--bx-type-body-family)`.          |
| `--bx-empty-state-description-font-size`      | Font size of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-size)`.            |
| `--bx-empty-state-description-font-weight`    | Font weight of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-weight)`.        |
| `--bx-empty-state-description-line-height`    | Line height of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-leading)`.       |
| `--bx-empty-state-description-letter-spacing` | Letter spacing of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.   |
| `--bx-empty-state-heading-font-family`        | Font family of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-family)`.        |
| `--bx-empty-state-heading-font-size`          | Font size of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-size)`.          |
| `--bx-empty-state-heading-font-weight`        | Font weight of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-weight)`.      |
| `--bx-empty-state-heading-line-height`        | Line height of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-leading)`.     |
| `--bx-empty-state-heading-letter-spacing`     | Letter spacing of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-EMPTYSTATE-01** Presentational; used by `bx-data-table` and `bx-data-list` when they have no rows.
- **FR-EMPTYSTATE-02** Default copy per variant is localizable.
- **FR-EMPTYSTATE-03** Heading level is configurable (`heading-level`) so it never breaks document outline.

## 4. Fluid scaling

Spacing and media size follow the ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Centered; actions stack when narrow.

## 6. Accessibility

- Decorative media is `aria-hidden`; when shown in response to a user action (search), a polite live announcement is made.
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

- [ ] All FR-EMPTYSTATE-* requirements covered by unit/component tests (`empty-state.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
