# `<bx-tag-input>`

> Free-form multi-value entry that turns typed text into removable chips.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-tag-input`         |
| **Status**          | Implemented            |
| **Form-associated** | Yes (ElementInternals) |
| **Depends on**      | `chip`, `input`        |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Free-form multi-value entry that turns typed text into removable chips. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name               | Type                        | Default | Description                   |
| ------------------ | --------------------------- | ------- | ----------------------------- |
| `label`            | string                      | ""      | -                             |
| `value`            | string[]                    | []      | -                             |
| `delimiters`       | string                      | ",\n"   | Characters that commit a tag. |
| `allow-duplicates` | boolean                     | false   | -                             |
| `max`              | number                      | 0       | Max tags (0 = unlimited).     |
| `validate`         | (value)=>boolean (property) | -       | Per-tag validation.           |
| `placeholder`      | string                      | ""      | -                             |
| `required`         | boolean                     | false   | -                             |
| `disabled`         | boolean                     | false   | -                             |
| `readonly`         | boolean                     | false   | -                             |
| `size`             | s/m/l                       | "m"     | -                             |

### Slots

| Name    | Description |
| ------- | ----------- |
| `label` | -           |
| `hint`  | -           |

### Events

| Event        | Detail / notes                     |
| ------------ | ---------------------------------- |
| `input`      | -                                  |
| `change`     | detail.value.                      |
| `bx-add`     | detail.value.                      |
| `bx-remove`  | detail.value.                      |
| `bx-reject`  | Validation or limit refused a tag. |
| `bx-invalid` | -                                  |

### CSS parts

| Part           | Description              |
| -------------- | ------------------------ |
| `form-control` | The form-control part.   |
| `base`         | The tag + input surface. |
| `input`        | The text input.          |
| `tag`          | A tag chip.              |

### CSS custom properties

| Property                      | Description       |
| ----------------------------- | ----------------- |
| `--bx-tag-input-bg`           | Background.       |
| `--bx-tag-input-border-color` | Border color.     |
| `--bx-tag-input-radius`       | Corner radius.    |
| `--bx-tag-input-gap`          | Gap between tags. |

### Methods

`focus()`, `add(value)`, `remove(value)`, `clear()`, `checkValidity()`

## 3. Functional requirements

- **FR-TAGINPUT-01** Form-associated; submits one entry per tag under the same name.
- **FR-TAGINPUT-02** Paste splits on delimiters.
- **FR-TAGINPUT-03** Backspace in an empty input selects, then removes, the last tag.
- **FR-TAGINPUT-04** Composes `bx-chip` with `removable`.

## 4. Fluid scaling

As `bx-input`.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Chips wrap; the input takes a full row when space is short.

## 6. Accessibility

- Input plus a list of tags; removal buttons labelled "Remove {tag}"; add/remove announced politely.
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

- [ ] All FR-TAGINPUT-* requirements covered by unit/component tests (`tag-input.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
