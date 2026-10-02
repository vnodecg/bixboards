# `<bx-dropdown-item>`

> A single menu entry: plain, checkbox, or submenu parent.

|                     |                    |
| ------------------- | ------------------ |
| **Package**         | `@bixant/core`     |
| **Category**        | Actions            |
| **Tag**             | `bx-dropdown-item` |
| **Status**          | Implemented        |
| **Form-associated** | No                 |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

A single menu entry: plain, checkbox, or submenu parent. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                      | Type                              | Default   | Description                                                                                        |
| ------------------------- | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `variant`                 | "default" \| "error"              | "default" | -                                                                                                  |
| `type`                    | "normal" \| "checkbox" \| "radio" | "normal"  | `radio` (added) pairs with `name` for mutually exclusive groups                                    |
| `checked`                 | boolean                           | false     | Checkbox state                                                                                     |
| `value`                   | string                            | ""        | Value reported on select                                                                           |
| `disabled`                | boolean                           | false     | -                                                                                                  |
| `name`                    | string                            | ""        | Radio group name within one menu (added)                                                           |
| `submenu-open`            | boolean                           | false     | Nested menu visibility, reflected (added)                                                          |
| `set-size` / `pos-in-set` | number                            | -         | `aria-setsize`/`aria-posinset` for windowed menus, where DOM siblings are not the full set (added) |

### Slots

| Slot        | Description                      |
| ----------- | -------------------------------- |
| `(default)` | Label                            |
| `icon`      | Leading icon                     |
| `details`   | Trailing hint (e.g. shortcut)    |
| `submenu`   | Nested bx-dropdown-item elements |

### Events

