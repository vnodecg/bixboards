# `<bx-popup>`

> Low-level positioning primitive (anchor, flip, shift, size, arrow) used by dropdown, select, tooltip, popover.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Utilities      |
| **Tag**             | `bx-popup`     |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Low-level positioning primitive (anchor, flip, shift, size, arrow) used by dropdown, select, tooltip, popover. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                       | Type                                     | Default    | Description |
| -------------------------- | ---------------------------------------- | ---------- | ----------- |
| `anchor`                   | Element \| string                        | -          | -           |
| `active`                   | boolean                                  | false      | -           |
| `placement`                | Placement                                | "top"      | -           |
| `strategy`                 | "absolute" \| "fixed"                    | "absolute" | -           |
| `distance`                 | number                                   | 0          | -           |
| `skidding`                 | number                                   | 0          | -           |
| `arrow`                    | boolean                                  | false      | -           |
| `arrow-placement`          | "start" \| "end" \| "center" \| "anchor" | "anchor"   | -           |
| `arrow-padding`            | number                                   | 10         | -           |
| `flip`                     | boolean                                  | false      | -           |
| `flip-fallback-placements` | string                                   | ""         | -           |
| `flip-padding`             | number                                   | 0          | -           |
| `shift`                    | boolean                                  | false      | -           |
| `shift-padding`            | number                                   | 0          | -           |
| `auto-size`                | "horizontal" \| "vertical" \| "both"     | -          | -           |
| `sync`                     | "width" \| "height" \| "both"            | -          | -           |
| `hover-bridge`             | boolean                                  | false      | -           |

### Slots

| Slot        | Description   |
| ----------- | ------------- |
| `(default)` | Popup content |
| `anchor`    | -             |

### Events

| Event           | Detail / notes |
| --------------- | -------------- |
| `bx-reposition` | -              |

### CSS parts

`arrow`, `popup`, `hover-bridge`

### CSS custom properties

`--arrow-size`, `--arrow-color`, `--auto-size-available-width`, `--auto-size-available-height`

### Methods

`reposition()`

## 3. Functional requirements

- **FR-POPUP-01** Uses CSS Anchor Positioning where supported, else Floating-UI-style computation.
- **FR-POPUP-02** Auto-update on scroll/resize/anchor resize only while active.
- **FR-POPUP-03** Correct inside shadow roots, transformed ancestors and top-layer.

## 4. Fluid scaling

Distance and arrow size scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Available-size vars drive `max-width/height` of consumers.

## 6. Accessibility

- Non-semantic; consumers own roles.
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

- [ ] All FR-POPUP-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Native anchor positioning fast path.
- Open: confirm final property names against the custom-elements manifest during implementation.
