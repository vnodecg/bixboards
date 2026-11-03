# `<bx-divider>`

> Horizontal or vertical rule.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Organization      |
| **Tag**             | `bx-divider`      |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Horizontal or vertical rule. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name          | Type                   | Default      | Description |
| ------------- | ---------------------- | ------------ | ----------- |
| `orientation` | horizontal \| vertical | "horizontal" | -           |

### Slots

_None._

### Events

_None._

### CSS parts

_None._

### CSS custom properties

| Property               | Description                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `--bx-divider-color`   | Rule color. Default `--bx-border-subtle`.                                                                                    |
| `--bx-divider-width`   | Rule thickness. Default `--bx-border-width` (1 device px, the only fixed-px exception per docs/features/_conventions.md §2). |
| `--bx-divider-spacing` | Margin on the axis perpendicular to the rule. Default `--bx-space-m`.                                                        |

### Methods

_None._

## 3. Functional requirements

- **FR-DIVIDER-01** `role="separator"`.

## 4. Fluid scaling

Spacing scales; width stays 1 device px.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- Separator semantics.
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

- [x] All FR-DIVIDER-* requirements covered by unit/component tests (Web Test Runner, real browsers: Chromium; Firefox/WebKit run in CI). See `packages/core/src/divider/divider.test.ts`.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations, asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan. Not applicable: the divider has no interactive state.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Implemented in `@bixboards/core` (`src/divider/`), following the pattern established by `bx-animated-image`.
- `orientation="vertical"` needs a sizing context from its parent (flex/grid item, or an explicit block-size) — a vertical rule has no intrinsic height, the same constraint a vertical `<hr>` would have.
- Open: confirm final property names against the custom-elements manifest once the CEM generation pipeline exists.
