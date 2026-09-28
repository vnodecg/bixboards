# `<bx-carousel>`

> Scroll-snap carousel with pagination, navigation, autoplay, multi-slide and drag.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Imagery        |
| **Tag**             | `bx-carousel`  |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Scroll-snap carousel with pagination, navigation, autoplay, multi-slide and drag. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                | Type                   | Default      | Description                 |
| ------------------- | ---------------------- | ------------ | --------------------------- |
| `loop`              | boolean                | false        | -                           |
| `navigation`        | boolean                | false        | -                           |
| `pagination`        | boolean                | false        | -                           |
| `autoplay`          | boolean                | false        | -                           |
| `autoplay-interval` | number                 | 3000         | -                           |
| `slides-per-page`   | number                 | 1            | Also accepts responsive map |
| `slides-per-move`   | number                 | 1            | -                           |
| `orientation`       | horizontal \| vertical | "horizontal" | -                           |
| `mouse-dragging`    | boolean                | false        | -                           |

### Slots

| Slot            | Description      |
| --------------- | ---------------- |
| `(default)`     | bx-carousel-item |
| `next-icon`     | -                |
| `previous-icon` | -                |

### Events

| Event             | Detail / notes             |
| ----------------- | -------------------------- |
| `bx-slide-change` | detail.index, detail.slide |

### CSS parts

`base`, `scroll-container`, `pagination`, `pagination-item`, `navigation`, `navigation-button`, `navigation-button--previous`, `navigation-button--next`

### CSS custom properties

`--slide-gap`, `--aspect-ratio`, `--scroll-hint`

### Methods

`next()`, `previous()`, `goToSlide(index, behavior)`

## 3. Functional requirements

- **FR-CAROUSEL-01** CSS scroll-snap based: native momentum on touch, no JS transform layout.
- **FR-CAROUSEL-02** Autoplay pauses on hover, focus, hidden tab, and reduced motion.
- **FR-CAROUSEL-03** Only slides near the viewport render heavy content (`loading="lazy"` propagation).
- **FR-CAROUSEL-04** `slides-per-page` resolved from the container width via container queries.

## 4. Fluid scaling

Gap, nav buttons and pagination dots scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Slides-per-page breakpoints are container-based (`slides-per-page="1 480px:2 800px:3"`).

## 6. Accessibility

- `role="region" aria-roledescription="carousel"`; slides `group` with "n of m"; autoplay has pause control.
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

- [ ] All FR-CAROUSEL-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Container-based slides-per-page.
- Open: confirm final property names against the custom-elements manifest during implementation.
