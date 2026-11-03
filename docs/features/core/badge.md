# `<bx-badge>`

> Compact status, count or label. One component for what many libraries split into "badge" and "tag": optionally removable, pulsing, or anchored to another element.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Feedback          |
| **Tag**             | `bx-badge`        |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

One small pill/rectangle for three jobs, so the system has a single visual:

- **Status**: "Verified", "Beta", a colored state.
- **Count**: notification numbers, optionally anchored to a corner of another element.
- **Label / chip**: categories and selections, optionally removable (used for the selected values inside `bx-select`).

There is no separate `bx-tag`: the two overlapped almost completely in look and API, and only differed by removability and size options, which are options here.

## 2. API

### Properties / attributes

| Name          | Type                                                           | Default           | Description                                                        |
| ------------- | -------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| `variant`     | `default` \| `secondary` \| `tertiary` \| `error` \| `warning` | "default"         | Semantic intent; any palette added to the design system also works |
| `appearance`  | "accent" \| "filled" \| "outlined" \| "filled outlined"        | "filled outlined" | Emphasis; `accent` is a solid fill                                 |
| `size`        | "small" \| "medium" \| "large"                                 | "medium"          | `small` is the compact status/count size                           |
| `pill`        | boolean                                                        | false             | Fully rounded ends                                                 |
| `attention`   | "none" \| "pulse" \| "bounce"                                  | "none"            | Draws attention; disabled under reduced motion                     |
| `max`         | number                                                         | 99                | Numeric content above this renders as `99+`                        |
| `anchor`      | "top-end" \| "top-start" \| "bottom-end" \| "bottom-start"     | -                 | Overlays a corner of the parent (count/status dot)                 |
| `with-remove` | boolean                                                        | false             | Adds a remove button (chip behavior)                               |
| `live`        | boolean                                                        | false             | Announces changes (`role="status"`) for dynamic counts             |

### Slots

| Slot        | Description      |
| ----------- | ---------------- |
| `(default)` | Content          |
| `start`     | Leading icon/dot |
| `end`       | Trailing content |

### Events

| Event       | Detail / notes                       |
| ----------- | ------------------------------------ |
| `bx-remove` | Remove button activated (cancelable) |

### CSS parts

| Part            | Description                                    |
| --------------- | ---------------------------------------------- |
| `start`         | The start slot.                                |
| `end`           | The end slot.                                  |
| `base`          | The host's inner wrapper.                      |
| `content`       | The wrapper around slotted/overflow content.   |
| `remove-button` | The remove button, present with `with-remove`. |

### CSS custom properties

