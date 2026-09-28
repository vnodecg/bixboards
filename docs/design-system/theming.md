# Theming

Themes are JSON. They change tokens; everything built on the tokens (components included) follows.

## Built-in

| Theme   | Notes                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `light` | Default; applied to `:root`                                                                                                        |
| `dark`  | Extends `light`; applied with `data-theme="dark"` and automatically under `prefers-color-scheme: dark` when `data-theme` is absent |

```html
<html data-theme="dark"></html>
```

## Creating a brand theme

1. Copy the seeds you want to change into a new JSON file; use `extends` to inherit everything else.
2. Roles (solid, on-solid, fg, border, …) are derived from the seeds and the theme's surfaces, so there is normally nothing to add. Add `contrast` rules only for your own token pairings.
3. Build and check warnings.

```json
{
  "name": "acme",
  "extends": "light",
  "seeds": { "brand": "#0a7d6b" }
}
```

```sh
node packages/design-system/src/bin.ts build --theme ./acme.json --out ./dist-acme --strict
```

Load `dist-acme/tokens.css`; apply with `data-theme="acme"` on any element to theme a subtree (for example an embedded widget).

## Customization levels

From least to most invasive; use the lowest level that does the job.

| Level                           | Mechanism                                                                    | Typical use                           |
| ------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| 1. Brand color                  | `seeds` (palettes generated; roles such as text-on-fill derived by contrast) | White-label a product                 |
| 2. Palette feel                 | `palette` curve, `shades` overrides                                          | Softer/deeper tints, hand-tuned steps |
| 3. Semantic tokens              | `tokens` (`surface`, `text`, `border`, `focus`, role overrides, …)           | Different neutrals, elevated surfaces |
| 4. Shape, type, density, motion | `foundation` (`radius`, `font`, `space`, `shadow`, `motion`, `scale`)        | Sharp vs. rounded, serif, compact     |
| 5. Composition                  | `extends: ["brand", "dark"]`                                                 | Any brand × any mode                  |
| 6. Runtime                      | `@bixant/design-system` (runtime API)                                        | Tenant-chosen colors without a build  |

| May change                              | May not change                                   |
| --------------------------------------- | ------------------------------------------------ |
| Everything above                        | Token names (all themes define the same set)     |
| New palettes (add to the default theme) | Anything about components; they are out of scope |

Adding a palette, for example `info`, means adding a seed in the default theme: every theme gets `color.info.*` and `role.info.*`, and components can then offer an `info` variant.

Component-level customization (one component in one app) is done with that component's own `--bx-<component>-*` properties once components exist; it is not a theme concern.

## Scale and density

Not part of a theme. Set `--bx-scale` on `.bx-scale` regions (for example a dense data grid at `0.85`). Coarse pointers automatically raise touch targets.

## Figma sync

`dist/tokens.dtcg.json` uses the Design Tokens Community Group format organised as sets (`foundation`, `light`, `dark`), with aliases preserved (`{color.brand.500}`).

- Import into Figma through [Tokens Studio](https://tokens.studio/) or a DTCG-capable variables importer; map sets to variable modes (`light`, `dark`).
- Source of truth is the JSON in this repo. Designers propose changes by pull request (or export from Figma and diff), not by editing Figma variables directly.
- Fluid tokens are `calc(clamp(...))` expressions, which Figma variables cannot evaluate. Import `tokens.figma.json` instead: the same sets, with `space`, `font`, `radius`, `control` and `fluid` values evaluated to pixels at a reference viewport (`--viewport`, default 1280) and the theme's scale.
