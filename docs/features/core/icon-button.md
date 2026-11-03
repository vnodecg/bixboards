# `<bx-icon-button>`

> Square or round button that shows only an icon, with a required accessible label.

|                     |                             |
| ------------------- | --------------------------- |
| **Package**         | `@bixboards/core`           |
| **Category**        | Actions                     |
| **Tag**             | `bx-icon-button`            |
| **Status**          | Proposed (not implemented)  |
| **Form-associated** | No                          |
| **Depends on**      | `button`, `icon`, `spinner` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Square or round button that shows only an icon, with a required accessible label. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                                     | Default     | Description                                    |
| ------------ | ---------------------------------------- | ----------- | ---------------------------------------------- |
| `label`      | string                                   | ""          | Accessible name (required; sets `aria-label`). |
| `name`       | string                                   | ""          | Icon name from the registered library.         |
| `src`        | string                                   | ""          | Icon URL (alternative to `name`).              |
| `variant`    | primary/secondary/tertiary/warning/error | "secondary" | Role palette.                                  |
| `appearance` | filled/outlined/plain                    | "plain"     | Surface style.                                 |
| `size`       | s/m/l                                    | "m"         | Control size.                                  |
| `shape`      | square/circle                            | "square"    | Corner shape.                                  |
| `disabled`   | boolean                                  | false       | -                                              |
| `loading`    | boolean                                  | false       | Shows a spinner and sets `aria-busy`.          |
| `href`       | string                                   | ""          | Link mode, as `bx-button`.                     |

### Slots

| Name        | Description                               |
| ----------- | ----------------------------------------- |
| `(default)` | Icon content when not using `name`/`src`. |

### Events

| Event   | Detail / notes                                    |
| ------- | ------------------------------------------------- |
| `click` | Native click (not emitted when disabled/loading). |

### CSS parts

| Part      | Description              |
| --------- | ------------------------ |
| `base`    | The interactive surface. |
| `icon`    | The `bx-icon`.           |
| `spinner` | Loading spinner.         |

### CSS custom properties

| Property                            | Description                                                              |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `--bx-icon-button-size`             | Width and height. Default derived from `size`.                           |
| `--bx-icon-button-bg`               | Background. Default role/appearance combination.                         |
| `--bx-icon-button-icon-size`        | Icon size. Default `1.25em`.                                             |
| `--bx-icon-button-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-icon-button-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-icon-button-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`focus()`, `blur()`, `click()`

## 3. Functional requirements

- **FR-ICONBUTTON-01** Reuses `bx-button` state, link-mode and form-submission behavior; only layout and icon sizing differ.
- **FR-ICONBUTTON-02** Missing `label` logs a dev warning and fails the axe check in tests.
- **FR-ICONBUTTON-03** Hit area is never below `--bx-target-min`, even when the visual size is smaller.

## 4. Fluid scaling

Size follows the control-height ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None; intrinsic size.

## 6. Accessibility

- `<button>`/`<a>` semantics with `aria-label`; Space/Enter activate; `aria-busy` while loading.
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

- [ ] All FR-ICONBUTTON-* requirements covered by unit/component tests (`icon-button.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
