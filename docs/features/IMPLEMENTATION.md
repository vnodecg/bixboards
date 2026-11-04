# Implementation checklist

Tracks build status for all 90 components across `@bixboards/core`, `@bixboards/data-table` and `@bixboards/data-list` (see [README](README.md) for the spec index, [_conventions.md](_conventions.md) for shared rules). Ordered into dependency tiers — build each tier before the ones that depend on it. Within a tier, order is arbitrary.

**Progress: 87 / 90 done.**

Legend: `[x]` implemented and tested, `[ ]` not started. "Depends on" lists hard dependencies (the component composes or requires the other) and, in parentheses, soft ones (shared pattern/reuse, not a hard blocker).

## Accessibility gate (applies to every component)

Do not check a component off in this list until its own spec's **§6 Accessibility** and **§9 Acceptance criteria** a11y rows are satisfied, on top of the [_conventions.md](_conventions.md) §10 contract:

1. **Correct ARIA pattern** — the role/state/property combination the spec's §6 names (e.g. `select` → combobox pattern; `tree` → `role="tree"`/`treeitem`/`aria-level`; `slider` → `role="slider"` + `aria-valuetext`; `tab-group` → tabs pattern with roving tabindex). Look it up in the ARIA Authoring Practices Guide when the spec's one-line summary isn't enough to implement correctly.
2. **Keyboard operability** — every interactive part reachable and operable without a mouse, visible focus indicator, no keyboard trap. If a component genuinely has no interactive parts of its own (e.g. a pure wrapper like `bx-animation`), say so explicitly in §9 rather than leaving the box unchecked with no explanation.
3. **`prefers-reduced-motion` and forced-colors** — required for anything that animates or relies on non-system color.
4. **axe-core: zero violations** — asserted in the component's own test file (`chai-a11y-axe` / `@open-wc/testing`'s `to.be.accessible()`), across every meaningful state (idle, error, expanded/collapsed, selected, disabled), not just the default render.
5. **Manual screen-reader pass** (NVDA/VoiceOver) — documented in the PR/test plan; automated axe checks alone do not catch announcement quality or reading order.
6. **200% zoom / text-spacing override** — no lost content or functionality.

When a box in a spec's §9 is left unchecked because required tooling doesn't exist yet (visual regression, size-limit, framework wrappers), say so inline instead of leaving it silent — see [animated-image.md](core/animated-image.md) and [animation.md](core/animation.md) for the pattern. That keeps "not accessible" and "accessible but untooled" distinguishable at a glance.

## Tier 0 — Foundation (done)

Not components themselves, but required by everything below.

- [x] `BixElement` base class — [bix-element.ts](../../packages/core/src/bix-element.ts)
- [x] Shared observer pools (`IntersectionObserver`, etc.) — [internal/shared-observers.ts](../../packages/core/src/internal/shared-observers.ts)
- [x] Design-system tokens (`@bixboards/design-system`)

## Tier 1 — Standalone primitives

No dependency on any other unbuilt `bx-*` component.

### `@bixboards/core`

