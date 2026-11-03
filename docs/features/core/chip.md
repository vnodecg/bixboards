# `<bx-chip>`

> Compact token for tags, filters and selections; optionally selectable, removable or clickable.

|                     |                                |
| ------------------- | ------------------------------ |
| **Package**         | `@bixboards/core`              |
| **Category**        | Feedback                       |
| **Tag**             | `bx-chip`                      |
| **Status**          | Proposed (not implemented)     |
| **Form-associated** | No                             |
| **Depends on**      | `close-button`, _badge_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Compact token for tags, filters and selections; optionally selectable, removable or clickable. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                   | Default   | Description           |
| ------------ | ---------------------- | --------- | --------------------- |
| `variant`    | role palette           | "neutral" | -                     |
| `appearance` | filled/outlined/subtle | "subtle"  | -                     |
| `size`       | s/m/l                  | "m"       | -                     |
| `selectable` | boolean                | false     | Toggle behavior.      |
| `selected`   | boolean                | false     | -                     |
| `removable`  | boolean                | false     | Shows a close button. |
| `disabled`   | boolean                | false     | -                     |
| `pill`       | boolean                | true      | Fully rounded.        |
| `value`      | string                 | ""        | -                     |

### Slots

| Name        | Description       |
| ----------- | ----------------- |
| `(default)` | Label.            |
| `start`     | Avatar or icon.   |
| `end`       | Trailing content. |

### Events

| Event       | Detail / notes                 |
| ----------- | ------------------------------ |
| `change`    | Selected state changed.        |
| `bx-remove` | Cancelable; removal requested. |
| `click`     | -                              |

### CSS parts

| Part            | Description             |
| --------------- | ----------------------- |
| `base`          | The base part.          |
| `label`         | The label part.         |
| `remove-button` | The remove-button part. |

### CSS custom properties

| Property                     | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `--bx-chip-bg`               | Background.                                                              |
| `--bx-chip-fg`               | Foreground.                                                              |
| `--bx-chip-radius`           | Corner radius.                                                           |
| `--bx-chip-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-chip-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-chip-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`focus()`, `blur()`

## 3. Functional requirements

- **FR-CHIP-01** A `bx-chip-group` wrapper (optional) provides single/multiple selection and roving tabindex.
- **FR-CHIP-02** Remove is keyboard reachable (Delete/Backspace on the focused chip).
- **FR-CHIP-03** Distinct from `bx-badge`: chips are interactive, badges are status.

## 4. Fluid scaling

Height from the control ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Label truncates with ellipsis.

## 6. Accessibility

- Selectable chips use `role="option"`/`aria-selected` inside a listbox group, or `aria-pressed` standalone; remove button labelled.
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

- [ ] All FR-CHIP-* requirements covered by unit/component tests (`chip.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
