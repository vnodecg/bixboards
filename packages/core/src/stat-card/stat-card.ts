import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getNumberFormatter } from '../internal/intl-cache.ts';
import { observeIntersection } from '../internal/shared-observers.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Trend = 'up' | 'down' | 'flat';

const ARROW: Record<Trend, string> = {
  up: 'M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z',
  down: 'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z',
  flat: 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z',
};

/**
 * `<bx-stat-card>` — KPI tile with label, value, delta trend and optional sparkline
 * (docs/features/core/stat-card.md).
 *
 * Composes `bx-card`. The value is formatted with `Intl.NumberFormat` via the shared formatter
 * cache (not a nested `bx-format-number`, which has no `format`-options object). The delta shows
 * its direction with an arrow *and* a sign plus screen-reader text, never colour alone
 * (FR-STATCARD-02); good/bad colouring follows `trend-is-good`. `count-up` (an addition: the spec
 * makes it implicit) animates a numeric value from 0 only when the card enters view and motion is
 * allowed (FR-STATCARD-03). With `href`, the label becomes a link whose hit area stretches over
 * the whole card.
 *
 * @fires click - When `href` is set and the link is activated.
 *
 * @slot icon - Leading icon.
 * @slot chart - Typically `bx-sparkline`.
 * @slot footer - Period caption.
 *
 * @csspart base - The base part.
 * @csspart label - The label part.
 * @csspart value - The value part.
 * @csspart delta - The delta part.
 * @csspart chart - The chart part.
 *
 * @cssprop --bx-stat-card-value-font-size - Value font size.
 * @cssprop --bx-stat-card-delta-color-good - Delta color when the trend is good.
 * @cssprop --bx-stat-card-delta-color-bad - Delta color when the trend is bad.
 */
