# `<bx-select>`

> Single or multiple choice with searchable, virtualized listbox and removable-badge display for selections.

|                     |                        |
| ------------------- | ---------------------- |
| **Package**         | `@bixant/core`         |
| **Category**        | Form                   |
| **Tag**             | `bx-select`            |
| **Status**          | Implemented            |
| **Form-associated** | Yes (ElementInternals) |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Single or multiple choice with searchable, virtualized listbox and removable-badge display for selections. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                     | Type                                     | Default    | Description                                                                                              |
| ------------------------ | ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `name`                   | string                                   | ""         | Form field name                                                                                          |
| `value`                  | string \| string[]                       | ""         | Current value; a `string[]` when `multiple` (whitespace-separated as an attribute)                       |
| `disabled`               | boolean                                  | false      | -                                                                                                        |
| `required`               | boolean                                  | false      | -                                                                                                        |
| `form`                   | string                                   | ""         | Associate with form by id — the native `form` attribute, honored by the browser; not a declared property |
| `hint`                   | string                                   | ""         | Help text (also `hint` slot)                                                                             |
| `label`                  | string                                   | ""         | Label (also `label` slot)                                                                                |
| `size`                   | "small" \| "medium" \| "large"           | "medium"   | -                                                                                                        |
| `with-label / with-hint` | boolean                                  | false      | Opt into slot-based label/hint                                                                           |
| `multiple`               | boolean                                  | false      | -                                                                                                        |
| `max-options-visible`    | number \| "auto"                         | 3          | Tags before "+N"; `auto` fits tags to the measured width                                                 |
| `clearable`              | boolean                                  | false      | -                                                                                                        |
| `placeholder`            | string                                   | ""         | -                                                                                                        |
| `placement`              | top \| bottom                            | "bottom"   | -                                                                                                        |
| `appearance`             | outlined \| filled \| filled outlined    | "outlined" | -                                                                                                        |
| `pill`                   | boolean                                  | false      | -                                                                                                        |
| `searchable`             | boolean                                  | false      | Adds filter input                                                                                        |
| `virtual`                | boolean \| "auto"                        | "auto"     | Virtualize option list; `auto` at 200+ options (`virtual="false"` turns it off)                          |
| `options`                | `{ value, label?, disabled?, group? }[]` | -          | Data-driven alternative to slotted `bx-option`s (required for 10k+ items)                                |
| `loading`                | boolean                                  | false      | Async loading state                                                                                      |
| `remote`                 | boolean                                  | false      | Emit `bx-search` instead of filtering locally                                                            |
| `readonly`               | boolean                                  | false      | Value cannot be changed and the list cannot be opened (added)                                            |
| `open`                   | boolean                                  | false      | Listbox visibility, reflected (added)                                                                    |

### Slots

| Slot          | Description           |
| ------------- | --------------------- |
| `(default)`   | bx-option, bx-divider |
| `label`       | -                     |
| `hint`        | -                     |
| `start`       | -                     |
| `end`         | -                     |
| `clear-icon`  | -                     |
| `expand-icon` | -                     |

### Events

| Event           | Detail / notes                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `input`         | Value changed by user (bubbles, composed)                                                                           |
| `change`        | Committed change                                                                                                    |
| `bx-invalid`    | Constraint validation failed                                                                                        |
| `focus / blur`  | -                                                                                                                   |
| `bx-clear`      | -                                                                                                                   |
| `bx-show`       | Cancelable                                                                                                          |
| `bx-after-show` | -                                                                                                                   |
| `bx-hide`       | Cancelable; fired by `hide()` (selection, Escape, focus leaving)                                                    |
| `bx-after-hide` | -                                                                                                                   |
| `bx-search`     | `detail: { query, signal }`, debounced 250 ms, only when `remote`; `signal` aborts when a newer query supersedes it |
| `bx-load-more`  | Near end of list for async paging                                                                                   |

### CSS parts

| Part            | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `form-control`  | The outer wrapper (label + combobox + hint).               |
| `label`         | The label element.                                         |
| `hint`          | The wrapper around the hint slot.                          |
| `combobox`      | The bordered control that opens the listbox.               |
| `display-input` | The native `<input role="combobox">`.                      |
| `listbox`       | The scrollable `role="listbox"` element.                   |
| `tags`          | The wrapper around selected-value badges (`multiple`).     |
| `tag`           | A selected-value badge, including the `+N` overflow badge. |
| `clear-button`  | The clear button.                                          |
| `expand-icon`   | The caret.                                                 |

### CSS custom properties

