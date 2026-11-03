# `<bx-social-button>`

> Branded sign-in / share button for common identity providers and social networks.

|                     |                            |
| ------------------- | -------------------------- |
| **Package**         | `@bixboards/core`          |
| **Category**        | Actions                    |
| **Tag**             | `bx-social-button`         |
| **Status**          | Proposed (not implemented) |
| **Form-associated** | No                         |
| **Depends on**      | `button`, `icon`           |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Branded sign-in / share button for common identity providers and social networks. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name         | Type                                                                     | Default    | Description                                                |
| ------------ | ------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------- |
| `provider`   | google/apple/microsoft/github/gitlab/facebook/x/linkedin/slack/discord/… | ""         | Selects icon and default label; extensible via a registry. |
| `mode`       | continue/signin/signup/share                                             | "continue" | Label template, e.g. "Continue with Google".               |
| `appearance` | brand/outlined/mono                                                      | "outlined" | `brand` uses the provider color; `mono` follows the theme. |
| `size`       | s/m/l                                                                    | "m"        | -                                                          |
| `href`       | string                                                                   | ""         | Link mode.                                                 |
| `disabled`   | boolean                                                                  | false      | -                                                          |
| `loading`    | boolean                                                                  | false      | -                                                          |

### Slots

| Name        | Description                    |
| ----------- | ------------------------------ |
| `(default)` | Overrides the generated label. |

### Events

| Event   | Detail / notes |
| ------- | -------------- |
| `click` | Native click.  |

### CSS parts

| Part    | Description         |
| ------- | ------------------- |
| `base`  | The button surface. |
| `logo`  | Provider mark.      |
| `label` | Text.               |

### CSS custom properties

| Property                              | Description                                                              |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `--bx-social-button-bg`               | Background. Default per `appearance`.                                    |
| `--bx-social-button-logo-size`        | Mark size. Default `1.25em`.                                             |
| `--bx-social-button-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-social-button-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-social-button-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`focus()`, `blur()`

## 3. Functional requirements

- **FR-SOCIALBUTTON-01** Provider marks are inline SVGs registered through `registerSocialProvider(name, {label, svg, brandColor})`; only the providers actually imported are bundled.
- **FR-SOCIALBUTTON-02** Labels come from the localization registry with a `{provider}` placeholder.
- **FR-SOCIALBUTTON-03** Brand marks follow each provider's published guidelines (no recoloring of multi-color marks).

## 4. Fluid scaling

Height from the control ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Label truncates with ellipsis before the logo shrinks.

## 6. Accessibility

- Visible label always present; the logo is `aria-hidden`.
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

- [ ] All FR-SOCIALBUTTON-* requirements covered by unit/component tests (`social-button.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
