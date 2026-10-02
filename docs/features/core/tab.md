# `<bx-tab>`

> A tab button.

|                     |                |
| ------------------- | -------------- |
| **Package**         | `@bixant/core` |
| **Category**        | Organization   |
| **Tag**             | `bx-tab`       |
| **Status**          | Planned        |
| **Form-associated** | No             |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

A tab button. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name       | Type    | Default | Description |
| ---------- | ------- | ------- | ----------- |
| `panel`    | string  | ""      | Panel name  |
| `active`   | boolean | false   | -           |
| `disabled` | boolean | false   | -           |

### Slots

| Slot        | Description |
| ----------- | ----------- |
| `(default)` | -           |

### Events

_None._

### CSS parts

| Part           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`         | The tab's interactive row (`role="tab"`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `close-button` | The close glyph, present when `closable` (not in the spec's own CSS parts table — added the same way `bx-badge`'s `remove-button` part exists for its own removable-chip case). It's a plain `aria-hidden` span, not its own focusable control: a focusable descendant of a `role="tab"` element is an ARIA nested-interactive violation (axe: nested-interactive) no matter its `tabindex`, since `tab` is itself an interactive widget role. Mouse users click it directly; keyboard users close via Backspace/Delete on the tab itself, the same pattern `bx-badge`'s removable chip uses for the same reason. |

### CSS custom properties

| Property                                  | Description                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--bx-tab-gap`                            | Gap of the root surface. Default `var(--bx-space-2xs)`.                                                           |
| `--bx-tab-min-height`                     | Minimum height of the root surface. Default `var(--bx-target-min)`.                                               |
| `--bx-tab-padding-inline`                 | Padding inline of the root surface. Default `var(--bx-space-m)`.                                                  |
| `--bx-tab-radius`                         | Corner radius of the root surface. Default `var(--bx-radius-s) var(--bx-radius-s) 0 0`.                           |
| `--bx-tab-fg`                             | Text/icon color of the root surface. Default `var(--bx-text-secondary)`.                                          |
| `--bx-tab-hover-fg`                       | Text/icon color of the root surface (hover state). Default `var(--bx-text-primary)`.                              |
| `--bx-tab-focus-ring-width`               | Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.                      |
| `--bx-tab-focus-ring-color`               | Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.                               |
| `--bx-tab-focus-ring-offset`              | Focus ring offset of the root surface (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.            |
| `--bx-tab-disabled-fg`                    | Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.                          |
| `--bx-tab-close-button-size`              | Size (width and height) of the `close-button` part. Default `1em`.                                                |
| `--bx-tab-close-button-min-width`         | Minimum width of the `close-button` part. Default `var(--bx-target-min)`.                                         |
| `--bx-tab-close-button-min-height`        | Minimum height of the `close-button` part. Default `var(--bx-target-min)`.                                        |
| `--bx-tab-close-button-radius`            | Corner radius of the `close-button` part. Default `var(--bx-radius-pill)`.                                        |
| `--bx-tab-close-button-hover-bg`          | Background of the `close-button` part (hover state). Default `color-mix(in srgb, currentColor 16%, transparent)`. |
| `--bx-tab-close-button-focus-ring-width`  | Focus ring width of the `close-button` part (focus state). Default `var(--bx-border-width-strong)`.               |
| `--bx-tab-close-button-focus-ring-color`  | Focus ring color of the `close-button` part (focus state). Default `var(--bx-focus-ring)`.                        |
| `--bx-tab-close-button-focus-ring-offset` | Focus ring offset of the `close-button` part (focus state). Default `var(--bx-focus-ring-offset)`.                |
| `--bx-tab-close-button-icon-size`         | Size (width and height) of the icon inside the `close-button` element. Default `0.65em`.                          |
| `--bx-tab-font-family`                    | Font family of the root surface. Default `var(--bx-type-body-family)`.                                            |
| `--bx-tab-font-family`                    | Font family of the root surface (text style `label-m`). Default `var(--bx-type-label-family)`.                    |
| `--bx-tab-font-size`                      | Font size of the root surface (text style `label-m`). Default `var(--bx-type-label-m-size)`.                      |
| `--bx-tab-font-weight`                    | Font weight of the root surface (text style `label-m`). Default `var(--bx-type-label-m-weight)`.                  |
| `--bx-tab-line-height`                    | Line height of the root surface (text style `label-m`). Default `var(--bx-type-label-m-leading)`.                 |
| `--bx-tab-letter-spacing`                 | Letter spacing of the root surface (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.             |
| `--bx-tab-hover-bg`                       | Background while hovered. Default `var(--bx-surface-subtle)`.                                                     |
| `--bx-tab-pressed-bg`                     | Background while pressed. Default `var(--bx-surface-muted)`.                                                      |
| `--bx-tab-selected-fg`                    | Text color of the selected tab. Default `var(--bx-text-primary)`.                                                 |
| `--bx-tab-selected-hover-bg`              | Background of the selected tab while hovered. Default `transparent`.                                              |

### Methods

_None._

## 3. Functional requirements

- **FR-TAB-01** Closable variant via `closable` (emits `bx-close`).

## 4. Fluid scaling

-

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

-

## 6. Accessibility

- `role="tab"` `aria-selected` `aria-controls`.
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

- [ ] All FR-TAB-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