| Property                                     | Description                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `--bx-badge-bg`                              | Background color. Defaults to a role/appearance combination.                                                       |
| `--bx-badge-fg`                              | Text/icon color. Defaults to a role/appearance combination.                                                        |
| `--bx-badge-border`                          | Border color. Defaults to a role/appearance combination.                                                           |
| `--bx-badge-radius`                          | Corner radius when `pill` is unset. Default `--bx-radius-s`.                                                       |
| `--bx-badge-border-width`                    | Border thickness. Default `--bx-border-width`.                                                                     |
| `--bx-badge-gap`                             | Gap between slots. Default `--bx-space-2xs`.                                                                       |
| `--bx-badge-min-height`                      | Minimum height, drives the `size` step.                                                                            |
| `--bx-badge-padding-inline`                  | Horizontal padding, drives the `size` step.                                                                        |
| `--bx-badge-max-width`                       | Truncation width for the content.                                                                                  |
| `--bx-badge-content-line-height`             | Line height of the `content` part. Default `1.3`.                                                                  |
| `--bx-badge-remove-button-size`              | Size (width and height) of the `remove-button` part. Default `1.4em`.                                              |
| `--bx-badge-remove-button-radius`            | Corner radius of the `remove-button` part. Default `var(--bx-radius-pill)`.                                        |
| `--bx-badge-remove-button-hit-size`          | Size (width and height) of the `remove-button` hit area. Default `max(100%, var(--bx-target-min))`.                |
| `--bx-badge-remove-button-hover-bg`          | Background of the `remove-button` part (hover state). Default `color-mix(in srgb, currentColor 16%, transparent)`. |
| `--bx-badge-remove-button-focus-ring-width`  | Focus ring width of the `remove-button` part (focus state). Default `var(--bx-border-width-strong)`.               |
| `--bx-badge-remove-button-focus-ring-color`  | Focus ring color of the `remove-button` part (focus state). Default `var(--bx-focus-ring)`.                        |
| `--bx-badge-remove-button-focus-ring-offset` | Focus ring offset of the `remove-button` part (focus state). Default `var(--bx-focus-ring-offset)`.                |
| `--bx-badge-remove-button-icon-size`         | Size (width and height) of the icon inside the `remove-button` element. Default `0.85em`.                          |
| `--bx-badge-font-family`                     | Font family of the root surface. Default `var(--bx-type-body-family)`.                                             |
| `--bx-badge-font-family`                     | Font family of the root surface (text style `label-m`). Default `var(--bx-type-label-family)`.                     |
| `--bx-badge-font-size`                       | Font size of the root surface (text style `label-m`). Default `var(--bx-type-label-m-size)`.                       |
| `--bx-badge-font-weight`                     | Font weight of the root surface (text style `label-m`). Default `var(--bx-type-label-m-weight)`.                   |
| `--bx-badge-line-height`                     | Line height of the root surface (text style `label-m`). Default `var(--bx-type-label-m-leading)`.                  |
| `--bx-badge-letter-spacing`                  | Letter spacing of the root surface (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.              |

### Methods

_None._

## 3. Functional requirements

- **FR-BADGE-01** Numeric content greater than `max` renders `max+`.
- **FR-BADGE-02** `anchor` overlays a corner of the parent without affecting its layout.
- **FR-BADGE-03** Rendering is cheap: no observers or popups. It is used many times inside `bx-select` and tables.
- **FR-BADGE-04** With `with-remove`, the remove button is separately focusable, labelled `Remove <content>`, and emits `bx-remove`; Backspace/Delete on a focused chip requests removal.
- **FR-BADGE-05** Long content truncates with an ellipsis at `--bx-badge-max-width` and exposes the full text via `title`.
- **FR-BADGE-06** Min-width equals height for single characters so counts stay circular with `pill`.

## 4. Fluid scaling

Height, padding and font size follow the `size` step (small ≈ 1.25u, medium ≈ 1.75u, large ≈ 2.25u where u is the fluid unit); all values come from the design-system tokens and rescale with `--bx-scale`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Text truncates when the container is narrower than the content; there is no other reflow.

## 6. Accessibility

- Decorative text by default; `role="status"` only with `live` (dynamic counts).
- Never color-only: pair variants with an icon or text; the badge takes its colors from design-system roles, which guarantee 4.5:1 for text on fills and tints in every theme; the component tests this with `contrast()`.
- Remove button has an accessible name including the badge text; target size ≥ 24 px (44 px on coarse pointers).
- Respects `prefers-reduced-motion` and forced-colors; usable at 200% zoom and with text-spacing overrides.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- Hard budget: ≤ 1 ms median first render, ≤ 2 KB gzip incremental JS (excluding shared base).
- Safe to upgrade/define lazily; safe to move between documents and re-connect.
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxRemove`, refs forward to the element, slots map via the `slot` attribute.
- Angular: standalone component with `@Input`/`@Output`.
- Svelte: typed component exposing props and callback events.

## 9. Acceptance criteria

- [x] All FR-BADGE-\* requirements covered by unit/component tests (Web Test Runner, real browsers: Chromium; Firefox/WebKit run in CI). See `packages/core/src/badge/badge.test.ts`.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark, every appearance × variant. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations (plain and removable), asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass documented.
- [x] Keyboard-only walkthrough for the removable variant (Backspace/Delete on a focused chip, `badge.test.ts`).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Badge and tag are one component (decision: they were visually and functionally near-identical). A chip is `<bx-badge with-remove>`; a status or count is a plain `<bx-badge>`.
- Implemented in `@bixboards/core` (`src/badge/`). `appearance="filled outlined"` (the default) is a space-separated pair of tokens read with CSS `~=` attribute selectors, so `filled` and `outlined` apply independently and compose; `accent` is its own single value.
- Numeric-overflow detection (`max`) and truncation (`--bx-badge-max-width`) both key off the default slot's assigned text via `slotchange`, not a rendered prop, so arbitrary slotted markup (an icon plus text) still works — only a slot whose flattened text is purely numeric gets the `max+` treatment.
- Open: whether a selectable (toggle) chip is needed; if so it should be a separate `bx-chip` built on this visual, not a return of `bx-tag`.
- Open: confirm final property names against the custom-elements manifest once the CEM generation pipeline exists.
