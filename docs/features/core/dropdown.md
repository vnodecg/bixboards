# `<bx-dropdown>`

> Anchors a menu of items to a trigger; keyboard navigable, typeahead-enabled, with checkbox and submenu support.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Actions           |
| **Tag**             | `bx-dropdown`     |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Anchors a menu of items to a trigger; keyboard navigable, typeahead-enabled, with checkbox and submenu support. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                 | Type                           | Default        | Description                                                                                       |
| -------------------- | ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------- |
| `open`               | boolean                        | false          | Controls visibility                                                                               |
| `placement`          | Placement                      | "bottom-start" | Popup placement                                                                                   |
| `distance`           | number                         | 0              | Offset from trigger                                                                               |
| `skidding`           | number                         | 0              | -                                                                                                 |
| `size`               | "small" \| "medium" \| "large" | "medium"       | -                                                                                                 |
| `virtual`            | boolean                        | false          | Virtualize items when count > `virtual-threshold`; applies to the `items` data array only         |
| `virtual-threshold`  | number                         | 100            | -                                                                                                 |
| `items`              | `DropdownItemData[]`           | -              | Data-driven alternative to slotted items; required for virtualization (added)                     |
| `focusable-disabled` | boolean                        | false          | Disabled items stay reachable with the arrow keys; read by the items (added, FR-DROPDOWN-ITEM-02) |

### Slots

| Slot        | Description                            |
| ----------- | -------------------------------------- |
| `trigger`   | Element that opens the menu            |
| `(default)` | bx-dropdown-item, bx-divider, headings |

### Events

