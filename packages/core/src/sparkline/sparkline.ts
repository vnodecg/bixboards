import { css, html, nothing, svg } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily } from '../internal/text-style.ts';

type Highlight = 'none' | 'last' | 'min' | 'max';

const W = 100;
const H = 30;
/** Above this many points the series is bucketed (min/max per bucket) before drawing. */
const MAX_POINTS = 240;

/**
 * Reduces `values` to at most `limit` points, keeping each bucket's min and max (in original
 * order) so spikes survive (FR-SPARKLINE-01). O(n).
 */
export function decimate(values: number[], limit = MAX_POINTS): number[] {
  if (values.length <= limit) return values;
  const buckets = Math.floor(limit / 2);
  const size = values.length / buckets;
  const out: number[] = [];
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor(b * size);
    const end = Math.floor((b + 1) * size);
    let lo = start;
    let hi = start;
    for (let i = start + 1; i < end; i++) {
      if (values[i]! < values[lo]!) lo = i;
      if (values[i]! > values[hi]!) hi = i;
    }
    if (lo === hi) out.push(values[lo]!);
    else
      out.push(
        ...(lo < hi ? [values[lo]!, values[hi]!] : [values[hi]!, values[lo]!]),
      );
  }
  return out;
}

/**
 * `<bx-sparkline>` — tiny dependency-free inline trend chart (docs/features/core/sparkline.md).
 *
 * Plain SVG with a non-uniform viewBox (`preserveAspectRatio="none"`) and non-scaling strokes, so
 * it stretches to its container's width while its height is `1.5em` and follows the surrounding
 * text. Highlighted points are zero-length round-capped strokes, which stay circular despite the
 * non-uniform scale. Without a `label` it is decorative (`aria-hidden`); with one it is a
 * `role="img"` whose name includes the first, last, min and max values. `trend-is-good` is
 * unset by default (the spec's default `up` would colour every sparkline); set it to colour the
 * line by whether the overall direction is good or bad.
 *
 * @csspart base - SVG.
 * @csspart line - The line part.
 * @csspart area - The area part.
 * @csspart bar - The bar part.
 * @csspart point - The point part.
 *
 * @cssprop --bx-sparkline-color - Line/bar color. Default `--bx-role-accent`.
 * @cssprop --bx-sparkline-stroke-width - Line width.
 * @cssprop --bx-sparkline-height - Height. Default `1.5em`.
 */
export class BxSparkline extends BixElement {
  static override tagName = 'bx-sparkline';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-sparkline', 'body')}
      }
      .base {
        display: block;
        inline-size: 100%;
        block-size: var(--bx-sparkline-height, 1.5em);
        overflow: visible;
        --_color: var(--bx-sparkline-color, var(--bx-role-accent));
      }
      .base[data-good='good'] {
        --_color: var(--bx-sparkline-color, var(--bx-role-brand-solid));
      }
      .base[data-good='bad'] {
        --_color: var(--bx-sparkline-color, var(--bx-role-danger-solid));
      }
      .line {
        fill: none;
        stroke: var(--_color);
        stroke-width: var(--bx-sparkline-stroke-width, 1.5);
        stroke-linejoin: round;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
      }
      .area {
        fill: var(--_color);
        fill-opacity: 0.18;
        stroke: none;
      }
      .bar {
        fill: var(--_color);
      }
      .point {
        fill: none;
        stroke: var(--_color);
        stroke-width: calc(var(--bx-sparkline-stroke-width, 1.5) * 3.5);
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
      }
      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          --_color: CanvasText;
        }
        .area {
          fill-opacity: 0.3;
        }
      }
    `,
  ];

  static override properties = {
    values: {
      // `values="1, 3, 2"` works in markup; the property takes a number[] directly.
      converter: {
        fromAttribute: (value: string | null) =>
          (value ?? '')
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(Number),
      },
    },
    type: { type: String, reflect: true },
    min: { type: Number },
    max: { type: Number },
    highlight: { type: String },
    trendIsGood: { type: String, attribute: 'trend-is-good' },
    label: { type: String },
  };

  declare values: number[];
  declare type: 'line' | 'area' | 'bar';
  declare min?: number;
  declare max?: number;
  declare highlight: Highlight;
  declare trendIsGood?: 'up' | 'down';
  declare label: string;

  constructor() {
    super();
    this.values = [];
    this.type = 'line';
    this.highlight = 'last';
    this.label = '';
  }

  protected override render() {
    const raw = (this.values ?? []).filter((v) => Number.isFinite(v));
    if (!raw.length)
      return html`<svg class="base" part="base" aria-hidden="true"></svg>`;
    const data = decimate(raw);
    let lo = this.min ?? Math.min(...data);
    let hi = this.max ?? Math.max(...data);
    if (hi === lo) {
      lo -= 1;
      hi += 1;
    }
    const pad = 2;
    const x = (i: number) =>
      data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
    const y = (v: number) =>
      H -
      pad -
      ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (H - pad * 2);

    const points = data.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`);
    const line = `M${points.join('L')}`;
    let hl = -1;
    if (this.highlight === 'last') hl = data.length - 1;
    else if (this.highlight === 'min') hl = data.indexOf(Math.min(...data));
    else if (this.highlight === 'max') hl = data.indexOf(Math.max(...data));

    const trendUp = raw[raw.length - 1]! >= raw[0]!;
    const good = !this.trendIsGood
      ? undefined
      : trendUp === (this.trendIsGood === 'up')
        ? 'good'
        : 'bad';

    const bw = (W / data.length) * 0.7;
    const body =
      this.type === 'bar'
        ? data.map(
            (v, i) =>
              svg`<rect class="bar" part="bar" x=${(i + 0.5) * (W / data.length) - bw / 2} y=${y(v)} width=${bw} height=${Math.max(H - pad - y(v), 0.5)}></rect>`,
          )
        : svg`${
            this.type === 'area'
              ? svg`<path class="area" part="area" d=${`${line}L${x(data.length - 1)},${H}L${x(0)},${H}Z`}></path>`
              : nothing
          }<path class="line" part="line" d=${line}></path>`;
    const dot =
      hl >= 0 && this.type !== 'bar'
        ? svg`<path class="point" part="point" d=${`M${x(hl)},${y(data[hl]!)}h0`}></path>`
        : nothing;

    const summary = this.label
      ? `${this.label}: from ${raw[0]} to ${raw[raw.length - 1]}, low ${Math.min(...raw)}, high ${Math.max(...raw)}`
      : undefined;
    return html`<svg
      class="base"
      part="base"
      viewBox="0 0 ${W} ${H}"
      preserveAspectRatio="none"
      data-good=${good ?? nothing}
      role=${summary ? 'img' : nothing}
      aria-label=${summary ?? nothing}
      aria-hidden=${summary ? nothing : 'true'}
    >
      ${body}${dot}
    </svg>`;
  }
}