| Property                                        | Description                                                                                                                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--bx-select-max-height`                        | Max height of the listbox. Default `20rem`, further bounded by the space available in the viewport.                                                                                     |
| `--bx-select-form-control-gap`                  | Gap of the `form-control` part. Default `var(--bx-space-xs)`.                                                                                                                           |
| `--bx-select-label-fg`                          | Text/icon color of the `label` part. Default `var(--bx-text-primary)`.                                                                                                                  |
| `--bx-select-combobox-gap`                      | Gap of the `combobox` part. Default `var(--bx-space-xs)`.                                                                                                                               |
| `--bx-select-combobox-padding-inline`           | Padding inline of the `combobox` part. Default `var(--bx-space-s)`.                                                                                                                     |
| `--bx-select-combobox-radius`                   | Corner radius of the `combobox` part. Default `var(--bx-radius-m)`.                                                                                                                     |
| `--bx-select-combobox-border-width`             | Border width of the `combobox` part. Default `var(--bx-border-width)`.                                                                                                                  |
| `--bx-select-combobox-border-color`             | Border color of the `combobox` part. Default `var(--bx-border-subtle)`.                                                                                                                 |
| `--bx-select-combobox-bg`                       | Background of the `combobox` part. Default `var(--bx-surface-base)`.                                                                                                                    |
| `--bx-select-combobox-hover-border-color`       | Border color of the `combobox` part (hover state). Default `var(--bx-border-strong)`.                                                                                                   |
| `--bx-select-combobox-focus-border-color`       | Border color of the `combobox` part (focus state). Default `var(--bx-focus-ring)`.                                                                                                      |
| `--bx-select-combobox-focus-shadow`             | Box shadow of the `combobox` part (focus state). Default `0 0 0 calc(var(--bx-border-width-strong) * 1.5) color-mix(in srgb, var(--bx-focus-ring) 22%, transparent)`.                   |
| `--bx-select-combobox-focus-ring-width`         | Focus ring width of the `combobox` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                         |
| `--bx-select-combobox-hover-bg`                 | Background of the `combobox` part (hover state). Default `var(--bx-surface-muted)`.                                                                                                     |
| `--bx-select-combobox-focus-bg`                 | Background of the `combobox` part (focus state). Default `var(--bx-surface-base)`.                                                                                                      |
| `--bx-select-combobox-disabled-bg`              | Background of the `combobox` part (disabled state). Default `var(--bx-surface-subtle)`.                                                                                                 |
| `--bx-select-combobox-disabled-border-color`    | Border color of the `combobox` part (disabled state). Default `var(--bx-border-subtle)`.                                                                                                |
| `--bx-select-combobox-disabled-fg`              | Text/icon color of the `combobox` part (disabled state). Default `var(--bx-text-disabled)`.                                                                                             |
| `--bx-select-combobox-invalid-border-color`     | Border color of the `combobox` part (invalid state). Default `var(--bx-role-danger-border)`.                                                                                            |
| `--bx-select-combobox-invalid-focus-shadow`     | Box shadow of the `combobox` part (invalid + focus state). Default `0 0 0 calc(var(--bx-border-width-strong) * 1.5) color-mix(in srgb, var(--bx-role-danger-border) 22%, transparent)`. |
| `--bx-select-value-area-gap`                    | Gap of the `value-area` element. Default `var(--bx-space-xs)`.                                                                                                                          |
| `--bx-select-value-area-padding-block`          | Padding block of the `value-area` element. Default `var(--bx-space-xs)`.                                                                                                                |
| `--bx-select-display-input-min-width`           | Minimum width of the `display-input` part. Default `4ch`.                                                                                                                               |
| `--bx-select-display-input-fg`                  | Text/icon color of the `display-input` part. Default `var(--bx-text-primary)`.                                                                                                          |
| `--bx-select-display-input-disabled-fg`         | Text/icon color of the `display-input` part (disabled state). Default `var(--bx-text-disabled)`.                                                                                        |
| `--bx-select-display-input-placeholder-fg`      | Text/icon color of the `display-input` part's `::placeholder`. Default `var(--bx-text-hint)`.                                                                                           |
| `--bx-select-display-input-placeholder-opacity` | Opacity of the `display-input` part's `::placeholder`. Default `1`.                                                                                                                     |
| `--bx-select-start-fg`                          | Text/icon color of the `start` element. Default `var(--bx-text-hint)`.                                                                                                                  |
| `--bx-select-clear-button-size`                 | Size (width and height) of the `clear-button` part. Default `1.5em`.                                                                                                                    |
| `--bx-select-clear-button-radius`               | Corner radius of the `clear-button` part. Default `var(--bx-radius-pill)`.                                                                                                              |
| `--bx-select-clear-button-fg`                   | Text/icon color of the `clear-button` part. Default `var(--bx-text-hint)`.                                                                                                              |
| `--bx-select-clear-button-hover-fg`             | Text/icon color of the `clear-button` part (hover state). Default `var(--bx-text-primary)`.                                                                                             |
| `--bx-select-clear-button-focus-ring-width`     | Focus ring width of the `clear-button` part (focus state). Default `var(--bx-border-width-strong)`.                                                                                     |
| `--bx-select-clear-button-focus-ring-color`     | Focus ring color of the `clear-button` part (focus state). Default `var(--bx-focus-ring)`.                                                                                              |
| `--bx-select-clear-button-focus-ring-offset`    | Focus ring offset of the `clear-button` part (focus state). Default `var(--bx-focus-ring-offset)`.                                                                                      |
| `--bx-select-expand-icon-fg`                    | Text/icon color of the `expand-icon` part. Default `var(--bx-text-hint)`.                                                                                                               |
| `--bx-select-hint-fg`                           | Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.                                                                                                                 |
| `--bx-select-hint-invalid-fg`                   | Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.                                                                                                 |
| `--bx-select-panel-border-width`                | Border width of the `panel` element. Default `var(--bx-border-width)`.                                                                                                                  |
| `--bx-select-panel-border-color`                | Border color of the `panel` element. Default `var(--bx-border-subtle)`.                                                                                                                 |
| `--bx-select-panel-radius`                      | Corner radius of the `panel` element. Default `var(--bx-radius-m)`.                                                                                                                     |
| `--bx-select-panel-shadow`                      | Box shadow of the `panel` element. Default `var(--bx-shadow-m)`.                                                                                                                        |
| `--bx-select-panel-bg`                          | Background of the `panel` element. Default `var(--bx-surface-base)`.                                                                                                                    |
| `--bx-select-panel-fg`                          | Text/icon color of the `panel` element. Default `var(--bx-text-primary)`.                                                                                                               |
| `--bx-select-hr-block-start-border-width`       | Block start border width of the `hr` element. Default `var(--bx-border-width)`.                                                                                                         |
| `--bx-select-hr-block-start-border-color`       | Block start border color of the `hr` element. Default `var(--bx-border-subtle)`.                                                                                                        |
| `--bx-select-group-label-padding-block`         | Padding block of the `group-label` element. Default `var(--bx-space-xs)`.                                                                                                               |
| `--bx-select-group-label-padding-inline`        | Padding inline of the `group-label` element. Default `var(--bx-space-s)`.                                                                                                               |
| `--bx-select-group-label-fg`                    | Text/icon color of the `group-label` element. Default `var(--bx-text-secondary)`.                                                                                                       |
| `--bx-select-status-gap`                        | Gap of the `status` element. Default `var(--bx-space-xs)`.                                                                                                                              |
| `--bx-select-status-padding`                    | Padding of the `status` element. Default `var(--bx-space-s)`.                                                                                                                           |
| `--bx-select-status-fg`                         | Text/icon color of the `status` element. Default `var(--bx-text-secondary)`.                                                                                                            |
| `--bx-select-clear-button-icon-size`            | Size (width and height) of the icon inside the `clear-button` element. Default `1em`.                                                                                                   |
| `--bx-select-height`                            | Combobox minimum height. Default derived from `size`.                                                                                                                                   |
| `--bx-select-font-family`                       | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                                                                                  |
| `--bx-select-label-font-family`                 | Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.                                                                                          |
| `--bx-select-label-font-size`                   | Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.                                                                                            |
| `--bx-select-label-font-weight`                 | Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                                                                                        |
| `--bx-select-label-line-height`                 | Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                                                                                       |
| `--bx-select-label-letter-spacing`              | Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                                                                                   |
| `--bx-select-display-input-font-family`         | Font family of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-family)`.                                                                                  |
| `--bx-select-display-input-font-size`           | Font size of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-size)`.                                                                                    |
| `--bx-select-display-input-font-weight`         | Font weight of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-weight)`.                                                                                |
| `--bx-select-display-input-line-height`         | Line height of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-leading)`.                                                                               |
| `--bx-select-display-input-letter-spacing`      | Letter spacing of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-tracking)`.                                                                           |
| `--bx-select-hint-font-family`                  | Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.                                                                                             |
| `--bx-select-hint-font-size`                    | Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                                                                               |
| `--bx-select-hint-font-weight`                  | Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                                                                           |
| `--bx-select-hint-line-height`                  | Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                                                                          |
| `--bx-select-hint-letter-spacing`               | Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                                                                      |
| `--bx-select-panel-font-family`                 | Font family of the `panel` element (text style `body-m`). Default `var(--bx-type-body-family)`.                                                                                         |
| `--bx-select-panel-font-size`                   | Font size of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-size)`.                                                                                           |
| `--bx-select-panel-font-weight`                 | Font weight of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-weight)`.                                                                                       |
| `--bx-select-panel-line-height`                 | Line height of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-leading)`.                                                                                      |
| `--bx-select-panel-letter-spacing`              | Letter spacing of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.                                                                                  |
| `--bx-select-group-label-font-family`           | Font family of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-family)`.                                                                                 |
| `--bx-select-group-label-font-size`             | Font size of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-size)`.                                                                                   |
| `--bx-select-group-label-font-weight`           | Font weight of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                                                                               |
| `--bx-select-group-label-line-height`           | Line height of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                                                                              |
| `--bx-select-group-label-letter-spacing`        | Letter spacing of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                                                                          |
| `--bx-select-status-font-family`                | Font family of the `status` element (text style `body-s`). Default `var(--bx-type-body-family)`.                                                                                        |
| `--bx-select-status-font-size`                  | Font size of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.                                                                                          |
| `--bx-select-status-font-weight`                | Font weight of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.                                                                                      |
| `--bx-select-status-line-height`                | Line height of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.                                                                                     |
| `--bx-select-status-letter-spacing`             | Letter spacing of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.                                                                                 |

### Methods

`show()`, `hide()`, `focus()`, `blur()`, plus the form-associated `checkValidity()`, `reportValidity()`, `setCustomValidity()`

## 3. Functional requirements

- **FR-SELECT-01** Form-associated custom element (ElementInternals): participates in FormData, `reset`, `form.elements`, autofill restoration and constraint validation.
- **FR-SELECT-02** `setCustomValidity`, `checkValidity`, `reportValidity`, `validity` and `willValidate` behave as native.
- **FR-SELECT-03** Validation UI styling via `:user-valid`/`:user-invalid` equivalents (`data-user-valid`/`data-user-invalid`) after first interaction.
- **FR-SELECT-04** Typeahead and search work on the full data set even when virtualized (index built off-thread for 50k+ options).
- **FR-SELECT-05** Selected items outside the rendered window still resolve their labels.
- **FR-SELECT-06** `aria-setsize`/`aria-posinset` correct under virtualization; `aria-activedescendant` used to avoid focusing recycled nodes.
- **FR-SELECT-07** Async mode: debounced query, cancellation of stale requests via `AbortSignal`.

## 4. Fluid scaling

Control and listbox rows scale; listbox max-height bounded by available space.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Multi-select tags collapse to "+N" based on measured width, not fixed count (`max-options-visible="auto"`).

## 6. Accessibility

- Combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, listbox `role="listbox"`, options `option`.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Target: open list of 100k options < 50 ms, scroll 60 fps.
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

- [ ] All FR-SELECT-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-SELECT-01/02/03/05/06/07 are covered; FR-SELECT-04 is covered for the full data set but the "index built off-thread" part is not implemented (main-thread, lazily built search keys — a few ms at 100k rows). Run in Chromium only so far.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (asserted closed, open, multiple, disabled and data-driven in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook stories; no recorded walkthrough yet.
- [x] Form integration tests: submit, reset, autofill restore, `required`/custom validity, disabled/readonly semantics. (Autofill restore calls `formStateRestoreCallback` directly rather than going through a browser restore.)
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Virtualization, remote search, data-driven options.
- Focus stays on a native `<input role="combobox">`; the highlighted option is exposed through `aria-activedescendant`, set via the `ariaActiveDescendantElement` element-reflection property so it can reference a slotted light-DOM `bx-option` (`bx-option` carries `role="option"` on its host for that reason). Browsers without element reflection fall back to the attribute, which only resolves for rows rendered in the shadow root.
- Windowed lists render rows themselves; slotted `bx-option`s are then only a data source, so their `start`/`end` slot content is not shown. Slotted `value`/`label` are read from attributes and text.
- Group headers are visual rows (`role="presentation"`), not `role="group"` — a flat, windowed list cannot nest options in a group element.
- A multiple select submits one `FormData` entry per value under `name`.
- Open: confirm final property names against the custom-elements manifest during implementation.
