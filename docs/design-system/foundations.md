# Foundations

Values below are the defaults from `packages/design-system/data/foundation.json` and the built-in themes. Storybook → Foundation/Tokens shows them live.

## Color

- Five palettes, deliberately few so the interface stays calm: `neutral` (surfaces, text, secondary), `brand` (default), `tertiary` (a muted stone), `warning`, `danger` (errors). There is no success palette; confirm success with an icon and text, not green.
- Component `variant` values map onto them: `default` → `brand`, `secondary` → `neutral`, `tertiary` → `tertiary`, `error` → `danger`, `warning` → `warning`. Each is derived from one seed hex into steps `100…900` (seed = 500) plus alpha steps `transparent.100…600`.
- **Use semantic tokens and roles in UI**; palette steps only inside themes. The step that reads well differs between light and dark, so components never pick a step themselves.

| Group   | Tokens                                                                  | Use                                                        |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Surface | `surface.base`, `.subtle`, `.muted`, `.inverse`                         | Page, cards/panels, fills, tooltips                        |
| Text    | `text.primary`, `.secondary`, `.hint`, `.disabled`, `.inverse`, `.link` | Body, supporting, placeholder, disabled, on inverse, links |
| Role    | `role.<palette>.solid`, `.solid-hover`, `.solid-active`, `.on-solid`    | Solid fills and the text on them                           |
|         | `role.<palette>.fg`, `.border`                                          | Colored text/icons and outlines on the page                |
|         | `role.<palette>.subtle`, `.subtle-hover`, `.subtle-active`, `.tint`     | Translucent backgrounds                                    |
| Border  | `border.subtle`, `.base`, `.strong`, `.disabled`                        | Dividers, controls (`base` ≥ 3:1), emphasis                |
| Focus   | `focus.ring`, `focus.ring-offset`                                       | Focus indicator color and gap from the element             |

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

| Token                      | ×unit     | Typical use                        |
| -------------------------- | --------- | ---------------------------------- |
| `space.2xs`                | 0.25      | Icon-to-text, tight stacks         |
| `space.xs`                 | 0.5       | Inline gaps, control padding-block |
| `space.s`                  | 0.75      | Control padding-inline, list gaps  |
| `space.m`                  | 1         | Default gap and padding            |
| `space.l`                  | 1.5       | Section padding                    |
| `space.xl` / `2xl` / `3xl` | 2 / 3 / 4 | Page regions, hero spacing         |

- Scale a region with `class="bx-scale"` and `--bx-scale`.
- Layout reflow uses container queries with thresholds in fluid units.
- **Target size**: `--bx-target-min` is 1.5rem (24 px) and 2.75rem (44 px) under `pointer: coarse`; interactive controls take `max(control height, target-min)`.

## Radius

`radius.s` (0.375u), `radius.m` (0.5u, default for controls), `radius.l` (0.75u, containers), `radius.pill`.

## Look: refined and calm

The default look is elegant and enterprise-grade: an indigo brand (`#4f46e5`) on cool slate neutrals, Inter-first typography with a system fallback, and rounded-but-not-bubbly corners (`radius.m` = 0.5u). A hairline `border.subtle` defines surfaces and a soft, indigo-tinted shadow adds depth where a surface sits above the page. Color is reserved for semantic meaning (status, the one accent action per region) rather than decoration, and `radius.pill` is for genuinely circular shapes (avatars, status dots), not a default button shape. This is a default, not a constraint: a theme can tighten radii, flatten shadows or swap the brand seed (`foundation.radius`, `foundation.shadow`, `seeds`) without touching components.

## Elevation

`shadow.s` (resting cards), `shadow.m` (popovers, tooltips, dropdowns), `shadow.l` (dialogs, drawers). Each is two layers, a tight contact shadow plus a wide ambient one, tinted toward the brand hue so they look natural on both light and tinted surfaces. Pair them with a hairline border; use surface tint rather than shadow in dark themes, where shadows read poorly. Stacking order comes from `z.*` tokens (`dropdown` < `sticky` < `overlay` < `modal` < `tooltip`); never hardcode z-index.

## Motion

- Durations: `fast` 120 ms (state changes), `base` 200 ms (enter/exit), `slow` 360 ms (layout/large surfaces). Easing: `motion.easing.standard`.
- Animate `transform` and `opacity`; avoid animating layout properties.
- Under `prefers-reduced-motion: reduce`, replace movement with fades or nothing. No information is conveyed by animation alone.

## Accessibility

Baseline for every component (WCAG 2.2 AA):

- Fully keyboard operable with visible `:focus-visible` indicator (3:1 against adjacent colors, width `border.width-strong`, gap `focus.ring-offset`).
- Correct role, name, state and value exposed; APG patterns for widgets (tabs, tree, combobox, dialog, menu).
- Target size per above; 200% zoom and text-spacing overrides without content loss.
- `prefers-reduced-motion`, `forced-colors` and RTL/logical properties supported.
- Virtualized structures expose `aria-setsize/posinset/rowindex` from data, not DOM order.
- Verified with axe-core in CI plus a manual screen-reader pass for form, overlay, tabs, tree and grid components.

## Iconography and imagery

Icons inherit `currentColor` and size with `1em`; decorative icons are `aria-hidden`, meaningful ones carry a label. Images always have `alt` or are marked decorative.
