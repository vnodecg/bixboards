# `<bx-page>`

> Application shell layout: header, subheader, navigation, main, aside, footer with responsive collapse.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Organization   |
| **Tag**             | `bx-page`      |
| **Status**          | Implemented    |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Application shell layout: header, subheader, navigation, main, aside, footer with responsive collapse. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                        | Type                  | Default | Description                                   |
| --------------------------- | --------------------- | ------- | --------------------------------------------- |
| `view`                      | "mobile" \| "desktop" | -       | Reflects current layout                       |
| `nav-open`                  | boolean               | false   | -                                             |
| `nav-placement`             | "start" \| "end"      | "start" | -                                             |
| `disable-navigation-toggle` | boolean               | false   | -                                             |
| `mobile-breakpoint`         | css length \| "768px" | -       | Container-based, measured on the page element |

### Slots

| Slot                | Description |
| ------------------- | ----------- |
| `skip-to-content`   | -           |
| `banner`            | -           |
| `header`            | -           |
| `subheader`         | -           |
| `navigation-header` | -           |
| `navigation`        | -           |
| `navigation-footer` | -           |
| `main-header`       | -           |
| `(default)`         | main        |
| `main-footer`       | -           |
| `aside`             | -           |
| `footer`            | -           |
| `menu-button`       | -           |
| `hide-menu-button`  | -           |

### Events

| Event                 | Detail / notes |
| --------------------- | -------------- |
| `bx-page-view-change` | -              |
| `bx-page-nav-toggle`  | -              |

### CSS parts

`base`, `banner`, `header`, `subheader`, `main`, `navigation`, `aside`, `footer`

### CSS custom properties

`--menu-width`, `--aside-width`, `--main-width`, `--banner-height`, `--header-height`, `--subheader-height`, `--nav-transition`

### Methods

`showNavigation()`, `hideNavigation()`, `toggleNavigation()`

## 3. Functional requirements

- **FR-PAGE-01** Layout switches between desktop and mobile via container query on the page element (works embedded in a micro-frontend).
- **FR-PAGE-02** Navigation becomes an off-canvas drawer in mobile view with focus management.
- **FR-PAGE-03** Includes skip link and landmark roles.

## 4. Fluid scaling

Widths of nav/aside are fluid (`clamp`) and follow `--bx-scale`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Primary demonstration of container reflow: aside drops below main, nav becomes drawer.

## 6. Accessibility

- Landmarks: banner, navigation, main, complementary, contentinfo; skip link first in tab order.
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

- [ ] All FR-PAGE-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-PAGE-01/02/03 are covered in Chromium; Firefox/WebKit run in CI only. The `prefers-reduced-motion` opt-out and forced-colors rules are CSS-only and not asserted in a test.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (desktop, mobile closed, mobile drawer open, asserted in the component's test file; color-contrast is ignored for the drawer-open state because axe measures the inert page through the scrim); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Skip link, Escape-to-close and focus return are covered by tests and the Storybook story; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
- The mobile drawer is an absolutely positioned in-page panel (not a top-layer `<dialog>` like `bx-drawer`) so it stays within an embedding container. Focus containment is `inert` on everything else, so Tab can reach browser chrome.
- `mobile-breakpoint` is resolved to px through a probe element, so `rem`/`em` follow the live root font size.
- `--main-width` only caps the main column's maximum inline size.
