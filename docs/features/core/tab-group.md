# `<bx-tab-group>`

> Tabbed interface with scrolling tab list, manual/auto activation.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Organization      |
| **Tag**             | `bx-tab-group`    |
| **Status**          | Planned           |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Tabbed interface with scrolling tab list, manual/auto activation. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                      | Type                                  | Default | Description       |
| ------------------------- | ------------------------------------- | ------- | ----------------- |
| `active`                  | string                                | -       | Active panel name |
| `placement`               | "top" \| "bottom" \| "start" \| "end" | "top"   | -                 |
| `activation`              | "auto" \| "manual"                    | "auto"  | -                 |
| `without-scroll-controls` | boolean                               | false   | -                 |

### Slots

| Slot              | Description  |
| ----------------- | ------------ |
| `(default)`       | bx-tab-panel |
| `nav`             | bx-tab       |
| `scroll-to-start` | -            |
| `scroll-to-end`   | -            |

### Events

| Event         | Detail / notes |
| ------------- | -------------- |
| `bx-tab-show` | -              |
| `bx-tab-hide` | -              |

### CSS parts

| Part                   | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `base`                 | The outer wrapper.                                        |
| `nav`                  | The wrapper around the scroll buttons and tab list.       |
| `tabs`                 | The `role="tablist"` scrollable element (the `nav` slot). |
| `body`                 | The wrapper around the default slot (panels).             |
| `scroll-button`        | Either scroll button.                                     |
| `scroll-button--start` | The "scroll to start" button.                             |
| `scroll-button--end`   | The "scroll to end" button.                               |
| `indicator`            | The sliding bar under (or beside) the selected tab.       |

### CSS custom properties

| Property                                         | Description                                                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `--bx-tab-group-indicator-color`                 | Active tab's indicator/text color. Forwarded to slotted `bx-tab` via custom-property inheritance. Default `--bx-role-accent`. |
| `--bx-tab-group-track-color`                     | Baseline track color under the tab list. Default `--bx-border-subtle`.                                                        |
| `--bx-tab-group-track-width`                     | Baseline track thickness. Default the hairline border width.                                                                  |
| `--bx-tab-group-scroll-button-size`              | Size (width and height) of the `scroll-button` part. Default `var(--bx-target-min)`.                                          |
| `--bx-tab-group-scroll-button-fg`                | Text/icon color of the `scroll-button` part. Default `var(--bx-text-secondary)`.                                              |
| `--bx-tab-group-scroll-button-hover-bg`          | Background of the `scroll-button` part (hover state). Default `var(--bx-surface-subtle)`.                                     |
| `--bx-tab-group-scroll-button-hover-fg`          | Text/icon color of the `scroll-button` part (hover state). Default `var(--bx-text-primary)`.                                  |
| `--bx-tab-group-scroll-button-focus-ring-width`  | Focus ring width of the `scroll-button` part (focus state). Default `var(--bx-border-width-strong)`.                          |
| `--bx-tab-group-scroll-button-focus-ring-color`  | Focus ring color of the `scroll-button` part (focus state). Default `var(--bx-focus-ring)`.                                   |
| `--bx-tab-group-scroll-button-focus-ring-offset` | Focus ring offset of the `scroll-button` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.                |
| `--bx-tab-group-scroll-button-icon-size`         | Size (width and height) of the icon inside the `scroll-button` element. Default `1em`.                                        |
| `--bx-tab-group-font-family`                     | Font family of the root surface. Default `var(--bx-type-body-family)`.                                                        |
| `--bx-tab-group-gap`                             | Space between tabs. Default `var(--bx-space-2xs)`.                                                                            |
| `--bx-tab-group-indicator-width`                 | Thickness of the selected-tab indicator. Default `var(--bx-border-width-strong)`.                                             |
| `--bx-tab-group-indicator-radius`                | Corner radius of the selected-tab indicator. Default `var(--bx-radius-pill)`.                                                 |

### Methods

`show(panel)`

## 3. Functional requirements

- **FR-TAB-GROUP-01** Overflowing tabs scroll with controls; selected tab scrolled into view.
- **FR-TAB-GROUP-02** Inactive panels are not rendered until first shown when `lazy`.
- **FR-TAB-GROUP-03** Placement start/end flips arrow-key axis.

## 4. Fluid scaling

Tab padding and indicator scale.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Tab list switches to overflow menu when container is narrow.

## 6. Accessibility

- Tabs pattern: `tablist`, `tab`, `tabpanel`, roving tabindex.
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

- [ ] All FR-TAB-GROUP-* requirements covered by unit/component tests (Web Test Runner, real browsers).
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark.
- [ ] axe-core: zero violations; manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.
- [ ] Size budget check (`size-limit`) passes.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Open: confirm final property names against the custom-elements manifest during implementation.
