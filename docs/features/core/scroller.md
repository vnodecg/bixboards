# `<bx-scroller>`

> Scroll region with edge shadows and keyboard access.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Organization      |
| **Tag**             | `bx-scroller`     |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Scroll region with edge shadows and keyboard access. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                | Type                   | Default      | Description |
| ------------------- | ---------------------- | ------------ | ----------- |
| `orientation`       | horizontal \| vertical | "horizontal" | -           |
| `without-scrollbar` | boolean                | false        | -           |
| `without-shadow`    | boolean                | false        | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |

### Events

_None._

### CSS parts

| Part      | Description             |
| --------- | ----------------------- |
| `content` | The scrollable element. |

### CSS custom properties

| Property                                  | Description                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `--bx-scroller-shadow-color`              | Edge shadow color. Default a translucent neutral.                                                                   |
| `--bx-scroller-shadow-size`               | Edge shadow extent. Default `--bx-space-l`.                                                                         |
| `--bx-scroller-content-focus-ring-width`  | Focus ring width of the `content` part (focus state). Default `var(--bx-border-width-strong)`.                      |
| `--bx-scroller-content-focus-ring-color`  | Focus ring color of the `content` part (focus state). Default `var(--bx-focus-ring)`.                               |
| `--bx-scroller-content-focus-ring-offset` | Focus ring offset of the `content` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.            |
| `--bx-scroller-shadow-opacity`            | Opacity of the `shadow` element. Default `1`.                                                                       |
| `--bx-scroller-shadow-start-bg`           | Background of the `shadow-start` element. Default `linear-gradient( to right, var(--_shadow-color), transparent )`. |
| `--bx-scroller-shadow-end-bg`             | Background of the `shadow-end` element. Default `linear-gradient( to left, var(--_shadow-color), transparent )`.    |

### Methods

_None._

## 3. Functional requirements

- **FR-SCROLLER-01** Shadows via scroll-driven animations/gradients; falls back to JS scroll listener (passive, rAF).
- **FR-SCROLLER-02** Focusable so keyboard users can scroll.

## 4. Fluid scaling

Shadow size scales.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- `tabindex=0` with `role="region"` label when scrollable.
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

- [ ] All FR-SCROLLER-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
