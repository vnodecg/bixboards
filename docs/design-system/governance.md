# Governance

Goal: a system that evolves with products without turning the core team into a bottleneck.

## Roles

| Role                   | Responsibility                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Core maintainers       | Own tokens, foundations, `core`, release process; final say on breaking changes                    |
| Component owners       | One named owner per component or module (`data-table`, `data-list`); triage issues, review changes |
| Contributors           | Any product team; propose or build changes following the flow below                                |
| Design representative  | Reviews visual/interaction changes and Figma sync                                                  |
| Accessibility reviewer | Signs off new interactive components and pattern changes                                           |

## Contribution flow

1. **Propose**: issue with the problem, at least two real use cases, and links to existing alternatives. New tokens or component options require a use case beyond one product.
2. **Spec**: for design-system changes, the token(s) needed with at least two uses; for components, the feature doc (behavior/API) and a Figma frame. Small changes can skip straight to a pull request.
3. **Build**: implementation with tests, Storybook stories and docs per the [definition of done](component-guidelines.md#definition-of-done-for-a-component).
4. **Review**: owner + design + accessibility as applicable. CI must pass: build with `--strict` (contrast, unknown token refs), tests, axe, size budget, visual regression.
5. **Release**: merged changes ship in the next release with a changelog entry.

Decision rule: prefer the smallest change that solves the problem for more than one team; otherwise keep it in the product as a local override.

## Naming rules

- Tags `bx-<name>`; events `bx-<name>`; component-level CSS properties `--bx-<component>-<parameter>` (owned by components); tokens `--bx-<group>-<name>` (dotted path, dashes in CSS).
- Semantic names describe role (`text.secondary`), never appearance (`gray-700`) and never a component.
- Parameter names are shared across components where the meaning is the same: `bg`, `fg`, `border`, `radius`, `min-height`, `padding-inline`, `gap`, `font-size`.
- Values `neutral`, `brand`, `success`, `warning`, `danger` are the only allowed `variant` values.

## Versioning (semantic versioning)

| Change                                                                         | Bump                         |
| ------------------------------------------------------------------------------ | ---------------------------- |
| New token, palette or role                                                     | minor                        |
| Value tweaks that keep contrast and layout                                     | patch                        |
| Renamed/removed token; changed token semantics (for example what a role means) | major                        |
| Theme colors changed by more than a rounding tweak                             | minor with visual-diff notes |

## Deprecation

1. Mark deprecated in the source JSON (`"$deprecated": { "surface.subtle": "use surface.muted" }` in `foundation.json` or a theme). The build warns wherever a mapping or theme still references the token, and `--strict` fails CI. Also mark it in docs.
2. Keep working for at least one minor release (two for tokens used by themes).
3. Remove in the next major, listed in the changelog with a migration note or codemod.

## Quality gates in CI

- `design-system:build --strict` (unknown references, missing theme tokens, contrast rules)
- Unit/component tests and axe-core
- Visual regression on the matrix (scale × container width × theme)
- Bundle size limits per entry point
- Benchmarks for data components

## Backlog

- Changelog generation from `$deprecated` entries and token diffs.
- High-contrast theme and `prefers-contrast` support.
- Density presets (`compact`, `comfortable`) as documented `--bx-scale` and spacing presets.
- Visual regression and Chromatic-style review in Storybook.
