# Feature documents

One detailed feature document per component. Shared rules live in [_conventions.md](_conventions.md). Product context: [PRD](../PRD.md).

**61 components** across 3 packages.

> **Status: proposals, hand-maintained.** These documents are the specification for each component. 53 are implemented (see [IMPLEMENTATION.md](IMPLEMENTATION.md) for the full tracker); the rest do not exist yet. API shapes for the unimplemented components are design proposals and have **not** been validated against real usage; confirm names and behavior when implementing each. Appearance, variant and size options are defined here, per component, and are implemented on top of the design-system tokens (colors from roles, sizes from the fluid scale) — the design system itself contains no component definitions. Conventions: appearance names use spaces (`filled outlined`), variants are the design-system palettes, and component CSS hooks are `--bx-<component>-<parameter>` (parts use short names; only custom properties carry the component prefix).

## `@bixant/core`

### Actions

| Component                                   | Summary                                                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`bx-button`](core/button.md)               | Triggers an action or navigates. Supports variants, appearances, sizes, loading state, link mode and form submission. |
| [`bx-button-group`](core/button-group.md)   | Groups related buttons into a single segmented control with shared borders and roving semantics.                      |
| [`bx-copy-button`](core/copy-button.md)     | One-click copy of text, a property, or another element's content to the clipboard with success/error feedback.        |
| [`bx-dropdown`](core/dropdown.md)           | Anchors a menu of items to a trigger; keyboard navigable, typeahead-enabled, with checkbox and submenu support.       |
| [`bx-dropdown-item`](core/dropdown-item.md) | A single menu entry: plain, checkbox, or submenu parent.                                                              |

### Feedback

| Component                                   | Summary                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| [`bx-badge`](core/badge.md)                 | Small status/count indicator, optionally pulsing or attached to another element. |
| [`bx-callout`](core/callout.md)             | Inline message block for info, warning and error with optional icon and dismiss. |
| [`bx-progress-bar`](core/progress-bar.md)   | Linear progress indicator, determinate or indeterminate.                         |
| [`bx-progress-ring`](core/progress-ring.md) | Circular progress indicator with centered label.                                 |
| [`bx-skeleton`](core/skeleton.md)           | Placeholder shimmer while content loads.                                         |
| [`bx-spinner`](core/spinner.md)             | Indeterminate loading spinner.                                                   |
| [`bx-tooltip`](core/tooltip.md)             | Short hover/focus hint anchored to any element via `for` or slot.                |

### Overlays

| Component                       | Summary                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| [`bx-popover`](core/popover.md) | Rich, interactive floating panel anchored to an element.                        |
| [`bx-dialog`](core/dialog.md)   | Modal dialog built on native `<dialog>`, with header, footer and light dismiss. |
| [`bx-drawer`](core/drawer.md)   | Edge-anchored panel (top/end/bottom/start), modal or contained to a parent.     |

### Form

| Component                                 | Summary                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`bx-input`](core/input.md)               | Single-line text field with all native input types, clearable, password toggle and prefix/suffix.          |
| [`bx-number-input`](core/number-input.md) | Numeric field with steppers, locale-aware parsing and min/max clamping.                                    |
| [`bx-textarea`](core/textarea.md)         | Multi-line text with auto-resize, character count and resize handle control.                               |
| [`bx-checkbox`](core/checkbox.md)         | Binary or indeterminate selection.                                                                         |
| [`bx-switch`](core/switch.md)             | On/off toggle.                                                                                             |
| [`bx-radio`](core/radio.md)               | Single option within a radio group; supports default, button and card appearances.                         |
| [`bx-radio-group`](core/radio-group.md)   | Manages a set of radios: single value, roving tabindex, validation.                                        |
| [`bx-select`](core/select.md)             | Single or multiple choice with searchable, virtualized listbox and removable-badge display for selections. |
| [`bx-option`](core/option.md)             | An item inside `bx-select`.                                                                                |
| [`bx-slider`](core/slider.md)             | Single or range slider with ticks, markers and tooltip.                                                    |
| [`bx-rating`](core/rating.md)             | Star-style rating input/display with fractional precision.                                                 |
| [`bx-color-picker`](core/color-picker.md) | Color selection with saturation area, hue/alpha sliders, swatches, eyedropper and format switching.        |

### Imagery

