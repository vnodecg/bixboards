# @bixant/design-system

Design tokens and theming for Bixant. Themes and foundation tokens are plain JSON; a small TypeScript compiler turns them into CSS custom properties, token files for design tools, and a contrast report. A browser-safe runtime API can theme at runtime.

**Scope.** This package owns _tokens and theming only_: color palettes and roles, semantic tokens, the fluid scale, type, radius, elevation, motion, themes, and their accessibility guarantees. It knows nothing about components. Components (built later) consume these tokens and define their own component-level custom properties (`--bx-button-bg`, …) on top of them.

## Layout

```
data/                 JSON sources (foundation tokens, themes)
examples/             Example custom themes
schema/               JSON Schemas for editor support
src/index.ts          Browser-safe runtime API (package root)
src/color.ts          Color math and palette generation
src/roles.ts          Contrast-derived semantic roles (shared by build and runtime)
src/build/            Compiler (Node only): themes, CSS, contrast report, DTCG/Figma export
src/cli.ts, bin.ts    `bixant-ds` CLI
```

Everything is TypeScript (`erasableSyntaxOnly`), so the sources also run directly on Node 24 (`node src/bin.ts …`); `tsc` emits the published JavaScript to `dist/`.

## Token tiers

1. **Primitive**: `color.brand.500`, `--bx-unit`, `space.m` (foundation and generated palettes).
2. **Semantic**: `surface.*`, `text.*`, `border.*`, `focus.ring`, and per-palette **roles** (below). This is what themes change, and what components should use.

Component tokens (tier 3) are defined by components, referencing tiers 1–2.

### Roles

Palettes are identical in light and dark; what differs is which step reads well on the page. Every palette therefore gets roles, derived per theme by a contrast search against the theme's surfaces:

| Role                                             | Use                                                  | Guarantee                                         |
| ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- |
| `role.<p>.solid` / `-hover` / `-active`          | Solid fills                                          | `on-solid` text ≥ 4.5:1 on all three              |
| `role.<p>.on-solid`                              | Text/icons on solid fills                            | white or the dark text color, whichever passes    |
| `role.<p>.fg`                                    | Text and icons on the page or on tints               | ≥ 4.5:1 on the surfaces and on the strongest tint |
| `role.<p>.border`                                | Outlines and rules that carry meaning                | ≥ 3:1 on the surfaces                             |
| `role.<p>.subtle` / `-hover` / `-active`, `tint` | Translucent backgrounds (alpha 0.16/0.24/0.32, 0.08) | composited on the surface for checks              |

Set a role explicitly in a theme's `tokens` to override the derivation; the build still checks it. **Components must use roles rather than palette steps**, otherwise they lose the guarantee in dark themes.

## Build and CLI

```sh
pnpm nx run design-system:build     # tsc -> dist/
pnpm nx run design-system:tokens    # CSS + token files -> dist/generated
pnpm nx run design-system:test
pnpm nx run design-system:validate  # strict checks, including the example themes
```

```sh
bixant-ds build [--out dir] [--theme file]… [--strict] [--viewport 1280]
bixant-ds validate [--strict] [--theme file]…
bixant-ds init-theme <name> [--extends light] [--brand "#0a7d6b"]
```

Unknown flags and missing values are errors. `--strict` fails on any warning (contrast, deprecations, un-evaluable Figma values).

Outputs in `dist/generated`:

| File                 | Contents                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| `tokens.css`         | All tokens as custom properties, in `@layer bx.tokens`                 |
| `themes/<name>.json` | Flat resolved tokens of one theme                                      |
| `contrast.json`      | Contrast ratio and pass/fail of every documented token pair, per theme |
| `tokens.dtcg.json`   | DTCG token sets for Tokens Studio / Figma variables                    |
| `tokens.figma.json`  | Same, with fluid dimensions evaluated to pixels                        |

```html
<link rel="stylesheet" href="@bixant/design-system/tokens.css" />
<html data-theme="dark">
  <!-- `dark` also follows prefers-color-scheme when data-theme is absent -->
</html>
```

### Contrast checks

The build fails (`--strict`) if any of these do not hold in any theme:

- Text tokens on `surface.base`/`surface.subtle` (4.5:1), `border.base`/`border.strong` and `focus.ring` (3:1), inverse text on the inverse surface.
- Every role guarantee above (also for hand-written role overrides).
- Rules a theme declares in `contrast`.

