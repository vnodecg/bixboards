# `<bx-drawer>`

> Edge-anchored panel (top/end/bottom/start), modal or contained to a parent.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Overlays       |
| **Tag**             | `bx-drawer`    |
| **Status**          | Implemented    |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Edge-anchored panel (top/end/bottom/start), modal or contained to a parent. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name             | Type                                  | Default | Description                                                                                           |
| ---------------- | ------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `open`           | boolean                               | false   | -                                                                                                     |
| `label`          | string                                | ""      | Title text (the `label` slot overrides)                                                               |
| `placement`      | "top" \| "end" \| "bottom" \| "start" | "end"   | -                                                                                                     |
| `contained`      | boolean                               | false   | Constrain to parent instead of viewport. Opens non-modally; **the parent needs `position: relative`** |
| `without-header` | boolean                               | false   | -                                                                                                     |
| `light-dismiss`  | boolean                               | true    | -                                                                                                     |

### Slots

| Slot             | Description                                  |
| ---------------- | -------------------------------------------- |
| `(default)`      | Body content                                 |
| `label`          | Overrides the `label` attribute as the title |
| `header-actions` | Actions before the close button              |
| `footer`         | Footer content (typically buttons)           |

### Events

| Event           | Detail / notes                                                                             |
| --------------- | ------------------------------------------------------------------------------------------ |
| `bx-show`       | Cancelable; canceling keeps it closed                                                      |
| `bx-after-show` | Opened                                                                                     |
| `bx-hide`       | Cancelable; `detail.source`: `'close-button' \| 'light-dismiss' \| 'keyboard' \| 'method'` |
| `bx-after-hide` | Closed and focus returned to the opener                                                    |

### CSS parts

`dialog`, `overlay` (only rendered when `contained`; a modal drawer uses `::backdrop`), `header`, `title`, `header-actions`, `close-button`, `body`, `footer`

### CSS custom properties

`--bx-drawer-size`, `--bx-drawer-spacing`

### Methods

`show()`, `hide()`

## 3. Functional requirements

- **FR-DRAWER-01** Slide animation on transform only; honors reduced motion.
- **FR-DRAWER-02** Contained drawers do not trap focus outside their parent.
- **FR-DRAWER-03** RTL-aware `start`/`end` placements.

## 4. Fluid scaling

Size = clamp(20rem, 30cqi, 32rem) × scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Fills the container on narrow widths.

## 6. Accessibility

- Same dialog semantics as `bx-dialog`.
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

- [ ] All FR-DRAWER-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-DRAWER-02 (contained, non-modal, no trap) and FR-DRAWER-03 (RTL placements) are covered; FR-DRAWER-01's slide is CSS-only and its `prefers-reduced-motion` opt-out is not asserted in a test.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (modal and contained, open, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook story; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Same dialog semantics as `bx-dialog`, as a parallel implementation rather than a shared base (only the open/close bookkeeping overlaps). The close control is a `bx-button` with a `bx-icon`. No close animation, matching `bx-dialog`.
- Open: confirm final property names against the custom-elements manifest during implementation.
