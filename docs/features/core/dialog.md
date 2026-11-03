# `<bx-dialog>`

> Modal dialog built on native `<dialog>`, with header, footer and light dismiss.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Overlays          |
| **Tag**             | `bx-dialog`       |
| **Status**          | Planned           |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Modal dialog built on native `<dialog>`, with header, footer and light dismiss. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name             | Type    | Default | Description           |
| ---------------- | ------- | ------- | --------------------- |
| `open`           | boolean | false   | -                     |
| `label`          | string  | ""      | Title/accessible name |
| `without-header` | boolean | false   | -                     |
| `light-dismiss`  | boolean | false   | -                     |

### Slots

| Slot             | Description |
| ---------------- | ----------- |
| `(default)`      | -           |
| `label`          | -           |
| `header-actions` | -           |
| `footer`         | -           |

### Events

| Event                     | Detail / notes |
| ------------------------- | -------------- |
| `bx-show`                 | -              |
| `bx-after-show`           | -              |
| `bx-hide (detail.source)` | -              |
| `bx-after-hide`           | -              |

### CSS parts

| Part             | Description                                 |
| ---------------- | ------------------------------------------- |
| `dialog`         | The native `<dialog>` element.              |
| `header`         | The header region.                          |
| `title`          | The title text.                             |
| `header-actions` | The wrapper around the header-actions slot. |
| `close-button`   | The default close button.                   |
| `body`           | The scrollable body region.                 |
| `footer`         | The footer region.                          |

### CSS custom properties

| Property                                 | Description                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `--bx-dialog-width`                      | Max width. Default `40rem`-equivalent fluid width.                                                        |
| `--bx-dialog-spacing`                    | Header/body/footer padding. Default `--bx-space-l`.                                                       |
| `--bx-dialog-max-height`                 | Maximum height of the root surface. Default `min(85vh, 100%)`.                                            |
| `--bx-dialog-border-width`               | Border width of the root surface. Default `var(--bx-border-width)`.                                       |
| `--bx-dialog-border-color`               | Border color of the root surface. Default `var(--bx-border-subtle)`.                                      |
| `--bx-dialog-radius`                     | Corner radius of the root surface. Default `var(--bx-radius-l)`.                                          |
| `--bx-dialog-shadow`                     | Box shadow of the root surface. Default `var(--bx-shadow-l)`.                                             |
| `--bx-dialog-bg`                         | Background of the root surface. Default `var(--bx-surface-base)`.                                         |
| `--bx-dialog-fg`                         | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                    |
| `--bx-dialog-backdrop-bg`                | Background of the `::backdrop`. Default `var(--bx-surface-overlay)`.                                      |
| `--bx-dialog-header-gap`                 | Gap of the `header` part. Default `var(--bx-space-s)`.                                                    |
| `--bx-dialog-header-padding-block-end`   | Padding block end of the `header` part. Default `var(--bx-space-m)`.                                      |
| `--bx-dialog-header-actions-gap`         | Gap of the `header-actions` part. Default `var(--bx-space-xs)`.                                           |
| `--bx-dialog-close-button-width`         | Width of the `close-button` part. Default `var(--bx-target-min)`.                                         |
| `--bx-dialog-close-button-radius`        | Corner radius of the `close-button` part. Default `var(--bx-radius-pill)`.                                |
| `--bx-dialog-close-button-fg`            | Text/icon color of the `close-button` part. Default `var(--bx-text-secondary)`.                           |
| `--bx-dialog-close-button-hover-bg`      | Background of the `close-button` part (hover state). Default `var(--bx-surface-subtle)`.                  |
| `--bx-dialog-body-padding-block`         | Padding block of the `body` part. Default `var(--bx-space-m)`.                                            |
| `--bx-dialog-footer-gap`                 | Gap of the `footer` part. Default `var(--bx-space-s)`.                                                    |
| `--bx-dialog-footer-padding-block-start` | Padding block start of the `footer` part. Default `var(--bx-space-m)`.                                    |
| `--bx-dialog-close-button-icon-size`     | Size (width and height) of the icon inside the `close-button` element. Default `1em`.                     |
| `--bx-dialog-font-family`                | Font family of the root surface. Default `var(--bx-type-body-family)`.                                    |
| `--bx-dialog-title-font-family`          | Font family of the `title` part (text style `heading-s`). Default `var(--bx-type-heading-family)`.        |
| `--bx-dialog-title-font-size`            | Font size of the `title` part (text style `heading-s`). Default `var(--bx-type-heading-s-size)`.          |
| `--bx-dialog-title-font-weight`          | Font weight of the `title` part (text style `heading-s`). Default `var(--bx-type-heading-s-weight)`.      |
| `--bx-dialog-title-line-height`          | Line height of the `title` part (text style `heading-s`). Default `var(--bx-type-heading-s-leading)`.     |
| `--bx-dialog-title-letter-spacing`       | Letter spacing of the `title` part (text style `heading-s`). Default `var(--bx-type-heading-s-tracking)`. |

### Methods

`show()`, `hide()`

## 3. Functional requirements

- **FR-DIALOG-01** Native `showModal()` provides inert background, focus trap and top-layer stacking.
- **FR-DIALOG-02** `data-dialog="close"` in slotted content closes it.
- **FR-DIALOG-03** Scroll lock without layout shift (scrollbar-gutter stable).
- **FR-DIALOG-04** Long bodies scroll inside body region; header/footer stay pinned.

## 4. Fluid scaling

Width = clamp(min, 90cqi, --bx-dialog-width); paddings scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Below narrow width becomes full-screen sheet.

## 6. Accessibility

- `aria-labelledby` to title; focus returns to opener; Escape closes.
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

- [ ] All FR-DIALOG-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
