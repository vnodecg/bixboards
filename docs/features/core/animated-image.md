# `<bx-animated-image>`

> Play/pause control for GIF and animated WebP.

|                     |                     |
| ------------------- | ------------------- |
| **Package**         | `@bixboards/core`   |
| **Category**        | Imagery             |
| **Tag**             | `bx-animated-image` |
| **Status**          | Implemented         |
| **Form-associated** | No                  |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Play/pause control for GIF and animated WebP. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

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

| Part          | Description                                                     |
| ------------- | --------------------------------------------------------------- |
| `frame`       | The element containing the image/canvas and the control button. |
| `control-box` | The play/pause toggle button.                                   |
| `play-icon`   | The `play-icon` slot wrapper, present while paused.             |
| `pause-icon`  | The `pause-icon` slot wrapper, present while playing.           |

### CSS custom properties

| Property                                            | Description                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--bx-animated-image-control-box-size`              | Toggle button diameter. Default `max(control-height-m, target-min)`.                                         |
| `--bx-animated-image-control-box-bg`                | Toggle button background. Default `--bx-surface-base` (translucent).                                         |
| `--bx-animated-image-control-box-color`             | Toggle button icon/text color. Default `--bx-text-primary`.                                                  |
| `--bx-animated-image-control-box-border-color`      | Toggle button border. Default `--bx-border-base`.                                                            |
| `--bx-animated-image-frame-border-color`            | Border around the image area. Default `--bx-border-subtle`.                                                  |
| `--bx-animated-image-frame-radius`                  | Corner radius of the image area. Default `--bx-radius-m`.                                                    |
| `--bx-animated-image-frame-border-width`            | Border width of the `frame` part. Default `var(--bx-border-width)`.                                          |
| `--bx-animated-image-frame-bg`                      | Background of the `frame` part. Default `var(--bx-surface-muted)`.                                           |
| `--bx-animated-image-placeholder-fg`                | Text/icon color of the `placeholder` element. Default `var(--bx-text-hint)`.                                 |
| `--bx-animated-image-placeholder-padding`           | Padding of the `placeholder` element. Default `var(--bx-space-xs)`.                                          |
| `--bx-animated-image-control-box-border-width`      | Border width of the `control-box` part. Default `var(--bx-border-width)`.                                    |
| `--bx-animated-image-control-box-radius`            | Corner radius of the `control-box` part. Default `var(--bx-radius-m)`.                                       |
| `--bx-animated-image-control-box-font-size`         | Font size of the `control-box` part. Default `calc(var(--bx-animated-image-control-box-size) * 0.45)`.       |
| `--bx-animated-image-control-box-disabled-bg`       | Background of the `control-box` part (disabled state). Default `var(--bx-role-neutral-subtle-hover)`.        |
| `--bx-animated-image-control-box-disabled-opacity`  | Opacity of the `control-box` part (disabled state). Default `0.5`.                                           |
| `--bx-animated-image-control-box-focus-ring-width`  | Focus ring width of the `control-box` part (focus state). Default `var(--bx-border-width-strong)`.           |
| `--bx-animated-image-control-box-focus-ring-color`  | Focus ring color of the `control-box` part (focus state). Default `var(--bx-focus-ring)`.                    |
| `--bx-animated-image-control-box-focus-ring-offset` | Focus ring offset of the `control-box` part (focus state). Default `var(--bx-focus-ring-offset)`.            |
| `--bx-animated-image-placeholder-font-family`       | Font family of the `placeholder` element (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-animated-image-placeholder-font-size`         | Font size of the `placeholder` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-animated-image-placeholder-font-weight`       | Font weight of the `placeholder` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-animated-image-placeholder-line-height`       | Line height of the `placeholder` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-animated-image-placeholder-letter-spacing`    | Letter spacing of the `placeholder` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

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

- [x] All FR-ANIMATED-IMAGE-* requirements covered by unit/component tests (Web Test Runner, real browsers: Chromium, Firefox, WebKit). See `packages/core/src/animated-image/animated-image.test.ts`.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations (paused, playing and error states), asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass (NVDA/VoiceOver) documented.
- [x] Keyboard-only walkthrough recorded in the test plan (Enter/Space toggle, `animated-image.test.ts`).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Implemented in `@bixboards/core` (`src/animated-image/`). Default play/pause glyphs are vendored from Phosphor Icons (regular weight, MIT), as two path strings rather than the whole icon package, to stay inside the incremental-JS budget; either icon is replaceable via the `play-icon`/`pause-icon` slots.
- `--bx-animated-image-control-box-size` defaults to `max(--bx-control-height-m, --bx-target-min)`, so the toggle scales with `--bx-scale` but never drops below the accessible touch-target floor.
- This is the first component built in `@bixboards/core`; it also introduces `BixElement` (`src/bix-element.ts`, every component's base class — `box-sizing` reset, `tagName`/`define()` registration, `prefersReducedMotion`), the shared `IntersectionObserver` pool (`src/internal/shared-observers.ts`) and the `defineCustomElement` helper (`src/internal/register.ts`), all of which later components should reuse rather than duplicating.
- Visual language follows AGENTS.md's shadcn-inspired direction: a 1px bordered frame instead of a shadow, a bordered ghost-style toggle instead of a solid dark scrim, `--bx-radius-m` instead of a pill. Every visual surface on the toggle and frame is its own CSS custom property (see above) so it can be reskinned without forking the component.
- Open: confirm final property names against the custom-elements manifest once the CEM generation pipeline exists.