| Component                                     | Summary                                                                           |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| [`bx-animated-image`](core/animated-image.md) | Play/pause control for GIF and animated WebP.                                     |
| [`bx-avatar`](core/avatar.md)                 | User image, initials or icon with shape variants.                                 |
| [`bx-carousel`](core/carousel.md)             | Scroll-snap carousel with pagination, navigation, autoplay, multi-slide and drag. |
| [`bx-carousel-item`](core/carousel-item.md)   | A single slide.                                                                   |
| [`bx-comparison`](core/comparison.md)         | Before/after image comparison with draggable divider.                             |
| [`bx-icon`](core/icon.md)                     | Icon from a registered library or URL, inlined SVG.                               |
| [`bx-qr-code`](core/qr-code.md)               | Generates a QR code from a value.                                                 |
| [`bx-zoomable-frame`](core/zoomable-frame.md) | Iframe with zoom controls.                                                        |

### Organization

| Component                                       | Summary                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [`bx-breadcrumb`](core/breadcrumb.md)           | Navigation trail with separators and overflow collapsing.                                                           |
| [`bx-breadcrumb-item`](core/breadcrumb-item.md) | One crumb; link or button.                                                                                          |
| [`bx-card`](core/card.md)                       | Container with header, media, body, footer and actions.                                                             |
| [`bx-details`](core/details.md)                 | Disclosure widget; supports grouping into an accordion.                                                             |
| [`bx-divider`](core/divider.md)                 | Horizontal or vertical rule.                                                                                        |
| [`bx-scroller`](core/scroller.md)               | Scroll region with edge shadows and keyboard access.                                                                |
| [`bx-split-panel`](core/split-panel.md)         | Two resizable panels with draggable divider.                                                                        |
| [`bx-tab-group`](core/tab-group.md)             | Tabbed interface with scrolling tab list, manual/auto activation.                                                   |
| [`bx-tab`](core/tab.md)                         | A tab button.                                                                                                       |
| [`bx-tab-panel`](core/tab-panel.md)             | Content for a tab.                                                                                                  |
| [`bx-tree`](core/tree.md)                       | Hierarchical tree with single/multi/leaf selection for small-to-medium data sets (use `bx-virtual-tree` for large). |
| [`bx-tree-item`](core/tree-item.md)             | A node in `bx-tree`, with lazy children.                                                                            |
| [`bx-page`](core/page.md)                       | Application shell layout: header, subheader, navigation, main, aside, footer with responsive collapse.              |

### Utilities

| Component                                                   | Summary                                                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`bx-animation`](core/animation.md)                         | Declarative Web Animations API wrapper with named presets.                                                     |
| [`bx-format-bytes`](core/format-bytes.md)                   | Formats byte counts in a locale-aware, human-readable form.                                                    |
| [`bx-format-date`](core/format-date.md)                     | Formats a date via `Intl.DateTimeFormat`.                                                                      |
| [`bx-format-number`](core/format-number.md)                 | Formats numbers, currency and percent.                                                                         |
| [`bx-relative-time`](core/relative-time.md)                 | Self-updating relative timestamps ("3 minutes ago").                                                           |
| [`bx-include`](core/include.md)                             | Fetches and inlines remote HTML.                                                                               |
| [`bx-intersection-observer`](core/intersection-observer.md) | Declarative IntersectionObserver.                                                                              |
| [`bx-mutation-observer`](core/mutation-observer.md)         | Declarative MutationObserver.                                                                                  |
| [`bx-resize-observer`](core/resize-observer.md)             | Declarative ResizeObserver.                                                                                    |
| [`bx-popup`](core/popup.md)                                 | Low-level positioning primitive (anchor, flip, shift, size, arrow) used by dropdown, select, tooltip, popover. |

## `@bixant/data-table`

### Data

| Component                                   | Summary                                                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`bx-data-table`](data-table/data-table.md) | Enterprise-grade virtualized table for 100k–1M+ rows: sorting, filtering, grouping, selection, pinning, resizing, reordering, inline editing, server-side data and export. Native-table accessibility. |

## `@bixant/data-list`

### Data

| Component                                      | Summary                                                                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`bx-data-list`](data-list/data-list.md)       | Virtualized list/grid of items for feeds, inboxes and galleries with dynamic heights, grouping, sticky headers, selection, reordering and infinite loading. |
| [`bx-virtual-tree`](data-list/virtual-tree.md) | Virtualized tree/tree-table for 100k+ nodes with lazy children, filtering and multi-selection. Data-driven counterpart to `bx-tree`.                        |
