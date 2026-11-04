import {
  css,
  html,
  nothing,
  svg,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import {
  observeIntersection,
  observeResize,
} from '../internal/shared-observers.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import { compactNumber, linear, lttb, niceTicks } from './chart-utils.ts';

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'stacked-bar'
  | 'bar-list'
  | 'radial'
  | 'radar'
  | 'scatter'
  | 'heatmap'
  | 'funnel'
  | 'sankey'
  | 'combo';

export interface Series {
  field: string;
  label?: string;
  color?: string;
}

export type Row = Record<string, unknown>;

/** What an adapter is asked to draw. */
export interface ChartSpec {
  type: ChartType;
  data: Row[];
  x: string;
  series: Required<Pick<Series, 'field' | 'label'>>[] & Series[];
  hidden: ReadonlySet<string>;
  stacked: boolean;
  smooth: boolean;
  width: number;
  height: number;
  /** CSS var() expression for series `i` (token-backed palette, FR-CHART-02). */
  color: (i: number) => string;
  locale?: string;
}

export interface ChartInstance {
  /** Re-draw for a new spec. */
  update(spec: ChartSpec): void;
  destroy(): void;
}

/**
 * Adapter between `bx-chart` and a rendering library (FR-CHART-01). The built-in `svg` adapter
 * needs no dependency; register another (e.g. an ECharts wrapper that imports it lazily) with
 * {@link registerChartAdapter} and select it with the `adapter` attribute.
 */
export interface ChartAdapter {
  /** Chart types this adapter can draw; others make `bx-chart` fall back to the data table. */
  supports: ReadonlySet<ChartType>;
  create(
    container: HTMLElement,
    host: HTMLElement,
  ): ChartInstance | Promise<ChartInstance>;
}

const adapters = new Map<string, ChartAdapter>();

export function registerChartAdapter(
  name: string,
  adapter: ChartAdapter,
): void {
  adapters.set(name, adapter);
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/** Down-sample threshold above which line/area/scatter series are reduced (FR-CHART-05). */
const LTTB_AT = 800;

function drawCartesian(spec: ChartSpec): TemplateResult {
  const { type, data, x, hidden, width: W, height: H } = spec;
  const series = spec.series.filter((s) => !hidden.has(s.field));
  const horizontal = type === 'bar-list';
  const m = { t: 12, r: 12, b: horizontal ? 12 : 28, l: horizontal ? 8 : 44 };
  const pw = Math.max(W - m.l - m.r, 10);
  const ph = Math.max(H - m.t - m.b, 10);
  const scatter = type === 'scatter';
  const stacked = type === 'stacked-bar' || spec.stacked;

  // y domain
  const values: number[] = [];
  data.forEach((row) => {
    if (stacked) {
      let pos = 0;
      for (const s of series) pos += Math.max(num(row[s.field]) || 0, 0);
      values.push(pos);
    } else for (const s of series) values.push(num(row[s.field]));
  });
  const finite = values.filter(Number.isFinite);
  const lo = Math.min(0, ...finite);
  const hi = Math.max(0, ...finite);
  const ticks = niceTicks(lo, hi, 5);
  const y0 = ticks[0];
  const y1 = ticks[ticks.length - 1];

  if (horizontal) {
    const s = spec.series[0];
    const rows = [...data]
      .map((r) => ({ label: String(r[x] ?? ''), v: num(r[s.field]) || 0 }))
      .sort((a, b) => b.v - a.v);
    const max = Math.max(...rows.map((r) => r.v), 1);
    const rowH = Math.min(ph / Math.max(rows.length, 1), 36);
    return svg`${rows.map((r, i) => {
      const w = (r.v / max) * (pw * 0.7);
      return svg`<g data-series=${s.field} data-index=${data.findIndex((d) => String(d[x] ?? '') === r.label)}>
        <text class="lbl" x=${m.l} y=${m.t + i * rowH + rowH * 0.35}>${r.label}</text>
        <rect class="bar" x=${m.l} y=${m.t + i * rowH + rowH * 0.45} width=${Math.max(w, 1)} height=${rowH * 0.35} rx="2" fill=${spec.color(0)}></rect>
        <text class="lbl val" x=${m.l + w + 6} y=${m.t + i * rowH + rowH * 0.72}>${compactNumber(r.v, spec.locale)}</text>
      </g>`;
    })}`;
  }

  const cats = data.map((r) => r[x]);
  const xBand = linear(0, Math.max(cats.length, 1), m.l, m.l + pw);
  const band = pw / Math.max(cats.length, 1);
  let xNum: ((v: number) => number) | undefined;
  if (scatter) {
    const xs = data.map((r) => num(r[x])).filter(Number.isFinite);
    const xt = niceTicks(Math.min(...xs), Math.max(...xs), 6);
    xNum = linear(xt[0], xt[xt.length - 1], m.l, m.l + pw);
  }
  const Y = linear(y0, y1, m.t + ph, m.t);

  const grid = ticks.map(
    (
      t,
    ) => svg`<g><line class="grid" x1=${m.l} x2=${m.l + pw} y1=${Y(t)} y2=${Y(t)}></line>
      <text class="axis" x=${m.l - 6} y=${Y(t) + 4} text-anchor="end">${compactNumber(t, spec.locale)}</text></g>`,
  );
  const step = Math.max(
    Math.ceil(cats.length / Math.max(Math.floor(pw / 56), 1)),
    1,
  );
  const xLabels = scatter
    ? nothing
    : cats.map((c, i) =>
        i % step === 0
          ? svg`<text class="axis" x=${xBand(i + 0.5)} y=${H - 8} text-anchor="middle">${String(c ?? '')}</text>`
          : nothing,
      );

  const body: TemplateResult[] = [];
  const baseline = Y(Math.max(y0, 0));
  if (type === 'bar' || type === 'stacked-bar') {
    const slot = stacked ? 1 : series.length;
    const bw = Math.max((band * 0.7) / slot, 1);
    data.forEach((row, i) => {
      let acc = 0;
      series.forEach((s, k) => {
        const v = num(row[s.field]);
        if (!Number.isFinite(v)) return;
        const idx = spec.series.indexOf(s);
        const xPos = stacked
          ? xBand(i + 0.5) - bw / 2
          : xBand(i + 0.5) - (bw * slot) / 2 + k * bw;
        const top = stacked ? Y(acc + v) : Y(Math.max(v, 0));
        const bottom = stacked ? Y(acc) : Y(Math.min(v, 0) || Math.max(y0, 0));
        if (stacked) acc += v;
        body.push(
          svg`<rect class="bar" data-series=${s.field} data-index=${i} x=${xPos} y=${Math.min(top, bottom)} width=${bw} height=${Math.max(Math.abs(bottom - top), v === 0 ? 0 : 1)} rx="2" fill=${spec.color(idx)}></rect>`,
        );
      });
    });
  } else {
    series.forEach((s) => {
      const idx = spec.series.indexOf(s);
      let pts: [number, number][] = data
        .map((row, i): [number, number] => [
          scatter ? xNum!(num(row[x])) : xBand(i + 0.5),
          Y(num(row[s.field])),
        ])
        .filter(([px, py]) => Number.isFinite(px) && Number.isFinite(py));
      const original = pts.length;
      if (pts.length > LTTB_AT) pts = lttb(pts, LTTB_AT);
      if (scatter) {
        body.push(
          ...pts.map(
            ([px, py], i) =>
              svg`<circle class="dot" data-series=${s.field} data-index=${original === pts.length ? i : -1} cx=${px} cy=${py} r="3.5" fill=${spec.color(idx)}></circle>`,
          ),
        );
        return;
      }
      const d = spec.smooth
        ? pts.reduce((acc, [px, py], i) => {
            if (i === 0) return `M${px},${py}`;
            const [qx] = pts[i - 1];
            const mx = (qx + px) / 2;
            return `${acc}C${mx},${pts[i - 1][1]} ${mx},${py} ${px},${py}`;
          }, '')
        : `M${pts.map(([px, py]) => `${px},${py}`).join('L')}`;
      if (type === 'area' && pts.length)
        body.push(
          svg`<path class="area" d=${`${d}L${pts[pts.length - 1][0]},${baseline}L${pts[0][0]},${baseline}Z`} fill=${spec.color(idx)}></path>`,
        );
      body.push(
        svg`<path class="line" data-series=${s.field} d=${d} stroke=${spec.color(idx)}></path>`,
      );
      if (pts.length <= 60)
        body.push(
          ...pts.map(
            ([px, py], i) =>
              svg`<circle class="dot" data-series=${s.field} data-index=${i} cx=${px} cy=${py} r="3" fill=${spec.color(idx)}></circle>`,
          ),
        );
    });
  }
  return svg`${grid}${xLabels}${body}`;
}

function drawRadial(spec: ChartSpec): TemplateResult {
  const s = spec.series[0];
  const rows = spec.data
    .map((r, i) => ({
      label: String(r[spec.x] ?? ''),
      v: Math.max(num(r[s.field]) || 0, 0),
      i,
    }))
    .filter((r) => !spec.hidden.has(r.label));
  const total = rows.reduce((a, r) => a + r.v, 0) || 1;
  const cx = spec.width / 2;
  const cy = spec.height / 2;
  const R = Math.min(cx, cy) - 8;
  const r0 = R * 0.6;
  let a = -Math.PI / 2;
  return svg`${rows.map((row) => {
    const sweep = (row.v / total) * Math.PI * 2;
    const [x0, y0] = [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    const [x1, y1] = [
      cx + R * Math.cos(a + sweep),
      cy + R * Math.sin(a + sweep),
    ];
    const [x2, y2] = [
      cx + r0 * Math.cos(a + sweep),
      cy + r0 * Math.sin(a + sweep),
    ];
    const [x3, y3] = [cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)];
    const large = sweep > Math.PI ? 1 : 0;
    const d =
      rows.length === 1
        ? `M${cx},${cy - R}A${R},${R} 0 1 1 ${cx - 0.01},${cy - R}Z M${cx},${cy - r0}A${r0},${r0} 0 1 0 ${cx - 0.01},${cy - r0}Z`
        : `M${x0},${y0}A${R},${R} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z`;
    a += sweep;
    return svg`<path class="slice" data-series=${s.field} data-index=${row.i} d=${d} fill=${spec.color(row.i)} fill-rule="evenodd"></path>`;
  })}`;
}

/** Built-in, dependency-free adapter: line, area, bar, stacked-bar, bar-list, scatter, radial. */
export const svgAdapter: ChartAdapter = {
  supports: new Set<ChartType>([
    'line',
    'area',
    'bar',
    'stacked-bar',
    'bar-list',
    'scatter',
    'radial',
  ]),
  create(container) {
    let svgEl: SVGSVGElement | undefined;
    const draw = async (spec: ChartSpec) => {
      const { render } = await import('lit');
      const body =
        spec.type === 'radial' ? drawRadial(spec) : drawCartesian(spec);
      render(
        html`<svg
          part="canvas"
          viewBox="0 0 ${spec.width} ${spec.height}"
          width=${spec.width}
          height=${spec.height}
          aria-hidden="true"
          ${ref((el) => (svgEl = el as SVGSVGElement))}
        >
          ${body}
        </svg>`,
        container,
      );
    };
    return {
      update: (spec) => void draw(spec),
      destroy: () => {
        svgEl?.remove();
        container.replaceChildren();
      },
    };
  },
};
registerChartAdapter('svg', svgAdapter);

let nextId = 0;

/**
 * `<bx-chart>` — declarative chart element (docs/features/core/chart.md).
 *
 * Rows go in `data`, the category/x field in `x`, and value fields in `series`. Drawing is
 * delegated to a {@link ChartAdapter} (FR-CHART-01): the built-in dependency-free `svg` adapter
 * draws `line`, `area`, `bar`, `stacked-bar`, `bar-list`, `scatter` and `radial`; the remaining
 * types (`radar`, `heatmap`, `funnel`, `sankey`, `combo`) need a registered adapter such as an
 * ECharts wrapper (none ships), and without one the chart shows a message and the data table.
 * Colours are `--bx-chart-color-1…8` custom properties defaulting to role tokens, so theme and
 * light/dark changes apply with no re-render (FR-CHART-02). Resize goes through the shared
 * `ResizeObserver`, and the first draw waits until the element is visible (FR-CHART-03). A visually
 * hidden data table is always present (FR-CHART-04); long line/scatter series are down-sampled with
 * LTTB past 800 points (FR-CHART-05). The legend toggles series; a hover tooltip reports the
 * nearest category. Points are not individually keyboard-focusable — the data table is the
 * non-pointer way to read values.
 *
 * @fires bx-point-click - A point/bar/slice was clicked. `detail.series`, `detail.datum`.
 * @fires bx-point-hover - The pointer moved to a category. `detail.index`, `detail.datum`.
 * @fires bx-legend-toggle - `detail.series`, `detail.visible`.
 * @fires bx-ready - The adapter instance was created.
 * @fires bx-unsupported - The chosen adapter cannot draw `type`. `detail.type`.
 *
 * @slot title - Chart title.
 * @slot legend - Custom legend.
 * @slot empty - Shown when there is no data.
 * @slot table - Optional replacement for the generated data table.
 *
 * @csspart base - The base part.
 * @csspart canvas - Rendering surface.
 * @csspart legend - The legend part.
 * @csspart tooltip - The tooltip part.
 * @csspart title - The title part.
 *
 * @cssprop --bx-chart-color-1 - Series color 1 (…8 follow). Default the categorical token ramp.
 * @cssprop --bx-chart-grid-color - Gridlines.
 * @cssprop --bx-chart-height - Height.
 */
export class BxChart extends BixElement {
  static override tagName = 'bx-chart';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-chart', 'body')}
        --_c1: var(--bx-chart-color-1, var(--bx-role-brand-solid));
        --_c2: var(--bx-chart-color-2, var(--bx-role-tertiary-solid));
        --_c3: var(--bx-chart-color-3, var(--bx-role-warning-solid));
        --_c4: var(--bx-chart-color-4, var(--bx-role-danger-solid));
        --_c5: var(--bx-chart-color-5, var(--bx-role-success-solid));
        --_c6: var(--bx-chart-color-6, var(--bx-role-neutral-solid));
        --_c7: var(--bx-chart-color-7, var(--bx-role-brand-border));
        --_c8: var(--bx-chart-color-8, var(--bx-role-tertiary-border));
      }
      .base {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-xs);
        color: var(--bx-text-primary);
      }
      .title {
        ${textStyle('--bx-chart-title', 'heading-xs')}
      }
      .title:not(:has(::slotted(*))) {
        display: none;
      }
      .plot {
        position: relative;
        block-size: var(--bx-chart-height, var(--_height, 16rem));
        min-inline-size: 0;
      }
      .canvas {
        position: absolute;
        inset: 0;
      }
      .canvas svg {
        display: block;
        overflow: visible;
      }
      .canvas .grid {
        stroke: var(--bx-chart-grid-color, var(--bx-border-subtle));
        stroke-width: 1;
      }
      .canvas .axis,
      .canvas .lbl {
        fill: var(--bx-text-secondary);
        font-size: 0.75rem;
        font-family: inherit;
      }
      .canvas .lbl {
        fill: var(--bx-text-primary);
      }
      .canvas .line {
        fill: none;
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
      }
      .canvas .area {
        opacity: 0.18;
      }
      .canvas .bar,
      .canvas .slice,
      .canvas .dot {
        cursor: pointer;
      }
      .canvas .dot {
        stroke: var(--bx-surface-base);
        stroke-width: 1.5;
      }
      .canvas [fill='var(--_c1)'] {
        color: var(--_c1);
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--bx-space-xs) var(--bx-space-s);
      }
      .legend button {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        min-block-size: var(--bx-target-min);
        padding: 0 var(--bx-space-2xs);
        border: 0;
        border-radius: var(--bx-radius-s);
        background: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        ${textStyle('--bx-chart-legend', 'label-s')}
      }
      .legend button[aria-pressed='false'] {
        opacity: 0.5;
        text-decoration: line-through;
      }
      .legend button:focus-visible {
        outline: var(--bx-chart-focus-ring-width, var(--bx-border-width-strong))
          solid var(--bx-chart-focus-ring-color, var(--bx-focus-ring));
      }
      .swatch {
        inline-size: 0.75em;
        block-size: 0.75em;
        border-radius: 2px;
        background: var(--_sw);
      }
      .tooltip {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        padding: var(--bx-space-2xs) var(--bx-space-xs);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-s);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        box-shadow: var(--bx-shadow-m);
        white-space: nowrap;
        ${textStyle('--bx-chart-tooltip', 'caption-m')}
      }
      .tooltip[hidden] {
        display: none;
      }
      .empty,
      .unsupported {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: 100%;
        color: var(--bx-text-secondary);
        text-align: center;
      }
      bx-skeleton {
        position: absolute;
        inset: 0;
        block-size: 100%;
        inline-size: 100%;
      }
      .sr-table {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      @media (forced-colors: active) {
        .canvas .line {
          stroke: CanvasText;
        }
        .canvas .bar,
        .canvas .slice,
        .canvas .dot {
          fill: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    type: { type: String, reflect: true },
    data: { attribute: false },
    x: { type: String },
    series: { attribute: false },
    legend: { type: String },
    tooltip: { type: Boolean },
    stacked: { type: Boolean },
    smooth: { type: Boolean },
    animate: { type: Boolean },
    height: { type: String },
    palette: { type: String },
    loading: { type: Boolean, reflect: true },
    label: { type: String },
    adapter: { type: String },
    _size: { state: true },
    _visible: { state: true },
    _hidden: { state: true },
    _tip: { state: true },
    _unsupported: { state: true },
  };

  declare type: ChartType;
  declare data: Row[];
  declare x: string;
  declare series: (string | Series)[];
  declare legend: 'none' | 'top' | 'bottom' | 'start' | 'end';
  declare tooltip: boolean;
  declare stacked: boolean;
  declare smooth: boolean;
  declare animate: boolean;
  declare height: string;
  declare palette: string;
  declare loading: boolean;
  declare label: string;
  declare adapter: string;
  /** @internal */
  declare _size: { w: number; h: number };
  /** @internal */
  declare _visible: boolean;
  /** @internal */
  declare _hidden: Set<string>;
  /** @internal */
  declare _tip?: {
    x: number;
    y: number;
    title: string;
    rows: { label: string; value: string; color: string }[];
  };
  /** @internal */
  declare _unsupported: boolean;

  #id = `bx-chart-${nextId++}`;
  #canvasRef = createRef<HTMLElement>();
  #plotRef = createRef<HTMLElement>();
  #instance?: ChartInstance;
  #instanceAdapter?: string;
  #unobserveResize?: () => void;
  #unobserveVisible?: () => void;

  constructor() {
    super();
    this.type = 'line';
    this.data = [];
    this.x = '';
    this.series = [];
    this.legend = 'bottom';
    this.tooltip = true;
    this.stacked = false;
    this.smooth = false;
    this.animate = true;
    this.height = '16rem';
    this.palette = 'categorical';
    this.loading = false;
    this.label = '';
    this.adapter = 'svg';
    this._size = { w: 0, h: 0 };
    this._visible = false;
    this._hidden = new Set();
    this._unsupported = false;
  }

  /** Series normalised to `{ field, label }` objects. */
  get normalizedSeries(): Required<Pick<Series, 'field' | 'label'>>[] &
    Series[] {
    return (this.series ?? []).map((s) => {
      const o = typeof s === 'string' ? { field: s } : s;
      return { ...o, label: o.label ?? o.field };
    }) as never;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._visible = typeof IntersectionObserver === 'undefined';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserveResize?.();
    this.#unobserveVisible?.();
    this.#unobserveResize = this.#unobserveVisible = undefined;
    this.#instance?.destroy();
    this.#instance = undefined;
    this.#instanceAdapter = undefined;
  }

  protected override firstUpdated(): void {
    const plot = this.#plotRef.value!;
    this.#unobserveResize = observeResize(plot, (entry) => {
      const { width, height } = entry.contentRect;
      if (width !== this._size.w || height !== this._size.h)
        this._size = { w: Math.round(width), h: Math.round(height) };
    });
    this.#unobserveVisible = observeIntersection(plot, (entry) => {
      if (entry.isIntersecting) {
        this._visible = true;
        this.#unobserveVisible?.();
        this.#unobserveVisible = undefined;
      }
    });
    const r = plot.getBoundingClientRect();
    this._size = { w: Math.round(r.width), h: Math.round(r.height) };
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('height')) this.style.setProperty('--_height', this.height);
    void this.#draw();
  }

  async #draw(): Promise<void> {
    const container = this.#canvasRef.value;
    if (
      !container ||
      !this._visible ||
      !this._size.w ||
      !this.data?.length ||
      this.loading
    )
      return;
    const adapter = adapters.get(this.adapter);
    const unsupported = !adapter || !adapter.supports.has(this.type);
    if (unsupported !== this._unsupported) this._unsupported = unsupported;
    if (unsupported) {
      this.#instance?.destroy();
      this.#instance = undefined;
      this.dispatchEvent(
        new CustomEvent('bx-unsupported', {
          bubbles: true,
          composed: true,
          detail: { type: this.type },
        }),
      );
      return;
    }
    if (!this.#instance || this.#instanceAdapter !== this.adapter) {
      this.#instance?.destroy();
      this.#instanceAdapter = this.adapter;
      this.#instance = await adapter.create(container, this);
      this.dispatchEvent(
        new Event('bx-ready', { bubbles: true, composed: true }),
      );
    }
    const series = this.normalizedSeries;
    this.#instance.update({
      type: this.type,
      data: this.data,
      x: this.x,
      series,
      hidden: this._hidden,
      stacked: this.stacked,
      smooth: this.smooth,
      width: this._size.w,
      height: this._size.h,
      color: (i) => series[i]?.color ?? `var(--_c${(i % 8) + 1})`,
      locale: this.lang || document.documentElement.lang || undefined,
    });
  }

  #color(i: number): string {
    return this.normalizedSeries[i]?.color ?? `var(--_c${(i % 8) + 1})`;
  }

  /** Legend entries: series, or categories for radial. */
  get #legendEntries(): { key: string; label: string; color: string }[] {
    if (this.type === 'radial')
      return (this.data ?? []).map((r, i) => ({
        key: String(r[this.x] ?? ''),
        label: String(r[this.x] ?? ''),
        color: this.#color(i),
      }));
    return this.normalizedSeries.map((s, i) => ({
      key: s.field,
      label: s.label,
      color: this.#color(i),
    }));
  }

  #toggle(key: string): void {
    const next = new Set(this._hidden);
    next.has(key) ? next.delete(key) : next.add(key);
    this._hidden = next;
    this.dispatchEvent(
      new CustomEvent('bx-legend-toggle', {
        bubbles: true,
        composed: true,
        detail: { series: key, visible: !next.has(key) },
      }),
    );
  }

  #onPointerMove = (event: PointerEvent): void => {
    const target = (event.target as Element).closest?.(
      '[data-index]',
    ) as SVGElement | null;
    const plot = this.#plotRef.value;
    if (!plot) return;
    const rect = plot.getBoundingClientRect();
    let index = target ? Number(target.getAttribute('data-index')) : -1;
    if (
      index < 0 &&
      !target &&
      this.type !== 'radial' &&
      this.type !== 'bar-list' &&
      this.type !== 'scatter' &&
      this.data.length
    ) {
      const frac = Math.min(
        Math.max(
          (event.clientX - rect.left - 44) / Math.max(rect.width - 56, 1),
          0,
        ),
        0.999,
      );
      index = Math.floor(frac * this.data.length);
    }
    const row = this.data[index];
    if (!row) {
      this._tip = undefined;
      return;
    }
    const series =
      this.type === 'radial'
        ? [this.normalizedSeries[0]]
        : this.normalizedSeries.filter((s) => !this._hidden.has(s.field));
    this.dispatchEvent(
      new CustomEvent('bx-point-hover', {
        bubbles: true,
        composed: true,
        detail: { index, datum: row },
      }),
    );
    if (!this.tooltip) return;
    const fmt = new Intl.NumberFormat(this.lang || undefined);
    this._tip = {
      x: Math.min(event.clientX - rect.left + 12, rect.width - 120),
      y: Math.max(event.clientY - rect.top - 8, 0),
      title: String(row[this.x] ?? ''),
      rows: series.map((s) => ({
        label: s.label,
        value: fmt.format(num(row[s.field])),
        color: this.#color(this.normalizedSeries.indexOf(s)),
      })),
    };
  };

  #onClick = (event: MouseEvent): void => {
    const target = (event.target as Element).closest?.(
      '[data-index]',
    ) as SVGElement | null;
    if (!target) return;
    const index = Number(target.getAttribute('data-index'));
    const datum = this.data[index];
    if (datum)
      this.dispatchEvent(
        new CustomEvent('bx-point-click', {
          bubbles: true,
          composed: true,
          detail: { series: target.getAttribute('data-series'), datum },
        }),
      );
  };

  #renderTable() {
    const series = this.normalizedSeries;
    return html`<table class="sr-table">
      <caption>
        ${this.label || 'Chart data'}
      </caption>
      <thead>
        <tr>
          <th scope="col">${this.x}</th>
          ${series.map((s) => html`<th scope="col">${s.label}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${this.data.map(
          (row) =>
            html`<tr>
              <th scope="row">${String(row[this.x] ?? '')}</th>
              ${series.map((s) => html`<td>${String(row[s.field] ?? '')}</td>`)}
            </tr>`,
        )}
      </tbody>
    </table>`;
  }

  protected override render() {
    const empty = !this.data?.length;
    const legend = this.legend !== 'none' && !empty ? this.#legendEntries : [];
    const legendEl = legend.length
      ? html`<div class="legend" part="legend" role="group" aria-label="Legend">
          <slot name="legend"
            >${legend.map(
              (e) =>
                html`<button
                  type="button"
                  aria-pressed=${this._hidden.has(e.key) ? 'false' : 'true'}
                  @click=${() => this.#toggle(e.key)}
                >
                  <span class="swatch" style="--_sw:${e.color}"></span
                  >${e.label}
                </button>`,
            )}</slot
          >
        </div>`
      : nothing;
    return html`<div class="base" part="base" id=${this.#id}>
      <div class="title" part="title"><slot name="title"></slot></div>
      ${this.legend === 'top' ? legendEl : nothing}
      <div
        class="plot"
        ${ref(this.#plotRef)}
        role="img"
        aria-label=${this.label || `${this.type} chart`}
        @pointermove=${this.#onPointerMove}
        @pointerleave=${() => (this._tip = undefined)}
        @click=${this.#onClick}
      >
        <div class="canvas" ${ref(this.#canvasRef)}></div>
        ${this.loading ? html`<bx-skeleton></bx-skeleton>` : nothing}
        ${empty && !this.loading ? html`<div class="empty"><slot name="empty">No data</slot></div>` : nothing}
        ${
          this._unsupported
            ? html`<div class="unsupported" role="status">
                “${this.type}” needs a chart adapter that supports it; the data
                is available in the table.
              </div>`
            : nothing
        }
        ${
          this._tip
            ? html`<div
                class="tooltip"
                part="tooltip"
                style="left:${this._tip.x}px;top:${this._tip.y}px"
                role="presentation"
              >
                <strong>${this._tip.title}</strong>
                ${this._tip.rows.map((r) => html`<div><span class="swatch" style="--_sw:${r.color}"></span> ${r.label}: ${r.value}</div>`)}
              </div>`
            : nothing
        }
      </div>
      ${this.legend !== 'top' ? legendEl : nothing}
      <slot name="table">${empty ? nothing : this.#renderTable()}</slot>
    </div>`;
  }
}
