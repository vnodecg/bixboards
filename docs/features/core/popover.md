# `<bx-popover>`

> Rich, interactive floating panel anchored to an element.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Overlays          |
| **Tag**             | `bx-popover`      |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Rich, interactive floating panel anchored to an element. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name            | Type      | Default | Description                                                                                           |
| --------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `for`           | string    | ""      | Anchor id, resolved in this element's own root (works inside shadow trees). Unset: a slotted `anchor` |
| `label`         | string    | ""      | Accessible name for the `role="dialog"` popup (added; not in the original spec)                       |
| `placement`     | Placement | "top"   | -                                                                                                     |
| `open`          | boolean   | false   | -                                                                                                     |
| `distance`      | number    | 8       | -                                                                                                     |
| `skidding`      | number    | 0       | -                                                                                                     |
| `without-arrow` | boolean   | false   | -                                                                                                     |

### Slots

| Slot        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `(default)` | Popover content                                      |
| `anchor`    | The anchor element, used when `for` is unset (added) |

### Events

| Event           | Detail / notes                                                                       |
| --------------- | ------------------------------------------------------------------------------------ |
| `bx-show`       | Cancelable; canceling keeps it closed                                                |
| `bx-after-show` | Opened and focus moved in                                                            |
| `bx-hide`       | Cancelable; `detail.source`: `'anchor' \| 'light-dismiss' \| 'keyboard' \| 'method'` |
| `bx-after-hide` | Closed                                                                               |

### CSS parts

| Part     | Description                                     |
| -------- | ----------------------------------------------- |
| `dialog` | The inner `bx-popup` (carries `role="dialog"`). |
| `body`   | The padded surface around the default slot.     |
| `arrow`  | The arrow, present unless `without-arrow`.      |

### CSS custom properties

| Property                           | Description                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--bx-popover-bg`                  | Body/arrow background. Default `--bx-surface-base`.                                                |
| `--bx-popover-arrow-size`          | Arrow diameter. Default `calc(var(--bx-unit) * 0.75)`.                                             |
| `--bx-popover-max-width`           | Max width of the body. Default `20rem`.                                                            |
| `--bx-popover-body-padding`        | Padding of the `body` part. Default `var(--bx-space-m)`.                                           |
| `--bx-popover-body-border-width`   | Border width of the `body` part. Default `var(--bx-border-width)`.                                 |
| `--bx-popover-body-border-color`   | Border color of the `body` part. Default `var(--bx-border-subtle)`.                                |
| `--bx-popover-body-radius`         | Corner radius of the `body` part. Default `var(--bx-radius-m)`.                                    |
| `--bx-popover-body-shadow`         | Box shadow of the `body` part. Default `var(--bx-shadow-m)`.                                       |
| `--bx-popover-body-fg`             | Text/icon color of the `body` part. Default `var(--bx-text-primary)`.                              |
| `--bx-popover-body-font-family`    | Font family of the `body` part (text style `body-m`). Default `var(--bx-type-body-family)`.        |
| `--bx-popover-body-font-size`      | Font size of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-size)`.          |
| `--bx-popover-body-font-weight`    | Font weight of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-weight)`.      |
| `--bx-popover-body-line-height`    | Line height of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-leading)`.     |
| `--bx-popover-body-letter-spacing` | Letter spacing of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-tracking)`. |

### Methods

`show()`, `hide()`

## 3. Functional requirements

- **FR-POPOVER-01** Uses native Popover API where available with `bx-popup` positioning fallback.
- **FR-POPOVER-02** Light dismiss and Escape; focus moves in on open when interactive content present.

## 4. Fluid scaling

Padding, arrow and max-width scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Converts to bottom sheet on narrow containers when `sheet-narrow` set.

## 6. Accessibility

- `role="dialog"` non-modal; anchor `aria-expanded`/`aria-controls`.
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

- [ ] All FR-POPOVER-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-POPOVER-02 is covered; FR-POPOVER-01's native Popover API path is not implemented (always `bx-popup` positioning), and §5's `sheet-narrow` bottom sheet is not implemented.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (open state, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook story; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- The anchor gets `aria-expanded` and `aria-haspopup="dialog"`; `aria-controls` is not set because the popup body lives in this element's shadow root, where the anchor's ID reference cannot resolve (same cross-root limitation as `bx-tooltip`'s `aria-describedby`).
- Focus moves to the first interactive element in the content on open (the slotted anchor is skipped); Escape returns it to the anchor. There is no focus trap: it is a non-modal dialog.
- Open: confirm final property names against the custom-elements manifest during implementation.
