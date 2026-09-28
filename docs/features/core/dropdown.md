# `<bx-dropdown>`

> Anchors a menu of items to a trigger; keyboard navigable, typeahead-enabled, with checkbox and submenu support.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Actions        |
| **Tag**             | `bx-dropdown`  |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Anchors a menu of items to a trigger; keyboard navigable, typeahead-enabled, with checkbox and submenu support. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                | Type                           | Default        | Description                                       |
| ------------------- | ------------------------------ | -------------- | ------------------------------------------------- |
| `open`              | boolean                        | false          | Controls visibility                               |
| `placement`         | Placement                      | "bottom-start" | Popup placement                                   |
| `distance`          | number                         | 0              | Offset from trigger                               |
| `skidding`          | number                         | 0              | -                                                 |
| `size`              | "small" \| "medium" \| "large" | "medium"       | -                                                 |
| `virtual`           | boolean                        | false          | Virtualize items when count > `virtual-threshold` |
| `virtual-threshold` | number                         | 100            | -                                                 |

### Slots

| Slot        | Description                            |
| ----------- | -------------------------------------- |
| `trigger`   | Element that opens the menu            |
| `(default)` | bx-dropdown-item, bx-divider, headings |

### Events

| Event                     | Detail / notes                |
| ------------------------- | ----------------------------- |
| `bx-show / bx-after-show` | Cancelable / completed        |
| `bx-hide / bx-after-hide` | -                             |
| `bx-select`               | detail.item (the chosen item) |

### CSS parts

`base`, `menu`

### CSS custom properties

`--bx-dropdown-width`

### Methods

`show()`, `hide()`, `reposition()`

## 3. Functional requirements

- **FR-DROPDOWN-01** Built on `bx-popup` (flip, shift, auto-size, viewport-aware).
- **FR-DROPDOWN-02** Arrow-key navigation, Home/End, typeahead, Escape returns focus to trigger.
- **FR-DROPDOWN-03** Outside click and focus-out close; supports nested submenus with safe-triangle hover.
- **FR-DROPDOWN-04** Checkbox items and radio-like groups maintain selection state.
- **FR-DROPDOWN-05** Virtual mode uses `VirtualizerController`; only visible items are in DOM while typeahead and aria-setsize stay correct.

## 4. Fluid scaling

Menu width, item height and padding scale; menu max-height = min(available viewport, 40 fluid units).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Below a narrow container width, menu becomes a bottom sheet (`sheet-narrow`).

## 6. Accessibility

- Trigger has `aria-haspopup="menu"`/`aria-expanded`; menu `role="menu"`, items `menuitem*`.
- Focus is managed programmatically; no focus loss on virtual scroll.
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

- [ ] All FR-DROPDOWN-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds virtual mode and narrow bottom-sheet behavior.
- Open: confirm final property names against the custom-elements manifest during implementation.
