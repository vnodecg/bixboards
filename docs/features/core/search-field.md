# `<bx-search-field>`

> Search-specific input with leading icon, clear button, debounced search event and optional suggestions.

|                     |                            |
| ------------------- | -------------------------- |
| **Package**         | `@bixboards/core`          |
| **Category**        | Form                       |
| **Tag**             | `bx-search-field`          |
| **Status**          | Implemented                |
| **Form-associated** | Yes (ElementInternals)     |
| **Depends on**      | `input`, _combobox_ (soft) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Search-specific input with leading icon, clear button, debounced search event and optional suggestions. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name          | Type    | Default  | Description                           |
| ------------- | ------- | -------- | ------------------------------------- |
| `label`       | string  | ""       | -                                     |
| `value`       | string  | ""       | -                                     |
| `placeholder` | string  | "Search" | -                                     |
| `debounce`    | number  | 250      | ms before `bx-search`.                |
| `loading`     | boolean | false    | -                                     |
| `clearable`   | boolean | true     | -                                     |
| `shortcut`    | string  | ""       | Global focus key chord, e.g. `mod+k`. |
| `size`        | s/m/l   | "m"      | -                                     |
| `disabled`    | boolean | false    | -                                     |

### Slots

| Name          | Description                              |
| ------------- | ---------------------------------------- |
| `start`       | Replaces the search icon.                |
| `end`         | Trailing content (e.g. a shortcut hint). |
| `suggestions` | Optional `bx-option` list.               |

### Events

| Event       | Detail / notes                        |
| ----------- | ------------------------------------- |
| `input`     | Each keystroke.                       |
| `bx-search` | Debounced or on Enter (detail.query). |
| `bx-clear`  | Clear button used.                    |

### CSS parts

| Part           | Description            |
| -------------- | ---------------------- |
| `form-control` | The form-control part. |
| `input`        | The input part.        |
| `clear-button` | The clear-button part. |
| `icon`         | The icon part.         |

### CSS custom properties

| Property                   | Description                                  |
| -------------------------- | -------------------------------------------- |
| `--bx-search-field-bg`     | Background.                                  |
| `--bx-search-field-radius` | Corner radius. Default `var(--bx-radius-l)`. |

### Methods

`focus()`, `blur()`, `select()`, `clear()`

## 3. Functional requirements

- **FR-SEARCHFIELD-01** Composes `bx-input type="search"`; Escape clears first, then blurs.
- **FR-SEARCHFIELD-02** With suggestions it follows the `bx-combobox` pattern.
- **FR-SEARCHFIELD-03** Shortcut registration is opt-in and skipped while another editable element has focus.

## 4. Fluid scaling

Same as `bx-input`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Shortcut hint hides below a rem threshold.

## 6. Accessibility

- `role="search"` landmark is the host app's choice (documented); input exposes `type="search"`; clear button labelled.
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
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; ships a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed component wrapper exposing props and callback events, and `bind:value`.

## 9. Acceptance criteria

- [ ] All FR-SEARCHFIELD-* requirements covered by unit/component tests (`search-field.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