| Event                             | Detail / notes                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bx-select (bubbles to dropdown)` | `detail: { value, checked, item }`; not fired for a submenu parent (activating it opens the submenu) |

### CSS parts

| Part           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `base`         | The item row (the element carrying the menuitem role).       |
| `checkmark`    | The checkbox/radio checkmark (or its reserved gutter space). |
| `icon`         | The wrapper around the icon slot.                            |
| `label`        | The wrapper around the default slot.                         |
| `details`      | The wrapper around the details slot.                         |
| `submenu-icon` | The trailing chevron shown when a submenu is present.        |
| `submenu`      | The floating panel around the nested items.                  |

### CSS custom properties

| Property                                    | Description                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--bx-dropdown-item-gap`                    | Gap of the root surface. Default `var(--bx-space-xs)`.                                                 |
| `--bx-dropdown-item-padding-inline`         | Padding inline of the root surface. Default `var(--bx-space-s)`.                                       |
| `--bx-dropdown-item-fg`                     | Text/icon color of the root surface. Default `var(--bx-text-primary)`.                                 |
| `--bx-dropdown-item-hover-bg`               | Background of the root surface (hover state). Default `var(--bx-surface-subtle)`.                      |
| `--bx-dropdown-item-focus-ring-width`       | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.           |
| `--bx-dropdown-item-focus-ring-color`       | Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.                    |
| `--bx-dropdown-item-focus-ring-offset`      | Focus ring offset of the root surface (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`. |
| `--bx-dropdown-item-disabled-fg`            | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.               |
| `--bx-dropdown-item-checkmark-size`         | Size (width and height) of the `checkmark` part. Default `1em`.                                        |
| `--bx-dropdown-item-icon-size`              | Size (width and height) of the `icon` part. Default `1em`.                                             |
| `--bx-dropdown-item-details-fg`             | Text/icon color of the `details` part. Default `var(--bx-text-secondary)`.                             |
| `--bx-dropdown-item-submenu-icon-size`      | Size (width and height) of the `submenu-icon` part. Default `0.75em`.                                  |
| `--bx-dropdown-item-submenu-icon-fg`        | Text/icon color of the `submenu-icon` part. Default `var(--bx-text-secondary)`.                        |
| `--bx-dropdown-item-submenu-min-width`      | Minimum width of the `submenu` part. Default `calc(var(--bx-unit) * 12)`.                              |
| `--bx-dropdown-item-submenu-border-width`   | Border width of the `submenu` part. Default `var(--bx-border-width)`.                                  |
| `--bx-dropdown-item-submenu-border-color`   | Border color of the `submenu` part. Default `var(--bx-border-subtle)`.                                 |
| `--bx-dropdown-item-submenu-radius`         | Corner radius of the `submenu` part. Default `var(--bx-radius-m)`.                                     |
| `--bx-dropdown-item-submenu-shadow`         | Box shadow of the `submenu` part. Default `var(--bx-shadow-m)`.                                        |
| `--bx-dropdown-item-submenu-bg`             | Background of the `submenu` part. Default `var(--bx-surface-base)`.                                    |
| `--bx-dropdown-item-submenu-fg`             | Text/icon color of the `submenu` part. Default `var(--bx-text-primary)`.                               |
| `--bx-dropdown-item-height`                 | Minimum item height. Default follows the parent `bx-dropdown`'s `size`, else `--bx-target-min`.        |
| `--bx-dropdown-item-error-fg`               | Text color of `variant="error"` items. Default `var(--bx-role-danger-fg)`.                             |
| `--bx-dropdown-item-font-family`            | Font family of the root surface. Default `var(--bx-type-body-family)`.                                 |
| `--bx-dropdown-item-details-font-family`    | Font family of the `details` part (text style `body-s`). Default `var(--bx-type-body-family)`.         |
| `--bx-dropdown-item-details-font-size`      | Font size of the `details` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.           |
| `--bx-dropdown-item-details-font-weight`    | Font weight of the `details` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.       |
| `--bx-dropdown-item-details-line-height`    | Line height of the `details` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.      |
| `--bx-dropdown-item-details-letter-spacing` | Letter spacing of the `details` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.  |
| `--bx-dropdown-item-submenu-font-family`    | Font family of the `submenu` part (text style `body-m`). Default `var(--bx-type-body-family)`.         |
| `--bx-dropdown-item-submenu-font-size`      | Font size of the `submenu` part (text style `body-m`). Default `var(--bx-type-body-m-size)`.           |
| `--bx-dropdown-item-submenu-font-weight`    | Font weight of the `submenu` part (text style `body-m`). Default `var(--bx-type-body-m-weight)`.       |
| `--bx-dropdown-item-submenu-line-height`    | Line height of the `submenu` part (text style `body-m`). Default `var(--bx-type-body-m-leading)`.      |
| `--bx-dropdown-item-submenu-letter-spacing` | Letter spacing of the `submenu` part (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.  |

### Methods

`openSubmenu(focusFirst?)`, `closeSubmenu()`, `focus()` (delegates to the row) — added

## 3. Functional requirements

- **FR-DROPDOWN-ITEM-01** Checkmark space reserved only when any sibling is a checkbox item (no layout jump).
- **FR-DROPDOWN-ITEM-02** Disabled items remain focusable for discoverability when `focusable-disabled` set on parent.

## 4. Fluid scaling

Row height ≥ 32 px at scale 1, grows with scale; touch density mode sets ≥ 44 px.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Details slot hides when the menu is narrower than 12 fluid units.

## 6. Accessibility

- `role="menuitem"`/`menuitemcheckbox`; `aria-checked`; `aria-haspopup` for submenu.
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

- [ ] All FR-DROPDOWN-ITEM-* requirements covered by unit/component tests (Web Test Runner, real browsers). Run in Chromium only so far.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (asserted in the item's and `bx-dropdown`'s test files); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook stories; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- A `submenu` slot with children makes the item a submenu parent: the nested items render in an internal `bx-popup` beside the row. Opens on hover (after a dwell, with a safe triangle), ArrowRight/Enter/Space; closes with ArrowLeft/Escape. One submenu per menu at a time.
- The host no longer sets `container-type`: it made fixed-position descendants (the submenu popup) resolve against the row instead of the viewport, so the "details hide when narrow" query now measures the inner row. Note that `@container` conditions cannot contain `var()`, so that query's `calc(var(--bx-unit) * 12)` threshold never matches today (pre-existing; not changed here).
- Open: confirm final property names against the custom-elements manifest during implementation.
