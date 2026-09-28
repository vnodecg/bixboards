# Foundations

Values below are the defaults from `packages/design-system/data/foundation.json` and the built-in themes. Storybook → Foundation/Tokens shows them live.

## Color

- Five semantic palettes: `neutral`, `brand`, `success`, `warning`, `danger`. Each is derived from one seed hex into steps `100…900` (seed = 500) plus alpha steps `transparent.100…600`.
- **Use semantic tokens and roles in UI**; palette steps only inside themes. The step that reads well differs between light and dark, so components never pick a step themselves.

| Group   | Tokens                                                                  | Use                                                        |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Surface | `surface.base`, `.subtle`, `.muted`, `.inverse`                         | Page, cards/panels, fills, tooltips                        |
| Text    | `text.primary`, `.secondary`, `.hint`, `.disabled`, `.inverse`, `.link` | Body, supporting, placeholder, disabled, on inverse, links |
| Role    | `role.<palette>.solid`, `.solid-hover`, `.solid-active`, `.on-solid`    | Solid fills and the text on them                           |
|         | `role.<palette>.fg`, `.border`                                          | Colored text/icons and outlines on the page                |
|         | `role.<palette>.subtle`, `.subtle-hover`, `.subtle-active`, `.tint`     | Translucent backgrounds                                    |
| Border  | `border.subtle`, `.base`, `.strong`, `.disabled`                        | Dividers, controls (`base` ≥ 3:1), emphasis                |
| Focus   | `focus.ring`                                                            | Focus indicator                                            |

Status colors always come with a second cue (icon, text, shape). Roles are derived per theme by contrast search: for example `warning` gets dark text on its solid fill, and `brand.fg` is a darker step in light and a lighter step in dark.

**Contrast requirements**, enforced by the build (`--strict` fails CI) in every theme:

- text on surfaces 4.5:1; `border.base`, `border.strong`, `focus.ring` and `role.*.border` 3:1 against the page;
- `role.*.on-solid` on solid, hover and active fills 4.5:1; `role.*.fg` on the surfaces and on the strongest tint 4.5:1;
- a theme's own `contrast` rules.

The matrix for every theme is in `contrast.json` and Storybook → Foundation → Contrast. Component-level pairs (a label on its fill) are the components' responsibility; using roles gives them the guarantees above. `disabled` states are exempt under WCAG.

## Typography

- Family: `font.family.sans` (system UI stack) and `font.family.mono`.
- Sizes: `xs, s, m, l, xl, 2xl, 3xl` as multiples of the fluid `--bx-unit` (0.75 → 2×). Body is `m`.
- Weights: regular 400, medium 500, semibold 600, bold 700. Line height: `tight` 1.25 for headings, `normal` 1.5 for body.
- Body text never renders below the equivalent of 16 px on coarse pointers.

## Spacing and the fluid scale

`--bx-unit = clamp(min, preferred, max) × --bx-scale`. All space, type, radius and control sizes are unit multiples.

| Token              | ×unit | Typical use                        |
| ------------------ | ----- | ---------------------------------- |
| `space.2xs`        | 0.25  | Icon-to-text, tight stacks         |
| `space.xs`         | 0.5   | Inline gaps, control padding-block |
| `space.s`          | 0.75  | Control padding-inline, list gaps  |
| `space.m`          | 1     | Default gap and padding            |
| `space.l`          | 1.5   | Section padding                    |
| `space.xl` / `2xl` | 2 / 3 | Page regions                       |

- Scale a region with `class="bx-scale"` and `--bx-scale`.
- Layout reflow uses container queries with thresholds in fluid units.
- **Target size**: `--bx-target-min` is 1.5rem (24 px) and 2.75rem (44 px) under `pointer: coarse`; interactive controls take `max(control height, target-min)`.

## Radius

`radius.s` (0.25u), `radius.m` (0.375u, default for controls), `radius.l` (0.625u, containers), `radius.pill`.

## Elevation

`shadow.s` (resting cards), `shadow.m` (popovers, tooltips, dropdowns), `shadow.l` (dialogs, drawers). In dark themes prefer surface tint and borders over heavier shadows. Stacking order comes from `z.*` tokens (`dropdown` < `sticky` < `overlay` < `modal` < `tooltip`); never hardcode z-index.

## Motion

- Durations: `fast` 120 ms (state changes), `base` 200 ms (enter/exit), `slow` 320 ms (layout/large surfaces). Easing: `motion.easing.standard`.
- Animate `transform` and `opacity`; avoid animating layout properties.
- Under `prefers-reduced-motion: reduce`, replace movement with fades or nothing. No information is conveyed by animation alone.

## Accessibility

Baseline for every component (WCAG 2.2 AA):

- Fully keyboard operable with visible `:focus-visible` indicator (3:1 against adjacent colors, 2 px, offset 2 px).
- Correct role, name, state and value exposed; APG patterns for widgets (tabs, tree, combobox, dialog, menu).
- Target size per above; 200% zoom and text-spacing overrides without content loss.
- `prefers-reduced-motion`, `forced-colors` and RTL/logical properties supported.
- Virtualized structures expose `aria-setsize/posinset/rowindex` from data, not DOM order.
- Verified with axe-core in CI plus a manual screen-reader pass for form, overlay, tabs, tree and grid components.

## Iconography and imagery

Icons inherit `currentColor` and size with `1em`; decorative icons are `aria-hidden`, meaningful ones carry a label. Images always have `alt` or are marked decorative.
