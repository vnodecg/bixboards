# `<bx-chart>`

> Declarative chart element wrapping a charting library: line, area, bar, radial, radar, scatter, heatmap, funnel, sankey and combo.

|                     |                                                        |
| ------------------- | ------------------------------------------------------ |
| **Package**         | `@bixboards/core`                                      |
| **Category**        | Charts                                                 |
| **Tag**             | `bx-chart`                                             |
| **Status**          | Proposed (not implemented)                             |
| **Form-associated** | No                                                     |
| **Depends on**      | `skeleton`, `resize-observer`, `intersection-observer` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Declarative chart element wrapping a charting library: line, area, bar, radial, radar, scatter, heatmap, funnel, sankey and combo. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name      | Type                                                                                | Default       | Description                              |
| --------- | ----------------------------------------------------------------------------------- | ------------- | ---------------------------------------- |
| `type`    | line/area/bar/stacked-bar/bar-list/radial/radar/scatter/heatmap/funnel/sankey/combo | "line"        | -                                        |
| `data`    | object[] (property)                                                                 | []            | Row objects.                             |
| `x`       | string                                                                              | ""            | Category/x field.                        |
| `series`  | string[]/Series[] (property)                                                        | []            | Value fields or full series definitions. |
| `legend`  | none/top/bottom/start/end                                                           | "bottom"      | -                                        |
| `tooltip` | boolean                                                                             | true          | -                                        |
| `stacked` | boolean                                                                             | false         | -                                        |
| `smooth`  | boolean                                                                             | false         | -                                        |
| `animate` | boolean                                                                             | true          | Disabled under reduced motion.           |
| `height`  | string                                                                              | "16rem"       | -                                        |
| `palette` | string                                                                              | "categorical" | Token-backed 8-color ramp.               |
| `loading` | boolean                                                                             | false         | -                                        |
| `label`   | string                                                                              | ""            | Accessible name.                         |

### Slots

| Name     | Description                                   |
| -------- | --------------------------------------------- |
| `title`  | -                                             |
| `legend` | Custom legend.                                |
| `empty`  | -                                             |
| `table`  | Optional visually-hidden data table fallback. |

### Events

| Event              | Detail / notes                 |
| ------------------ | ------------------------------ |
| `bx-point-click`   | detail.series, detail.datum.   |
| `bx-point-hover`   | -                              |
| `bx-legend-toggle` | detail.series, detail.visible. |
| `bx-ready`         | Library instance created.      |

### CSS parts

| Part      | Description        |
| --------- | ------------------ |
| `base`    | The base part.     |
| `canvas`  | Rendering surface. |
| `legend`  | The legend part.   |
| `tooltip` | The tooltip part.  |
| `title`   | The title part.    |

### CSS custom properties

| Property                      | Description                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| `--bx-chart-color-1…8`        | Series colors. Default the categorical token ramp.                       |
| `--bx-chart-grid-color`       | Gridlines.                                                               |
| `--bx-chart-height`           | Height.                                                                  |
| `--bx-chart-font-family`      | -                                                                        |
| `--bx-chart-focus-ring-width` | Focus ring width (focus state). Default `var(--bx-border-width-strong)`. |
| `--bx-chart-focus-ring-color` | Focus ring color (focus state). Default `var(--bx-focus-ring)`.          |
| `--bx-chart-font-family`      | Font family. Default `var(--bx-font-family-sans)`.                       |

### Methods

`resize()`, `exportImage(type)`, `highlight(series, index)`, `getInstance()`

## 3. Functional requirements

- **FR-CHART-01** **Library**: a thin adapter interface (`ChartAdapter`) wraps the chosen library (default ECharts, loaded lazily via dynamic import, so pages without charts pay nothing); adapters for others can be registered.
- **FR-CHART-02** Theme tokens (colors, font, gridlines, light/dark) are read from CSS custom properties and re-applied on theme change.
- **FR-CHART-03** Resize uses the shared ResizeObserver pool; rendering is deferred until the element is visible (IntersectionObserver).
- **FR-CHART-04** Every chart exposes a data table alternative (slot `table` or auto-generated visually hidden table).
- **FR-CHART-05** Large series are down-sampled (LTTB) beyond a threshold.
- **FR-CHART-06** Chart types the library cannot render (e.g. activity rings) are separate elements (`bx-progress-ring` group), not hacked into `chart`.

## 4. Fluid scaling

Fonts and paddings follow the ramp; default height in rem.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Legend moves below the plot and axis labels thin out as width shrinks.

## 6. Accessibility

- Container is `role="img"` with `aria-label` and a description that summarizes trend; the data table fallback is the accessible representation; series are distinguished by pattern/marker as well as color; keyboard focus walks data points with arrow keys and announces values.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`.
- Svelte: typed component wrapper exposing props and callback events.

## 9. Acceptance criteria

- [ ] All FR-CHART-* requirements covered by unit/component tests (`chart.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
