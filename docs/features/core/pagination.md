# `<bx-pagination>`

> Page navigation with numbered pages, ellipsis collapsing, page size selector and compact mode.

|                     |                                         |
| ------------------- | --------------------------------------- |
| **Package**         | `@bixboards/core`                       |
| **Category**        | Navigation                              |
| **Tag**             | `bx-pagination`                         |
| **Status**          | Implemented                             |
| **Form-associated** | No                                      |
| **Depends on**      | `button`, `select`, _data-table_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Page navigation with numbered pages, ellipsis collapsing, page size selector and compact mode. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name             | Type     | Default | Description                                  |
| ---------------- | -------- | ------- | -------------------------------------------- |
| `page`           | number   | 1       | Current page (1-based).                      |
| `page-count`     | number   | 1       | -                                            |
| `total`          | number   | 0       | Alternative: total items (with `page-size`). |
| `page-size`      | number   | 10      | -                                            |
| `page-sizes`     | number[] | []      | Shows a size selector when set.              |
| `sibling-count`  | number   | 1       | Pages shown around the current one.          |
| `boundary-count` | number   | 1       | Pages shown at each end.                     |
| `compact`        | boolean  | false   | Prev/next with "3 of 20".                    |
| `href-template`  | string   | ""      | Renders real links, e.g. `?page={page}`.     |
| `disabled`       | boolean  | false   | -                                            |

### Slots

| Name      | Description            |
| --------- | ---------------------- |
| `summary` | "Showing 1–10 of 200". |
| `prev`    | -                      |
| `next`    | -                      |

### Events

| Event                 | Detail / notes   |
| --------------------- | ---------------- |
| `change`              | detail.page.     |
| `bx-page-size-change` | detail.pageSize. |

### CSS parts

| Part           | Description              |
| -------------- | ------------------------ |
| `base`         | `nav` element.           |
| `page`         | A page button.           |
| `page-current` | The current page button. |
| `ellipsis`     | The ellipsis part.       |
| `prev`         | The previous button.     |
| `next`         | The next button.         |
| `size-select`  | The page-size select.    |

### CSS custom properties

| Property                                 | Description                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--bx-pagination-gap`                    | Gap between controls. Default `var(--bx-space-2xs)`.                                                  |
| `--bx-pagination-current-bg`             | Current page background.                                                                              |
| `--bx-pagination-current-fg`             | Current page text color.                                                                              |
| `--bx-pagination-font-family`            | Font family of the root surface. Default `var(--bx-type-label-family)`.                               |
| `--bx-pagination-font-size`              | Font size of the root surface. Default `var(--bx-type-label-size)`.                                   |
| `--bx-pagination-font-weight`            | Font weight of the root surface. Default `var(--bx-type-label-weight)`.                               |
| `--bx-pagination-line-height`            | Line height of the root surface. Default `var(--bx-type-label-leading)`.                              |
| `--bx-pagination-letter-spacing`         | Letter spacing of the root surface. Default `var(--bx-type-label-tracking)`.                          |
| `--bx-pagination-size-font-family`       | Font family of the `size` text (text style `body-s`). Default `var(--bx-type-body-family)`.           |
| `--bx-pagination-size-font-size`         | Font size of the `size` text (text style `body-s`). Default `var(--bx-type-body-s-size)`.             |
| `--bx-pagination-size-font-weight`       | Font weight of the `size` text (text style `body-s`). Default `var(--bx-type-body-s-weight)`.         |
| `--bx-pagination-size-line-height`       | Line height of the `size` text (text style `body-s`). Default `var(--bx-type-body-s-leading)`.        |
| `--bx-pagination-size-letter-spacing`    | Letter spacing of the `size` text (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.    |
| `--bx-pagination-summary-font-family`    | Font family of the `summary` text (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-pagination-summary-font-size`      | Font size of the `summary` text (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-pagination-summary-font-weight`    | Font weight of the `summary` text (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-pagination-summary-line-height`    | Line height of the `summary` text (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-pagination-summary-letter-spacing` | Letter spacing of the `summary` text (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

### Methods

`goTo(page)`, `next()`, `previous()`

## 3. Functional requirements

- **FR-PAGINATION-01** Page-range algorithm is pure and unit-tested (never more than `2*siblings + 2*boundary + 3` slots, stable width).
- **FR-PAGINATION-02** Link mode renders anchors so pagination works without JS and for SEO.
- **FR-PAGINATION-03** Pairs with `bx-data-table` for server-side data.

## 4. Fluid scaling

Button size from the target-size tokens.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Switches to `compact` automatically when the container is narrow.

## 6. Accessibility

- `nav` with `aria-label="Pagination"`; current page has `aria-current="page"`; prev/next disabled via `aria-disabled` while staying in tab order only when actionable.
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

- [ ] All FR-PAGINATION-* requirements covered by unit/component tests (`pagination.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
