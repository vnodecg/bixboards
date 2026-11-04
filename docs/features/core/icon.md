# `<bx-icon>`

> Icon from a registered library or URL, inlined SVG.

|                     |                   |
| ------------------- | ----------------- |
| **Package**         | `@bixboards/core` |
| **Category**        | Imagery           |
| **Tag**             | `bx-icon`         |
| **Status**          | Implemented       |
| **Form-associated** | No                |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Icon from a registered library or URL, inlined SVG. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes.

## 2. API

### Properties / attributes

| Name      | Type   | Default   | Description |
| --------- | ------ | --------- | ----------- |
| `name`    | string | ""        | -           |
| `family`  | string | "default" | -           |
| `variant` | string | ""        | -           |
| `src`     | string | ""        | -           |
| `label`   | string | ""        | -           |
| `library` | string | "default" | -           |

### Slots

_None._

### Events

| Event      | Detail / notes |
| ---------- | -------------- |
| `bx-load`  | -              |
| `bx-error` | -              |

### CSS parts

| Part  | Description                             |
| ----- | --------------------------------------- |
| `svg` | The wrapper around the inlined `<svg>`. |

### CSS custom properties

| Property                     | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `--bx-icon-size`             | Width/height. Default `1em`, so the icon follows fluid type. |
| `--bx-icon-fallback-opacity` | Opacity of the `fallback` element. Default `0.6`.            |

### Methods

_None._

## 3. Functional requirements

- **FR-ICON-01** Icon libraries registered via `registerIconLibrary(name, {resolver, mutator})`.
- **FR-ICON-02** Fetch is cached and de-duplicated; sanitised (script/foreignObject stripped).
- **FR-ICON-03** Tree-shakable bundled default set so no network is needed offline.

## 4. Fluid scaling

`1em` by default so icons follow fluid type.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

None.

## 6. Accessibility

- Decorative (`aria-hidden`) unless `label` is set (`role="img"`).
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

- [x] All FR-ICON-* requirements covered by unit/component tests (Web Test Runner, real browsers: Chromium; Firefox/WebKit run in CI). See `packages/core/src/icon/icon.test.ts`.
- [ ] Visual regression snapshots at scale 0.85 / 1 / 1.25 and container widths 240 / 480 / 960 px, light + dark. No visual-regression harness exists yet in the workspace.
- [x] axe-core: zero violations (decorative and labelled), asserted in the test suite via `chai-a11y-axe`.
- [ ] Manual screen-reader pass (NVDA/VoiceOver) documented.
- [ ] Keyboard-only walkthrough recorded in the test plan. Not applicable: the icon has no interactive state of its own.
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events. Wrapper packages do not exist yet.
- [ ] Size budget check (`size-limit`) passes. No size-limit tooling configured yet.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Implemented in `@bixboards/core` (`src/icon/`). `registerIconLibrary(name, {resolver, mutator})` lives in `src/icon/registry.ts`; a resolver returns either raw SVG markup (used as-is — no network, this is how the bundled `default` library in `src/icon/default-library.ts` stays offline-safe) or a URL/data URI, which is fetched. Every result, and every `src` fetch, is sanitised (`<script>`/`<foreignObject>` stripped via `DOMParser`) and cached/de-duplicated by `library::family::variant::name` (or `src::<url>`) across every `<bx-icon>` instance on the page.
- The bundled `default` library ships a small set (`check`, `close`, `copy`, four `chevron-*`, `info`, `warning`) vendored from Phosphor Icons (regular weight, MIT) as path strings, matching the vendoring approach already used for `bx-animated-image`'s play/pause glyphs.
- **Any SVG source works.** The bundled set is only a small offline default; `<bx-icon>` is pack-agnostic. Register a library (Lucide, Heroicons, Feather, Material, your own sprite folder) or pass `src`:
  ```js
  registerIconLibrary('lucide', {
    resolver: (name) =>
      `https://unpkg.com/lucide-static@0.469.0/icons/${name}.svg`,
  });
  // <bx-icon library="lucide" name="settings"></bx-icon>
  // <bx-icon src="/assets/logo.svg"></bx-icon>  (URLs and data: URIs)
  ```
  Paint is inherited, not forced: `fill: currentColor` is set on the wrapper, so glyph packs (Phosphor, Material) with no paint attributes take the text colour, while stroke packs that set `fill="none" stroke="currentColor"` on the root (Lucide, Feather, Heroicons outline) keep it. A missing `viewBox` is derived from `width`/`height` so the icon scales with `--bx-icon-size`. Sanitisation also strips `on*` attributes and `javascript:` hrefs.
- Open: confirm final property names against the custom-elements manifest once the CEM generation pipeline exists.
