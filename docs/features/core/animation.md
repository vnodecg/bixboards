# `<bx-animation>`

> Declarative Web Animations API wrapper with named presets.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Utilities      |
| **Tag**             | `bx-animation` |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Declarative Web Animations API wrapper with named presets. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name              | Type       | Default  | Description |
| ----------------- | ---------- | -------- | ----------- |
| `name`            | string     | "none"   | Preset name |
| `play`            | boolean    | false    | -           |
| `delay`           | number     | 0        | -           |
| `direction`       | string     | "normal" | -           |
| `duration`        | number     | 1000     | -           |
| `easing`          | string     | "linear" | -           |
| `end-delay`       | number     | 0        | -           |
| `fill`            | string     | "auto"   | -           |
| `iterations`      | number     | Infinity | -           |
| `iteration-start` | number     | 0        | -           |
| `playback-rate`   | number     | 1        | -           |
| `keyframes`       | Keyframe[] | -        | Custom      |

### Slots

| Slot        | Description        |
| ----------- | ------------------ |
| `(default)` | Element to animate |

### Events

| Event       | Detail / notes |
| ----------- | -------------- |
| `bx-cancel` | -              |
| `bx-finish` | -              |
| `bx-start`  | -              |

### CSS parts

_None._

### CSS custom properties

_Only global tokens (see conventions)._

### Methods

`cancel()`, `finish()`, `getAnimation()`

## 3. Functional requirements

- **FR-ANIMATION-01** Tree-shakable preset registry (`bounce`, `fadeIn`, …); presets are opt-in imports.
- **FR-ANIMATION-02** Auto-disabled under `prefers-reduced-motion` unless `force` attribute is set.

## 4. Fluid scaling

Distance-based presets use fluid units.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- Never conveys information by animation alone.
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

- [x] All FR-ANIMATION-* requirements covered by unit/component tests (Web Test Runner, Chromium). See `packages/core/src/animation/animation.test.ts` (preset resolution, reduced-motion behavior).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations (idle and playing states), asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan. Not applicable as written: `bx-animation` renders no interactive parts of its own (`display: contents`, one `<slot>`) — it never intercepts focus or key input, and the slotted element keeps its own native keyboard behavior unchanged. Revisit if a future preset adds host-level controls.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
