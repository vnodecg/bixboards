# `<bx-textarea>`

> Multi-line text with auto-resize, character count and resize handle control.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-textarea`          |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Multi-line text with auto-resize, character count and resize handle control. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                     | Type                                                     | Default    | Description                    |
| ------------------------ | -------------------------------------------------------- | ---------- | ------------------------------ |
| `name`                   | string                                                   | ""         | Form field name                |
| `value`                  | string                                                   | ""         | Current value                  |
| `disabled`               | boolean                                                  | false      | -                              |
| `required`               | boolean                                                  | false      | -                              |
| `form`                   | string                                                   | ""         | Associate with form by id      |
| `hint`                   | string                                                   | ""         | Help text (also `hint` slot)   |
| `label`                  | string                                                   | ""         | Label (also `label` slot)      |
| `size`                   | "small" \| "medium" \| "large"                           | "medium"   | -                              |
| `with-label / with-hint` | boolean                                                  | false      | Opt into slot-based label/hint |
| `rows`                   | number                                                   | 4          | -                              |
| `resize`                 | "none" \| "vertical" \| "horizontal" \| "both" \| "auto" | "vertical" | `auto` grows with content      |
| `minlength / maxlength`  | number                                                   | -          | -                              |
| `placeholder`            | string                                                   | ""         | -                              |
| `readonly`               | boolean                                                  | false      | -                              |
| `appearance`             | outlined \| filled \| filled outlined                    | "outlined" | -                              |
| `autocapitalize`         | string                                                   | -          | -                              |
| `spellcheck`             | boolean                                                  | true       | -                              |
| `show-count`             | boolean                                                  | false      | Character counter              |

### Slots

| Slot    | Description |
| ------- | ----------- |
| `label` | -           |
| `hint`  | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

`form-control`, `label`, `hint`, `base`, `textarea`, `count`

### CSS custom properties

`--bx-textarea-max-height`

### Methods

`focus()`, `select()`, `setSelectionRange()`, `setRangeText()`

## 3. Functional requirements

- **FR-TEXTAREA-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-TEXTAREA-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-TEXTAREA-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-TEXTAREA-04** Auto-resize measured without layout thrash (batched in rAF, uses `field-sizing: content` when available).
- **FR-TEXTAREA-05** Handles very large values (≥1 MB) without freezing: count computed lazily.

## 4. Fluid scaling

As `bx-input`; min rows scale line-height.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- Counter announced politely at thresholds, not every keystroke.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Hard budget: ≤ 1 ms median first render, ≤ 2 KB gzip incremental JS (excluding shared base).
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element, slots map to named children via `slot` attribute.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; form-associated components ship a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed action/component wrapper exposing props, `on:`/callback events and `bind:value` where applicable.

## 9. Acceptance criteria

- [ ] All FR-TEXTAREA-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
