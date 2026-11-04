# `<bx-split-panel>`

> Two resizable panels with draggable divider.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Organization      |
| **Tag**             | `bx-split-panel`  |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Two resizable panels with draggable divider. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                 | Type                   | Default      | Description                     |
| -------------------- | ---------------------- | ------------ | ------------------------------- |
| `position`           | number                 | 50           | Percent                         |
| `position-in-pixels` | number                 | -            | -                               |
| `orientation`        | horizontal \| vertical | "horizontal" | -                               |
| `disabled`           | boolean                | false        | -                               |
| `primary`            | start \| end           | -            | Panel that keeps size on resize |
| `snap`               | string                 | -            | Snap points                     |
| `snap-threshold`     | number                 | 12           | -                               |

### Slots

| Slot      | Description |
| --------- | ----------- |
| `start`   | -           |
| `end`     | -           |
| `divider` | -           |

### Events

| Event           | Detail / notes |
| --------------- | -------------- |
| `bx-reposition` | -              |

### CSS parts

| Part      | Description      |
| --------- | ---------------- |
| `start`   | The start panel. |
| `end`     | The end panel.   |
| `panel`   | Either panel.    |
| `divider` | The divider.     |

### CSS custom properties

| Property                         | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `--bx-split-panel-divider-width` | Divider width. Default `max(var(--bx-space-3xs), 2px)`. |
| `--bx-split-panel-min`           | Minimum start-panel size. Default `0px`.                |
| `--bx-split-panel-max`           | Maximum start-panel size. Default `100%`.               |

### Methods

_None._

## 3. Functional requirements

- **FR-SPLIT-PANEL-01** Pointer-capture drag; keyboard arrows/Home/End; persisted position optional via `storage-key`.
- **FR-SPLIT-PANEL-02** Uses ResizeObserver only to preserve pixel position for `primary`.

## 4. Fluid scaling

Divider hit-area scales, ≥ 12 px.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Stacks vertically below `--bx-split-stack-at` when `responsive` attribute set.

## 6. Accessibility

- Divider `role="separator"` focusable with `aria-valuenow`.
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

- [ ] All FR-SPLIT-PANEL-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds responsive stack and persistence.
- Open: confirm final property names against the custom-elements manifest during implementation.
