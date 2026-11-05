# `<bx-notification-center>`

> Bell trigger plus panel listing persistent notifications with unread state, grouping and actions.

|                     |                                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| **Package**         | `@bixboards/core`                                                         |
| **Category**        | Feedback                                                                  |
| **Tag**             | `bx-notification-center`                                                  |
| **Status**          | Implemented                                                               |
| **Form-associated** | No                                                                        |
| **Depends on**      | `popover`, `drawer`, `badge`, `relative-time`, `data-list`, `icon-button` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Bell trigger plus panel listing persistent notifications with unread state, grouping and actions. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name           | Type                          | Default   | Description                                         |
| -------------- | ----------------------------- | --------- | --------------------------------------------------- |
| `items`        | NotificationItem[] (property) | []        | id, title, body, time, read, href, avatar, actions. |
| `unread-count` | number                        | derived   | Badge value.                                        |
| `group-by`     | none/day                      | "day"     | -                                                   |
| `open`         | boolean                       | false     | -                                                   |
| `empty-text`   | string                        | localized | -                                                   |
| `loading`      | boolean                       | false     | -                                                   |

### Slots

| Name      | Description        |
| --------- | ------------------ |
| `trigger` | Replaces the bell. |
| `item`    | Item template.     |
| `empty`   | -                  |
| `footer`  | e.g. "View all".   |

### Events

| Event              | Detail / notes                 |
| ------------------ | ------------------------------ |
| `bx-item-click`    | detail.item.                   |
| `bx-mark-read`     | detail.ids.                    |
| `bx-mark-all-read` | -                              |
| `bx-dismiss`       | detail.id.                     |
| `bx-load-more`     | Infinite loading near the end. |

### CSS parts

| Part            | Description             |
| --------------- | ----------------------- |
| `trigger`       | The trigger part.       |
| `badge`         | The badge part.         |
| `panel`         | The panel part.         |
| `group-heading` | The group-heading part. |
| `item`          | The item part.          |
| `empty`         | The empty part.         |

### CSS custom properties

| Property                                        | Description                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--bx-notification-center-width`                | Panel width.                                                                                               |
| `--bx-notification-center-max-height`           | Panel max height.                                                                                          |
| `--bx-notification-center-font-family`          | Font family of the root surface. Default `var(--bx-type-body-family)`.                                     |
| `--bx-notification-center-body-font-family`     | Font family of the `body` text (text style `body-s`). Default `var(--bx-type-body-family)`.                |
| `--bx-notification-center-body-font-size`       | Font size of the `body` text (text style `body-s`). Default `var(--bx-type-body-s-size)`.                  |
| `--bx-notification-center-body-font-weight`     | Font weight of the `body` text (text style `body-s`). Default `var(--bx-type-body-s-weight)`.              |
| `--bx-notification-center-body-line-height`     | Line height of the `body` text (text style `body-s`). Default `var(--bx-type-body-s-leading)`.             |
| `--bx-notification-center-body-letter-spacing`  | Letter spacing of the `body` text (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.         |
| `--bx-notification-center-group-font-family`    | Font family of the `group` text (text style `label-xs`). Default `var(--bx-type-label-family)`.            |
| `--bx-notification-center-group-font-size`      | Font size of the `group` text (text style `label-xs`). Default `var(--bx-type-label-xs-size)`.             |
| `--bx-notification-center-group-font-weight`    | Font weight of the `group` text (text style `label-xs`). Default `var(--bx-type-label-xs-weight)`.         |
| `--bx-notification-center-group-line-height`    | Line height of the `group` text (text style `label-xs`). Default `var(--bx-type-label-xs-leading)`.        |
| `--bx-notification-center-group-letter-spacing` | Letter spacing of the `group` text (text style `label-xs`). Default `var(--bx-type-label-xs-tracking)`.    |
| `--bx-notification-center-head-font-family`     | Font family of the `head` text (text style `heading-xs`). Default `var(--bx-type-heading-family)`.         |
| `--bx-notification-center-head-font-size`       | Font size of the `head` text (text style `heading-xs`). Default `var(--bx-type-heading-xs-size)`.          |
| `--bx-notification-center-head-font-weight`     | Font weight of the `head` text (text style `heading-xs`). Default `var(--bx-type-heading-xs-weight)`.      |
| `--bx-notification-center-head-line-height`     | Line height of the `head` text (text style `heading-xs`). Default `var(--bx-type-heading-xs-leading)`.     |
| `--bx-notification-center-head-letter-spacing`  | Letter spacing of the `head` text (text style `heading-xs`). Default `var(--bx-type-heading-xs-tracking)`. |
| `--bx-notification-center-time-font-family`     | Font family of the `time` text (text style `caption-s`). Default `var(--bx-type-caption-family)`.          |
| `--bx-notification-center-time-font-size`       | Font size of the `time` text (text style `caption-s`). Default `var(--bx-type-caption-s-size)`.            |
| `--bx-notification-center-time-font-weight`     | Font weight of the `time` text (text style `caption-s`). Default `var(--bx-type-caption-s-weight)`.        |
| `--bx-notification-center-time-line-height`     | Line height of the `time` text (text style `caption-s`). Default `var(--bx-type-caption-s-leading)`.       |
| `--bx-notification-center-time-letter-spacing`  | Letter spacing of the `time` text (text style `caption-s`). Default `var(--bx-type-caption-s-tracking)`.   |
| `--bx-notification-center-title-font-family`    | Font family of the `title` text (text style `label-m`). Default `var(--bx-type-label-family)`.             |
| `--bx-notification-center-title-font-size`      | Font size of the `title` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.               |
| `--bx-notification-center-title-font-weight`    | Font weight of the `title` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.           |
| `--bx-notification-center-title-line-height`    | Line height of the `title` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.          |
| `--bx-notification-center-title-letter-spacing` | Letter spacing of the `title` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.      |
| `--bx-notification-center-focus-ring-width`     | Focus ring width of the items (focus state). Default `var(--bx-border-width-strong)`.                      |
| `--bx-notification-center-focus-ring-color`     | Focus ring color of the items (focus state). Default `var(--bx-focus-ring)`.                               |

### Methods

`show()`, `hide()`, `markAllRead()`

## 3. Functional requirements

- **FR-NOTIFICATIONCENTER-01** List uses `bx-data-list` for large histories.
- **FR-NOTIFICATIONCENTER-02** Times render with `bx-relative-time`.
- **FR-NOTIFICATIONCENTER-03** Panel is a popover on wide containers and a drawer on narrow ones.
- **FR-NOTIFICATIONCENTER-04** Unread count is announced when it changes (polite).

## 4. Fluid scaling

Row padding from the space ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Popover to drawer switch via container thresholds.

## 6. Accessibility

- Trigger is a button with `aria-expanded` and an accessible name including the unread count; panel is a labelled region with list semantics.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`.
- Svelte: typed component wrapper exposing props and callback events.

## 9. Acceptance criteria

- [ ] All FR-NOTIFICATIONCENTER-* requirements covered by unit/component tests (`notification-center.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
