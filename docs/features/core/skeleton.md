# `<bx-skeleton>`

> Placeholder shimmer while content loads.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Feedback       |
| **Tag**             | `bx-skeleton`  |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Placeholder shimmer while content loads. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name     | Type                         | Default | Description       |
| -------- | ---------------------------- | ------- | ----------------- |
| `effect` | "none" \| "pulse" \| "sheen" | "none"  | Loading animation |

### Slots

_None._

### Events

_None._

### CSS parts

`indicator`

### CSS custom properties

`--bx-skeleton-color`, `--bx-skeleton-sheen-color`, `--bx-skeleton-border-radius`

### Methods

_None._

## 3. Functional requirements

- **FR-SKELETON-01** Composable shapes (line, circle, block) via CSS custom props.
- **FR-SKELETON-02** Animation paused when off-screen (IntersectionObserver) and under reduced motion.

## 4. Fluid scaling

Default height = 1 line-height unit.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- `aria-hidden`; container should set `aria-busy="true"`.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Skeleton row helper for tables/lists renders lightweight static divs, not N web components.
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

- [ ] All FR-SKELETON-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds skeleton-row primitive consumed by data-table/data-list.
- Open: confirm final property names against the custom-elements manifest during implementation.
