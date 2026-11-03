# `<bx-avatar>`

> User image, initials or icon with shape variants.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Imagery           |
| **Tag**             | `bx-avatar`       |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

User image, initials or icon with shape variants. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name       | Type                              | Default  | Description      |
| ---------- | --------------------------------- | -------- | ---------------- |
| `image`    | string                            | ""       | -                |
| `label`    | string                            | ""       | Accessible label |
| `initials` | string                            | ""       | -                |
| `loading`  | "eager" \| "lazy"                 | "eager"  | -                |
| `shape`    | "circle" \| "square" \| "rounded" | "circle" | -                |

### Slots

| Slot        | Description    |
| ----------- | -------------- |
| `icon`      | -              |
| `(default)` | Custom content |

### Events

| Event      | Detail / notes |
| ---------- | -------------- |
| `bx-error` | -              |

### CSS parts

| Part       | Description                                            |
| ---------- | ------------------------------------------------------ |
| `base`     | The host's inner wrapper.                              |
| `image`    | The `<img>` element, present while an image is loaded. |
| `initials` | The initials text, present as a fallback.              |
| `icon`     | The icon slot wrapper, present as the final fallback.  |

### CSS custom properties

| Property                     | Description                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `--bx-avatar-size`           | Diameter/side length. Default a fluid step (`calc(var(--bx-unit) * 2.5)`).                                  |
| `--bx-avatar-bg`             | Background of the root surface. Default `var(--bx-surface-muted)`.                                          |
| `--bx-avatar-fg`             | Text/icon color of the root surface. Default `var(--bx-text-secondary)`.                                    |
| `--bx-avatar-border-width`   | Border width of the root surface. Default `var(--bx-border-width)`.                                         |
| `--bx-avatar-border-color`   | Border color of the root surface. Default `var(--bx-border-subtle)`.                                        |
| `--bx-avatar-radius`         | Corner radius of the root surface. Default `var(--bx-radius-pill)`.                                         |
| `--bx-avatar-font-family`    | Font family of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-family)`.         |
| `--bx-avatar-font-size`      | Font size of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-size)`.          |
| `--bx-avatar-font-weight`    | Font weight of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-weight)`.      |
| `--bx-avatar-line-height`    | Line height of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-leading)`.     |
| `--bx-avatar-letter-spacing` | Letter spacing of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-AVATAR-01** Falls back image → initials → icon on error.
- **FR-AVATAR-02** Avatar-group layout via `bx-avatar-group`-style container class with overlap and "+N".

## 4. Fluid scaling

`--bx-avatar-size` default is a fluid step; initials scale in cqi.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Group collapses to "+N" by measured width.

## 6. Accessibility

- `role="img"` with label.
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

- [x] All FR-AVATAR-* requirements covered by unit/component tests (Web Test Runner, real browsers: Chromium; Firefox/WebKit run in CI). See `packages/core/src/avatar/avatar.test.ts`.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations, asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan. Not applicable: the avatar has no interactive state of its own.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Implemented in `@bixboards/core` (`src/avatar/`), as `BxAvatar` plus a separate `BxAvatarGroup` (tag `bx-avatar-group`) for FR-AVATAR-02.
- The default slot takes priority over image/initials/icon when it has assigned content, for fully custom avatar contents; `image` failing to load dispatches `bx-error` and falls back to `initials`, then the `icon` slot.
- `bx-avatar-group`'s overflow ("+N") is driven by a `max` attribute over slotted children rather than a `ResizeObserver` measuring container width — deterministic under SSR and in tests, at the cost of not reflowing automatically when the container shrinks. A measured version can replace this later without changing the public API (`max`, `(default)` slot, `overflow` part).
- Open: confirm final property names against the custom-elements manifest once the CEM generation pipeline exists.
