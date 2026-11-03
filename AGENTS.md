<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Component workflow

Components live in `@bixboards/core` (plus `@bixboards/data-table`, `@bixboards/data-list` for the data components), built on `@bixboards/design-system` tokens. Build components **one at a time**, not in batch:

- Pick a single component from [docs/features/README.md](docs/features/README.md); read its feature doc plus [docs/features/_conventions.md](docs/features/_conventions.md) before writing it.
- Implement it fully (element, styles, forms/a11y/virtualization as applicable per the conventions doc) and land it before starting the next component.
- **Add its Storybook story in the same change, every time — this is not optional.** A component is not done without one; do not defer it, do not batch it for later, do not skip it because the component "is simple." See "Required Storybook example per component" below for what it must cover. Before marking IMPLEMENTATION.md's checkbox, confirm `packages/storybook/stories/<name>.stories.ts` exists and that `pnpm nx run storybook:build-storybook` succeeds — a missing or broken story is a blocking gap, not a follow-up task. (This rule exists because a backlog of ~30 shipped components with no story accumulated silently — Storybook coverage had drifted far behind IMPLEMENTATION.md's checkmarks, and one of those missing stories is what surfaced the `createRenderRoot`/`shadowRootOptions` bug documented below. Writing the story is also the actual verification step: several components looked correct in isolation but only revealed layout bugs once rendered live.)

## File layout per component

Follow `packages/core/src/animated-image/` as the template for a new component `<name>`:

- `<name>/<name>.ts` — the `BixElement` subclass. All logic and styles live here; keep it a single file unless it genuinely outgrows one (a sub-part like a shared item component, e.g. `tree-item`, is its own component/tag, not a file split).
- `<name>/index.ts` — the side-effecting entry point: imports `define.ts` and calls it once, then re-exports the class and the `define...` function. This is what `@bixboards/core/<name>` resolves to.
- `<name>/define.ts` — a named `export function define<PascalName>(tagName?: string): void` wrapping `MyComponent.define(tagName)`. This is what `@bixboards/core/<name>/define` resolves to (no eager registration).
- `<name>/<name>.test.ts` — Web Test Runner + `@open-wc/testing`, real browsers. See "Required tests per component" below.
- `<name>/fixtures/` — any binary/data fixtures the tests need (keep them tiny; the animated-image fixture is a 37-byte GIF).
- Add both entries to `packages/core/package.json`'s `exports` map (`./<name>` and `./<name>/define`, each with `types`/`default`) and to `sideEffects` if not already covered by the `dist/*/index.js` glob.

## Naming