| Event                     | Detail / notes                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bx-show / bx-after-show` | Cancelable / completed                                                                                                                                   |
| `bx-hide / bx-after-hide` | `bx-hide` is cancelable; `detail.source`: `'trigger' \| 'light-dismiss' \| 'keyboard' \| 'select' \| 'focus-out' \| 'method'`                            |
| `bx-select`               | `detail.item` (the chosen item element), `detail.value`, `detail.checked`; data rows also `detail.data` and `detail.index` (the element can be recycled) |

### CSS parts

| Part   | Description                           |
| ------ | ------------------------------------- |
| `base` | The popup wrapping the menu.          |
| `menu` | The scrollable `role="menu"` element. |

### CSS custom properties

| Property                                    | Description                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--bx-dropdown-width`                       | Menu width. Default `calc(var(--bx-unit) * 16)`.                                                                                  |
| `--bx-dropdown-menu-max-height`             | Maximum height of the `menu` part. Default `min( var(--bx-popup-auto-size-available-height, 100vh), calc(var(--bx-unit) * 40) )`. |
| `--bx-dropdown-menu-padding-block`          | Padding block of the `menu` part. Default `var(--bx-space-xs)`.                                                                   |
| `--bx-dropdown-menu-border-width`           | Border width of the `menu` part. Default `var(--bx-border-width)`.                                                                |
| `--bx-dropdown-menu-border-color`           | Border color of the `menu` part. Default `var(--bx-border-subtle)`.                                                               |
| `--bx-dropdown-menu-radius`                 | Corner radius of the `menu` part. Default `var(--bx-radius-m)`.                                                                   |
| `--bx-dropdown-menu-shadow`                 | Box shadow of the `menu` part. Default `var(--bx-shadow-m)`.                                                                      |
| `--bx-dropdown-menu-bg`                     | Background of the `menu` part. Default `var(--bx-surface-base)`.                                                                  |
| `--bx-dropdown-menu-fg`                     | Text/icon color of the `menu` part. Default `var(--bx-text-primary)`.                                                             |
| `--bx-dropdown-hr-block-start-border-width` | Block start border width of the `hr` element. Default `var(--bx-border-width)`.                                                   |
| `--bx-dropdown-hr-block-start-border-color` | Block start border color of the `hr` element. Default `var(--bx-border-subtle)`.                                                  |
| `--bx-dropdown-heading-padding-block`       | Padding block of the `heading` element. Default `var(--bx-space-xs)`.                                                             |
| `--bx-dropdown-heading-padding-inline`      | Padding inline of the `heading` element. Default `var(--bx-space-s)`.                                                             |
| `--bx-dropdown-heading-fg`                  | Text/icon color of the `heading` element. Default `var(--bx-text-secondary)`.                                                     |
| `--bx-dropdown-menu-font-family`            | Font family of the `menu` part (text style `body-m`). Default `var(--bx-type-body-family)`.                                       |
| `--bx-dropdown-menu-font-size`              | Font size of the `menu` part (text style `body-m`). Default `var(--bx-type-body-m-size)`.                                         |
| `--bx-dropdown-menu-font-weight`            | Font weight of the `menu` part (text style `body-m`). Default `var(--bx-type-body-m-weight)`.                                     |
| `--bx-dropdown-menu-line-height`            | Line height of the `menu` part (text style `body-m`). Default `var(--bx-type-body-m-leading)`.                                    |
| `--bx-dropdown-menu-letter-spacing`         | Letter spacing of the `menu` part (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.                                |
| `--bx-dropdown-heading-font-family`         | Font family of the `heading` element (text style `label-s`). Default `var(--bx-type-label-family)`.                               |
| `--bx-dropdown-heading-font-size`           | Font size of the `heading` element (text style `label-s`). Default `var(--bx-type-label-s-size)`.                                 |
| `--bx-dropdown-heading-font-weight`         | Font weight of the `heading` element (text style `label-s`). Default `var(--bx-type-label-s-weight)`.                             |
| `--bx-dropdown-heading-line-height`         | Line height of the `heading` element (text style `label-s`). Default `var(--bx-type-label-s-leading)`.                            |
| `--bx-dropdown-heading-letter-spacing`      | Letter spacing of the `heading` element (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.                        |

### Methods

`show()`, `hide()`, `reposition()`

## 3. Functional requirements

- **FR-DROPDOWN-01** Built on `bx-popup` (flip, shift, auto-size, viewport-aware).
- **FR-DROPDOWN-02** Arrow-key navigation, Home/End, typeahead, Escape returns focus to trigger.
- **FR-DROPDOWN-03** Outside click and focus-out close; supports nested submenus with safe-triangle hover.
- **FR-DROPDOWN-04** Checkbox items and radio-like groups maintain selection state.
- **FR-DROPDOWN-05** Virtual mode uses `VirtualizerController`; only visible items are in DOM while typeahead and aria-setsize stay correct.

## 4. Fluid scaling

Menu width, item height and padding scale; menu max-height = min(available viewport, 40 fluid units).

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Below a narrow container width, menu becomes a bottom sheet (`sheet-narrow`).

## 6. Accessibility

- Trigger has `aria-haspopup="menu"`/`aria-expanded`; menu `role="menu"`, items `menuitem*`.
- Focus is managed programmatically; no focus loss on virtual scroll.
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

- [ ] All FR-DROPDOWN-* requirements covered by unit/component tests (Web Test Runner, real browsers). All five are covered. FR-DROPDOWN-05 is met by the `items` data array: slotted children are the consumer's elements and cannot be windowed, so `virtual` does nothing for them. §5's `sheet-narrow` bottom sheet is not implemented. Run in Chromium only so far.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (closed, open, submenu open and data-driven, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook stories; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Adds virtual mode and narrow bottom-sheet behavior (virtual mode done; bottom sheet not).
- Real DOM focus moves onto the items (roving, programmatic), per the APG menu pattern. Arrow keys wrap; Tab closes the menu and continues from the trigger; Escape returns focus to the trigger. Checkbox and radio items keep the menu open; other items close it.
- Data rows are flat (no submenus). Their `checked` state lives in the dropdown so it survives node recycling, and the focused row is pinned in the window so scrolling never drops it.
- The trigger is expected to be a button-like control; Enter/Space activate it through its own click. A click synthesized by the keyboard (`detail === 0`) focuses the first item, a pointer click focuses the menu.
- Submenus open on hover (120 ms dwell, safe triangle while crossing siblings), ArrowRight/Enter/Space, and close with ArrowLeft/Escape; direction flips in RTL.
- Open: confirm final property names against the custom-elements manifest during implementation.
