# `<bx-copy-button>`

> One-click copy of text, a property, or another element's content to the clipboard with success/error feedback.

|                     |                  |
| ------------------- | ---------------- |
| **Package**         | `@bixant/core`   |
| **Category**        | Actions          |
| **Tag**             | `bx-copy-button` |
| **Status**          | Implemented      |
| **Form-associated** | No               |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

One-click copy of text, a property, or another element's content to the clipboard with success/error feedback. Specified for the Bixant token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name                | Type      | Default     | Description                                          |
| ------------------- | --------- | ----------- | ---------------------------------------------------- |
| `value`             | string    | ""          | Text to copy                                         |
| `from`              | string    | ""          | `id`, `id[attr]` or `id.prop` reference to copy from |
| `disabled`          | boolean   | false       | -                                                    |
| `variant`           | string    | "secondary" | Passed to the inner `bx-button` (added)              |
| `appearance`        | string    | "plain"     | Passed to the inner `bx-button` (added)              |
| `size`              | string    | "medium"    | Passed to the inner `bx-button` (added)              |
| `copy-label`        | string    | "Copy"      | Tooltip text                                         |
| `success-label`     | string    | "Copied"    | -                                                    |
| `error-label`       | string    | "Error"     | -                                                    |
| `feedback-duration` | number    | 1000        | ms to show feedback                                  |
| `tooltip-placement` | Placement | "top"       | -                                                    |

### Slots

| Slot           | Description                       |
| -------------- | --------------------------------- |
| `copy-icon`    | Default: `bx-icon name="copy"`    |
| `success-icon` | Default: `bx-icon name="check"`   |
| `error-icon`   | Default: `bx-icon name="warning"` |

### Events

| Event      | Detail / notes                                                                      |
| ---------- | ----------------------------------------------------------------------------------- |
| `bx-copy`  | detail.value                                                                        |
| `bx-error` | detail.reason (unresolvable `from`, nothing to copy, or a rejected clipboard write) |

### CSS parts

`button`, `copy-icon`, `success-icon`, `error-icon`, `tooltip`

### CSS custom properties

`--bx-copy-button-success-color`, `--bx-copy-button-error-color` (renamed from the spec's `--bx-success-color`/`--bx-error-color` to follow the package's component-prefix rule; defaults are `--bx-role-success-fg`/`--bx-role-danger-fg`)

### Methods

`copy()`

## 3. Functional requirements

- **FR-COPY-BUTTON-01** Uses async Clipboard API; falls back to `execCommand` in insecure contexts.
- **FR-COPY-BUTTON-02** `from` resolves across shadow roots via root-node lookup.
- **FR-COPY-BUTTON-03** Feedback state announced via live region.

## 4. Fluid scaling

Icon and hit area scale with the size step.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None beyond inherited button behavior.

## 6. Accessibility

- Accessible name = current label; status change announced politely.
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

- [ ] All FR-COPY-BUTTON-* requirements covered by unit/component tests (Web Test Runner, real browsers). FR-02, FR-03 and the async Clipboard path are covered; the `execCommand` fallback (FR-01) is implemented but not exercised, since the test browsers are secure contexts.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression tooling configured yet.
- [ ] axe-core: zero violations (at rest and after copying, asserted in the component's test file); manual screen-reader pass (NVDA/VoiceOver) not done yet.
- [ ] Keyboard-only walkthrough recorded in the test plan. Keyboard behavior is covered by tests and the Storybook story; no recorded walkthrough yet.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. No wrapper generation yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- A composite of `bx-button` + `bx-tooltip` + `bx-icon`; the tooltip doubles as feedback and a visually hidden `role="status"` live region announces it. The inner `bx-button`'s `aria-label` tracks the current label.
- Open: confirm final property names against the custom-elements manifest during implementation.
