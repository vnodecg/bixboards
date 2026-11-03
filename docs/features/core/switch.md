# `<bx-switch>`

> On/off toggle.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-switch`            |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

On/off toggle. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name       | Type    | Default  | Description |
| ---------- | ------- | -------- | ----------- |
| `name`     | string  | ""       | -           |
| `value`    | string  | "on"     | -           |
| `checked`  | boolean | false    | -           |
| `disabled` | boolean | false    | -           |
| `required` | boolean | false    | -           |
| `size`     | s/m/l   | "medium" | -           |
| `hint`     | string  | ""       | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |
| `hint`      | -           |

### Events

| Event          | Detail / notes                            |
| -------------- | ----------------------------------------- |
| `input`        | Value changed by user (bubbles, composed) |
| `change`       | Committed change                          |
| `bx-invalid`   | Constraint validation failed              |
| `focus / blur` | -                                         |

### CSS parts

| Part      | Description                          |
| --------- | ------------------------------------ |
| `base`    | The outer label wrapper.             |
| `control` | The track.                           |
| `thumb`   | The moving thumb.                    |
| `label`   | The wrapper around the default slot. |
| `hint`    | The wrapper around the hint slot.    |

### CSS custom properties

| Property                                    | Description                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--bx-switch-width`                         | Track width. Default `calc(var(--bx-unit) * 2.75)`.                                                |
| `--bx-switch-height`                        | Track height. Default `calc(var(--bx-unit) * 1.5)`.                                                |
| `--bx-switch-thumb-size`                    | Thumb diameter. Default track height minus three insets.                                           |
| `--bx-switch-thumb-inset`                   | Gap between the thumb and the track edge. Default `--bx-border-width-strong`.                      |
| `--bx-switch-gap`                           | Gap of the root surface. Default `var(--bx-space-xs)`.                                             |
| `--bx-switch-disabled-fg`                   | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.           |
| `--bx-switch-control-border-width`          | Border width of the `control` part. Default `var(--bx-border-width-strong)`.                       |
| `--bx-switch-control-border-color`          | Border color of the `control` part. Default `var(--bx-border-strong)`.                             |
| `--bx-switch-control-radius`                | Corner radius of the `control` part. Default `var(--bx-radius-pill)`.                              |
| `--bx-switch-control-bg`                    | Background of the `control` part. Default `var(--bx-surface-subtle)`.                              |
| `--bx-switch-control-checked-border-color`  | Border color of the `control` part (checked state). Default `var(--bx-role-accent)`.               |
| `--bx-switch-control-checked-bg`            | Background of the `control` part (checked state). Default `var(--bx-role-accent)`.                 |
| `--bx-switch-control-focus-ring-width`      | Focus ring width of the `control` part (focus state). Default `var(--bx-border-width-strong)`.     |
| `--bx-switch-control-focus-ring-color`      | Focus ring color of the `control` part (focus state). Default `var(--bx-focus-ring)`.              |
| `--bx-switch-control-focus-ring-offset`     | Focus ring offset of the `control` part (focus state). Default `var(--bx-focus-ring-offset)`.      |
| `--bx-switch-control-disabled-border-color` | Border color of the `control` part (disabled state). Default `var(--bx-border-subtle)`.            |
| `--bx-switch-control-disabled-bg`           | Background of the `control` part (disabled state). Default `var(--bx-surface-subtle)`.             |
| `--bx-switch-thumb-bg`                      | Background of the `thumb` part. Default `var(--bx-surface-base)`.                                  |
| `--bx-switch-thumb-disabled-bg`             | Background of the `thumb` part (disabled state). Default `var(--bx-surface-subtle)`.               |
| `--bx-switch-label-padding-block-start`     | Padding block start of the `label` part. Default `calc((var(--bx-target-min) - 1lh) / 2)`.         |
| `--bx-switch-label-min-height`              | Minimum height of the `label` part. Default `var(--bx-target-min)`.                                |
| `--bx-switch-hint-fg`                       | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                            |
| `--bx-switch-font-family`                   | Font family of the root surface. Default `var(--bx-type-body-family)`.                             |
| `--bx-switch-hint-font-family`              | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.        |
| `--bx-switch-hint-font-size`                | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.          |
| `--bx-switch-hint-font-weight`              | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.      |
| `--bx-switch-hint-line-height`              | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.     |
| `--bx-switch-hint-letter-spacing`           | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`. |

### Methods

`click()`, `focus()`, `blur()`

## 3. Functional requirements

- **FR-SWITCH-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-SWITCH-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-SWITCH-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-SWITCH-04** Thumb travel animated with transform; reduced motion disables it.
- **FR-SWITCH-05** Drag-to-toggle on touch.

## 4. Fluid scaling

Track and thumb scale together.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- `role="switch"` `aria-checked`.
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

- [ ] All FR-SWITCH-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
