# `<bx-sidebar>`

> Application navigation rail with groups, nested items, collapse-to-icons and a mobile drawer mode.

|                     |                                              |
| ------------------- | -------------------------------------------- |
| **Package**         | `@bixboards/core`                            |
| **Category**        | Navigation                                   |
| **Tag**             | `bx-sidebar`                                 |
| **Status**          | Proposed (not implemented)                   |
| **Form-associated** | No                                           |
| **Depends on**      | `page`, `drawer`, `tooltip`, `badge`, `icon` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Application navigation rail with groups, nested items, collapse-to-icons and a mobile drawer mode. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type           | Default | Description                                  |
| ------------- | -------------- | ------- | -------------------------------------------- |
| `collapsed`   | boolean        | false   | Icon-only rail.                              |
| `collapsible` | boolean        | true    | -                                            |
| `mode`        | inline/overlay | auto    | Overlay on narrow containers.                |
| `open`        | boolean        | false   | Overlay visibility.                          |
| `width`       | string         | token   | -                                            |
| `persist-key` | string         | ""      | Remembers collapsed state in `localStorage`. |

### Slots

| Name        | Description                             |
| ----------- | --------------------------------------- |
| `header`    | Brand / workspace switcher.             |
| `(default)` | `bx-sidebar-group` / `bx-sidebar-item`. |
| `footer`    | User menu.                              |

### Events

| Event                | Detail / notes                                    |
| -------------------- | ------------------------------------------------- |
| `bx-collapse-change` | -                                                 |
| `bx-show / bx-hide`  | Overlay lifecycle.                                |
| `bx-navigate`        | From `bx-sidebar-item` (detail.href, cancelable). |

### CSS parts

| Part          | Description           |
| ------------- | --------------------- |
| `base`        | The base part.        |
| `header`      | The header part.      |
| `content`     | The content part.     |
| `footer`      | The footer part.      |
| `toggle`      | Collapse button.      |
| `item`        | The item part.        |
| `group-label` | The group-label part. |

### CSS custom properties

| Property                        | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `--bx-sidebar-width`            | Expanded width.                                                          |
| `--bx-sidebar-width-collapsed`  | Rail width.                                                              |
| `--bx-sidebar-bg`               | Background.                                                              |
| `--bx-sidebar-item-bg-active`   | Active item background.                                                  |
| `--bx-sidebar-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-sidebar-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-sidebar-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`toggle()`, `collapse()`, `expand()`, `show()`, `hide()`

## 3. Functional requirements

- **FR-SIDEBAR-01** Designed to sit in the `bx-page` `navigation` slot and reuse its responsive collapse.
- **FR-SIDEBAR-02** Collapsed items show a `bx-tooltip` with their label and flyout submenus.
- **FR-SIDEBAR-03** Items support `href`, `active`, badge, nested children (max 2 levels) and disabled.
- **FR-SIDEBAR-04** Overlay mode traps focus like `bx-drawer`.

## 4. Fluid scaling

Widths from the unit token.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Inline to overlay via container thresholds on the page shell.

## 6. Accessibility

- `nav` landmark with label; active item `aria-current="page"`; nested groups use disclosure buttons with `aria-expanded`; collapse button labelled.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`.
- Svelte: typed component wrapper exposing props and callback events.

## 9. Acceptance criteria

- [ ] All FR-SIDEBAR-* requirements covered by unit/component tests (`sidebar.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
