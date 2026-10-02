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

| Part           | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `form-control` | The outer wrapper (label + base + hint).                         |
| `label`        | The label element.                                               |
| `hint`         | The wrapper around the hint slot.                                |
| `base`         | The wrapper around the textarea and count.                       |
| `textarea`     | The native `<textarea>`.                                         |
| `count`        | The visible character counter, present when `show-count` is set. |

### CSS custom properties

| Property                                 | Description                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--bx-textarea-max-height`               | Caps auto-resize growth. Unset: grows unbounded.                                                       |
| `--bx-textarea-form-control-gap`         | Gap of the `form-control` part. Default `var(--bx-space-xs)`.                                          |
| `--bx-textarea-label-fg`                 | Text/icon color of the `label` part. Default `var(--bx-text-primary)`.                                 |
| `--bx-textarea-radius`                   | Corner radius of the root surface. Default `var(--bx-radius-m)`.                                       |
| `--bx-textarea-border-width`             | Border width of the root surface. Default `var(--bx-border-width)`.                                    |
| `--bx-textarea-border-color`             | Border color of the root surface. Default `var(--bx-border-subtle)`.                                   |
| `--bx-textarea-bg`                       | Background of the root surface. Default `var(--bx-surface-base)`.                                      |
| `--bx-textarea-focus-ring-width`         | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.           |
| `--bx-textarea-disabled-bg`              | Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.                   |
| `--bx-textarea-disabled-fg`              | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.               |
| `--bx-textarea-invalid-border-color`     | Border color of the root surface (invalid state). Default `var(--bx-role-danger-border)`.              |
| `--bx-textarea-min-height`               | Minimum height of the root surface. Default `calc(var(--bx-unit) * 1.5 * 2)`.                          |
| `--bx-textarea-padding-block`            | Padding block of the root surface. Default `var(--bx-space-xs)`.                                       |
| `--bx-textarea-padding-inline`           | Padding inline of the root surface. Default `var(--bx-space-m)`.                                       |
| `--bx-textarea-placeholder-fg`           | Text/icon color of the `::placeholder`. Default `var(--bx-text-secondary)`.                            |
| `--bx-textarea-count-padding-inline-end` | Padding inline end of the `count` part. Default `var(--bx-space-m)`.                                   |
| `--bx-textarea-count-padding-block-end`  | Padding block end of the `count` part. Default `var(--bx-space-2xs)`.                                  |
| `--bx-textarea-count-fg`                 | Text/icon color of the `count` part. Default `var(--bx-text-secondary)`.                               |
| `--bx-textarea-hint-fg`                  | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                                |
| `--bx-textarea-hint-invalid-fg`          | Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.                |
| `--bx-textarea-count-over-limit-fg`      | Color of the character counter once `maxlength` is exceeded. Default `var(--bx-role-danger-fg)`.       |
| `--bx-textarea-hover-border-color`       | Border color while hovered. Default `var(--bx-border-strong)`.                                         |
| `--bx-textarea-focus-border-color`       | Border color while focused. Default `var(--bx-focus-ring)`.                                            |
| `--bx-textarea-focus-shadow`             | Soft halo around the field while focused. Default a translucent `--bx-focus-ring` ring.                |
| `--bx-textarea-hover-bg`                 | Background of a `filled` field while hovered. Default `var(--bx-surface-muted)`.                       |
| `--bx-textarea-focus-bg`                 | Background of a `filled` field while focused. Default `var(--bx-surface-base)`.                        |
| `--bx-textarea-disabled-border-color`    | Border color when disabled. Default `var(--bx-border-subtle)`.                                         |
| `--bx-textarea-invalid-focus-shadow`     | Halo while focused and invalid. Default a translucent `--bx-role-danger-border` ring.                  |
| `--bx-textarea-placeholder-opacity`      | Placeholder opacity. Default `1`.                                                                      |
| `--bx-textarea-font-family`              | Font family of the root surface. Default `var(--bx-type-body-family)`.                                 |
| `--bx-textarea-label-font-family`        | Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.         |
| `--bx-textarea-label-font-size`          | Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.           |
| `--bx-textarea-label-font-weight`        | Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.       |
| `--bx-textarea-label-line-height`        | Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.      |
| `--bx-textarea-label-letter-spacing`     | Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.  |
| `--bx-textarea-font-family`              | Font family of the root surface (text style `body-m`). Default `var(--bx-type-body-family)`.           |
| `--bx-textarea-font-size`                | Font size of the root surface (text style `body-m`). Default `var(--bx-type-body-m-size)`.             |
| `--bx-textarea-font-weight`              | Font weight of the root surface (text style `body-m`). Default `var(--bx-type-body-m-weight)`.         |
| `--bx-textarea-line-height`              | Line height of the root surface (text style `body-m`). Default `var(--bx-type-body-m-leading)`.        |
| `--bx-textarea-letter-spacing`           | Letter spacing of the root surface (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.    |
| `--bx-textarea-count-font-family`        | Font family of the `count` element (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-textarea-count-font-size`          | Font size of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-textarea-count-font-weight`        | Font weight of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-textarea-count-line-height`        | Line height of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-textarea-count-letter-spacing`     | Letter spacing of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |
| `--bx-textarea-hint-font-family`         | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.            |
| `--bx-textarea-hint-font-size`           | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.              |
| `--bx-textarea-hint-font-weight`         | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.          |
| `--bx-textarea-hint-line-height`         | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.         |
| `--bx-textarea-hint-letter-spacing`      | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.     |

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
