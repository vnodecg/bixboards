# Shared conventions

Rules that apply to every component. Individual feature documents only list what is specific to that component.

## 1. Naming and packaging

- Tag prefix `bx-`, CSS custom properties `--bx-*`, events `bx-*` (native events such as `input`/`change` keep their names).
- Packages: `@bixboards/core` (all general components, tokens, virtualizer, utilities), `@bixboards/data-table`, `@bixboards/data-list` (list + virtual tree). Wrappers: `@bixboards/react`, `@bixboards/angular`, `@bixboards/svelte`.
- Every component is importable individually (`@bixboards/core/button`) and side-effect-registers its tag; a `define` variant lets consumers choose the tag name/prefix. Package `sideEffects` is scoped per component so bundlers can tree-shake.

## 2. Fluid sizing (no breakpoints)

A single token drives the system:

```css
:root {
  --bx-scale: 1; /* app-level multiplier */
  --bx-fluid-min: 0.875rem;
  --bx-fluid-max: 1.125rem;
  --bx-fluid-preferred: 0.8125rem + 0.25vi;
  --bx-unit: calc(
    clamp(var(--bx-fluid-min), var(--bx-fluid-preferred), var(--bx-fluid-max)) *
      var(--bx-scale)
  );

  --bx-space-xs: calc(var(--bx-unit) * 0.5);
  --bx-space-m: var(--bx-unit);
  --bx-space-xl: calc(var(--bx-unit) * 2);
  /* full ramps for space, type, radius and control heights: see @bixboards/design-system */
}
```

- `--bx-scale` can be overridden on any element that also carries `class="bx-scale"` (or `data-bx-scale`), because derived tokens resolve where they are declared. A region (e.g. a dense data grid) can then be scaled independently.
- The tokens are generated from JSON by `@bixboards/design-system`.
- Components never hardcode px sizes; hairlines (1 px borders/seams) are the only exception.
- Floors: body text ≥ 16 px equivalent on coarse pointers, touch targets ≥ 44 px, at every scale.
- `--bx-fluid` bounds are themeable (`--bx-fluid-min`, `--bx-fluid-max`, `--bx-fluid-vi-min/max`).

## 3. Container-query reflow

- Layout-bearing components (`card`, `page`, `data-table`, `data-list`, `tab-group`, `carousel`, form fields, `breadcrumb`, `button-group`) set `container-type: inline-size` and reflow with `@container`, never `@media`.
- Thresholds are expressed in `rem` (custom properties such as `--bx-unit` are not allowed inside `@container` conditions, so a `calc(var(--bx-unit) * n)` threshold never matches).
- Components that need a JS measurement (overflow collapse, virtual columns) use the shared `ResizeObserver` pool, never a per-instance observer.

## 4. Virtualization (built in)

`VirtualizerController` (Lit `ReactiveController`, exported from `@bixboards/core`) is the single implementation used by `select`, `dropdown`, `virtual-tree`, `data-list` and `data-table`.

- Fixed or variable item size, both axes, with a prefix-sum index and measured-size correction.
- Scroll anchoring so content above the viewport resizing never moves what the user is looking at.
- Overscan, node pooling/recycling keyed by item key, `scrollToIndex/Key`, sticky items (group headers, pinned rows).
- Emits accessibility metadata (`aria-setsize`, `aria-posinset`, `aria-rowindex`) from data indices, not DOM position.
- Works with `content-visibility` fallback for small lists (< ~200 items) where simple rendering is faster.

**Tall lists.** Browsers cap the height of an element (Firefox near 17.9M px, Chromium near 33.5M), so a 1M-row table at 36px (36M px) cannot be a single spacer. Content taller than `maxScrollSize` (default 16,000,000 px) is compressed: `spacerSize` stays at the cap, scroll position maps to the content offset by the ratio (`scrollOffset` is in content coordinates, not the raw `scrollTop`), and each item carries a `position` (relative to the scrolled window) to place it with. Hosts must size the spacer with `spacerSize` and place items with `item.position`, never `totalSize`/`item.start`. Below the cap `position === start` and nothing changes. When compressed, one scrolled pixel moves several content pixels, so wheel and drag scrolling is coarser than on a short list.

Implementation notes (`packages/core/src/virtualizer`): the controller owns geometry, not DOM. A host calls `setOptions({ count, getScrollElement, itemSize | dynamic, overscan, getItemKey, stickyIndexes, pinnedIndexes, enabled })` from `willUpdate`, renders `controller.items` (each `{ index, key, start, size }`) inside a spacer of `controller.totalSize` using `repeat()` keyed by `item.key`, and — for variable sizes — calls `measureElement(el)` on rendered items (which carry `data-index`). `pinnedIndexes` keeps an element (the focused or `aria-activedescendant` one) in the DOM outside the window; `getAria(index)` yields `aria-setsize`/`aria-posinset`/`aria-rowindex` from data indexes; `scrollToIndex`/`scrollToKey` and `sync()` (re-read geometry when a hidden scroller becomes visible) round it out. Fixed sizes are pure arithmetic; variable sizes use a Fenwick-tree prefix-sum index (O(log n) correction) with an adaptive estimate for unmeasured items. Observer callbacks only schedule renders on the next animation frame, since re-rendering inside a `ResizeObserver` callback triggers "loop completed with undelivered notifications".

## 5. Forms

