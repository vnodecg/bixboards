# `<bx-radio>`

> Single option within a radio group; supports default, button and card appearances.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixboards/core`      |
| **Category**        | Form                   |
| **Tag**             | `bx-radio`             |
| **Status**          | Planned                |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Single option within a radio group; supports default, button and card appearances. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name         | Type                  | Default   | Description |
| ------------ | --------------------- | --------- | ----------- |
| `value`      | string                | ""        | -           |
| `disabled`   | boolean               | false     | -           |
| `appearance` | "default" \| "button" | "default" | -           |
| `size`       | s/m/l                 | "medium"  | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |

### Events

| Event          | Detail / notes |
| -------------- | -------------- |
| `focus / blur` | -              |

### CSS parts

| Part           | Description                          |
| -------------- | ------------------------------------ |
| `base`         | The outer label wrapper.             |
| `control`      | The circular control.                |
| `checked-icon` | The filled dot shown when checked.   |
| `label`        | The wrapper around the default slot. |

### CSS custom properties

| Property                                   | Description                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `--bx-radio-gap`                           | Gap of the root surface. Default `var(--bx-space-xs)`.                                                            |
| `--bx-radio-disabled-fg`                   | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.                          |
| `--bx-radio-control-border-width`          | Border width of the `control` part. Default `var(--bx-border-width-strong)`.                                      |
| `--bx-radio-control-border-color`          | Border color of the `control` part. Default `var(--bx-border-strong)`.                                            |
| `--bx-radio-control-bg`                    | Background of the `control` part. Default `var(--bx-surface-base)`.                                               |
| `--bx-radio-control-checked-border-color`  | Border color of the `control` part (checked state). Default `var(--bx-role-accent)`.                              |
| `--bx-radio-control-focus-ring-width`      | Focus ring width of the `control` part (focus state). Default `var(--bx-border-width-strong)`.                    |
| `--bx-radio-control-focus-ring-color`      | Focus ring color of the `control` part (focus state). Default `var(--bx-focus-ring)`.                             |
| `--bx-radio-control-focus-ring-offset`     | Focus ring offset of the `control` part (focus state). Default `var(--bx-focus-ring-offset)`.                     |
| `--bx-radio-control-disabled-border-color` | Border color of the `control` part (disabled state). Default `var(--bx-border-subtle)`.                           |
| `--bx-radio-control-disabled-bg`           | Background of the `control` part (disabled state). Default `var(--bx-surface-subtle)`.                            |
| `--bx-radio-checked-icon-bg`               | Background of the `checked-icon` part. Default `var(--bx-role-accent)`.                                           |
| `--bx-radio-checked-icon-disabled-bg`      | Background of the `checked-icon` part (disabled state). Default `var(--bx-text-disabled)`.                        |
| `--bx-radio-label-padding-block-start`     | Padding block start of the `label` part. Default `calc((var(--bx-target-min) - 1lh) / 2)`.                        |
| `--bx-radio-label-min-height`              | Minimum height of the `label` part. Default `var(--bx-target-min)`.                                               |
| `--bx-radio-min-height`                    | Minimum height of the root surface. Default `var(--bx-target-min)`.                                               |
| `--bx-radio-padding-inline`                | Padding inline of the root surface. Default `var(--bx-space-m)`.                                                  |
| `--bx-radio-border-width`                  | Border width of the root surface. Default `var(--bx-border-width)`.                                               |
| `--bx-radio-border-color`                  | Border color of the root surface. Default `var(--bx-border-subtle)`.                                              |
| `--bx-radio-radius`                        | Corner radius of the root surface. Default `var(--bx-radius-m)`.                                                  |
| `--bx-radio-checked-border-color`          | Border color of the root surface (checked state). Default `var(--bx-role-accent)`.                                |
| `--bx-radio-checked-bg`                    | Background of the root surface (checked state). Default `var(--bx-role-accent-subtle, var(--bx-surface-subtle))`. |
| `--bx-radio-checked-fg`                    | Text/icon color of the root surface (checked state). Default `var(--bx-role-accent-fg)`.                          |
| `--bx-radio-focus-ring-width`              | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.                      |
| `--bx-radio-focus-ring-color`              | Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.                               |
| `--bx-radio-focus-ring-offset`             | Focus ring offset of the root surface (focus state). Default `var(--bx-focus-ring-offset)`.                       |
| `--bx-radio-disabled-border-color`         | Border color of the root surface (disabled state). Default `var(--bx-border-subtle)`.                             |
| `--bx-radio-disabled-bg`                   | Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.                              |
| `--bx-radio-size`                          | Control size (width and height). Default `calc(var(--bx-unit) * 1.25)`, or per `size`.                            |
| `--bx-radio-font-family`                   | Font family of the root surface. Default `var(--bx-type-body-family)`.                                            |

### Methods

_None._

## 3. Functional requirements

- **FR-RADIO-01** State is owned by `bx-radio-group`; standalone radios are unsupported.

## 4. Fluid scaling

Scales with type.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Button appearance wraps to multiple lines when narrow.

## 6. Accessibility

- `role="radio"`; roving tabindex managed by group.
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

- [ ] All FR-RADIO-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
