# `<bx-context-menu>`

> Right-click / long-press menu anchored at the pointer, reusing dropdown items.

|                     |                                      |
| ------------------- | ------------------------------------ |
| **Package**         | `@bixboards/core`                    |
| **Category**        | Navigation                           |
| **Tag**             | `bx-context-menu`                    |
| **Status**          | Implemented                          |
| **Form-associated** | No                                   |
| **Depends on**      | `dropdown`, `dropdown-item`, `popup` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Right-click / long-press menu anchored at the pointer, reusing dropdown items. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name       | Type    | Default | Description                                   |
| ---------- | ------- | ------- | --------------------------------------------- |
| `for`      | string  | parent  | Id of the target element; defaults to parent. |
| `disabled` | boolean | false   | -                                             |
| `open`     | boolean | false   | -                                             |

### Slots

| Name        | Description                                      |
| ----------- | ------------------------------------------------ |
| `(default)` | `bx-dropdown-item` children, dividers, submenus. |

### Events

| Event                                               | Detail / notes |
| --------------------------------------------------- | -------------- |
| `bx-select`                                         | detail.item.   |
| `bx-show / bx-after-show / bx-hide / bx-after-hide` | -              |

### CSS parts

| Part    | Description     |
| ------- | --------------- |
| `menu`  | The menu part.  |
| `panel` | The panel part. |

### CSS custom properties

| Property                      | Description |
| ----------------------------- | ----------- |
| `--bx-context-menu-min-width` | Min width.  |

### Methods

`show(x, y)`, `hide()`

## 3. Functional requirements

- **FR-CONTEXTMENU-01** Opens on `contextmenu`, long-press (touch), and Shift+F10 / Menu key at the focused element.
- **FR-CONTEXTMENU-02** Positions with a virtual anchor via `bx-popup`; flips and shifts at viewport edges.
- **FR-CONTEXTMENU-03** Native browser menu is suppressed only when the component is enabled for that target.
- **FR-CONTEXTMENU-04** Reuses the keyboard model, typeahead and submenus of `bx-dropdown`.

## 4. Fluid scaling

As `bx-dropdown`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Clamped to the viewport.

## 6. Accessibility

- `role="menu"` with items; focus moves into the menu on open and returns to the target on close; the menu is keyboard-reachable via the Menu key.
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

- [ ] All FR-CONTEXTMENU-* requirements covered by unit/component tests (`context-menu.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
