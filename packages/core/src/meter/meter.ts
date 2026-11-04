import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Band = 'good' | 'warning' | 'bad';

const GLYPH: Record<Band, string> = {
  good: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
  warning:
    'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z',
  bad: 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
};

/**
 * Band of `value` by the HTML `<meter>` algorithm (FR-METER-01): `low`/`high` split the range into
 * three regions, and the region holding `optimum` is "good"; its neighbour is "warning" and the
 * far region is "bad". Without `low`/`high`/`optimum` the defaults are `min`, `max` and the
 * midpoint, so everything is "good".
 */
export function meterBand(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number,
): Band {
  const lo = Math.min(Math.max(low ?? min, min), max);
  const hi = Math.max(Math.min(high ?? max, max), lo);
  const opt = Math.min(Math.max(optimum ?? (min + max) / 2, min), max);
  const region = (n: number) => (n < lo ? 0 : n > hi ? 2 : 1);
  const distance = Math.abs(region(value) - region(opt));
  return distance === 0 ? 'good' : distance === 1 ? 'warning' : 'bad';
}

/**
 * `<bx-meter>` — scalar measurement within a known range (docs/features/core/meter.md).
 *
 * `role="meter"` with `aria-valuenow/min/max`. The value is clamped to `min`/`max`
 * (FR-METER-03). The band (good/warning/bad) is conveyed by a glyph and by `aria-valuetext`, not by
 * the fill colour alone (FR-METER-02). For task progress use `bx-progress-bar`.
 *
 * @slot (default) - Overlay label.
 *
 * @csspart base - Track.
 * @csspart fill - Value bar.
 * @csspart label - The label part.
 *
 * @cssprop --bx-meter-height - Track height.
 * @cssprop --bx-meter-fill-good - Color in the optimum band.
 * @cssprop --bx-meter-fill-warning - Color in the middle band.
 * @cssprop --bx-meter-fill-bad - Color in the worst band.
 */
export class BxMeter extends BixElement {
  static override tagName = 'bx-meter';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-meter', 'label')}
        --_height: calc(var(--bx-space-xs) * 1.25);
      }
      :host([size='s']) {
        --_height: var(--bx-space-2xs);
      }
      :host([size='l']) {
        --_height: var(--bx-space-s);
      }
      .row {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
      }
      .label {
        ${textStyle('--bx-meter', 'label-s')}
        color: var(--bx-text-primary);
      }
      .label:empty {
        display: none;
      }
      .base {
        flex: 1 1 auto;
        box-sizing: border-box;
        block-size: var(--bx-meter-height, var(--_height));
        overflow: hidden;
        border-radius: var(--bx-radius-pill);
        background: var(--bx-surface-subtle);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .fill {
        block-size: 100%;
        inline-size: calc(var(--_pct, 0) * 1%);
        border-radius: inherit;
        background: var(--_fill);
        transition: inline-size var(--bx-motion-duration-base)
          var(--bx-motion-easing-standard);
      }
      .good {
        --_fill: var(
          --bx-meter-fill-good,
          var(--bx-role-success-solid, #2a8a4b)
        );
        --_fg: var(--bx-role-success-fg, #1f6b3a);
      }
      .warning {
        --_fill: var(--bx-meter-fill-warning, var(--bx-role-warning-solid));
        --_fg: var(--bx-role-warning-fg);
      }
      .bad {
        --_fill: var(--bx-meter-fill-bad, var(--bx-role-danger-solid));
        --_fg: var(--bx-role-danger-fg);
      }
      .state {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-3xs);
        color: var(--_fg);
        ${textStyle('--bx-meter-value', 'label-s')}
      }
      .state svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }
      @media (prefers-reduced-motion: reduce) {
        .fill {
          transition: none;
        }
      }
      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
        .fill {
          background: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    low: { type: Number },
    high: { type: Number },
    optimum: { type: Number },
    label: { type: String },
    showValue: { type: Boolean, attribute: 'show-value' },
    size: { type: String, reflect: true },
    format: { attribute: false },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare low?: number;
  declare high?: number;
  declare optimum?: number;
  declare label: string;
  declare showValue: boolean;
  declare size: 's' | 'm' | 'l';
  declare format?: Intl.NumberFormatOptions;

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.label = '';
    this.showValue = false;
    this.size = 'm';
  }

  protected override render() {
    const span = this.max - this.min || 1;
    const value = Math.min(Math.max(this.value, this.min), this.max);
    const pct = ((value - this.min) / span) * 100;
    const band = meterBand(
      value,
      this.min,
      this.max,
      this.low,
      this.high,
      this.optimum,
    );
    const text = new Intl.NumberFormat(undefined, this.format).format(value);
    const bandText = { good: 'good', warning: 'warning', bad: 'critical' }[
      band
    ];
    return html`<div class="row ${band}">
      <span class="label" part="label" id="label"
        ><slot>${this.label}</slot></span
      >
      <div
        class="base"
        part="base"
        role="meter"
        aria-labelledby=${this.label || this.textContent?.trim() ? 'label' : nothing}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${value}
        aria-valuetext=${`${text}, ${bandText}`}
      >
        <div class="fill" part="fill" style="--_pct:${pct}"></div>
      </div>
      <span class="state" aria-hidden="true">
        <svg viewBox="0 0 256 256"><path d=${GLYPH[band]} /></svg>
        ${this.showValue ? text : nothing}
      </span>
    </div>`;
  }
}
