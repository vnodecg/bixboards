# `<bx-combobox>`

> Text input with a filterable, virtualized listbox; free text or restricted to options; async source supported.

|                     |                                                     |
| ------------------- | --------------------------------------------------- |
| **Package**         | `@bixboards/core`                                   |
| **Category**        | Form                                                |
| **Tag**             | `bx-combobox`                                       |
| **Status**          | Implemented                                         |
| **Form-associated** | Yes (ElementInternals)                              |
| **Depends on**      | `select`, `option`, `popup`, `input`, `virtualizer` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Text input with a filterable, virtualized listbox; free text or restricted to options; async source supported. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name           | Type                              | Default    | Description                                    |
| -------------- | --------------------------------- | ---------- | ---------------------------------------------- |
| `label`        | string                            | ""         | -                                              |
| `hint`         | string                            | ""         | -                                              |
| `value`        | string/string[]                   | ""         | Selected value(s).                             |
| `multiple`     | boolean                           | false      | Tokens for selections.                         |
| `allow-custom` | boolean                           | false      | Accept values not in the list.                 |
| `filter`       | "contains"/"starts-with"/function | "contains" | Local filtering.                               |
| `loading`      | boolean                           | false      | Shows progress while an async source resolves. |
| `placeholder`  | string                            | ""         | -                                              |
| `required`     | boolean                           | false      | -                                              |
| `disabled`     | boolean                           | false      | -                                              |
| `size`         | s/m/l                             | "m"        | -                                              |
| `open`         | boolean                           | false      | Listbox visibility.                            |

### Slots

| Name        | Description                 |
| ----------- | --------------------------- |
| `(default)` | `bx-option` children.       |
| `label`     | -                           |
| `hint`      | -                           |
| `empty`     | Shown when nothing matches. |

### Events

| Event                                               | Detail / notes                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `input`                                             | Query text changed (detail.query) — drive async sources from this. |
| `change`                                            | Committed selection changed.                                       |
| `bx-show / bx-after-show / bx-hide / bx-after-hide` | Listbox lifecycle.                                                 |
| `bx-invalid`                                        | Constraint validation failed.                                      |

### CSS parts

| Part      | Description                  |
| --------- | ---------------------------- |
| `control` | The input surface.           |
| `input`   | The native input.            |
| `listbox` | The listbox.                 |
| `chip`    | A selection chip (multiple). |

### CSS custom properties

| Property                             | Description                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `--bx-combobox-bg`                   | Control background.                                                                                      |
| `--bx-combobox-border-color`         | Control border color.                                                                                    |
| `--bx-combobox-radius`               | Control radius.                                                                                          |
| `--bx-combobox-max-height`           | Max listbox height.                                                                                      |
| `--bx-combobox-font-family`          | Font family of the root surface. Default `var(--bx-type-field-family)`.                                  |
| `--bx-combobox-font-size`            | Font size of the root surface. Default `var(--bx-type-field-size)`.                                      |
| `--bx-combobox-font-weight`          | Font weight of the root surface. Default `var(--bx-type-field-weight)`.                                  |
| `--bx-combobox-line-height`          | Line height of the root surface. Default `var(--bx-type-field-leading)`.                                 |
| `--bx-combobox-letter-spacing`       | Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.                             |
| `--bx-combobox-empty-font-family`    | Font family of the `empty` text (text style `body-m`). Default `var(--bx-type-body-family)`.             |
| `--bx-combobox-empty-font-size`      | Font size of the `empty` text (text style `body-m`). Default `var(--bx-type-body-m-size)`.               |
| `--bx-combobox-empty-font-weight`    | Font weight of the `empty` text (text style `body-m`). Default `var(--bx-type-body-m-weight)`.           |
| `--bx-combobox-empty-line-height`    | Line height of the `empty` text (text style `body-m`). Default `var(--bx-type-body-m-leading)`.          |
| `--bx-combobox-empty-letter-spacing` | Letter spacing of the `empty` text (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.      |
| `--bx-combobox-hint-font-family`     | Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.        |
| `--bx-combobox-hint-font-size`       | Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.          |
| `--bx-combobox-hint-font-weight`     | Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.      |
| `--bx-combobox-hint-line-height`     | Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.     |
| `--bx-combobox-hint-letter-spacing`  | Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`. |
| `--bx-combobox-label-font-family`    | Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.           |
| `--bx-combobox-label-font-size`      | Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.             |
| `--bx-combobox-label-font-weight`    | Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.         |
| `--bx-combobox-label-line-height`    | Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.        |
| `--bx-combobox-label-letter-spacing` | Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.    |

### Methods

`focus()`, `blur()`, `show()`, `hide()`, `checkValidity()`, `reportValidity()`, `setCustomValidity()`

## 3. Functional requirements

- **FR-COMBOBOX-01** Form-associated; shares option model and virtualization with `bx-select` (`VirtualizerController`).
- **FR-COMBOBOX-02** Async mode: debounced `input` events, `loading` state, stale responses ignored.
- **FR-COMBOBOX-03** `allow-custom` creates a value from the query on Enter/blur.
- **FR-COMBOBOX-04** Typeahead filtering must not move DOM focus out of the input (`aria-activedescendant`).

## 4. Fluid scaling

Control height from the ramp; popup width matches the anchor.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Popup flips and shrinks to the available space.

## 6. Accessibility

- ARIA 1.2 combobox with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`; result count announced via a polite live region.
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

- [ ] All FR-COMBOBOX-* requirements covered by unit/component tests (`combobox.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