- [x] [`bx-animated-image`](core/animated-image.md) — `packages/core/src/animated-image`
- [x] [`bx-animation`](core/animation.md) — `packages/core/src/animation`
- [x] [`bx-icon`](core/icon.md) — `packages/core/src/icon`
- [x] [`bx-divider`](core/divider.md) — `packages/core/src/divider`
- [x] [`bx-badge`](core/badge.md) — `packages/core/src/badge`
- [x] [`bx-avatar`](core/avatar.md) (covers avatar-group layout itself, FR-AVATAR-02) — `packages/core/src/avatar`
- [x] [`bx-progress-bar`](core/progress-bar.md) — `packages/core/src/progress-bar`
- [x] [`bx-progress-ring`](core/progress-ring.md) — `packages/core/src/progress-ring`
- [x] [`bx-skeleton`](core/skeleton.md) — `packages/core/src/skeleton`
- [x] [`bx-spinner`](core/spinner.md) — `packages/core/src/spinner`
- [x] [`bx-callout`](core/callout.md) — `packages/core/src/callout`
- [x] [`bx-card`](core/card.md) — `packages/core/src/card`
- [x] [`bx-scroller`](core/scroller.md) — `packages/core/src/scroller`; edge shadows use the JS scroll-listener fallback path only, not the scroll-driven-animation alternative (noted in the component's own doc comment)
- [x] [`bx-details`](core/details.md) (accordion grouping via `name` attribute is peer coordination, no child component needed) — `packages/core/src/details`
- [x] [`bx-dialog`](core/dialog.md) (built on native `<dialog>`) — `packages/core/src/dialog`
- [x] [`bx-input`](core/input.md) — `packages/core/src/input`
- [x] [`bx-checkbox`](core/checkbox.md) (lite render path for `bx-data-table` selection deferred until that package exists) — `packages/core/src/checkbox`
- [x] [`bx-switch`](core/switch.md) — `packages/core/src/switch`
- [x] [`bx-radio`](core/radio.md) (self-coordinates mutual exclusion + roving tabindex by `name` until `bx-radio-group` exists, same peer-group pattern as `bx-details`) — `packages/core/src/radio`
- [x] [`bx-slider`](core/slider.md) (single and range modes; range submits as a `${name}-min`/`${name}-max` `FormData` pair) — `packages/core/src/slider`
- [x] [`bx-rating`](core/rating.md) (hover preview and RTL fill are one `clip-path` overlay, not per-symbol state) — `packages/core/src/rating`
- [x] [`bx-zoomable-frame`](core/zoomable-frame.md) (sandbox defaults to `""`, the most restrictive value; controls collapse into a menu button under `@container`) — `packages/core/src/zoomable-frame`
- [x] [`bx-comparison`](core/comparison.md) — `packages/core/src/comparison`
- [x] [`bx-popup`](core/popup.md) (JS Floating-UI-style computation path only, no native CSS Anchor Positioning fast path yet — noted in the component's own doc comment) — `packages/core/src/popup`
- [x] [`bx-breadcrumb-item`](core/breadcrumb-item.md) (adds a `current` boolean, not in the spec's own properties table, so the not-yet-built `bx-breadcrumb` parent has a way to mark the last crumb per §6's "aria-current on last" — see the component's own doc comment) — `packages/core/src/breadcrumb-item`
- [x] [`bx-carousel-item`](core/carousel-item.md) — `packages/core/src/carousel-item`
- [x] [`bx-dropdown-item`](core/dropdown-item.md) (checkmark-gutter reservation is a peer-group pattern keyed by parent element, same as `bx-details`'/`bx-radio`'s groups — see the component's own doc comment) — `packages/core/src/dropdown-item`
- [x] [`bx-tab`](core/tab.md) (adds a `close-button` CSS part for `closable`, not in the spec's own CSS parts table, same precedent as `bx-badge`'s `remove-button`) — `packages/core/src/tab`
- [x] [`bx-tab-panel`](core/tab-panel.md) — `packages/core/src/tab-panel`
- [x] [`bx-tree-item`](core/tree-item.md) (adds a `children` slot, plus `loading`/`lazy-error`/`with-checkbox`, none in the spec's own tables — see the component's own doc comment for the lazy-load event contract) — `packages/core/src/tree-item`
- [x] [`bx-option`](core/option.md) (state owned by parent per FR-OPTION-01: no listeners of its own — see the component's own doc comment) — `packages/core/src/option`
- [x] [`bx-format-bytes`](core/format-bytes.md) — `packages/core/src/format-bytes`
- [x] [`bx-format-date`](core/format-date.md) — `packages/core/src/format-date`
- [x] [`bx-format-number`](core/format-number.md) (renders in light DOM, no shadow root, per FR-FORMAT-NUMBER-02 — see the component's own doc comment) — `packages/core/src/format-number`
- [x] [`bx-relative-time`](core/relative-time.md) (self-timer per instance by default; `sync` opts into a shared page-wide ticker that also pauses on tab-hidden — see the component's own doc comment) — `packages/core/src/relative-time`
- [x] [`bx-include`](core/include.md) (sanitizes `<script>`/`on*`/`javascript:` URIs by default; `allow-scripts` re-creates `<script>` elements so they actually execute — see the component's own doc comment) — `packages/core/src/include`
- [x] [`bx-intersection-observer`](core/intersection-observer.md) (observes the host itself via the shared pool; toggles `intersect-class` on the host) — `packages/core/src/intersection-observer`
- [x] [`bx-mutation-observer`](core/mutation-observer.md) (observes the host's light-DOM subtree; relies on native per-microtask batching for FR-MUTATION-OBSERVER-01) — `packages/core/src/mutation-observer`
- [x] [`bx-resize-observer`](core/resize-observer.md) (wraps the shared `ResizeObserver`; coalesces delivery to one rAF per instance) — `packages/core/src/resize-observer`

## Tier 2 — Simple composites

Depend only on Tier 1 components.

- [x] [`bx-button`](core/button.md) (spec's own header/FR-01 disagree on form-association — resolved by finding the form and calling `requestSubmit()`/`reset()` directly rather than `FormAssociatedMixin`, see the component's own doc comment; `disabled` never becomes the inner control's native `disabled` attribute, per FR-BUTTON-06) — depends on `bx-spinner` (loading state) — `packages/core/src/button`
- [x] [`bx-tooltip`](core/tooltip.md) (§6 "anchor gets aria-describedby" is unimplemented — verified that this package's pinned Chromium doesn't resolve a light-DOM-to-shadow-internal `ariaDescribedByElements` reference, the reverse direction of the one `bx-tab-group` relies on, see the component's own doc comment; fixed a latent `bx-popup` bug along the way — `arrow` + `active` together looped forever re-triggering `updated()`, only ever exercised once a real consumer combined them) — depends on `bx-popup` — `packages/core/src/tooltip`
- [x] [`bx-radio-group`](core/radio-group.md) (owns form participation for its members; `bx-radio` skips its own `setFormValue` when nested inside one — see that component's own doc comment; Home/End live here, arrow keys stay peer-to-peer in `bx-radio`) — depends on `bx-radio` — `packages/core/src/radio-group`
- [x] [`bx-tab-group`](core/tab-group.md) (FR-TAB-GROUP-02 "lazy" deferred — no `<template>`-based content model to defer into yet, see the component's own doc comment; `bx-tab`/`bx-tab-panel` gained `tab-stop`/`controlsElement`/`tabElement` and `ariaLabelledByElements` wiring respectively so `aria-controls`/`aria-labelledby` can cross their separate shadow roots) — depends on `bx-tab`, `bx-tab-panel` — `packages/core/src/tab-group`
- [x] [`bx-breadcrumb`](core/breadcrumb.md) (FR-BREADCRUMB-01's "ellipsis dropdown" is an inline expand, not a floating popover menu — `bx-dropdown` is Tier 4/`VirtualizerController`-gated, see the component's own doc comment; `bx-breadcrumb-item` gained a `:host([hidden])` rule so collapse can actually hide items) — depends on `bx-breadcrumb-item` — `packages/core/src/breadcrumb`
- [x] [`bx-carousel`](core/carousel.md) — depends on `bx-carousel-item` — `packages/core/src/carousel`
- [x] [`bx-tree`](core/tree.md) (checkbox-tree tri-state deviates from APG's own pattern — `bx-tree-item` keeps its real nested checkbox rather than moving to `aria-checked`-only on the treeitem, see the component's own doc comment; `bx-tree-item` gained `indeterminate` and a `roving` tab-stop-suppression property, mirroring `bx-tab`'s `tab-stop`) — depends on `bx-tree-item` — `packages/core/src/tree`
- [x] [`bx-number-input`](core/number-input.md) (shares patterns with `bx-input`; native control is `type="text" inputmode="decimal"`, not `type="number"`, so it can show a locale-formatted display string while editing shows the raw parseable one, see the component's own doc comment) — `packages/core/src/number-input`
- [x] [`bx-textarea`](core/textarea.md) (shares patterns with `bx-input`; `resize="auto"` prefers `field-sizing: content`, falling back to an rAF-batched `scrollHeight` measurement only when unsupported) — `packages/core/src/textarea`
- [x] [`bx-color-picker`](core/color-picker.md) (canonical internal state is HSV + alpha, not the `format`-displayed string — every representation is a pure derivation per FR-COLOR-PICKER-06, see the component's own doc comment; non-`inline` mode's trigger→panel uses `bx-popup`, the same primitive `bx-tooltip` builds on) — depends on `bx-popup` — `packages/core/src/color-picker`

## Tier 3 — Higher composites

Depend on Tier 2 components.

- [x] [`bx-popover`](core/popover.md) (`bx-popup` positioning only, no native Popover API path; adds `label` and an `anchor` slot; `sheet-narrow` not implemented; the anchor gets `aria-expanded`/`aria-haspopup` but not `aria-controls` — see the component's own doc comment) — depends on `bx-popup` — `packages/core/src/popover`
- [x] [`bx-drawer`](core/drawer.md) (native `<dialog>`, parallel to `bx-dialog` rather than a shared base; `contained` opens non-modally and needs a positioned parent; close control is a `bx-button` + `bx-icon`) — (shares dialog semantics/focus-trap with `bx-dialog`) — `packages/core/src/drawer`
- [x] [`bx-copy-button`](core/copy-button.md) (composes `bx-button` + `bx-tooltip` + `bx-icon`; adds `variant`/`appearance`/`size` passthrough; success/error color props renamed `--bx-copy-button-*`; `execCommand` fallback untested) — depends on `bx-tooltip`, `bx-icon` — `packages/core/src/copy-button`
- [x] [`bx-button-group`](core/button-group.md) (corners shaped via `bx-button`'s new `--bx-button-radius`, inherited into wrappers like `bx-copy-button`/`bx-tooltip`; `overflow="menu"`, `stack-narrow` and `toolbar` not implemented) — depends on `bx-button` — `packages/core/src/button-group`

## Tier 4 — Virtualization infra + virtualized pickers

- [x] `VirtualizerController` (shared `ReactiveController`, `@bixboards/core`; fixed sizes are arithmetic, variable sizes use a Fenwick-tree prefix-sum index with measured-size correction, scroll anchoring, overscan, pinned and sticky indexes, `scrollToIndex/Key`, `aria-setsize`/`posinset`/`rowindex` from data indexes; `enabled: false` returns every item for the small-list fallback, and the consumer pairs it with `content-visibility`; horizontal/RTL axis is implemented but only the vertical axis is exercised by tests so far; observer callbacks defer renders to the next animation frame to avoid "ResizeObserver loop" errors) — infra, not a tag; required by `bx-select`, `bx-dropdown`, `bx-virtual-tree`, `bx-data-list`, `bx-data-table` (conventions §4) — `packages/core/src/virtualizer`
- [x] [`bx-select`](core/select.md) (focus stays on a native `<input role="combobox">`, highlighted option via `aria-activedescendant` set through element reflection, so `bx-option` now carries `role="option"` on its host; slotted options are only a data source once the list is windowed, so their `start`/`end` slots are not shown then; FR-SELECT-04's off-thread index is not implemented — main-thread, lazily built search keys; adds `readonly`/`open`, `value` is `string[]` when `multiple`; `bx-search` only when `remote`; group headers are visual rows, not `role="group"` — see the component's own doc comment) — depends on `bx-popup`, `bx-option`, `VirtualizerController` — `packages/core/src/select`
- [x] [`bx-dropdown`](core/dropdown.md) (virtual mode (FR-DROPDOWN-05) applies to the new `items` data array only — slotted items are the consumer's elements and cannot be windowed; `sheet-narrow` not implemented; `bx-dropdown-item` gained working submenus with safe-triangle hover, `type="radio"`, `focus()`, and its host dropped `container-type` because it broke fixed-position descendants; breadcrumb's ellipsis menu is still an inline expand, not wired to this — see the component's own doc comment) — depends on `bx-popup`, `bx-dropdown-item`, `VirtualizerController` (FR-DROPDOWN-01/05) — `packages/core/src/dropdown`

## Tier 5 — Application shell

- [x] [`bx-page`](core/page.md) (view is derived from the page element's own measured width and reflected as `view`, since a container query can't take a configurable threshold; in mobile the navigation is an in-page off-canvas drawer — absolutely positioned, not a top-layer `<dialog>`, so it stays inside an embedding container — and focus is contained via `inert` on everything else rather than a Tab trap; the navigation body scrolls in a `bx-scroller`, whose vertical mode was fixed to honor a host height constraint; `--bx-page-main-width` only caps the main column's max size; `sheet-narrow` n/a — see the component's own doc comment) — (shares pattern with `bx-drawer`); uses `bx-scroller` — `packages/core/src/page`

## Tier 6 — Data packages

Depend on `VirtualizerController` (Tier 4).

- [x] [`bx-virtual-tree`](data-list/virtual-tree.md) (`@bixboards/data-list`; indexed once into pre-order arrays so collapsed subtrees are skipped and branch tri-state is two integers; filtering is a main-thread linear pass, not a Worker; tree-_table_ mode and the `expand-icon`/`collapse-icon` slots not implemented, the `node` slot is the `renderNode` property — see the component's own doc comment) — depends on `VirtualizerController`; data-driven counterpart of `bx-tree` — `packages/data-list/src/virtual-tree`
- [x] [`bx-data-list`](data-list/data-list.md) (`@bixboards/data-list`; `layout="masonry"` renders as `grid`, since column packing needs per-column virtualization the shared virtualizer lacks; `item`/`group-header` slots are the `renderItem`/`renderGroupHeader` properties; focus stays on the viewport with `aria-activedescendant` — see the component's own doc comment) — depends on `VirtualizerController` — `packages/data-list/src/data-list`
- [x] [`bx-data-table`](data-table/data-table.md) (`@bixboards/data-table`; sort/filter/group run on the main thread over typed-array index arrays, no Worker, so FR-DATA-TABLE-04's Worker path is not implemented; tree-data mode, column show/hide menu, drag-to-pin UI and toolbar overflow menu not implemented; `row-detail` is the `renderDetail` property; the built-in editors are native `<input>`/`<select>`, and `bx-input`/`bx-select` are used by passing a function `editor` — see the component's own doc comment) — depends on `VirtualizerController` — `packages/data-table/src/data-table`

## Tier 7 — Proposed additions (BoardUI gap)

Not started. Each depends only on components in earlier tiers or on others in this tier as noted.

### Actions

- [x] [`bx-icon-button`](core/icon-button.md) (composes `bx-button`; `primary` maps to bx-button's `default` variant) — depends on button, icon, spinner — `packages/core/src/icon-button`
- [x] [`bx-close-button`](core/close-button.md) (specialisation of `bx-icon-button`; Escape handling stays in the owning overlay. Existing ad-hoc close buttons in dialog/drawer/callout are not migrated yet) — depends on icon-button — `packages/core/src/close-button`
- [x] [`bx-social-button`](core/social-button.md) (no brand artwork is bundled; apps register marks via `registerSocialProvider`, unregistered providers fall back to a letter monogram) — depends on button, icon — `packages/core/src/social-button`
- [x] [`bx-toggle-button`](core/toggle-button.md) (native `<button aria-pressed>` with a check glyph when pressed; `bx-button-group` selection modes (FR-TOGGLEBUTTON-02) not implemented since the group has no selection mode) — depends on button, button-group, soft — `packages/core/src/toggle-button`

### Form

- [x] [`bx-combobox`](core/combobox.md) (not virtualized (every option is a real element; fine up to a few hundred); `bx-select`'s virtualizer is not shared; async mode = debounced `input` event + `loading`, stale-response handling is the consumer's) — depends on select, option, popup, input, virtualizer — `packages/core/src/combobox`
- [x] [`bx-input-otp`](core/input-otp.md) (one transparent real `<input>` over presentational cells, so caret/paste/autofill are native; adds `name`, not in the spec's property table) — depends on input — `packages/core/src/input-otp`
- [x] [`bx-file-upload`](core/file-upload.md) (`directory` sets `webkitdirectory`; the per-file `file` slot template is not implemented; adds `name`) — depends on button, progress-bar, format-bytes, icon — `packages/core/src/file-upload`
- [x] [`bx-search-field`](core/search-field.md) (composes `bx-input type=search`; the `suggestions` slot (FR-SEARCHFIELD-02) is not implemented, use `bx-combobox`) — depends on input, combobox, soft — `packages/core/src/search-field`
- [x] [`bx-segmented-control`](core/segmented-control.md) (adds `bx-segment` (`packages/core/src/segment`); the radiogroup/radio roles live on the hosts; indicator animates `transform` for position and `inline-size` for width) — depends on radio-group, resize-observer — `packages/core/src/segmented-control`
- [x] [`bx-calendar`](core/calendar.md) (plain-ISO date helpers in `dates.ts`; the `day` slot is not implemented; `value` is always a string (`start/end` for range, comma-separated for multiple)) — depends on button — `packages/core/src/calendar`
- [x] [`bx-date-picker`](core/date-picker.md) (typed entry parses ISO or the locale's numeric day/month/year order only (no month names); popup is a non-modal `bx-popup`; exports `parseTypedDate`) — depends on calendar, popup, input — `packages/core/src/date-picker`
- [x] [`bx-time-field`](core/time-field.md) (standalone segmented field (no calendar/popup, so not built on `bx-date-picker`); `value` is always 24-hour `HH:mm[:ss]`; exports `parseTime`/`localeIs12h`) — depends on date-picker, soft — `packages/core/src/time-field`
- [x] [`bx-tag-input`](core/tag-input.md) (typed text is the native input inside the control, not `bx-input`; `add()`/`remove()` are public) — depends on chip, input — `packages/core/src/tag-input`

### Feedback

- [x] [`bx-chip`](core/chip.md) (`bx-chip-group` (optional, FR-CHIP-01) not implemented; adds `clickable` and `remove-label`, not in the spec's property table) — depends on close-button, badge, soft — `packages/core/src/chip`
- [x] [`bx-meter`](core/meter.md) (own `role=meter` track (not native `<meter>`); band logic is exported as `meterBand`) — depends on progress-bar, soft — `packages/core/src/meter`
- [x] [`bx-toast`](core/toast.md) (adds `bx-toast-region` (`packages/core/src/toast-region`); `BxToast.toast()` is async (lazy-imports the region); the region is not itself an `aria-live` region, each toast carries `role=status|alert`) — depends on callout, close-button, popup — `packages/core/src/toast`
- [x] [`bx-notification-center`](core/notification-center.md) (plain `bx-popup` panel (a CSS sheet on narrow screens, not `bx-drawer`/`bx-popover`); not built on `bx-data-list`; the `item` slot template is not implemented; controlled via cancelable events but also applies changes locally) — depends on popover, drawer, badge, relative-time, data-list, icon-button — `packages/core/src/notification-center`
- [x] [`bx-empty-state`](core/empty-state.md) (not yet wired into `bx-data-table`/`bx-data-list`; default copy is English in `emptyStateCopy`) — depends on icon, button — `packages/core/src/empty-state`
- [x] [`bx-stepper`](core/stepper.md) (adds a `bx-step` child (`packages/core/src/step`); `error`/`skipped` are set on the step, the rest derived from `current`; does not build on `bx-tab-group`) — depends on tab-group, soft — `packages/core/src/stepper`

### Navigation

- [x] [`bx-pagination`](core/pagination.md) (page-size selector is a native `<select>`, not `bx-select`; exports the pure `pageRange`) — depends on button, select, data-table, soft — `packages/core/src/pagination`
- [x] [`bx-sidebar`](core/sidebar.md) (adds `bx-sidebar-item`/`bx-sidebar-group`; collapsed parents expand the sidebar instead of showing a flyout; overlay mode is standalone (`matchMedia` under 48rem, or `mode`), not wired to `bx-page`'s drawer; focus loop is a Tab handler, not `bx-drawer`'s dialog) — depends on page, drawer, tooltip, badge, icon — `packages/core/src/sidebar`
- [x] [`bx-command-palette`](core/command-palette.md) (native `<dialog>`, not `bx-dialog`; own listbox (not `bx-combobox`); renders at most 200 results, no virtualization yet; exports `fuzzyScore`) — depends on dialog, combobox, kbd, virtualizer — `packages/core/src/command-palette`
- [x] [`bx-context-menu`](core/context-menu.md) (composes `bx-dropdown` with a zero-size virtual trigger at the pointer) — depends on dropdown, dropdown-item, popup — `packages/core/src/context-menu`

### Display

- [x] [`bx-stat-card`](core/stat-card.md) (composes `bx-card`; formats with the shared `Intl.NumberFormat` cache instead of a nested `bx-format-number`; `count-up` is opt-in, not implicit) — depends on card, format-number, skeleton, sparkline, soft — `packages/core/src/stat-card`
- [x] [`bx-kbd`](core/kbd.md) (key names are English; the localization registry the spec mentions does not exist yet) — `packages/core/src/kbd`
- [x] [`bx-timeline`](core/timeline.md) (adds a `bx-timeline-item` child (`packages/core/src/timeline-item`, no spec of its own); horizontal orientation is basic and has no alternate layout; items are all rendered, long timelines should compose `bx-data-list`) — depends on relative-time, format-date, icon — `packages/core/src/timeline`
- [x] [`bx-code-block`](core/code-block.md) (token-based highlighter API (`registerHighlighter` returns `CodeToken[]`, not HTML, so output is injection-safe); no grammars bundled; scrolls in its own `<pre>` rather than `bx-scroller`) — depends on copy-button, scroller — `packages/core/src/code-block`

### Charts

- [ ] [`bx-chart`](core/chart.md) (depends on skeleton, resize-observer, intersection-observer)
- [x] [`bx-sparkline`](core/sparkline.md) (exports `decimate`; `trend-is-good` has no default (the spec's `up` would colour every sparkline); highlight is a zero-length round-capped stroke so it stays circular under non-uniform scaling) — `packages/core/src/sparkline`

## Framework wrappers (after the above)

Not per-component tasks — generated once from the Custom Elements Manifest, per conventions §8:

- [ ] `@bixboards/react`
- [ ] `@bixboards/angular`
- [ ] `@bixboards/svelte`