export class BxStatCard extends BixElement {
  static override tagName = 'bx-stat-card';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-stat-card', 'body')}
      }
      bx-card {
        position: relative;
        block-size: 100%;
      }
      .head {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-stat-card-label', 'label-m')}
      }
      .label {
        color: inherit;
        text-decoration: none;
      }
      a.label::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
      }
      a.label:focus-visible {
        outline: none;
      }
      a.label:focus-visible::after {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: var(--bx-space-xs);
        margin-block-start: var(--bx-space-2xs);
      }
      .value {
        color: var(--bx-text-primary);
        font-variant-numeric: tabular-nums;
        ${textStyle('--bx-stat-card-value', 'heading-l')}
      }
      .delta {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-3xs);
        color: var(--bx-role-neutral-fg);
        ${textStyle('--bx-stat-card-delta', 'label-m')}
      }
      .delta svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }
      .delta[data-tone='good'] {
        color: var(--bx-stat-card-delta-color-good, var(--bx-role-brand-fg));
      }
      .delta[data-tone='bad'] {
        color: var(--bx-stat-card-delta-color-bad, var(--bx-role-danger-fg));
      }
      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      .chart {
        margin-block-start: var(--bx-space-xs);
      }
      .chart:not(:has(::slotted(*))) {
        display: none;
      }
      .footer {
        margin-block-start: var(--bx-space-xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-stat-card-footer', 'caption-m')}
      }
      .footer:not(:has(::slotted(*))) {
        display: none;
      }
      bx-skeleton {
        display: block;
        block-size: 1.2em;
        inline-size: 6em;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    value: { type: String },
    format: { attribute: false },
    delta: { type: Number },
    deltaFormat: { type: String, attribute: 'delta-format' },
    trend: { type: String, reflect: true },
    trendIsGood: { type: String, attribute: 'trend-is-good' },
    loading: { type: Boolean, reflect: true },
    href: { type: String },
    countUp: { type: Boolean, attribute: 'count-up' },
    _shown: { state: true },
  };

  declare label: string;
  declare value: string | number;
  declare format?: Intl.NumberFormatOptions;
  declare delta?: number;
  declare deltaFormat: 'percent' | 'absolute';
  declare trend?: Trend;
  declare trendIsGood: 'up' | 'down';
  declare loading: boolean;
  declare href: string;
  declare countUp: boolean;
  /** @internal The value currently displayed while counting up. */
  declare _shown?: number;

  #unobserve?: () => void;
  #raf = 0;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.deltaFormat = 'percent';
    this.trendIsGood = 'up';
    this.loading = false;
    this.href = '';
    this.countUp = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
    this.#unobserve = undefined;
    cancelAnimationFrame(this.#raf);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value') || changed.has('countUp')) this.#armCountUp();
  }

  #armCountUp(): void {
    this.#unobserve?.();
    cancelAnimationFrame(this.#raf);
    this._shown = undefined;
    const target = this.#numeric;
    if (!this.countUp || target === undefined || this.prefersReducedMotion)
      return;
    this._shown = 0;
    this.#unobserve = observeIntersection(this, (entry) => {
      if (!entry.isIntersecting) return;
      this.#unobserve?.();
      this.#unobserve = undefined;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / 700, 1);
        this._shown = target * (1 - (1 - t) ** 3);
        if (t < 1) this.#raf = requestAnimationFrame(step);
        else this._shown = undefined;
      };
      this.#raf = requestAnimationFrame(step);
    });
  }

  get #numeric(): number | undefined {
    if (typeof this.value === 'number') return this.value;
    return this.value !== '' && Number.isFinite(Number(this.value))
      ? Number(this.value)
      : undefined;
  }

  get #direction(): Trend | undefined {
    if (this.trend) return this.trend;
    if (this.delta === undefined || Number.isNaN(this.delta)) return undefined;
    return this.delta > 0 ? 'up' : this.delta < 0 ? 'down' : 'flat';
  }

  #formatValue(): string {
    const n = this._shown ?? this.#numeric;
    return n === undefined
      ? String(this.value)
      : getNumberFormatter(undefined, this.format ?? {}).format(n);
  }

  #renderDelta() {
    const direction = this.#direction;
    if (direction === undefined || this.delta === undefined) return nothing;
    const magnitude = Math.abs(this.delta);
    const text =
      this.deltaFormat === 'absolute'
        ? getNumberFormatter(undefined, this.format ?? {}).format(magnitude)
        : `${getNumberFormatter(undefined, { maximumFractionDigits: 1 }).format(magnitude)}%`;
    const sign = direction === 'up' ? '+' : direction === 'down' ? '−' : '';
    const tone =
      direction === 'flat'
        ? 'flat'
        : direction === this.trendIsGood
          ? 'good'
          : 'bad';
    const spoken =
      direction === 'flat'
        ? 'No change'
        : direction === 'up'
          ? 'Increased by'
          : 'Decreased by';
    return html`<span class="delta" part="delta" data-tone=${tone}>
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <path d=${ARROW[direction]} />
      </svg>
      <span class="sr">${spoken} </span
      ><span aria-hidden="true">${sign}${text}</span
      ><span class="sr">${text}</span>
    </span>`;
  }

  protected override render() {
    const label = this.href
      ? html`<a class="label" part="label" href=${this.href}>${this.label}</a>`
      : html`<span class="label" part="label">${this.label}</span>`;
    return html`<bx-card
      part="base"
      aria-busy=${this.loading ? 'true' : 'false'}
    >
      <div class="head">
        <slot name="icon"></slot>
        ${label}
      </div>
      <div class="row">
        ${
          this.loading
            ? html`<bx-skeleton></bx-skeleton>`
            : html`<span class="value" part="value">${this.#formatValue()}</span
                >${this.#renderDelta()}`
        }
      </div>
      <div class="chart" part="chart"><slot name="chart"></slot></div>
      <div class="footer"><slot name="footer"></slot></div>
    </bx-card>`;
  }
}
