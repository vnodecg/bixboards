# Implementation checklist

Tracks build status for all 61 components across `@bixant/core`, `@bixant/data-table` and `@bixant/data-list` (see [README](README.md) for the spec index, [_conventions.md](_conventions.md) for shared rules). Ordered into dependency tiers — build each tier before the ones that depend on it. Within a tier, order is arbitrary.

**Progress: 2 / 61 done.**

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
- [x] Design-system tokens (`@bixant/design-system`)

## Tier 1 — Standalone primitives

No dependency on any other unbuilt `bx-*` component.

### `@bixant/core`

- [x] [`bx-animated-image`](core/animated-image.md) — `packages/core/src/animated-image`
- [x] [`bx-animation`](core/animation.md) — `packages/core/src/animation`
- [ ] [`bx-icon`](core/icon.md)
- [ ] [`bx-divider`](core/divider.md)
- [ ] [`bx-badge`](core/badge.md)
- [ ] [`bx-avatar`](core/avatar.md) (covers avatar-group layout itself, FR-AVATAR-02)
- [ ] [`bx-progress-bar`](core/progress-bar.md)
- [ ] [`bx-progress-ring`](core/progress-ring.md)
- [ ] [`bx-skeleton`](core/skeleton.md)
- [ ] [`bx-spinner`](core/spinner.md)
- [ ] [`bx-callout`](core/callout.md)
- [ ] [`bx-card`](core/card.md)
- [ ] [`bx-scroller`](core/scroller.md)
- [ ] [`bx-details`](core/details.md) (accordion grouping via `name` attribute is peer coordination, no child component needed)
- [ ] [`bx-dialog`](core/dialog.md) (built on native `<dialog>`)
- [ ] [`bx-input`](core/input.md)
- [ ] [`bx-checkbox`](core/checkbox.md)
- [ ] [`bx-switch`](core/switch.md)
- [ ] [`bx-radio`](core/radio.md) (works standalone; grouped by `bx-radio-group` in Tier 2)
- [ ] [`bx-slider`](core/slider.md)
- [ ] [`bx-rating`](core/rating.md)
- [ ] [`bx-zoomable-frame`](core/zoomable-frame.md)
- [ ] [`bx-comparison`](core/comparison.md)
- [ ] [`bx-popup`](core/popup.md) — positioning primitive; needed by Tier 2/3 overlays
- [ ] [`bx-breadcrumb-item`](core/breadcrumb-item.md)
- [ ] [`bx-carousel-item`](core/carousel-item.md)
- [ ] [`bx-dropdown-item`](core/dropdown-item.md)
- [ ] [`bx-tab`](core/tab.md)
- [ ] [`bx-tab-panel`](core/tab-panel.md)
- [ ] [`bx-tree-item`](core/tree-item.md)
- [ ] [`bx-option`](core/option.md)
- [ ] [`bx-format-bytes`](core/format-bytes.md)
- [ ] [`bx-format-date`](core/format-date.md)
- [ ] [`bx-format-number`](core/format-number.md)
- [ ] [`bx-relative-time`](core/relative-time.md)
- [ ] [`bx-include`](core/include.md)
- [ ] [`bx-intersection-observer`](core/intersection-observer.md)
- [ ] [`bx-mutation-observer`](core/mutation-observer.md)
- [ ] [`bx-resize-observer`](core/resize-observer.md)
- [ ] [`bx-qr-code`](core/qr-code.md)

## Tier 2 — Simple composites

Depend only on Tier 1 components.

- [ ] [`bx-button`](core/button.md) — depends on `bx-spinner` (loading state)
- [ ] [`bx-tooltip`](core/tooltip.md) — depends on `bx-popup`
- [ ] [`bx-radio-group`](core/radio-group.md) — depends on `bx-radio`
- [ ] [`bx-tab-group`](core/tab-group.md) — depends on `bx-tab`, `bx-tab-panel`
- [ ] [`bx-breadcrumb`](core/breadcrumb.md) — depends on `bx-breadcrumb-item`
- [ ] [`bx-carousel`](core/carousel.md) — depends on `bx-carousel-item`
- [ ] [`bx-tree`](core/tree.md) — depends on `bx-tree-item`
- [ ] [`bx-number-input`](core/number-input.md) (shares patterns with `bx-input`)
- [ ] [`bx-textarea`](core/textarea.md) (shares patterns with `bx-input`)
- [ ] [`bx-color-picker`](core/color-picker.md) (shares patterns with `bx-slider`)

## Tier 3 — Higher composites

Depend on Tier 2 components.

- [ ] [`bx-popover`](core/popover.md) — depends on `bx-popup`
- [ ] [`bx-drawer`](core/drawer.md) — (shares dialog semantics/focus-trap with `bx-dialog`)
- [ ] [`bx-copy-button`](core/copy-button.md) — depends on `bx-tooltip`, `bx-icon`
- [ ] [`bx-button-group`](core/button-group.md) — depends on `bx-button`

## Tier 4 — Virtualization infra + virtualized pickers

- [ ] `VirtualizerController` (shared `ReactiveController`, `@bixant/core`) — infra, not a tag; required by `bx-select`, `bx-dropdown`, `bx-virtual-tree`, `bx-data-list`, `bx-data-table` (conventions §4)
- [ ] [`bx-select`](core/select.md) — depends on `bx-popup`, `bx-option`, `VirtualizerController`
- [ ] [`bx-dropdown`](core/dropdown.md) — depends on `bx-popup`, `bx-dropdown-item`, `VirtualizerController` (FR-DROPDOWN-01/05)

## Tier 5 — Application shell

- [ ] [`bx-page`](core/page.md) — mobile nav becomes an off-canvas drawer (FR-PAGE-02); (shares pattern with `bx-drawer`); uses `bx-scroller`

## Tier 6 — Data packages

Depend on `VirtualizerController` (Tier 4).

- [ ] [`bx-virtual-tree`](data-list/virtual-tree.md) (`@bixant/data-list`) — depends on `VirtualizerController`; data-driven counterpart of `bx-tree`, build after it for API parity
- [ ] [`bx-data-list`](data-list/data-list.md) (`@bixant/data-list`) — depends on `VirtualizerController`
- [ ] [`bx-data-table`](data-table/data-table.md) (`@bixant/data-table`) — depends on `VirtualizerController`; row/cell editing reuses `bx-input`/`bx-checkbox`

## Framework wrappers (after the above)

Not per-component tasks — generated once from the Custom Elements Manifest, per conventions §8:

- [ ] `@bixant/react`
- [ ] `@bixant/angular`
- [ ] `@bixant/svelte`
