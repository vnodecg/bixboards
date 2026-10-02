# `<bx-checkbox>`

> Binary or indeterminate selection.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-checkbox`          |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Binary or indeterminate selection. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name            | Type    | Default  | Description            |
| --------------- | ------- | -------- | ---------------------- |
| `name`          | string  | ""       | -                      |
| `value`         | string  | "on"     | Submitted when checked |
| `checked`       | boolean | false    | -                      |
| `indeterminate` | boolean | false    | -                      |
| `disabled`      | boolean | false    | -                      |
| `required`      | boolean | false    | -                      |
| `size`          | s/m/l   | "medium" | -                      |
| `hint`          | string  | ""       | -                      |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | Label       |
| `hint`      | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

| Part                 | Description                          |
| -------------------- | ------------------------------------ |
| `base`               | The outer label wrapper.             |
| `control`            | The checkbox box.                    |
| `checked-icon`       | The checkmark icon.                  |
| `indeterminate-icon` | The indeterminate (dash) icon.       |
| `label`              | The wrapper around the default slot. |
| `hint`               | The wrapper around the hint slot.    |

### CSS custom properties

| Property                                      | Description                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--bx-checkbox-checked-icon-color`            | Icon color when checked/indeterminate. Default `--bx-on-accent`.                                   |
| `--bx-checkbox-gap`                           | Gap of the root surface. Default `var(--bx-space-xs)`.                                             |
| `--bx-checkbox-disabled-fg`                   | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.           |
| `--bx-checkbox-control-border-width`          | Border width of the `control` part. Default `var(--bx-border-width-strong)`.                       |
| `--bx-checkbox-control-border-color`          | Border color of the `control` part. Default `var(--bx-border-strong)`.                             |
| `--bx-checkbox-control-radius`                | Corner radius of the `control` part. Default `var(--bx-radius-s)`.                                 |
| `--bx-checkbox-control-bg`                    | Background of the `control` part. Default `var(--bx-surface-base)`.                                |
| `--bx-checkbox-control-checked-border-color`  | Border color of the `control` part (checked state). Default `var(--bx-role-accent)`.               |
| `--bx-checkbox-control-checked-bg`            | Background of the `control` part (checked state). Default `var(--bx-role-accent)`.                 |
| `--bx-checkbox-control-focus-ring-width`      | Focus ring width of the `control` part (focus state). Default `var(--bx-border-width-strong)`.     |
| `--bx-checkbox-control-focus-ring-color`      | Focus ring color of the `control` part (focus state). Default `var(--bx-focus-ring)`.              |
| `--bx-checkbox-control-focus-ring-offset`     | Focus ring offset of the `control` part (focus state). Default `var(--bx-focus-ring-offset)`.      |
| `--bx-checkbox-control-disabled-border-color` | Border color of the `control` part (disabled state). Default `var(--bx-border-subtle)`.            |
| `--bx-checkbox-control-disabled-bg`           | Background of the `control` part (disabled state). Default `var(--bx-surface-subtle)`.             |
| `--bx-checkbox-label-padding-block-start`     | Padding block start of the `label` part. Default `calc((var(--bx-target-min) - 1lh) / 2)`.         |
| `--bx-checkbox-label-min-height`              | Minimum height of the `label` part. Default `var(--bx-target-min)`.                                |
| `--bx-checkbox-hint-fg`                       | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                            |
| `--bx-checkbox-size`                          | Control size (width and height). Default `calc(var(--bx-unit) * 1.25)`, or per `size`.             |
| `--bx-checkbox-font-family`                   | Font family of the root surface. Default `var(--bx-type-body-family)`.                             |
| `--bx-checkbox-hint-font-family`              | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-checkbox-hint-font-size`                | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-checkbox-hint-font-weight`              | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-checkbox-hint-line-height`              | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-checkbox-hint-letter-spacing`           | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

### Methods

`click()`, `focus()`, `blur()`

## 3. Functional requirements

- **FR-CHECKBOX-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-CHECKBOX-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-CHECKBOX-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-CHECKBOX-04** Indeterminate cleared on user toggle.
- **FR-CHECKBOX-05** Usable as cheap row selector in `bx-data-table` (lite render path, no shadow slotting overhead).

## 4. Fluid scaling

Box size scales with type; hit target padded to ≥44 px.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- `role="checkbox"` with `aria-checked="mixed"` for indeterminate.
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

- [ ] All FR-CHECKBOX-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Adds lite mode for data-table selection column.
- Open: confirm final property names against the custom-elements manifest during implementation.