Form-associated components use `ElementInternals`: `formAssociated`, `setFormValue`, `setValidity`, `formResetCallback`, `formStateRestoreCallback`, `formDisabledCallback`. Constraint validation API matches native controls.

## 6. Events

- Names are `bx-*`, `bubbles: true, composed: true` unless stated. Cancelable "before" events (`bx-show`, `bx-hide`) precede "after" events.
- `detail` payloads are typed and documented in the custom-elements manifest.

## 7. Theming

- Light/dark/auto via `color-scheme` and `light-dark()`; semantic roles (`brand`, `neutral`, `tertiary`, `warning`, `danger`) map to token ramps.
- Forced-colors and high-contrast supported through system colors.
- Component-level hooks are CSS custom properties and `::part()`; no internal class names are public API.
- Every themeable surface of every component is a documented `--bx-<component>-*` hook with a token-backed default, never shadowed inside the shadow tree. Naming, vocabulary and enforcement: [Styling API](../design-system/component-guidelines.md#styling-api-component-hooks).

## 8. Framework wrappers

Generated from the Custom Elements Manifest (CEM) so wrappers cannot drift from the elements:

- **React**: property (not attribute) binding for objects/arrays, event props (`onBxSelect`), `ref` forwarding, typed slots; works with React 18/19 and server components (client boundary only for interactive parts).
- **Angular**: standalone components/directives, `@Input/@Output`, `ControlValueAccessor` for form-associated elements, `CUSTOM_ELEMENTS_SCHEMA` not required.
- **Svelte**: Svelte 5, typed props and callback events, `bind:` for form values, snippets for templates.
- Renderer callbacks (data-table cells, list items) use adapter-managed roots (React portals/roots, Angular `EmbeddedViewRef`, Svelte `mount`) that are pooled with the recycled DOM nodes.

## 9. Performance and reliability contract

- No component work at import time beyond `customElements.define`.
- Shared constructable stylesheets, shared observers, cached `Intl` formatters.
- No layout thrash: read/write phases separated; scroll handlers are passive and rAF-coalesced.
- No memory leaks: every listener/observer/timer is released on disconnect; verified by leak tests.
- Errors are isolated: a failing renderer, data source or icon load never breaks sibling components.
- SSR-safe: import and first render do not touch `window`/`document` unguarded.

## 10. Accessibility contract

WCAG 2.2 AA minimum; ARIA Authoring Practices patterns for widgets; reduced motion; forced colors; RTL and logical properties throughout; i18n strings overridable via a localization registry.

## 11. Testing contract

Unit/component tests in real browsers (Chromium, Firefox, WebKit), axe-core, visual regression across scale × container width × theme, keyboard walkthroughs, wrapper smoke tests, and for data components benchmark suites with regression gates.

## 12. Apple Human Interface Guidelines alignment

WCAG 2.2 AA (§10) is the accessibility floor for every platform; this section is the delta that makes the system also feel native and correct on Apple platforms (Safari/iOS/iPadOS/macOS, and installed web apps). It is a checklist for what a component must already satisfy, not a separate visual style — no component should look "Apple-themed" by default.

**Already satisfied by the tokens/conventions above, called out explicitly so it isn't lost in a rewrite:**

- **Tap targets**: `--bx-target-min` is 2.75rem (44px) under `pointer: coarse` (§2), exactly [HIG's minimum hit target](https://developer.apple.com/design/human-interface-guidelines/layout).
- **Dark mode**: `light-dark()` / `prefers-color-scheme` (§7) — HIG requires both appearances to be considered, not just supported.
- **Reduced motion**: every autoplaying/looping animation checks `prefers-reduced-motion` (§9, `BixElement.prefersReducedMotion`) — maps to iOS's Reduce Motion setting.
- **Dynamic Type**: sizing is `rem`/fluid-unit based, never fixed `px` for type (§2) — the nearest web equivalent of Dynamic Type is "respects the browser/OS base font size and zoom," which a `rem` root satisfies; a hardcoded `px` font-size would not.
- **Legible contrast**: WCAG 4.5:1 text contrast (`@bixboards/design-system` role guarantees) meets or exceeds anything HIG asks for.
- **System font**: `--bx-font-family-sans` leads with `system-ui, -apple-system`, i.e. San Francisco on Apple platforms, not a hardcoded web font.

**Gaps this section closes:**

- **Safe areas**: `--bx-safe-area-inset-{top,right,bottom,left}` (`@bixboards/design-system`, wrapping `env(safe-area-inset-*, 0px)`) exist so edge-to-edge components (a future `page`, `dialog`, `sheet`, `toast`) can keep content clear of the notch/Dynamic Island/home indicator, per [HIG's layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout#Platform-considerations). Pad with `max(<space token>, var(--bx-safe-area-inset-*))`, never the inset alone, so the design spacing is a floor. See `@bixboards/design-system` README "Safe areas".

**Explicitly out of scope** (native-platform behavior a web component cannot reproduce, and should not fake):

- SF Symbols — components use plain SVG (currently vendored Phosphor paths); an app targeting only Apple platforms may swap icon slots for SF Symbols itself, but the library does not ship or require them.
- Haptics, native share sheets, system gesture navigation, spring-based physical motion tied to touch velocity — these require native APIs with no DOM equivalent.
- Continuous corner ("squircle") curvature — CSS has no shipped, interoperable primitive for it (the `corner-shape` proposal is not yet stable across browsers); components use ordinary circular `border-radius` and a theme may only approximate the Apple look, not reproduce it exactly.
