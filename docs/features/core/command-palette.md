# `<bx-command-palette>`

> Global ⌘K-style launcher: fuzzy search over commands, pages and recent items with groups and shortcuts.

|                     |                                            |
| ------------------- | ------------------------------------------ |
| **Package**         | `@bixboards/core`                          |
| **Category**        | Navigation                                 |
| **Tag**             | `bx-command-palette`                       |
| **Status**          | Proposed (not implemented)                 |
| **Form-associated** | No                                         |
| **Depends on**      | `dialog`, `combobox`, `kbd`, `virtualizer` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Global ⌘K-style launcher: fuzzy search over commands, pages and recent items with groups and shortcuts. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type                 | Default   | Description                                               |
| ------------- | -------------------- | --------- | --------------------------------------------------------- |
| `open`        | boolean              | false     | -                                                         |
| `commands`    | Command[] (property) | []        | id, label, group, keywords, shortcut, icon, handler/href. |
| `placeholder` | string               | localized | -                                                         |
| `shortcut`    | string               | "mod+k"   | Global open chord; "" disables.                           |
| `loading`     | boolean              | false     | Async results.                                            |
| `recent`      | string[]             | []        | Recent command ids.                                       |
| `filter`      | function             | fuzzy     | Custom ranking.                                           |

### Slots

| Name     | Description                    |
| -------- | ------------------------------ |
| `empty`  | -                              |
| `footer` | Hints (↑↓ navigate, ↵ select). |

### Events

| Event                                               | Detail / notes                    |
| --------------------------------------------------- | --------------------------------- |
| `bx-select`                                         | Cancelable; detail.command.       |
| `input`                                             | detail.query (for async sources). |
| `bx-show / bx-after-show / bx-hide / bx-after-hide` | -                                 |

### CSS parts

| Part       | Description        |
| ---------- | ------------------ |
| `dialog`   | The dialog part.   |
| `input`    | The input part.    |
| `list`     | The list part.     |
| `group`    | The group part.    |
| `item`     | The item part.     |
| `shortcut` | The shortcut part. |
| `footer`   | The footer part.   |

### CSS custom properties

| Property                                | Description                                                              |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `--bx-command-palette-width`            | Dialog width.                                                            |
| `--bx-command-palette-max-height`       | List max height.                                                         |
| `--bx-command-palette-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-command-palette-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-command-palette-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`show()`, `hide()`, `toggle()`

## 3. Functional requirements

- **FR-COMMANDPALETTE-01** Built on `bx-dialog` plus the `bx-combobox` listbox pattern; list virtualized above ~200 results.
- **FR-COMMANDPALETTE-02** Fuzzy ranking is deterministic and unit-tested (prefix > word-start > subsequence).
- **FR-COMMANDPALETTE-03** Shortcut chords rendered with `bx-kbd`, with ⌘ on Apple platforms and Ctrl elsewhere.
- **FR-COMMANDPALETTE-04** Does not intercept the chord inside editable fields unless it includes a modifier.

## 4. Fluid scaling

Width in rem, capped by viewport.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Full-width sheet on narrow viewports.

## 6. Accessibility

- Dialog with a combobox/listbox; focus returns to the opener on close; result count announced.
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

- [ ] All FR-COMMANDPALETTE-* requirements covered by unit/component tests (`command-palette.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
