# `<bx-code-block>`

> Syntax-highlighted code with line numbers, highlighting, wrapping and a built-in copy button.

|                     |                           |
| ------------------- | ------------------------- |
| **Package**         | `@bixboards/core`         |
| **Category**        | Display                   |
| **Tag**             | `bx-code-block`           |
| **Status**          | Implemented               |
| **Form-associated** | No                        |
| **Depends on**      | `copy-button`, `scroller` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Syntax-highlighted code with line numbers, highlighting, wrapping and a built-in copy button. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name              | Type    | Default     | Description                           |
| ----------------- | ------- | ----------- | ------------------------------------- |
| `language`        | string  | "plaintext" | Grammar id.                           |
| `code`            | string  | ""          | Source (alternative to slotted text). |
| `line-numbers`    | boolean | false       | -                                     |
| `highlight-lines` | string  | ""          | e.g. `2,5-7`.                         |
| `wrap`            | boolean | false       | -                                     |
| `filename`        | string  | ""          | Header caption.                       |
| `copyable`        | boolean | true        | -                                     |

### Slots

| Name        | Description  |
| ----------- | ------------ |
| `(default)` | Source text. |
| `header`    | -            |

### Events

| Event     | Detail / notes        |
| --------- | --------------------- |
| `bx-copy` | Via `bx-copy-button`. |

### CSS parts

| Part          | Description           |
| ------------- | --------------------- |
| `base`        | The base part.        |
| `header`      | The header part.      |
| `pre`         | The pre part.         |
| `line`        | The line part.        |
| `line-number` | The line-number part. |
| `copy-button` | The copy-button part. |

### CSS custom properties

| Property                                | Description                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--bx-code-block-bg`                    | Background.                                                                                                |
| `--bx-code-block-line-highlight`        | Highlighted line background.                                                                               |
| `--bx-code-block-font-family`           | Font family of the root surface. Default `var(--bx-type-code-family)`.                                     |
| `--bx-code-block-font-size`             | Font size of the root surface. Default `var(--bx-type-code-size)`.                                         |
| `--bx-code-block-font-weight`           | Font weight of the root surface. Default `var(--bx-type-code-weight)`.                                     |
| `--bx-code-block-line-height`           | Line height of the root surface. Default `var(--bx-type-code-leading)`.                                    |
| `--bx-code-block-letter-spacing`        | Letter spacing of the root surface. Default `var(--bx-type-code-tracking)`.                                |
| `--bx-code-block-header-font-family`    | Font family of the `header` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.        |
| `--bx-code-block-header-font-size`      | Font size of the `header` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.          |
| `--bx-code-block-header-font-weight`    | Font weight of the `header` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.      |
| `--bx-code-block-header-line-height`    | Line height of the `header` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.     |
| `--bx-code-block-header-letter-spacing` | Letter spacing of the `header` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`. |

### Methods

_None._

## 3. Functional requirements

- **FR-CODEBLOCK-01** Highlighting is pluggable (`registerHighlighter`); the core ships no grammars, so bundles stay small.
- **FR-CODEBLOCK-02** Highlight token colors come from semantic tokens and meet 4.5:1 in both themes.
- **FR-CODEBLOCK-03** The scroll region is keyboard focusable.

## 4. Fluid scaling

Font size follows the type ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Horizontal scroll or wrap; never overflows its container.

## 6. Accessibility

- Scrollable region has `tabindex="0"` and a label; line numbers are `aria-hidden` and not selectable.
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

- [ ] All FR-CODEBLOCK-* requirements covered by unit/component tests (`code-block.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
