# `<bx-close-button>`

> Standard dismiss control (×) used by dialogs, drawers, callouts, toasts and chips.

|                     |                            |
| ------------------- | -------------------------- |
| **Package**         | `@bixboards/core`          |
| **Category**        | Actions                    |
| **Tag**             | `bx-close-button`          |
| **Status**          | Proposed (not implemented) |
| **Form-associated** | No                         |
| **Depends on**      | `icon-button`              |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Standard dismiss control (×) used by dialogs, drawers, callouts, toasts and chips. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type         | Default | Description                   |
| ------------ | ------------ | ------- | ----------------------------- |
| `label`      | string       | "Close" | Accessible name; localizable. |
| `size`       | s/m/l        | "m"     | -                             |
| `appearance` | plain/filled | "plain" | -                             |
| `disabled`   | boolean      | false   | -                             |

### Slots

_None._

### Events

| Event      | Detail / notes                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `click`    | Native click.                                                                                    |
| `bx-close` | Emitted on activation (bubbles, composed, cancelable). Hosts listen for this instead of `click`. |

### CSS parts

| Part   | Description         |
| ------ | ------------------- |
| `base` | The button surface. |
| `icon` | The × glyph.        |

### CSS custom properties

| Property                             | Description                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `--bx-close-button-size`             | Hit target size. Default `var(--bx-target-min)`.                         |
| `--bx-close-button-icon-size`        | Glyph size. Default `0.875em`.                                           |
| `--bx-close-button-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-close-button-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-close-button-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`focus()`, `blur()`

## 3. Functional requirements

- **FR-CLOSEBUTTON-01** Thin specialization of `bx-icon-button` with a fixed icon and localized default label.
- **FR-CLOSEBUTTON-02** `bx-close-button` replaces the ad-hoc close buttons inside dialog, drawer, callout and the planned toast and chip.
- **FR-CLOSEBUTTON-03** Escape handling stays in the owning overlay, not in the button.

## 4. Fluid scaling

Glyph scales with type; target size is never below 24 px (44 px on coarse pointers).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- Native button; default accessible name "Close" from the localization registry.
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

- [ ] All FR-CLOSEBUTTON-* requirements covered by unit/component tests (`close-button.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
