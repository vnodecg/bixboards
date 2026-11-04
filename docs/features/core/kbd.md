# `<bx-kbd>`

> Keyboard shortcut display that adapts modifier glyphs to the platform.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Display           |
| **Tag**             | `bx-kbd`          |
| **Status**          | Implemented       |
| **Form-associated** | No                |
| **Depends on**      | none              |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Keyboard shortcut display that adapts modifier glyphs to the platform. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name       | Type             | Default | Description                  |
| ---------- | ---------------- | ------- | ---------------------------- |
| `keys`     | string           | ""      | Chord such as `mod+shift+k`. |
| `platform` | auto/mac/windows | "auto"  | -                            |
| `size`     | s/m              | "m"     | -                            |

### Slots

| Name        | Description               |
| ----------- | ------------------------- |
| `(default)` | Literal text alternative. |

### Events

_None._

### CSS parts

| Part        | Description                     |
| ----------- | ------------------------------- |
| `base`      | The wrapper around the chord.   |
| `key`       | A single key cap.               |
| `separator` | The separator between key caps. |

### CSS custom properties

| Property                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `--bx-kbd-bg`           | Key cap background.                                  |
| `--bx-kbd-border-color` | Key cap border color.                                |
| `--bx-kbd-gap`          | Gap between key caps. Default `var(--bx-space-3xs)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-KBD-01** Uses native `<kbd>` elements inside the shadow tree.
- **FR-KBD-02** `mod` resolves to ⌘ on Apple platforms and Ctrl elsewhere; names (Esc, Enter, arrows) are localized.
- **FR-KBD-03** Platform detection happens in `connectedCallback`, never at import (SSR-safe).

## 4. Fluid scaling

Font size follows the type ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Inline.

## 6. Accessibility

- Exposes a text name ("Command K") via `aria-label`; glyphs are not read as symbols.
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

- [ ] All FR-KBD-* requirements covered by unit/component tests (`kbd.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