- Tag: `bx-<name>`. Events: `bx-<verb>` (`bx-load`, `bx-error`), `bubbles: true, composed: true`.
- CSS parts use short, undecorated names (`frame`, `control-box`) — `::part()` is already scoped by the element it's called on, so no component prefix is needed.
- CSS custom properties ARE prefixed with the component name: `--bx-<name>-[<part>-][<state>-]<property>` (e.g. `--bx-animated-image-control-box-bg`, `--bx-tab-selected-fg`). The root surface (`base`) has no part segment. Never shorten it to `--bx-<part>-<property>` or leave it unprefixed (`--slide-gap`): every unprefixed or foreign name was a bug the audit now rejects.
- Every custom property has a token-backed fallback: `var(--bx-<name>-<part>-<property>, var(--bx-<design-system-token>))`. No raw colors, `px`, durations or global-scale `z-index` anywhere in a component's CSS, and no raw fallback on a design-system token (`var(--bx-radius-m, 0.5rem)` is wrong — tokens are a hard dependency).
- Full vocabulary, state/variant naming and the rules that keep hooks live: [docs/design-system/component-guidelines.md → Styling API](docs/design-system/component-guidelines.md#styling-api-component-hooks). It is enforced, not advisory: `pnpm audit:design-system` (static) and `packages/core/src/internal/css-hooks.test.ts` (runtime) fail the build.

## Keeping docs in sync

A component is not done when the code and tests pass — the docs describing it must match, or the next person (human or agent) works from a stale spec. When you implement or change a component, update in the same change:

- The feature doc (`docs/features/<package>/<name>.md`): `Status` field, the API tables (properties, slots, events, **CSS parts**, **CSS custom properties** — every part/prop in the JSDoc must appear here and vice versa; these two tables are generated from the JSDoc by `pnpm generate`, so edit the JSDoc, not the table), and check off the acceptance criteria that are genuinely met (leave the rest unchecked with a one-line reason, don't check something that isn't true).
- `docs/features/README.md`'s intro paragraph if it makes a claim that's no longer true (e.g. "components that do not exist yet").
- Root `README.md`: the status callout and the `@bixboards/core` row's implemented-count.
- This `AGENTS.md` file, if the change introduces or changes a shared convention (a new `BixElement` member, a new required test category, a naming rule) — not for a change scoped to one component.

Before finishing, grep for the old name/value if you renamed or removed something (a CSS custom property, a token, a file path) across `docs/`, `AGENTS.md`, `README.md` and `packages/*/src` — a rename that only touches the implementation is exactly the kind of drift this section exists to prevent.

## Base class

Every component class extends `BixElement` (`packages/core/src/bix-element.ts`), never `LitElement` directly. It is intentionally thin — a shared `box-sizing: border-box` reset (`BixElement.baseStyles`, composed into the subclass's own `static styles` array, not applied automatically), the `static tagName` + `static define(tagName?)` registration pattern (a component's `index.ts` calls `MyComponent.define()`; its `define.ts` wraps that in a named `defineMyComponent(tagName?)` function per docs/features/_conventions.md §1), and a `protected get prefersReducedMotion` for anything that autoplays. Add to `BixElement` only once a second component needs the same thing — don't pre-build abstractions for components that don't exist yet.

**Never override `createRenderRoot()` to call `this.attachShadow(...)` directly** — this was a real, shipped bug (found 2026-09-29, via the first Storybook story several `delegatesFocus` components had ever gotten — see the note above on why stories aren't optional): Lit's own `createRenderRoot()` attaches the shadow root *and* adopts `static styles` onto it via `adoptedStyleSheets`; replacing it with a raw `attachShadow()` call attaches the shadow root but silently skips style adoption, so the component renders with zero CSS applied in a real browser (existing DOM/state tests don't catch this — they don't check computed layout). `bx-checkbox`, `bx-switch`, `bx-radio`, `bx-slider`, `bx-rating`, `bx-input` and `bx-comparison` all had this bug for `delegatesFocus`. To customize shadow root options (e.g. `delegatesFocus`), override the **static** `shadowRootOptions` property instead and let the inherited `createRenderRoot()` do the rest:
```ts
static override shadowRootOptions: ShadowRootInit = {
  ...BixElement.shadowRootOptions,
  delegatesFocus: true,
};
```

## Visual language: shadcn-inspired

Default appearance should read like shadcn/ui, not material design: neutral surfaces, a visible but subtle 1px border (`var(--bx-border-subtle)`/`var(--bx-border-base)`) instead of heavy drop shadows or dark scrims, restrained color (semantic role colors only where they carry meaning — status, brand actions — not decoration), consistently `var(--bx-radius-m)` ("rounded-md") rather than pill/fully-round unless the element is genuinely circular (an avatar, a dot), and a crisp `:focus-visible` ring (`outline: var(--bx-border-width-strong) solid var(--bx-focus-ring); outline-offset: var(--bx-focus-ring-offset);`). Prefer ghost/outline-style interactive elements (transparent or near-transparent background, border, a subtle hover fill from `--bx-role-neutral-subtle-hover`) over solid, saturated fills for anything that isn't a primary action.

## Extendability

Components must be easy to reskin without forking them, the way shadcn components are easy to edit because you own the code:

- Every themeable visual surface (background, border color/width, color, radius, shadow, padding, gap, font, size, focus ring — not just size) is its own CSS custom property with a token-backed default (see "Naming" above for the exact pattern). List every one in a `@cssprop` JSDoc block on the class; the feature doc's "CSS parts" and "CSS custom properties" tables are generated from that JSDoc by `pnpm generate` (never hand-edit them).
- Every piece of text uses a design-system text style through `textStyle(hook, '<group>-<size>')` / `textFamily(hook, '<group>')` (`packages/core/src/internal/text-style.ts`, tokens `--bx-type-*`): never loose `--bx-font-*` tokens or literal font values. Pick the style by the kind of text (`label-s` form label, `body-s` hint, `field-m` typed value, `heading-s` dialog title); see Foundations → Typography.
- A public hook is never redeclared inside the shadow tree: size/appearance variants set a private `--_*` property that feeds `var(--bx-<name>-<hook>, var(--_x))`, so the consumer's value always wins. Runtime state written by script (a fill percentage, a position) is a private `--_*` too, not a hook.
- Every meaningful internal element gets a `part="..."` attribute and a matching `@csspart` JSDoc entry, per docs/features/_conventions.md §7 ("Component-level hooks are CSS custom properties and `::part()`; no internal class names are public API").
- Slots are the first extension point for content/icons (see the animated-image `play-icon`/`pause-icon` slots); CSS custom properties and parts are for everything visual on top of that.

## Required Storybook example per component

Every component needs a detailed Storybook story covering, at minimum:

- **All variants/appearances/sizes** defined in its feature doc, shown together (not just the default).
- **All states** — disabled, loading, error/invalid, focus, etc. where applicable.
- **Interactive controls (`argTypes`)** for every public property/attribute so props can be toggled live.
- **Theme + scale toolbar compatibility** — the story must render correctly against the existing theme switcher and `--bx-scale` toolbar controls.
- **A11y and keyboard usage** demonstrated (e.g. a story exercising keyboard navigation for interactive components).
- For data-bearing/virtualized components, a story using a large dataset (see scaling tests below), not just a handful of rows.

## Required tests per component

Every component's test suite must include, at minimum (per the [testing contract](docs/features/_conventions.md#11-testing-contract)):

- **Scaling tests** — verify the component holds up under large data volumes: for data-bearing/virtualized components (`select`, `dropdown`, `tree`, `virtual-tree`, `data-list`, `data-table`), benchmark with realistic large datasets (10k/100k/1M+ items per the component's target range) and assert against regression gates (render time, scroll frame time, memory) per the [performance contract](docs/features/_conventions.md#9-performance-and-reliability-contract). For non-data components, verify behavior under many instances/large content (e.g. long lists of slotted children, many open popovers) where relevant.
- **Theming tests** — verify the component renders correctly across light/dark/auto (`color-scheme`, `light-dark()`), each semantic role (`brand`, `neutral`, `success`, `warning`, `danger`), and forced-colors/high-contrast mode.

Do not mark a component done without both test categories passing.

## Verifying a component locally

```sh
pnpm nx run core:typecheck          # tsc --build, includes design-system's build as a dependency
pnpm nx run core:test               # web-test-runner: Chromium, Firefox, Webkit (tokens.css is loaded into every test page)
TEST_BROWSERS=chromium pnpm nx run core:test   # scope to installed browsers only (see below)
pnpm nx run storybook:typecheck     # also compiles every story
pnpm nx run storybook:build-storybook
pnpm audit:design-system            # raw values, hook naming/shadowing, @cssprop/@csspart drift
pnpm generate                       # CEM + framework wrappers + the feature docs' CSS tables
npx prettier --check .              # run --write to fix
```

If Firefox/WebKit aren't installed (`npx playwright install` needs network access to `playwright.download.prss.microsoft.com` and its mirrors, which some sandboxes block), set `TEST_BROWSERS=chromium` — `packages/core/web-test-runner.config.mjs` reads it and CI still runs the full set. Don't quietly drop a browser from the config to make a local run pass.

After any design-system token change, regenerate before checking a component against it: `pnpm nx run design-system:tokens` (or `pnpm nx run-many -t tokens` to also refresh Storybook's copy).