Semi-transparent colors are composited on the surface first. The full matrix is in `contrast.json` (and Storybook → Foundation → Contrast). Component-level pairs (for example a button's label on its fill) are the components' responsibility, but they inherit these guarantees by using roles; `contrast()` from the package root is available for their tests.

## Foundation (fluid scale)

`--bx-unit = clamp(min, preferred, max) × --bx-scale`. Spacing, type, radii and control heights are multiples of the unit.

```html
<section class="bx-scale" style="--bx-scale: 0.85">…</section>
```

Derived tokens hold `var()` references and resolve where they are declared, so a region opts in with `.bx-scale` (or `data-bx-scale`) for its own `--bx-scale` to take effect. A theme that sets `foundation.scale` re-declares every derived token in its own scope, so it works on any element, not just `<html>`. Touch targets: `--bx-target-min` is 1.5rem, and 2.75rem under `pointer: coarse` — 44pt, [Apple HIG's minimum tap target](https://developer.apple.com/design/human-interface-guidelines/layout).

### Safe areas

`--bx-safe-area-inset-{top,right,bottom,left}` wrap `env(safe-area-inset-*, 0px)` (the notch/Dynamic Island/home-indicator insets Apple's HIG requires edge-to-edge content to respect on iOS/iPadOS Safari and installed web apps; `0px` elsewhere). They are theme-independent literals, not derived from `--bx-unit`. Full-bleed components (a future `page`, `dialog`, `sheet`, `toast`) should pad with `max(<normal-space>, var(--bx-safe-area-inset-*))` rather than the space token alone, so the safe inset only grows the padding, never shrinks it below the design spacing:

```css
padding-block-start: max(var(--bx-space-m), var(--bx-safe-area-inset-top));
```

## Themes

```json
{
  "name": "acme",
  "extends": "light",
  "seeds": { "brand": "#0a7d6b" },
  "foundation": { "radius": { "m": "calc({unit} * 0.75)" } }
}
```

| Key           | What it customizes                                                                                                              | Example                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `seeds`       | Palette colors. A new name in the **default** theme adds a palette (with roles) everywhere; other themes fall back to that seed | `"info": "#0891b2"`                           |
| `palette`     | Lightness curve of generated palettes (`lightest` 50–100, `darkest` 0–50)                                                       | `{ "lightest": 97, "darkest": 14 }`           |
| `shades`      | Hand-tuned steps that replace generated ones                                                                                    | `{ "brand": { "600": "#0b5f52" } }`           |
| `tokens`      | Semantic tokens, including role overrides                                                                                       | `{ "surface": { "base": "#fdfdf8" } }`        |
| `foundation`  | Radius, font, spacing, shadows, motion, control heights, `scale`; `$coarse` for `pointer: coarse`                               | `{ "scale": "0.9" }`                          |
| `extends`     | One theme or a list. Ancestors are applied once, in order; later entries win, then the theme itself                             | `["acme", "dark"]`                            |
| `contrast`    | Extra rules (token paths)                                                                                                       | `{ "fg": "text.link", "bg": "surface.base" }` |
| `$deprecated` | Token paths → migration note. Builds warn while a theme or foundation override still references them                            | `{ "radius.s": "use radius.m" }`              |

- `default: true` (exactly one) applies to `:root`; a user theme passed via `--theme` with `default: true` replaces the built-in default (white-label builds). `auto: true` also applies under the matching `prefers-color-scheme`.
- Every theme defines the same token names as the default theme.
- Inputs are validated with file-aware errors (invalid JSON, unknown properties, bad hex, out-of-range curves, unknown extends, circular extends, unknown token references).

## How components use the tokens

Components are out of scope here, but the contract is simple:

- Read semantic tokens and roles (`var(--bx-role-brand-solid)`, `var(--bx-text-primary)`, `var(--bx-space-m)`), never palette steps or raw values.
- Size with the fluid tokens so `--bx-scale` and `.bx-scale` regions work.
- Define component-level properties (`--bx-<component>-*`) in the component, defaulting to those tokens, so apps can override one component without touching the theme.

## Runtime theming

For brands known only at runtime (multi-tenant, user-chosen accent). Browser-safe; the package root imports no Node APIs.

```ts
import { applyTheme, themeVars, toCssText } from '@bixant/design-system';

applyTheme(
  document.documentElement,
  { brand: '#0a7d6b' },
  {
    scheme: 'light', // roles are chosen for this mode's surfaces
    curve: { lightest: 97, darkest: 14 },
    foundation: { '--bx-radius-m': '0px' },
  },
);

toCssText('[data-tenant="acme"]', themeVars({ brand: '#0a7d6b' })); // e.g. SSR
```

Roles are computed with the same contrast search as the build. Apply on the element that carries `data-theme` (or `<html>`); descendants inherit.

**Untrusted input**: seeds must be `#rgb`/`#rrggbb`, palette names lowercase identifiers, property names `--[a-z0-9-]+`, and values may not contain `; { } < > \`, comments, `@import` or `url(`. Anything else throws, so `toCssText` cannot be used to break out of a declaration.

## Design tool export

- `tokens.dtcg.json`: [DTCG](https://tr.designtokens.org/format/) format as Tokens Studio sets (`foundation`, then one set per theme). Aliases are preserved; only literal dimensions are typed `dimension`, so CSS expressions never masquerade as lengths.
- `tokens.figma.json`: the same, with foundation dimensions evaluated to pixels at a reference viewport (`--viewport`, default 1280) and scale 1 (or the theme's scale), since Figma variables cannot evaluate `calc(clamp(…))`.

## Editor support

JSON Schemas in `schema/` (`theme`, `foundation`); each data file references one through `$schema`.
