# `<bx-card>`

> Container with header, media, body, footer and actions.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Organization      |
| **Tag**             | `bx-card`         |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Container with header, media, body, footer and actions. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name          | Type                                                    | Default    | Description |
| ------------- | ------------------------------------------------------- | ---------- | ----------- |
| `appearance`  | "accent" \| "filled" \| "outlined" \| "filled outlined" | "outlined" | -           |
| `with-header` | boolean                                                 | false      | -           |
| `with-media`  | boolean                                                 | false      | -           |
| `with-footer` | boolean                                                 | false      | -           |
| `orientation` | horizontal \| vertical                                  | "vertical" | -           |

### Slots

| Slot             | Description |
| ---------------- | ----------- |
| `(default)`      | -           |
| `header`         | -           |
| `media`          | -           |
| `footer`         | -           |
| `actions`        | -           |
| `footer-actions` | -           |
| `header-actions` | -           |

### Events

_None._

### CSS parts

| Part     | Description                                       |
| -------- | ------------------------------------------------- |
| `base`   | The outer container.                              |
| `media`  | The wrapper around the media slot.                |
| `header` | The wrapper around the header slots.              |
| `body`   | The wrapper around the default and actions slots. |
| `footer` | The wrapper around the footer slots.              |

### CSS custom properties

| Property                          | Description                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--bx-card-spacing`               | Padding and inter-region gap. Default `--bx-space-m`.                                                        |
| `--bx-card-radius`                | Corner radius. Default `--bx-radius-m`.                                                                      |
| `--bx-card-fg`                    | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                       |
| `--bx-card-border-width`          | Border width of the root surface. Default `var(--bx-border-width)`.                                          |
| `--bx-card-shadow`                | Box shadow of the root surface. Default `var(--bx-shadow-s)`.                                                |
| `--bx-card-bg`                    | Background of the root surface. Default `var(--bx-surface-subtle)`.                                          |
| `--bx-card-border-color`          | Border color of the root surface. Default `var(--bx-border-subtle)`.                                         |
| `--bx-card-font-family`           | Font family of the root surface. Default `var(--bx-type-body-family)`.                                       |
| `--bx-card-header-font-family`    | Font family of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-family)`.         |
| `--bx-card-header-font-size`      | Font size of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-size)`.          |
| `--bx-card-header-font-weight`    | Font weight of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-weight)`.      |
| `--bx-card-header-line-height`    | Line height of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-leading)`.     |
| `--bx-card-header-letter-spacing` | Letter spacing of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-CARD-01** Container-query root (`container-type: inline-size`) so content can adapt to card width, not viewport.
- **FR-CARD-02** Horizontal orientation auto-stacks when narrow.

## 4. Fluid scaling

Spacing and radius scale; media aspect-ratio preserved.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Horizontal → vertical below threshold.

## 6. Accessibility

- Landmark not implied; supports `role="article"` opt-in.
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

- [ ] All FR-CARD-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
