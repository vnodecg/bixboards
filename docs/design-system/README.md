# Bixboards design system

How the design system is structured and governed. Implementation lives in [`@bixboards/design-system`](../../packages/design-system/README.md).

**Scope: tokens and theming only.** The design system defines color, type, space, shape, elevation and motion, the themes that change them, and their accessibility guarantees. It does not define components. Components are specified in [features](../features/README.md), are built afterwards, and consume these tokens.

The structure follows practices common to mature systems (Material Design 3, IBM Carbon, Shopify Polaris, Arco, Atlassian, Uber Base; see the [Figma design-system examples](https://www.figma.com/resource-library/design-system-examples/)):

| Practice                                                 | Where it lives here                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| Design tokens as the single source of truth              | JSON in `packages/design-system/data` → CSS variables, DTCG/Figma exports |
| Tiered tokens: primitive → semantic (→ component, later) | [Token architecture](#token-architecture)                                 |
| Accessibility built in                                   | [foundations](foundations.md#accessibility), enforced contrast checks     |
| Tiered documentation (principles → foundations → usage)  | this folder, Storybook                                                    |
| Theme flexibility without redesigning components         | [theming](theming.md)                                                     |
| Design/dev/product alignment                             | [governance](governance.md), Figma sync via DTCG export                   |
| Scalable governance                                      | [governance](governance.md)                                               |

## Documents

- [Principles](principles.md): what we optimise for and how to resolve trade-offs.
- [Foundations](foundations.md): color, typography, spacing/fluid scale, radius, elevation, motion, accessibility.
- [Theming](theming.md): seeds, custom brands, dark mode, density/scale, runtime theming, Figma sync.
- [Governance](governance.md): ownership, contribution flow, naming rules, versioning and deprecation.
- [Component guidelines](component-guidelines.md): a template for when components start (not part of the design-system deliverables).

## Token architecture

| Tier         | Purpose                              | Examples                                                                         | Defined in                                              |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1. Primitive | Raw scale values, no meaning         | `color.brand.500`, `--bx-unit`, `space.m`, `radius.m`                            | `foundation.json`, theme `seeds` (palettes are derived) |
| 2. Semantic  | Meaning and role; what themes change | `surface.base`, `text.secondary`, `border.strong`, `focus.ring`, `role.brand.fg` | theme `tokens`, derived roles                           |

Component tokens (`--bx-button-bg`, …) are a third tier owned by each component, not by this package.

Rules:

- A tier may only reference the tier above it. Semantic tokens reference primitives; component tokens will reference semantic tokens.
- Components use **roles** (`role.<palette>.solid`, `.fg`, `.border`, …) rather than palette steps, because the step that reads well differs between light and dark. Roles are derived per theme by contrast search.
- Themes change tier 2 (and seeds, foundation values). They never know about components.
- Apps can override any token with CSS custom properties; tokens are in `@layer bx.tokens`, so unlayered CSS wins.

## Deliverables per release

1. `tokens.css` and per-theme `themes/<name>.json` (consumed by apps, components and Storybook)
2. `contrast.json`: contrast ratio and pass/fail of every documented token pair, per theme
3. `tokens.dtcg.json` and `tokens.figma.json` (imported into Figma variables through Tokens Studio or the Figma variables importer)
4. Storybook: tokens, roles, contrast, theming playground
5. Changelog with token additions, deprecations and removals
