# Bixboards

A Lit-based web component library that **scales automatically**.

- **Fluid sizing** — one `--bx-scale` token drives spacing, type and radii through `clamp()`. No breakpoints.
- **Container-query reflow** — components adapt to the space they are given, not the viewport.
- **Enterprise-ready** — virtualization is built in; the data table, list and tree stay fast with very large datasets.
- **Modular** — a `core` package plus optional data modules, so apps only pay for what they import.
- **Framework-friendly** — native custom elements with thin React, Angular and Svelte adapters (no reimplementations).

> Status: early. Implemented: the [design system](packages/design-system/README.md) (tokens and theming: TypeScript compiler, themes, contrast checks, runtime API), a Storybook of the tokens, and the first `@bixboards/core` component, [`bx-animated-image`](docs/features/core/animated-image.md). **Components are being built one at a time on top of the design system.** Not started: the other 60 components, `data-table`, `data-list` and the framework wrappers. See the [PRD](docs/PRD.md), the [feature documents](docs/features/README.md) and the [code review](docs/code-review-2026-09-28.md).

## Packages

| Package                                                     | Purpose                                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`@bixboards/design-system`](packages/design-system/README.md) | Design tokens and theming: JSON themes and foundation compiled to CSS custom properties (implemented) |
| `@bixboards/core`                                              | `VirtualizerController`, 58 general components (55 implemented, see the tracker)                      |
| `@bixboards/data-table`                                        | Virtualized enterprise data table                                                                     |
| `@bixboards/data-list`                                         | Virtualized list/grid and tree                                                                        |
| `@bixboards/react` · `@bixboards/angular` · `@bixboards/svelte`      | Generated wrappers over the custom elements                                                           |

Names are provisional (see PRD open questions).

## Design in a nutshell

```css
:root {
  --bx-scale: 1; /* override on a .bx-scale element to rescale a subtree */
  --bx-fluid-preferred: 0.8125rem + 0.25vi;
  --bx-unit: calc(
    clamp(0.875rem, var(--bx-fluid-preferred), 1.125rem) * var(--bx-scale)
  );
}
```

```html
<div class="bx-scale" style="--bx-scale: 0.85; width: 320px">
  <bx-card>
    <bx-button variant="brand">Adapts to its container</bx-button>
  </bx-card>
</div>
```

## Documentation

- [Product requirements (PRD)](docs/PRD.md)
- [Feature documents, one per component](docs/features/README.md)
- [Shared conventions](docs/features/_conventions.md): fluid tokens, container queries, virtualization, forms, events, wrappers, testing

Components are specified in the feature documents and will be built on the design-system tokens. Implementation must be original; see PRD §10 on licensing.

## Storybook

```sh
pnpm storybook          # dev server on http://localhost:6006
pnpm build-storybook    # static build to packages/storybook/dist
```

This builds the tokens (design system plus the example themes) and starts Storybook on port 6006. The toolbar switches theme and `--bx-scale`. Stories show tokens, per-theme roles, the contrast matrix, a runtime-theming playground, and (as components are implemented) the components themselves — every implemented component has one. A test fails if a story references a token the design system does not generate.

## Development

The workspace is TypeScript (Node 24, pnpm). Everything runs through Nx:

```sh
pnpm check                         # format:check + typecheck, test, validate, build, tokens, build-storybook
pnpm test                          # design-system + core unit/component tests (real browsers) + Storybook token-reference tests
pnpm typecheck
pnpm nx run design-system:tokens   # regenerate CSS/token files (strict)
pnpm nx graph
pnpm nx sync                       # keep TypeScript project references in sync
```

If Nx hangs on your machine, set `NX_DAEMON=false` (CI does).

`pnpm-workspace.yaml` allows install scripts for `@swc/core`, `nx` and `esbuild` (required by Nx and Storybook); review it before adding more.

Generate a package (example, for one that doesn't exist yet):

```sh
pnpm nx g @nx/js:lib packages/data-table --publishable --importPath=@bixboards/data-table
```

See the [Nx docs](https://nx.dev/docs) for more.
