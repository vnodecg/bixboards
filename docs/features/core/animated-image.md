# `<bx-animated-image>`

> Play/pause control for GIF and animated WebP.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixant/core`      |
| **Category**        | Imagery             |
| **Tag**             | `bx-animated-image` |
| **Status**          | Planned             |
| **Form-associated** | No                  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Play/pause control for GIF and animated WebP. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name   | Type    | Default | Description |
| ------ | ------- | ------- | ----------- |
| `src`  | string  | ""      | -           |
| `alt`  | string  | ""      | Required    |
| `play` | boolean | false   | -           |

### Slots

| Slot         | Description |
| ------------ | ----------- |
| `play-icon`  | -           |
| `pause-icon` | -           |

### Events

| Event      | Detail / notes |
| ---------- | -------------- |
| `bx-load`  | -              |
| `bx-error` | -              |

### CSS parts

`control-box`, `play-icon`, `pause-icon`

### CSS custom properties

`--bx-control-box-size`

### Methods

_None._

## 3. Functional requirements

- **FR-ANIMATED-IMAGE-01** Renders first frame to canvas when paused; lazy loads via IntersectionObserver.
- **FR-ANIMATED-IMAGE-02** Respects `prefers-reduced-motion` by starting paused.

## 4. Fluid scaling

Control size scales.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Image fits container (object-fit contain).

## 6. Accessibility

- Toggle button labelled; `alt` required.
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

- [ ] All FR-ANIMATED-IMAGE-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
