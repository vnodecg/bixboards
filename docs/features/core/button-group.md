# `<bx-button-group>`

> Groups related buttons into a single segmented control with shared borders and roving semantics.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixant/core`    |
| **Category**        | Actions           |
| **Tag**             | `bx-button-group` |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Groups related buttons into a single segmented control with shared borders and roving semantics. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name          | Type                       | Default      | Description                                                       |
| ------------- | -------------------------- | ------------ | ----------------------------------------------------------------- |
| `label`       | string                     | ""           | Accessible label for the group                                    |
| `orientation` | "horizontal" \| "vertical" | "horizontal" | Layout axis                                                       |
| `variant`     | string                     | ""           | When set, forced on every descendant `bx-button`/`bx-copy-button` |
| `size`        | string                     | ""           | When set, forced on every descendant `bx-button`/`bx-copy-button` |

### Slots

| Slot        | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `(default)` | bx-button, bx-dropdown, bx-copy-button, bx-tooltip-wrapped items |

### Events

| Event  | Detail / notes                 |
| ------ | ------------------------------ |
| `none` | Children emit their own events |

### CSS parts

| Part   | Description                 |
| ------ | --------------------------- |
| `base` | The `role="group"` wrapper. |

### CSS custom properties

| Property                   | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `--bx-button-group-gap`    | Offset between items. Default `-1 * --bx-border-width` (shared seam). |
| `--bx-button-group-radius` | Outer corner radius. Default `--bx-radius-m`.                         |

### Methods

_None._

## 3. Functional requirements

- **FR-BUTTON-GROUP-01** Collapses inner border radii so only outer edges are rounded; handles slotted tooltips and dropdown wrappers.
- **FR-BUTTON-GROUP-02** Applies `role="group"` with `aria-label`.
- **FR-BUTTON-GROUP-03** Focused/hovered child is raised (z-index) so borders are not clipped.
- **FR-BUTTON-GROUP-04** Optional `overflow="menu"` moves items that do not fit into a trailing overflow dropdown (ResizeObserver-driven).

## 4. Fluid scaling

Gap and radius inherit from the button size step; seams are 1 device pixel regardless of scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Switches to vertical stack below `--bx-group-stack-at` when `stack-narrow` is set.

## 6. Accessibility

- `role="group"` + label; arrow-key roving is NOT imposed (each button stays in tab order) unless `toolbar` mode is set.
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

- [ ] All FR-BUTTON-GROUP-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-01 (incl. tooltip and `bx-copy-button` items, RTL, vertical), FR-02 and FR-03 are covered; FR-04's `overflow="menu"` is not implemented (needs `bx-dropdown`, Tier 4), nor are §5's `stack-narrow` or §6's `toolbar` mode.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (default group, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook story; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Adds overflow-to-menu mode (not yet implemented, see §9).
- Hovered/focused items are raised with `z-index` on the flex item, deliberately without `position: relative`, which would make the item the containing block for a descendant tooltip's popup.
- Open: confirm final property names against the custom-elements manifest during implementation.
